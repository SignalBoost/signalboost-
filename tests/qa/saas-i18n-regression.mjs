import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const locales = ['en', 'es', 'pt', 'pl', 'ru'];
const requiredNavbar = ['marketplace', 'promote_business', 'reviews', 'calendar', 'spreadsheets', 'outreach', 'assistant', 'pricing', 'admin'];

for (const locale of locales) {
  const dict = JSON.parse(readFileSync(new URL(`../../locales/${locale}.json`, import.meta.url), 'utf8'));
  for (const key of requiredNavbar) {
    assert.ok(dict.navbar?.[key], `${locale} missing navbar.${key}`);
  }
}

const saasI18n = readFileSync(new URL('../../lib/saas-i18n.ts', import.meta.url), 'utf8');
for (const locale of locales) {
  assert.match(saasI18n, new RegExp(`${locale}: \\{`, 'u'), `missing ${locale} localized module block`);
}

for (const route of ['/promote', '/reviews', '/calendar', '/spreadsheets', '/outreach', '/assistant', '/pricing']) {
  assert.match(saasI18n + readFileSync(new URL('../../components/SiteHeader.tsx', import.meta.url), 'utf8'), new RegExp(route.replace('/', '\\/'), 'u'), `missing route ${route}`);
}

console.log('SaaS i18n regression checks passed for five locales, navbar routes, and pricing links.');
