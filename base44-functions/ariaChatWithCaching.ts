// =============================================================
//   ARIA v3 — OpenAI-Powered Research Intelligence for Signal87
//   Uses OPENAI (GPTKEY) ONLY — Anthropic fully removed
//   Reads ALL documents except Trash
// =============================================================

import { createClientFromRequest } from "npm:@base44/sdk@0.8.4";

// -------------------------
// Secrets
// -------------------------
const GPTKEY = Deno.env.get("GPTKEY");
if (!GPTKEY) {
  console.error("❌ Missing GPTKEY OpenAI API key");
}

// -------------------------
// OpenAI Endpoint & Model
// -------------------------
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
// You can change this to "gpt-4o-mini", "gpt-4o", etc.
const OPENAI_MODEL = "gpt-4o";

// =============================================================
// 1. Load All Documents Except Trash
// =============================================================
async function loadDocuments(base44, userId, maxDocs = 50) {
  // Adjust "Document" entity name/fields if your schema differs
  const docs = await base44.asServiceRole.entities.Document.filter({
    created_by: userId,
    is_trashed: false,
  });

  if (!docs?.length) {
    return { contextText: "", usedDocuments: [] };
  }

  const usedDocuments = [];

  const blocks = docs.slice(0, maxDocs).map((doc, idx) => {
    const title = doc.title || `Document ${idx + 1}`;

    // Prefer AI summary, then summary, then extracted_content text
    const summary =
      doc.ai_summary ||
      doc.summary ||
      (doc.extracted_content
        ? String(doc.extracted_content).slice(0, 4000)
        : "");

    // Internal URL for client-side linking
    const url = `/Documents?docId=${doc.id}`;
    usedDocuments.push({ id: doc.id, title, url });

    return [
      `=== Document ${idx + 1} ===`,
      `ID: ${doc.id}`,
      `Title: ${title}`,
      "",
      `Content (truncated):`,
      summary || "(no extractable content)",
      "",
    ].join("\n");
  });

  return {
    contextText: blocks.join("\n"),
    usedDocuments,
  };
}

// =============================================================
// 2. ARIA System Prompt — Research Grade
// =============================================================
const SYSTEM_PROMPT = `
You are ARIA v3, the research intelligence engine of Signal87 AI.

You are talking to a highly sophisticated user (VC / PE / legal / policy / enterprise).
You have access to a document library provided as plain text.

CORE CAPABILITIES
- Deep cross-document analysis
- Timeline & entity extraction
- Contradiction detection
- Policy / legal / financial reasoning
- Structured, audit-ready responses

OUTPUT FORMAT (unless user explicitly requests another format):

1. Direct Answer
   - Clear, concise response (2–6 sentences) focused on the user's question.

2. Evidence Across Documents
   - Bullet list.
   - Each bullet should:
     - Reference document numbers: (Doc 1, Doc 3, Doc 5, …)
     - Quote or paraphrase the most relevant evidence.

3. Reasoning Trace
   - Short explanation of how you moved from evidence → conclusion.
   - Call out any major assumptions.

4. Risks / Missing Information
   - What is uncertain, incomplete, or potentially risky based on the docs.

5. Recommended Next Actions
   - 3–7 concrete steps ARIA or the user could take inside Signal87
     (e.g., "Open Doc 3 and tag as 'High-Risk Contract'",
     "Create a summary report comparing Docs 2, 4, and 7",
     "Group all invoices for Client X into a folder").

STYLE:
- Professional, analytical, structured.
- No fluff, no emojis, no apologies unless truly needed.
- When unsure, say so explicitly and state what additional evidence is needed.
`.trim();

// =============================================================
// 3. OpenAI API Caller
// =============================================================
async function callOpenAI(userPrompt, contextText) {
  const composedUserPrompt = [
    "You are analyzing the following Signal87 document library.",
    "",
    contextText || "(no documents available)",
    "",
    "User request:",
    userPrompt,
  ].join("\n");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GPTKEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: composedUserPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI API error in ARIA v3:", err);
    throw new Error(`OpenAI request failed: ${res.status}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : String(content || "");
}

// =============================================================
// 4. Main API Handler
// =============================================================
Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const latest = messages[messages.length - 1];

    // Extract user text robustly
    let userText = "";
    if (typeof latest.content === "string") {
      userText = latest.content;
    } else if (Array.isArray(latest.content)) {
      const textItem = latest.content.find((c) => c.type === "text");
      userText = textItem?.text || "";
    }
    userText = (userText || "").trim();

    if (!userText) {
      return Response.json({ error: "Empty message" }, { status: 400 });
    }

    // Load documents for this user
    const { contextText, usedDocuments } = await loadDocuments(base44, user.email);

    // Call OpenAI
    const answer = await callOpenAI(userText, contextText);

    // Response payload ARIA front-end can consume
    return Response.json(
      {
        answer,
        model: OPENAI_MODEL,
        used_documents: usedDocuments,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("ARIA v3 ERROR:", err);
    return Response.json(
      {
        error: "ARIA backend failure",
        details: err?.message || String(err),
      },
      { status: 500 },
    );
  }
});
