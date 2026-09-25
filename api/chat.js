const allowedOrigin = "https://tolux.org";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const origin = req.headers.origin;
  if (origin && origin !== allowedOrigin) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 1200) {
    return res.status(400).json({ error: "Please send a short message." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "Assistant is not configured." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        reasoning: { effort: "minimal" },
        input: [
          {
            role: "developer",
            content:
              "You are the Tolux AI Assistant for Tolux LLC. Be helpful, concise, and accurate. Explain Tolux services: AI automation, AI Math Coach, Contract Intelligence, Verify due diligence, Home Help, Mobility, and Tolux Media. Do not invent pricing, availability, legal advice, financial advice, or contractual commitments. Invite visitors who need a quote or detailed help to use the website contact form.",
          },
          { role: "user", content: message },
        ],
        max_output_tokens: 500,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI error", data);
      return res.status(502).json({ error: "Assistant is temporarily unavailable." });
    }

    const textParts = data.output
      ?.flatMap((item) => item.content || [])
      .map((part) => part.text || part.value || "")
      .filter(Boolean);

    const reply = data.output_text || textParts?.join("\n") || "I’m sorry, I couldn’t answer that right now.";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: "Assistant is temporarily unavailable." });
  }
};
