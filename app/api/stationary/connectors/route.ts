import { createCipheriv, createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stationaryWorkflows, type StationaryWorkflowSlug } from "@/lib/stationary-workflows";

export const runtime = "nodejs";

type ConnectorTokenRequest = {
  provider?: string;
  workflow?: StationaryWorkflowSlug;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes?: string[];
};

const providerAllowList = new Set(
  stationaryWorkflows.flatMap((workflow) => workflow.connectors.map((connector) => connector.name.toLowerCase()))
);

function encryptionKey() {
  const secret = process.env.STATIONARY_CONNECTOR_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

function encryptTokenPayload(payload: ConnectorTokenRequest) {
  const key = encryptionKey();
  if (!key) {
    throw new Error("Missing STATIONARY_CONNECTOR_TOKEN_SECRET for connector token custody.");
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

function isKnownWorkflow(workflow?: string): workflow is StationaryWorkflowSlug {
  return stationaryWorkflows.some((item) => item.slug === workflow);
}

export async function POST(req: NextRequest) {
  let body: ConnectorTokenRequest = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid connector payload." }, { status: 400 });
  }

  const provider = body.provider?.trim();
  if (!provider || !providerAllowList.has(provider.toLowerCase())) {
    return NextResponse.json({ error: "Unsupported Stationary SaaS Station connector." }, { status: 400 });
  }

  if (!isKnownWorkflow(body.workflow)) {
    return NextResponse.json({ error: "Unsupported Stationary SaaS Station workflow." }, { status: 400 });
  }

  if (!body.accessToken && !body.refreshToken) {
    return NextResponse.json({ error: "Connector token is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in before wiring Stationary SaaS Station connectors." }, { status: 401 });
  }

  const encryptedTokenBundle = encryptTokenPayload({
    provider,
    workflow: body.workflow,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expiresAt: body.expiresAt,
    scopes: body.scopes || [],
  });

  const { error } = await supabase.from("stationary_connector_tokens").upsert(
    {
      user_id: user.id,
      provider,
      workflow: body.workflow,
      encrypted_token_bundle: encryptedTokenBundle,
      scopes: body.scopes || [],
      expires_at: body.expiresAt || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider,workflow" }
  );

  if (error) {
    return NextResponse.json({ error: "Unable to store connector token in Supabase." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    provider,
    workflow: body.workflow,
    storage: "supabase:stationary_connector_tokens",
  });
}
