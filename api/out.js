import { kv } from '@vercel/kv';

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function guessSource(referrer = '') {
  const r = String(referrer).toLowerCase();
  if (r.includes('admin')) return 'admin';
  if (r.includes('column3') || r.includes('top brands')) return 'column3';
  return 'site';
}

function guessPartner(targetUrl = '') {
  const url = String(targetUrl).toLowerCase();

  const map = [
    ['trivago', 'Trivago'],
    ['kiwi', 'Kiwi'],
    ['kiwitaxi', 'Kiwitaxi'],
    ['airalo', 'Airalo'],
    ['klook', 'Klook'],
    ['tiqets', 'Tiqets'],
    ['aviasales', 'Aviasales'],
    ['gocity', 'GoCity'],
    ['welcomepickups', 'Welcome Pickups'],
    ['busbud', 'Busbud'],
    ['localrent', 'Localrent'],
    ['gettransfer', 'GetTransfer'],
    ['drimsim', 'Drimsim'],
    ['yesim', 'Yesim'],
    ['saily', 'Saily']
  ];

  const found = map.find(([needle]) => url.includes(needle));
  return found ? found[1] : 'Unknown';
}

export default async function handler(req, res) {
  const { url, partner, source } = req.query;

  if (!url) {
    return res.status(400).send('Missing url');
  }

  const target = safeDecode(url);

  if (!/^https?:\/\//i.test(target)) {
    return res.status(400).send('Invalid url');
  }

  const click = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    target,
    partner: partner || guessPartner(target),
    source: source || guessSource(req.headers.referer || ''),
    referrer: req.headers.referer || '',
    ua: req.headers['user-agent'] || '',
    ip:
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      ''
  };

  try {
    await kv.lpush('clicks:recent', JSON.stringify(click));
    await kv.ltrim('clicks:recent', 0, 499);

    await kv.incr('clicks:total');
    await kv.incr(`clicks:partner:${click.partner}`);
    await kv.incr(`clicks:source:${click.source}`);

    const day = click.ts.slice(0, 10);
    await kv.incr(`clicks:day:${day}`);
  } catch (err) {
    console.error('KV log failed', err);
  }

  return res.redirect(target);
}
