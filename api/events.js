
/*
==========================================================
SIGNALBOOST EVENT LOGGER API
----------------------------------------------------------
PURPOSE:
- Collect user behavior (searches, clicks)
- Store temporarily (console for now)
- Ready for database upgrade later

IMPORTANT:
- This runs on Vercel serverless
- Endpoint: /api/events
==========================================================
*/

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const event = req.body;

    /*
    ==========================================================
    EVENT STRUCTURE EXPECTED FROM FRONTEND
    ==========================================================
    {
      eventType: "search_submitted" | "provider_clicked" | "results_rendered",
      sessionId: "sb_xxx",
      timestamp: "ISO date",
      payload: {
        query: "...",
        title: "...",
        department: "...",
        etc...
      }
    }
    */

    // BASIC VALIDATION
    if (!event || !event.eventType) {
      return res.status(400).json({ message: 'Invalid event format' });
    }

    /*
    ==========================================================
    CURRENT STORAGE (TEMPORARY)
    ==========================================================
    Right now we log to console.

    In next phase we will:
    - Store in database (Supabase / MongoDB / Postgres)
    - Analyze trends
    - Build revenue intelligence
    */

    console.log("SIGNALBOOST EVENT:", {
      type: event.eventType,
      session: event.sessionId,
      time: event.timestamp,
      payload: event.payload
    });

    /*
    ==========================================================
    RESPONSE
    ==========================================================
    Keep it fast and silent for frontend
    */

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error("EVENT LOG ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error logging event"
    });
  }
}
