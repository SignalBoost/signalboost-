export type OutreachChannel = "facebook" | "instagram" | "linkedin" | "twitter" | "youtube";
export type OutreachMedia = "text" | "image" | "video";

export type OutreachConnector = {
  channel: OutreachChannel;
  label: string;
  oauthScopes: string[];
  dailyLimit: number;
  supportedMedia: OutreachMedia[];
};

export const OUTREACH_CONNECTORS: OutreachConnector[] = [
  { channel: "facebook", label: "Facebook Pages", oauthScopes: ["pages_manage_posts", "pages_read_engagement"], dailyLimit: 50, supportedMedia: ["text", "image", "video"] },
  { channel: "instagram", label: "Instagram Business", oauthScopes: ["instagram_content_publish", "instagram_manage_insights"], dailyLimit: 50, supportedMedia: ["text", "image", "video"] },
  { channel: "linkedin", label: "LinkedIn Company", oauthScopes: ["w_organization_social", "r_organization_social"], dailyLimit: 50, supportedMedia: ["text", "image", "video"] },
  { channel: "twitter", label: "Twitter/X", oauthScopes: ["tweet.write", "tweet.read", "users.read"], dailyLimit: 50, supportedMedia: ["text", "image", "video"] },
  { channel: "youtube", label: "YouTube Channels", oauthScopes: ["youtube.upload", "youtube.readonly"], dailyLimit: 50, supportedMedia: ["text", "image", "video"] },
];

export function getConnector(channel: string) {
  return OUTREACH_CONNECTORS.find((connector) => connector.channel === channel);
}

export function enforceOutreachRateLimit(queuedToday: number, limit = 50) {
  return {
    allowed: queuedToday < limit,
    remaining: Math.max(limit - queuedToday, 0),
    limit,
  };
}

export function buildAuditLog(action: string, channel: string, actor = "system") {
  return {
    id: `outreach-${channel}-${Date.now()}`,
    action,
    channel,
    actor,
    status: "queued",
    createdAt: new Date().toISOString(),
  };
}
