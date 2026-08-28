import "server-only";

const PARTNER_PROJECT_REF = "vdtxulrusfvyxdtatryx";
const PARTNER_FUNCTION_URL = `https://${PARTNER_PROJECT_REF}.supabase.co/functions/v1/partner-admin`;
const PARTNER_PUBLISHABLE_KEY = "sb_publishable_RibKPLEHTX20TO_6gWaRSQ_H7D6K4aR";

type BrokerPayload =
  | { action: "upsert"; row: Record<string, unknown> }
  | { action: "delete"; id: string };

type BrokerResult =
  | { ok: true; status: number; data: Record<string, unknown> }
  | { ok: false; status: number; error: string };

function normalizeStatus(status: number): number {
  if (status === 404 || status >= 500) return 503;
  return status;
}

export async function callPartnerAdminBroker(
  accessToken: string,
  payload: BrokerPayload
): Promise<BrokerResult> {
  if (!accessToken) {
    return { ok: false, status: 401, error: "Authenticated session is required." };
  }

  try {
    const response = await fetch(PARTNER_FUNCTION_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: PARTNER_PUBLISHABLE_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    let data: Record<string, unknown> = {};
    try {
      const parsed = await response.json();
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        data = parsed as Record<string, unknown>;
      }
    } catch {
      data = {};
    }

    if (!response.ok) {
      const error =
        typeof data.error === "string"
          ? data.error
          : `Partner write service failed (${response.status}).`;
      return { ok: false, status: normalizeStatus(response.status), error };
    }

    return { ok: true, status: response.status, data };
  } catch (error) {
    console.error(
      "PARTNER_ADMIN_BROKER_UNAVAILABLE:",
      error instanceof Error ? error.message : "unknown error"
    );
    return {
      ok: false,
      status: 503,
      error: "Partner write service is temporarily unavailable.",
    };
  }
}
