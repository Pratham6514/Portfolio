// TODO: Verify the current model name in the provider docs.
const DEFAULT_MODEL = "gemini-2.0-flash";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

// TODO: replace [Your Full Name] and [your-username] if you want the assistant to speak in first person with live links.
const SYSTEM_INSTRUCTION = `You are an AI assistant representing [Your Full Name]. Answer ONLY using the portfolio context below. Background: Computer Science student skilled in Python, JavaScript, HTML/CSS, Git, Vercel, and Cursor AI. Project 1 (Python Programs Collection): Implemented Factorial, Fibonacci sequence generator, and structure-to-dict parser. Project 2 (Messy Python Code Improvement): Took an unstructured, un-commented Python file and improved readability, modularity, and PEP 8 compliance using Cursor AI. Project 3 (Bug Fixing Using Cursor AI): Identified edge-case logic defects and exceptions in a program, documented the bugs, and fixed them using AI prompts. Project 4 (Interactive Quiz App): Lecture 10 project featuring score counters, dynamic question rendering, and responsive styling. Project 5 (Book Reading List App): Lecture 11 project allowing users to add, update, and manage book progress with live deployment. GitHub: https://github.com/[your-username]. Keep answers friendly, concise, and professional. If you don't know something from this context, say so instead of guessing. If a question is unrelated to the portfolio, politely steer back to the projects.`;

const FRIENDLY_ERROR = "Sorry, I could not complete that request. Please try again.";
const BUSY_ERROR = "The assistant is busy right now. Please try again shortly.";
const CONFIG_ERROR = "The assistant is temporarily unavailable.";

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function isHistoryTurn(item) {
  return (
    item &&
    typeof item === "object" &&
    (item.role === "user" || item.role === "assistant") &&
    typeof item.content === "string"
  );
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.filter(isHistoryTurn).slice(-6);
}

function toGeminiContents(history, message) {
  const contents = history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.content.slice(0, 500) }],
  }));
  contents.push({ role: "user", parts: [{ text: message }] });
  return contents;
}

function extractReply(payload) {
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();
  return text || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 500) {
    sendJson(res, 400, { error: "Please send a message between 1 and 500 characters." });
    return;
  }

  const history = sanitizeHistory(req.body?.history);
  const apiKey = process.env.CHATBOT_API_KEY;
  if (!apiKey) {
    console.error("CHATBOT_API_KEY is not set.");
    sendJson(res, 500, { error: CONFIG_ERROR });
    return;
  }

  const model = process.env.CHATBOT_MODEL || DEFAULT_MODEL;
  const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: toGeminiContents(history, message),
      }),
    });

    if (upstream.status === 429) {
      sendJson(res, 429, { error: BUSY_ERROR });
      return;
    }

    if (!upstream.ok) {
      console.error("Upstream chat request failed with status", upstream.status);
      sendJson(res, 502, { error: FRIENDLY_ERROR });
      return;
    }

    let payload;
    try {
      payload = await upstream.json();
    } catch (parseError) {
      console.error("Failed to parse upstream chat response.");
      sendJson(res, 502, { error: FRIENDLY_ERROR });
      return;
    }

    const reply = extractReply(payload);
    if (!reply) {
      sendJson(res, 502, { error: FRIENDLY_ERROR });
      return;
    }

    sendJson(res, 200, { reply });
  } catch (error) {
    console.error("Chat handler network failure.");
    sendJson(res, 502, { error: FRIENDLY_ERROR });
  }
}
