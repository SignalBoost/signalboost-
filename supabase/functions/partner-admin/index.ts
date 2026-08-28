// @ts-nocheck -- Supabase Edge Functions run on Deno; the Next.js app tsconfig does not load Deno globals.
const PRIMARY_SUPABASE_URL = "https://qpblefwtnbivuusxmabv.supabase.co";
const PRIMARY_PUBLISHABLE_KEY = "sb_publishable_Hp_uxUv6ue8RPzV6rJsmOA_qAFpIVXQ";

const ALLOWED_ROLES = new Set(["owner", "admin"]);
const PARTNER_FIELDS = new Set([
  "id",
  "name",
  "category",
  "category_key",
  "category_label",
  "network",
  "logo",
  "description",
  "tier",
  "featured",
  "travel_related",
  "regions",
  "url",
  "regional_urls",
  "placements",
]);

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function requirePrimaryAdmin(req: Request): Promise<{ ok: true } | { ok: false; response: Response }> {
  const authorization = req.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return { ok: false, response: json(401, { error: "Authenticated session is required." }) };
  }

  const userResponse = await fetch(`${PRIMARY_SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: PRIMARY_PUBLISHABLE_KEY,
      Authorization: authorization,
    },
  });

  if (!userResponse.ok) {
    return { ok: false, response: json(401, { error: "Invalid or expired session." }) };
  }

  const user = await userResponse.json();
  const userId = typeof user?.id === "string" ? user.id : "";
  if (!userId) {
    return { ok: false, response: json(401, { error: "Invalid authenticated user." }) };
  }

  // `team_members` is protected by primary-project RLS. The caller's primary
  // access token can only read its own membership (or rows it legitimately owns),
  // so this authorization check needs no cross-project service-role secret.
  const endpoint = new URL(`${PRIMARY_SUPABASE_URL}/rest/v1/team_members`);
  endpoint.searchParams.set("select", "role,status");
  endpoint.searchParams.set("member_id", `eq.${userId}`);
  endpoint.searchParams.set("limit", "1");

  const adminResponse = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: PRIMARY_PUBLISHABLE_KEY,
      Authorization: authorization,
      Accept: "application/json",
    },
  });

  if (!adminResponse.ok) {
    console.error("PARTNER_ADMIN_PRIMARY_MEMBERSHIP_LOOKUP_FAILED", adminResponse.status);
    return { ok: false, response: json(503, { error: "Admin authorization service is unavailable." }) };
  }

  const memberships = await adminResponse.json();
  const membership = Array.isArray(memberships) ? memberships[0] : null;
  const role = String(membership?.role || "").toLowerCase();
  const status = String(membership?.status || "").toLowerCase();

  if (!membership || !ALLOWED_ROLES.has(role) || status !== "active") {
    return { ok: false, response: json(403, { error: "This account is not an active admin." }) };
  }

  return { ok: true };
}

function cleanPartnerRow(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const row: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(source)) {
    if (PARTNER_FIELDS.has(key)) row[key] = entry;
  }

  const id = String(row.id || "").trim();
  const name = String(row.name || "").trim();
  const url = String(row.url || "").trim();

  if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(id) || !name || !url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  } catch {
    return null;
  }

  const tier = Number(row.tier);
  if (!Number.isFinite(tier) || tier < 1 || tier > 3) return null;

  row.id = id;
  row.name = name;
  row.url = url;
  row.tier = tier;
  row.featured = Boolean(row.featured);
  row.travel_related = Boolean(row.travel_related);
  return row;
}

async function secondaryRequest(path: string, init: RequestInit): Promise<Response> {
  const secondaryUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!secondaryUrl || !serviceRoleKey) {
    throw new Error("Secondary Supabase runtime credentials are unavailable.");
  }

  return fetch(`${secondaryUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const auth = await requirePrimaryAdmin(req);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json(400, { error: "Invalid request body." });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  const action = String(body.action || "");

  if (action === "upsert") {
    const row = cleanPartnerRow(body.row);
    if (!row) return json(400, { error: "Invalid partner payload." });

    try {
      const writeResponse = await secondaryRequest(
        "/rest/v1/affiliate_partners?on_conflict=id",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify(row),
        }
      );

      if (!writeResponse.ok) {
        console.error("PARTNER_ADMIN_BROKER_UPSERT_FAILED", writeResponse.status, (await writeResponse.text()).slice(0, 300));
        return json(500, { error: "Partner write failed." });
      }

      const verifyResponse = await secondaryRequest(
        `/rest/v1/affiliate_partners?select=id,name&id=eq.${encodeURIComponent(String(row.id))}&limit=1`,
        { method: "GET", headers: { Accept: "application/json" } }
      );
      const verified = verifyResponse.ok ? await verifyResponse.json() : [];

      if (!verifyResponse.ok || !Array.isArray(verified) || verified.length !== 1) {
        console.error("PARTNER_ADMIN_BROKER_VERIFY_FAILED", verifyResponse.status);
        return json(500, { error: "Partner write could not be verified." });
      }

      return json(200, {
        ok: true,
        action: "upsert",
        id: row.id,
        partnerDatabaseRef: "vdtxulrusfvyxdtatryx",
      });
    } catch (error) {
      console.error("PARTNER_ADMIN_BROKER_UPSERT_EXCEPTION", error instanceof Error ? error.message : "unknown error");
      return json(503, { error: "Partner database is temporarily unavailable." });
    }
  }

  if (action === "delete") {
    const id = String(body.id || "").trim();
    if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(id)) {
      return json(400, { error: "Invalid partner id." });
    }

    try {
      const deleteResponse = await secondaryRequest(
        `/rest/v1/affiliate_partners?id=eq.${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Prefer: "return=representation" },
        }
      );

      if (!deleteResponse.ok) {
        console.error("PARTNER_ADMIN_BROKER_DELETE_FAILED", deleteResponse.status, (await deleteResponse.text()).slice(0, 300));
        return json(500, { error: "Partner delete failed." });
      }

      return json(200, {
        ok: true,
        action: "delete",
        id,
        partnerDatabaseRef: "vdtxulrusfvyxdtatryx",
      });
    } catch (error) {
      console.error("PARTNER_ADMIN_BROKER_DELETE_EXCEPTION", error instanceof Error ? error.message : "unknown error");
      return json(503, { error: "Partner database is temporarily unavailable." });
    }
  }

  return json(400, { error: "Unsupported action." });
});
