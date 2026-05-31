import fs from "node:fs/promises";

const partners = JSON.parse(await fs.readFile("partners.json", "utf8"));
const urls = [];
for (const partner of partners) {
  urls.push({ partner: partner.id, region: "default", url: partner.url });
  for (const [region, url] of Object.entries(partner.regional_urls || {})) {
    urls.push({ partner: partner.id, region, url });
  }
}

const unique = Array.from(new Map(urls.map((item) => [`${item.partner}:${item.region}:${item.url}`, item])).values());
const results = [];

async function check(item) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(item.url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "SignalBoost affiliate audit (+https://www.signalboostapp.com)" },
    });
    clearTimeout(timer);
    if (response.status === 405 || response.status === 403) {
      const getResponse = await fetch(item.url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "SignalBoost affiliate audit (+https://www.signalboostapp.com)" },
      });
      return { ...item, ok: getResponse.ok || getResponse.status < 500, status: getResponse.status, finalUrl: getResponse.url };
    }
    return { ...item, ok: response.ok || response.status < 500, status: response.status, finalUrl: response.url };
  } catch (error) {
    clearTimeout(timer);
    return { ...item, ok: false, status: "ERROR", error: error instanceof Error ? error.message : String(error) };
  }
}

const concurrency = 8;
for (let index = 0; index < unique.length; index += concurrency) {
  const batch = unique.slice(index, index + concurrency);
  results.push(...(await Promise.all(batch.map(check))));
  process.stdout.write(`Checked ${Math.min(index + concurrency, unique.length)}/${unique.length}\r`);
}
process.stdout.write("\n");

const failures = results.filter((item) => !item.ok);
const report = {
  checkedAt: new Date().toISOString(),
  partnerCount: partners.length,
  urlCount: unique.length,
  okCount: results.length - failures.length,
  failureCount: failures.length,
  failures,
};
await fs.writeFile("reports/affiliate-link-audit.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(`Affiliate audit complete: ${report.okCount}/${report.urlCount} URLs resolved; ${report.failureCount} failures logged.`);
if (failures.length) {
  console.log("Failures were logged but partners were not deleted.");
}
process.exit(0);
