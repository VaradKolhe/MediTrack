
export function normalizeMessage(msg) {
  if (!msg) return null;

  // If already normalized, return shallow copy
  if (msg.text && msg.sender) {
    return { ...msg };
  }

  // User message (likely has .text)
  if (msg.sender === "user") {
    return {
      ...msg,
      text: typeof msg.text === "string" ? msg.text : String(msg.text || "")
    };
  }

  // Bot message: may come from parsed JSON or raw string
  const reply = msg.reply ?? (msg.text ? msg.text : "");
  const steps = Array.isArray(msg.steps) ? msg.steps : [];
  const tips = Array.isArray(msg.tips) ? msg.tips : [];

  const textParts = [];
  if (reply) textParts.push(reply);
  if (steps.length) textParts.push("Steps:\n" + steps.map((s, i) => `${i+1}. ${s}`).join("\n"));
  if (tips.length) textParts.push("Tips:\n" + tips.map((t, i) => `${i+1}. ${t}`).join("\n"));

  return {
    ...msg,
    sender: "bot",
    reply,
    steps,
    tips,
    text: textParts.join("\n\n"),
    raw: msg
  };
}

/**
 * Validate that parsed JSON from the model conforms to the strict schema:
 * { reply: string, steps: [string], tips: [string] }
 * Returns normalized object or throws.
 */
export function validateBotJson(obj) {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("Bot output is not an object");
  }

  if (typeof obj.reply !== "string") {
    throw new Error("Missing 'reply' string");
  }

  const steps = Array.isArray(obj.steps) ? obj.steps.map(String) : [];
  const tips = Array.isArray(obj.tips) ? obj.tips.map(String) : [];

  // Keep reply short: if too long, truncate to sentence-ish length (but don't modify if fine)
  const reply = obj.reply.trim();

  return { reply, steps, tips };
}

/**
 * Try to find a JSON substring in a raw text reply and parse it.
 * Returns parsed object or null.
 */
export function extractJsonFromText(text) {
  if (!text || typeof text !== "string") return null;

  // Greedy approach: find first "{" and last "}" and attempt to parse progressively shrinking candidate
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch (e) {
    // try a looser approach: replace single quotes and trailing commas then parse
    let relaxed = candidate.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
    relaxed = relaxed.replace(/'/g, '"');
    relaxed = relaxed.replace(/,\s*}/g, "}");
    relaxed = relaxed.replace(/,\s*]/g, "]");
    try {
      return JSON.parse(relaxed);
    } catch {
      return null;
    }
  }
}
