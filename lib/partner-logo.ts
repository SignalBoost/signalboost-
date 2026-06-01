// File: lib/partner-logo.ts
// Resolves the best available logo for a partner, in priority order:
//   1. A real logo file you've added at /logos/{id}.png (official asset)
//   2. A Google favicon for a CONFIDENT brand domain (curated map below)
//   3. (caller falls back to a monogram tile when this returns null)
//
// We deliberately do NOT derive domains from the affiliate `url` field —
// ~80 of those are network-redirect links (awin1.com, tpo.lv, obfuscated
// trackers) that would show the network's icon, not the partner's. The brand
// name is the reliable signal, so the map below is keyed by partner id and
// hand-verified. Unknown/regional brands intentionally have no entry and get
// the monogram, so we never show a wrong or broken logo.

// id -> real brand domain. Only brands we are confident about.
const BRAND_DOMAINS: Record<string, string> = {
  // Car Rentals
  alamo: "alamo.com",
  economybookings: "economybookings.com",
  europcar: "europcar.com",
  qeeq: "qeeq.com",
  "discover-cars": "discovercars.com",
  localrent: "localrent.com",
  // Finance
  "western-union": "westernunion.com",
  pagbank: "pagbank.com.br",
  countabout: "countabout.com",
  // Flights
  aviasales: "aviasales.com",
  cvc: "cvc.com.br",
  "oman-airlines": "omanair.com",
  lastminute: "lastminute.com",
  "ozon-travel": "ozon.travel",
  // Hotels
  "booking-com-brazil": "booking.com",
  trivago: "trivago.com",
  "h10-hotels": "h10hotels.com",
  zenhotels: "zenhotels.com",
  "sirenis-hotels": "sirenishotels.com",
  // Insurance & Claims
  airhelp: "airhelp.com",
  ekta: "ekta.com",
  acko: "acko.com",
  "icici-lombard": "icicilombard.com",
  compensair: "compensair.com",
  // Marketplace
  aliexpress: "aliexpress.com",
  amazon: "amazon.com",
  miravia: "miravia.es",
  "converse-pl": "converse.com",
  "king-koil": "kingkoil.com",
  "lunzo-pl": "lunzo.pl",
  // Products & Tools
  "adguard-vpn": "adguard-vpn.com",
  envato: "envato.com",
  lingualeo: "lingualeo.com",
  "proton-vpn": "protonvpn.com",
  turbovpn: "turbovpn.com",
  "tiktok-lite": "tiktok.com",
  alison: "alison.com",
  eset: "eset.com",
  "eset-br": "eset.com",
  // SIM & Connectivity
  airalo: "airalo.com",
  drimsim: "drimsim.com",
  saily: "saily.com",
  yesim: "yesim.app",
  jetpac: "jetpacapp.com",
  // Specialty & Other
  "beverly-hills-md": "beverlyhillsmd.com",
  "igp-gifts": "igp.com",
  megogo: "megogo.net",
  ggsel: "ggsel.net",
  // Tours & Activities
  klook: "klook.com",
  tiqets: "tiqets.com",
  wegotrip: "wegotrip.com",
  bikesbooking: "bikesbooking.com",
  go2africa: "go2africa.com",
  // Transfers
  kiwitaxi: "kiwitaxi.com",
  "welcome-pickups": "welcomepickups.com",
  gettransfer: "gettransfer.com",
  "intui-travel": "intui.travel",
  // Travel Services
  "radical-storage": "radicalstorage.com",

  // --- Blend additions (recognizable brands with findable domains) ---
  getrentacar: "getrentacar.com",
  "top-villas": "topvillas.com",
  bodylab: "bodylab.com",
  "awol-vision": "awolvision.com",
  "cyber-florist": "cyber-florist.com",
  "samboat-us": "samboat.com",
  "beetles-gel-polish": "beetlesgelpolish.com",
};

export type LogoResolution =
  | { kind: "image"; src: string }   // a real file you uploaded
  | { kind: "favicon"; src: string } // google favicon for a known brand
  | { kind: "monogram"; letter: string };

// Build a logo URL for a domain. Prefers logo.dev (real brand logos) when a
// publishable token is configured via NEXT_PUBLIC_LOGO_DEV_TOKEN; otherwise
// falls back to Google's favicon service so logos still render.
// fallback=404 makes logo.dev return an empty 404 when it has no logo, so the
// <img> onError handler shows OUR gold monogram instead of logo.dev's plain one.
function faviconFor(domain: string): string {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  if (token) {
    return `https://img.logo.dev/${encodeURIComponent(domain)}?token=${token}&size=128&retina=true&fallback=404`;
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

// Decide the best logo for a partner. `logo` is the partner.logo field (a
// filename like "amazon.png" when an official file exists), `id` and `name`
// come straight from the partner record.
export function resolvePartnerLogo(args: { id?: string; name?: string; logo?: string }): LogoResolution {
  const id = (args.id || "").toLowerCase();
  const name = (args.name || "").trim();

  // 1. Official uploaded file always wins, if the file actually exists in the
  //    repo. We can't stat the filesystem from the client, so we treat a logo
  //    value that is a full URL as a real asset; bare filenames are only used
  //    once you've confirmed the file exists (kept here for forward use).
  const logo = args.logo || "";
  if (/^https?:\/\//.test(logo)) {
    return { kind: "image", src: logo };
  }

  // 2. Curated brand favicon.
  const domain = BRAND_DOMAINS[id];
  if (domain) {
    return { kind: "favicon", src: faviconFor(domain) };
  }

  // 3. Monogram fallback.
  const letter = (name.charAt(0) || "?").toUpperCase();
  return { kind: "monogram", letter };
}

// Convenience for callers that just want a src or null (null => monogram).
export function partnerFaviconOrNull(args: { id?: string; name?: string; logo?: string }): string | null {
  const r = resolvePartnerLogo(args);
  return r.kind === "monogram" ? null : r.src;
}
