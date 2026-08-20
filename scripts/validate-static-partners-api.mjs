import { readFile } from "node:fs/promises";

const routePath = new URL("../app/api/partners/route.ts", import.meta.url);
const savePath = new URL("../app/api/admin/save-partner/route.ts", import.meta.url);
const routeSource = await readFile(routePath, "utf8");
const saveSource = await readFile(savePath, "utf8");

const executableRouteSource = routeSource
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");
const executableSaveSource = saveSource
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

const requiredRoutePatterns = [
  /NEXT_PUBLIC_SUPABASE_URL/,
  /SUPABASE_SERVICE_ROLE_KEY/,
  /NEXT_PUBLIC_SUPABASE_ANON_KEY/,
  /affiliate_partners/,
  /unstable_cache/,
  /revalidate\s*:\s*300/,
  /tags\s*:\s*\[PARTNER_CACHE_TAG\]/,
  /dynamic\s*=\s*["']force-dynamic["']/,
  /bundled-static-fallback-retryable/,
  /Cache-Control["']?\s*:\s*["']no-store, max-age=0["']/,
  /supabase-\$\{live\.credentialSource\}-cached/,
  /PUBLIC_PARTNER_COLUMNS/,
];

const missingRoute = requiredRoutePatterns
  .filter((pattern) => !pattern.test(executableRouteSource))
  .map((pattern) => pattern.toString());

if (missingRoute.length > 0) {
  console.error("Public partner API must cache only successful live Supabase reads and keep fallback retryable.");
  console.error("Missing route guardrails:", missingRoute.join(", "));
  process.exit(1);
}

const requiredSavePatterns = [
  /revalidateTag/,
  /PARTNER_CACHE_TAG/,
  /revalidateTag\(PARTNER_CACHE_TAG\)/,
  /cacheInvalidated/,
];

const missingSave = requiredSavePatterns
  .filter((pattern) => !pattern.test(executableSaveSource))
  .map((pattern) => pattern.toString());

if (missingSave.length > 0) {
  console.error("Partner save route must invalidate the live directory cache after successful writes.");
  console.error("Missing save-route guardrails:", missingSave.join(", "));
  process.exit(1);
}

const forbiddenRoutePatterns = [
  /select\s*\(\s*["']\*["']\s*\)/,
  /export\s+const\s+revalidate\s*=\s*false/,
  /bundled-static-fallback["']\s*,?\s*\n?\s*["']X-Partner-Count/,
];

const violations = forbiddenRoutePatterns
  .filter((pattern) => pattern.test(executableRouteSource))
  .map((pattern) => pattern.toString());

if (violations.length > 0) {
  console.error("Public partner API safety guardrails were violated.");
  console.error("Forbidden executable patterns found:", violations.join(", "));
  process.exit(1);
}

console.log("Nonsticky cached live partner API validation passed.");
