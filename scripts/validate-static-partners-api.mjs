import { readFile } from "node:fs/promises";

const routePath = new URL("../app/api/partners/route.ts", import.meta.url);
const source = await readFile(routePath, "utf8");

// Scan executable source only. Comments intentionally document the historical
// Supabase implementation and must not trigger the protection check.
const executableSource = source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

const forbiddenPatterns = [
  /NEXT_PUBLIC_SUPABASE_URL/,
  /SUPABASE_SERVICE_ROLE_KEY/,
  /affiliate_partners/,
  /\/rest\/v1\//,
  /cache\s*:\s*["']no-store["']/,
  /createClient\s*\(/,
];

const violations = forbiddenPatterns
  .filter((pattern) => pattern.test(executableSource))
  .map((pattern) => pattern.toString());

if (violations.length > 0) {
  console.error("Public partner API must not query Supabase.");
  console.error("Forbidden executable patterns found:", violations.join(", "));
  process.exit(1);
}

if (!executableSource.includes('X-Partner-Source": "bundled-static"')) {
  console.error("Public partner API must identify bundled-static as its source.");
  process.exit(1);
}

console.log("Static partner API validation passed.");
