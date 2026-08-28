import { readFile } from "node:fs/promises";

const routePath = new URL("../app/api/partners/route.ts", import.meta.url);
const savePath = new URL("../app/api/admin/save-partner/route.ts", import.meta.url);
const partnerClientPath = new URL("../lib/supabase/partners-server.ts", import.meta.url);
const homeSourcePath = new URL("../lib/home/partners-source.ts", import.meta.url);
const partnerAdminFunctionPath = new URL("../supabase/functions/partner-admin/index.ts", import.meta.url);

const routeSource = await readFile(routePath, "utf8");
const saveSource = await readFile(savePath, "utf8");
const partnerClientSource = await readFile(partnerClientPath, "utf8");
const homeSource = await readFile(homeSourcePath, "utf8");
const partnerAdminFunctionSource = await readFile(partnerAdminFunctionPath, "utf8");

const stripComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const executableRouteSource = stripComments(routeSource);
const executableSaveSource = stripComments(saveSource);
const executablePartnerClientSource = stripComments(partnerClientSource);
const executableHomeSource = stripComments(homeSource);
const executablePartnerAdminFunctionSource = stripComments(partnerAdminFunctionSource);

const requiredRoutePatterns = [
  /PARTNER_PROJECT_REF\s*=\s*["']vdtxulrusfvyxdtatryx["']/,
  /PARTNER_PUBLISHABLE_KEY/,
  /rest\/v1\/affiliate_partners/,
  /cache\s*:\s*["']no-store["']/,
  /dynamic\s*=\s*["']force-dynamic["']/,
  /Cache-Control["']?\s*:\s*["']no-store, max-age=0["']/,
  /secondary-postgrest-direct/,
  /X-Partner-Database-Ref/,
  /X-Partner-Count/,
  /PUBLIC_PARTNER_COLUMNS/,
];

const missingRoute = requiredRoutePatterns
  .filter((pattern) => !pattern.test(executableRouteSource))
  .map((pattern) => pattern.toString());

if (missingRoute.length > 0) {
  console.error("Public partner API must use one direct no-cache PostgREST read from the authoritative secondary database.");
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
  /AUTHORITATIVE_PARTNER_PROJECT_REF/,
  /AUTHORITATIVE_PARTNER_URL/,
  /AUTHORITATIVE_PARTNER_PUBLISHABLE_KEY/,
  /createPartnerReadClient/,
  /createPartnerDatabaseClient/,
  /PARTNERS_SUPABASE_SERVICE_ROLE_KEY/,
  /SECONDARY_SUPABASE_SERVICE_ROLE_KEY/,
  /MARKETING_SUPABASE_SERVICE_ROLE_KEY/,
  /NEXT_PUBLIC_SUPABASE_URL/,
  /PARTNER_DATABASE_NOT_CONFIGURED/,
  /PARTNER_DATABASE_MISCONFIGURED/,
  /createClient/,
];

const missingPartnerClient = requiredPartnerClientPatterns
  .filter((pattern) => !pattern.test(executablePartnerClientSource))
  .map((pattern) => pattern.toString());

if (missingPartnerClient.length > 0) {
  console.error("Dedicated partner clients are missing read/write separation guardrails.");
  console.error("Missing partner-client guardrails:", missingPartnerClient.join(", "));
  process.exit(1);
}

const requiredHomePatterns = [
  /createPartnerReadClient/,
  /affiliate_partners/,
  /return\s+\[\]/,
];

const missingHome = requiredHomePatterns
  .filter((pattern) => !pattern.test(executableHomeSource))
  .map((pattern) => pattern.toString());

if (missingHome.length > 0) {
  console.error("Homepage partner loader must use the authoritative public secondary read client.");
  console.error("Missing home-source guardrails:", missingHome.join(", "));
  process.exit(1);
}

const requiredPartnerAdminFunctionPatterns = [
  /MARKETING_PROJECT_REF\s*=\s*["']vdtxulrusfvyxdtatryx["']/,
  /MARKETING_PUBLISHABLE_KEY/,
  /auth\/v1\/user/,
  /rest\/v1\/rpc\/is_admin/,
  /SUPABASE_SERVICE_ROLE_KEY/,
  /affiliate_partners/,
  /requireMarketingAdmin/,
];

const missingPartnerAdminFunction = requiredPartnerAdminFunctionPatterns
  .filter((pattern) => !pattern.test(executablePartnerAdminFunctionSource))
  .map((pattern) => pattern.toString());

if (missingPartnerAdminFunction.length > 0) {
  console.error("Partner admin broker must authenticate against the marketing Supabase project before privileged partner writes.");
  console.error("Missing partner-admin broker guardrails:", missingPartnerAdminFunction.join(", "));
  process.exit(1);
}

const forbiddenPartnerAdminFunctionPatterns = [
  /qpblefwtnbivuusxmabv/,
  /PRIMARY_SUPABASE_URL/,
  /PRIMARY_PUBLISHABLE_KEY/,
  /rest\/v1\/team_members/,
  /requirePrimaryAdmin/,
];

const partnerAdminFunctionViolations = forbiddenPartnerAdminFunctionPatterns
  .filter((pattern) => pattern.test(executablePartnerAdminFunctionSource))
  .map((pattern) => pattern.toString());

if (partnerAdminFunctionViolations.length > 0) {
  console.error("Partner admin broker must never validate marketing-site tokens against the separate SaaS Supabase project.");
  console.error("Forbidden partner-admin broker patterns found:", partnerAdminFunctionViolations.join(", "));
  process.exit(1);
}

const forbiddenRoutePatterns = [
  /process\.env\.NEXT_PUBLIC_SUPABASE_URL/,
  /process\.env\.SUPABASE_SERVICE_ROLE_KEY/,
  /process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY/,
  /createPartnerReadClient/,
  /unstable_cache/,
  /partnersFallback/,
  /partners\.json/,
  /bundled-static-fallback/,
  /export\s+const\s+revalidate\s*=\s*false/,
];

const routeViolations = forbiddenRoutePatterns
  .filter((pattern) => pattern.test(executableRouteSource))
  .map((pattern) => pattern.toString());

if (routeViolations.length > 0) {
  console.error("Public partner API must not use primary Supabase, wrapper clients, framework caching, or static partner data.");
  console.error("Forbidden route patterns found:", routeViolations.join(", "));
  process.exit(1);
}

const forbiddenHomePatterns = [
  /partners\.json/,
  /loadStaticFallback/,
  /createPartnerDatabaseClient/,
];

const homeViolations = forbiddenHomePatterns
  .filter((pattern) => pattern.test(executableHomeSource))
  .map((pattern) => pattern.toString());

if (homeViolations.length > 0) {
  console.error("Homepage must never silently fall back to the obsolete static partner directory.");
  console.error("Forbidden home-source patterns found:", homeViolations.join(", "));
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

console.log("Authoritative secondary partner database validation passed.");
