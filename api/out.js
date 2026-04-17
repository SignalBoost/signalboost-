const ALLOWED_HOSTS = new Set([
  'kiwitaxi.tpo.lv',
  'tpo.lv',
  'intui.tpo.lv',
  'holidaytaxis.tpo.lv',
  'busbud.tpo.lv',
  'bikesbooking.tpo.lv',
  'wegotrip.tpo.lv',
  'autoeurope.tpo.lv',
  'gettransfer.tpo.lv',
  'searadar.tpo.lv',
  'radicalstorage.tpo.lv',
  'aviasales.tpo.lv',
  'localrent.tpo.lv',
  'economybookings.tpo.lv',
  'qeeq.tpo.lv',
  'getrentacar.tpo.lv',
  'airalo.tpo.lv',
  'drimsim.tpo.lv',
  'yesim.tpo.lv',
  'klook.tpo.lv',
  'gocity.tpo.lv',
  'bigbustours.tpo.lv',
  'eatwith.tpo.lv',
  'ektatraveling.tpo.lv',
  'airhelp.tpo.lv',
  'compensair.tpo.lv',
  'booking.tpo.lv',

  'www.awin1.com',
  'awin1.com',
  'tp.media'
]);

const MAX_PARAM_LEN = 1200;

function safeString(value) {
  if (Array.isArray(value)) value = value[0];
  return String(value || '').trim().slice(0, MAX_PARAM_LEN);
}

function parseRedirectUrl(rawUrl) {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

function isAllowedRedirect(parsedUrl) {
  if (!parsedUrl) return false;
  if (parsedUrl.protocol !== 'https:') return false;
  return ALLOWED_HOSTS.has(parsedUrl.hostname.toLowerCase());
}

function appendTrackingParams(parsedUrl, partner, source) {
  const host = parsedUrl.hostname.toLowerCase();

  // 🔥 DO NOT touch affiliate tracking links
  if (host === 'awin1.com' || host === 'www.awin1.com' || host === 'tp.media') {
    return parsedUrl;
  }

  if (partner) parsedUrl.searchParams.set('sb_partner', partner);
  if (source) parsedUrl.searchParams.set('sb_source', source);

  return parsedUrl;
}

export default function handler(req, res) {
  const rawUrl = safeString(req.query.url);
  const partner = safeString(req.query.partner);
  const source = safeString(req.query.source);

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (!rawUrl) {
    return res.status(400).send('Missing redirect URL');
  }

  const parsedUrl = parseRedirectUrl(rawUrl);

  if (!isAllowedRedirect(parsedUrl)) {
    return res.status(400).send('Blocked redirect');
  }

  try {
    const redirectUrl = appendTrackingParams(parsedUrl, partner, source);

    return res.redirect(302, redirectUrl.toString());
  } catch {
    return res.status(400).send('Invalid redirect');
  }
}
