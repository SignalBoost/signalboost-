import { readFile } from "node:fs/promises";

const routePath = new URL("../app/api/partners/route.ts", import.meta.url);
const savePath = new URL("../app/api/admin/save-partner/route.ts", import.meta.url);
const partnerClientPath = new URL("../lib/supabase/partners-server.ts", import.meta.url);

const routeSource = await readFile(routePath, "utf8");
const saveSource = await readFile(savePath, "utf8");
const partnerClientSource = await readFile(partnerClientPath, "utf8");

const stripComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const executableRouteSource = stripComments(routeSource);
const executableSaveSource = stripComments(saveSource);
const executablePartnerClientSource = stripComments(partnerClientSource);

const requiredRoutePatterns = [
  /createPartnerDatabaseClient/,
  /affiliate_partners/,
  /unstable_cache/,
  /revalidate\s*:\s*300/,
  /tags\s*:\s*\[PARTNER_CACHE_TAG\]/,
  /dynamic\s*=\s*["']force-dynamic["']/,
  /bundled-static-fallback-retryable/,
  /Cache-Control["']?\s*:\s*["']no-store, max-age=0["']/,
  /supabase-secondary-cached/,
  /X-Partner-Database-Ref/,
  /PUBLIC_PARTNER_COLUMNS/,
];

const missingRoute = requiredRoutePatterns
  .filter((pattern) => !pattern.test(executableRouteSource))
  .map((pattern) => pattern.toString());

if (missingRoute.length > 0) {
  console.error("Public partner API must read only from the dedicated secondary partner database and keep fallback retryable.");
  console.error("Missing route guardrails:", missingRoute.join(", "));
  process.exit(1);
}

const requiredSavePatterns = [
  /createPartnerDatabaseClient/,
  /revalidateTag/,
  /PARTNER_CACHE_TAG/,
  /revalidateTag\(PARTNER_CACHE_TAG\)/,
  /cacheInvalidated/,
  /partnerDatabaseRef/,
  /PARTNER_SAVE_VERIFICATION_FAILED/,
];

const missingSave = requiredSavePatterns
  .filter((pattern) => !pattern.test(executableSaveSource))
  .map((pattern) => pattern.toString());

if (missingSave.length > 0) {
  console.error("Partner save route must write to and verify the dedicated secondary partner database.");
  console.error("Missing save-route guardrails:", missingSave.join(", "));
  process.exit(1);
}

const requiredPartnerClientPatterns = [
  /PARTNERS_SUPABASE_URL/,
  /PARTNERS_SUPABASE_SERVICE_ROLE_KEY/,
  /NEXT_PUBLIC_SUPABASE_URL/,
  /PARTNER_DATABASE_NOT_CONFIGURED/,
  /PARTNER_DATABASE_MISCONFIGURED/,
  /createClient/,
];

const missingPartnerClient = requiredPartnerClientPatterns
  .filter((pattern) => !pattern.test(executablePartnerClientSource))
  .map((pattern) => pattern.toString());

if (missingPartnerClient.length > 0) {
  console.error("Dedicated partner database client is missing fail-closed configuration guardrails.");
  console.error("Missing partner-client guardrails:", missingPartnerClient.join(", "));
  process.exit(1);
}

const forbiddenRoutePatterns = [
  /process\.env\.NEXT_PUBLIC_SUPABASE_URL/,
  /process\.env\.SUPABASE_SERVICE_ROLE_KEY/,
  /process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY/,
  /select\s*\(\s*["']\*["']\s*\)/,
  /export\s+const\s+revalidate\s*=\s*false/,
];

const routeViolations = forbiddenRoutePatterns
  .filter((pattern) => pattern.test(executableRouteSource))
  .map((pattern) => pattern.toString());

if (routeViolations.length > 0) {
  console.error("Public partner API must never connect directly to the primary Supabase environment.");
  console.error("Forbidden route patterns found:", routeViolations.join(", "));
  process.exit(1);
}

const forbiddenSavePatterns = [
  /const\s+supabase\s*=\s*await\s+createClient\(\)/,
  /supabase\.from\(\s*["']affiliate_partners["']\s*\)/,
];

const saveViolations = forbiddenSavePatterns
  .filter((pattern) => pattern.test(executableSaveSource))
  .map((pattern) => pattern.toString());

if (saveViolations.length > 0) {
  console.error("Partner save route must never write affiliate_partners through the primary application client.");
  console.error("Forbidden save-route patterns found:", saveViolations.join(", "));
  process.exit(1);
}

console.log("Dedicated secondary partner database validation passed.");
