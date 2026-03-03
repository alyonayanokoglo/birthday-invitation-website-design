const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwSRmjOomfzbofnycIHlwm21MT0BGwnUJ--mUv69E2grfTL2bpl_2U8cPvPkJlqaZ1s/exec";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, response } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const body = new URLSearchParams({
      name: String(name || "").trim(),
      response: String(response || ""),
    }).toString();

    const result = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const text = await result.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: result.ok, raw: text };
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("RSVP proxy error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
