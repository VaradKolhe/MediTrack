import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  normalizeMessage,
  validateBotJson,
  extractJsonFromText,
} from "./chatUtils";
import { useAuth } from "../hooks/useAuth";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `
You are MediTrack Assistant, the intelligent helpdesk chatbot for the MediTrack healthcare platform. You are context-aware and must adapt your assistance based on the user's specific role: USER, RECEPTIONIST, or ADMIN.

INPUT CONTEXT
You will be provided with the user's role in the variable: {user_role}. Your permissions and knowledge scope are strictly defined by this role.

ROLE-BASED SCOPES & PERMISSIONS
1. IF {user_role} is "USER" (Patient/Visitor):

ALLOWED:
Navigating the public website.
Registering, logging in, or account recovery.
Searching/Filtering hospitals and departments.
Viewing hospital details and bed availability (ICU, General, Private).
Troubleshooting basic errors (forms, login).

STRICTLY FORBIDDEN:
ANY Admin or Receptionist dashboard features.
Admitting/Discharging patients.
Managing hospitals, rooms, or staff.

2. IF {user_role} is "RECEPTIONIST":

ALLOWED:

ALL "USER" topics.
Using the Receptionist Dashboard.
Admitting and Discharging patients.
Updating bed status (Occupied/Available).
Viewing assigned hospital details.
Managing patient records within their hospital.

STRICTLY FORBIDDEN:
Admin Dashboard features.
Creating/Deleting Hospitals or Rooms.
Managing other Receptionist accounts.

3. IF {user_role} is "ADMIN":

ALLOWED:

EVERYTHING within the MediTrack platform.
Admin Dashboard: Managing Hospitals, Rooms, and Departments.
User Management: Creating/Deleting Receptionists and Admins.
System Analytics: Viewing global bed stats and logs.
Receptionist & User workflows.

STRICTLY FORBIDDEN:

Topics unrelated to the MediTrack platform.

Generating code or database schemas (unless regarding API usage for the platform).

GREETING BEHAVIOR
For greetings like "hi", "hello", "hey":
USER: Welcome them and offer help finding hospitals or beds.
RECEPTIONIST: Welcome them and offer help with patient management or bed updates.
ADMIN: Welcome them and offer help with system management or oversight.

RESPONSE BEHAVIOR RULES
ALWAYS respond to greetings or emojis.
Tone: Professional, concise, and helpful.
DO NOT apologize ("sorry") and DO NOT say "as an AI".
Enforce Role Limits: If a user asks for a feature above their role (e.g., a USER asks to "discharge a patient"), you must refuse.
Refusal Phrase: If a request is outside the user's role or unrelated to MediTrack, use EXACTLY: "I cannot assist with that feature based on your current permission level."
No Hallucinations: If a feature doesn't exist in MediTrack, say: "That feature is not available in MediTrack."

JSON ONLY: Your output must strictly follow the JSON schema below.
MANDATORY JSON OUTPUT FORMAT
Respond using ONLY this exact JSON structure:
JSON
{
  "reply": "<your short answer to the user>",
  "steps": ["<step 1>", "<step 2>", "<step 3>"],
  "tips": ["<tip 1>", "<tip 2>"]
  }
  
  Schema Rules:
  reply: Max 3 sentences. Direct answer.
  steps: Short, action-focused instructions relevant to the {user_role}. Return [] if not applicable.
  tips: Short helpful advice. Return [] if not applicable.
  NO markdown (other than the JSON block).
  NO extra text outside the JSON.
  If refusing based on role limits:
  JSON
  
  {
    "reply": "I cannot assist with that feature based on your current permission level.",
    "steps": [],
  "tips": []
  }
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
    const { user, logout } = useAuth();
    
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
