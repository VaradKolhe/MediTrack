import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  normalizeMessage,
  validateBotJson,
  extractJsonFromText,
} from "./chatUtils";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `
You are MediTrack Assistant — the helpdesk chatbot for regular users of the MediTrack healthcare platform. You assist ONLY end-users (patients, visitors, or individuals) who use the public MediTrack website. You DO NOT assist admins, hospital staff, or receptionists.

-------------------------------------
GREETING BEHAVIOR
-------------------------------------
For greetings like "hi", "hello", "hey", respond with:
- A friendly welcome
- A quick offer to help with navigation or finding hospitals
- Steps showing common actions (e.g., view hospitals, check availability)

-------------------------------------
ALLOWED TOPICS (ONLY for end-users)
-------------------------------------
You may ONLY answer questions related to:
- How to navigate the MediTrack website
- How to register, log in, or recover an account
- How to view hospitals, departments, and services
- How to see hospital bed availability
- How to check room/bed types (ICU, General, Private)
- How to request or book a bed (if supported)
- How hospital pages, listings, filtering, or searching works
- How to understand hospital details shown on the website
- How to use public-facing features (no admin or staff tools)
- Troubleshooting common user errors (login issues, form errors)

-------------------------------------
STRICTLY FORBIDDEN TOPICS
-------------------------------------
You MUST REFUSE any request related to:
- Admin dashboard
- Receptionist dashboard
- Hospital staff workflows
- Adding doctors, beds, rooms, or staff
- Backend, database, or developer guidance
- Internal management processes
- Anything NOT related to MediTrack

Refusal MUST use this exact sentence:
"I can help only with end-user questions related to MediTrack."

-------------------------------------
RESPONSE BEHAVIOR RULES
-------------------------------------
1. ALWAYS respond — even to greetings like “hi”, “hello”, “hey”, or emojis.
2. Keep tone friendly, simple, and helpful for a normal non-technical user.
3. DO NOT apologize (“sorry”) and DO NOT say “as an AI”.
4. DO NOT mention admin/staff/internal dashboards under ANY condition.
5. If the user asks something vague, guide them by suggesting helpful next steps.
6. NEVER hallucinate a feature. If unsure, say:
   "That feature is not available in MediTrack."
7. Your answer must ALWAYS follow the JSON response schema below.

-------------------------------------
MANDATORY JSON OUTPUT FORMAT
-------------------------------------
Respond using ONLY this exact JSON structure:

{
  "reply": "<your short answer to the user>",
  "steps": ["<step 1>", "<step 2>", "<step 3>"],
  "tips": ["<tip 1>", "<tip 2>"]
}

Rules:
- No markdown.
- No extra explanation outside the JSON.
- reply = max 3 sentences.
- Steps = short, action-focused.
- Tips = short and helpful.

If refusing:
{
  "reply": "I can help only with end-user questions related to MediTrack.",
  "steps": [],
  "tips": []
}

-------------------------------------
END OF INSTRUCTIONS
-------------------------------------
`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: SYSTEM_PROMPT,
});

const DEFAULT_TIMEOUT_MS = 12_000; // 12s per attempt
const MAX_RETRIES = 2; // initial + 2 retries (tunable)
const BACKOFF_BASE = 300; // ms

function buildHistoryPayload(history = []) {
  // ensure every history entry has `.text`
  return history
    .map(normalizeMessage)
    .filter(Boolean)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text || "" }],
    }));
}

/**
 * Attempts to parse a raw text response into the strict schema, with fallbacks.
 */
function parseModelResponseText(rawText) {
  // 1) Try direct JSON parse
  try {
    const parsed = JSON.parse(rawText);
    return validateBotJson(parsed);
  } catch (e) {
    // not direct JSON
  }

  // 2) Try to extract JSON substring
  const extracted = extractJsonFromText(rawText);
  if (extracted) {
    try {
      return validateBotJson(extracted);
    } catch (e) {
      // fallthrough
    }
  }

  // 3) Last resort: attempt to heuristically convert free-text into schema
  // We will put whole rawText into reply, with empty steps/tips
  return { reply: rawText.trim().slice(0, 1500), steps: [], tips: [] };
}

/**
 * Core function: sends query with history and robust error handling.
 * Returns an object { reply, steps, tips }
 */
export async function sendMessageToGemini(query, history = []) {
  if (!query || typeof query !== "string") {
    throw new Error("Query must be a non-empty string");
  }

  const payloadHistory = buildHistoryPayload(history);

  let attempt = 0;
  let lastErr = null;

  while (attempt <= MAX_RETRIES) {
    attempt += 1;
    const timeout = DEFAULT_TIMEOUT_MS + attempt * 2000; // slight increase per attempt

    try {
      // startChat must be started anew with correct history
      const chat = await model.startChat({ history: payloadHistory });

      // Use AbortController to enforce timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const result = await chat
        .sendMessage(query, { signal: controller.signal })
        .catch((err) => {
          throw err;
        });

      clearTimeout(timer);

      // Some SDKs return response / response.text() differently; guard for both
      const raw = result?.response?.text
        ? await result.response.text()
        : typeof result === "string"
        ? result
        : (await (result?.response?.json?.() ?? Promise.resolve(null))) || "";

      const parsed = parseModelResponseText(String(raw || ""));

      // Always ensure we return the strict schema as strings/arrays
      return {
        reply: parsed.reply,
        steps: parsed.steps,
        tips: parsed.tips,
      };
    } catch (err) {
      lastErr = err;
      console.error(`Gemini attempt ${attempt} failed:`, err?.message || err);

      // If AbortError or network, retry with exponential backoff
      if (attempt <= MAX_RETRIES) {
        const backoff = BACKOFF_BASE * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      // final fallback: return apologetic structured response
      return {
        reply: "Sorry, I couldn't process that right now. Please try again.",
        steps: [],
        tips: [],
      };
    }
  }

  // unreachable but safe fallback
  console.error("Gemini all attempts failed", lastErr);
  return { reply: "Sorry, something went wrong.", steps: [], tips: [] };
}
