import { createCipheriv, randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stationWorkflows } from "@/lib/station-workflows";

export const runtime = "nodejs";

const SUPPORTED_CONNECTORS = new Set(
  stationWorkflows.flatMap((workflow) => workflow.connectors.map((connector) => connector.toLowerCase()))
);

type ConnectorTokenPayload = {
  provider?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes?: string[];
  workflow?: string;
};

function encryptionKey() {
  const secret = process.env.CONNECTOR_TOKEN_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

function encryptTokenBundle(payload: ConnectorTokenPayload) {
  const key = encryptionKey();
  if (!key) return null;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    algorithm: "aes-256-gcm",
  };
}

function tokenPreview(token = "") {
  return token.length > 4 ? token.slice(-4) : "set";
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    connectors: Array.from(SUPPORTED_CONNECTORS).sort(),
    storage: "supabase:station_connector_tokens",
    security: "server-side AES-GCM encryption; raw tokens are never returned to the browser",
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ConnectorTokenPayload;
  const provider = payload.provider?.trim().toLowerCase();

  if (!provider || !SUPPORTED_CONNECTORS.has(provider)) {
    return NextResponse.json({ error: "Unsupported Stationary SaaS Station connector." }, { status: 400 });
  }

  if (!payload.accessToken && !payload.refreshToken) {
    return NextResponse.json({ error: "A connector accessToken or refreshToken is required." }, { status: 400 });
  }

  const encrypted = encryptTokenBundle(payload);
  if (!encrypted) {
    return NextResponse.json(
      { error: "CONNECTOR_TOKEN_KEY must be configured before connector tokens can be vaulted." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Sign in before connecting Stationary SaaS Station apps." }, { status: 401 });
  }

  const { error } = await supabase.from("station_connector_tokens").upsert(
    {
      user_id: user.id,
      provider,
      workflow: payload.workflow || null,
      token_ciphertext: encrypted.ciphertext,
      token_iv: encrypted.iv,
      token_tag: encrypted.tag,
      token_algorithm: encrypted.algorithm,
      scopes: payload.scopes || [],
      expires_at: payload.expiresAt || null,
      token_preview: tokenPreview(payload.accessToken || payload.refreshToken),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider,workflow" }
  );

  if (error) {
    return NextResponse.json({ error: "Unable to store connector token in Supabase." }, { status: 500 });
  }

  return NextResponse.json({
    status: "connected",
    provider,
    workflow: payload.workflow || null,
    tokenPreview: tokenPreview(payload.accessToken || payload.refreshToken),
  });
}
