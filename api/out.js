const ALLOWED_HOSTS = new Set([
  'kiwitaxi.tpo.lv',
  'tpo.lv',
  'intui.tpo.lv',
  'holidaytaxis.tpo.lv',
  'busbud.tpo.lv',
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
  'aviasales.tpo.lv',
  'booking.tpo.lv',
  'radicalstorage.tpo.lv',

  'www.awin1.com',
  'awin1.com',
  'tp.media'
]);

const MAX_PARAM_LEN = 300;

function safeString(value) {
  return String(value || '').trim().slice(0, MAX_PARAM_LEN);
}

function isAllowedRedirect(targetUrl) {
  try {
    const parsed = new URL(targetUrl);

    if (parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    if (ALLOWED_HOSTS.has(host)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
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

  if (!isAllowedRedirect(rawUrl)) {
    return res.status(400).send('Blocked redirect');
  }

  try {
    const redirectUrl = new URL(rawUrl);

    if (partner) {
      redirectUrl.searchParams.set('sb_partner', partner);
    }

    if (source) {
      redirectUrl.searchParams.set('sb_source', source);
    }

    return res.redirect(302, redirectUrl.toString());
  } catch {
    return res.status(400).send('Invalid redirect');
  }
}
