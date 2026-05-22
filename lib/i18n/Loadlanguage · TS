// File: lib/i18n/loadLanguage.ts
// Mirrors the SaaS loader: lazy-imports the per-language dictionary JSON.
// Requires locales/{en,pt,es,pl,ru}.json to exist (committed alongside this).

export type DictValue = string | string[] | Dict
export type Dict = { [key: string]: DictValue }

const dictionaries: Record<string, () => Promise<Dict>> = {
  en: () =>
    import('@/locales/en.json').then(m => m.default as Dict),
  pt: () =>
    import('@/locales/pt.json').then(m => m.default as Dict),
  es: () =>
    import('@/locales/es.json').then(m => m.default as Dict),
  pl: () =>
    import('@/locales/pl.json').then(m => m.default as Dict),
  ru: () =>
    import('@/locales/ru.json').then(m => m.default as Dict),
}

export async function loadLanguage(lang: string): Promise<Dict> {
  const loader = dictionaries[lang] || dictionaries['en']
  return loader()
}
