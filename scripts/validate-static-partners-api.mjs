import { readFile } from "node:fs/promises";

const routePath = new URL("../app/api/partners/route.ts", import.meta.url);
const source = await readFile(routePath, "utf8");

const executableSource = source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

const requiredPatterns = [
  /NEXT_PUBLIC_SUPABASE_URL/,
  /SUPABASE_SERVICE_ROLE_KEY/,
  /affiliate_partners/,
  /next\s*:\s*\{\s*revalidate\s*:\s*300\s*\}/,
  /s-maxage=300/,
  /bundled-static-fallback/,
  /supabase-service-role-cached/,
];

const missing = requiredPatterns
  .filter((pattern) => !pattern.test(executableSource))
  .map((pattern) => pattern.toString());

if (missing.length > 0) {
  console.error("Public partner API must use a bounded cached server-side Supabase read with static fallback.");
  console.error("Missing required guardrails:", missing.join(", "));
  process.exit(1);
}

const forbiddenPatterns = [
  /cache\s*:\s*["']no-store["']/,
  /revalidate\s*=\s*false/,
  /dynamic\s*=\s*["']force-dynamic["']/,
  /NEXT_PUBLIC_SUPABASE_ANON_KEY/,
];

const violations = forbiddenPatterns
  .filter((pattern) => pattern.test(executableSource))
  .map((pattern) => pattern.toString());

if (violations.length > 0) {
  console.error("Public partner API cache/credential guardrails were violated.");
  console.error("Forbidden executable patterns found:", violations.join(", "));
  process.exit(1);
}

console.log("Cached authoritative partner API validation passed.");
