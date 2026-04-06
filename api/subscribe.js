export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let email = "";

  try {
    email = (req.body?.email || "").trim();
  } catch (e) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  if (!email) {
    return res.status(400).json({ error: "Email is empty" });
  }

  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
  const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_AUDIENCE_ID) {
    return res.status(500).json({ error: "Missing Mailchimp environment variables" });
  }

  try {
    const mcRes = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
        }),
      }
    );

    const data = await mcRes.json();

    if (!mcRes.ok) {
      return res.status(mcRes.status).json({
        error: data.title || "Mailchimp error",
        detail: data.detail || "Subscription failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      detail: err.message || "Unknown error",
    });
  }
}
