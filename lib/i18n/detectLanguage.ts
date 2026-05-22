// File: lib/i18n/detectLanguage.ts
// Mirrors the SaaS i18n system: browser language -> one of en/pt/es/pl/ru.

export function detectLanguage(): string {
  if (typeof navigator === 'undefined') {
    return 'en'
  }

  const lang =
    (
      navigator.languages?.[0] ||
      navigator.language ||
      'en'
    ).toLowerCase()

  if (lang.startsWith('pt')) {
    return 'pt'
  }

  if (lang.startsWith('es')) {
    return 'es'
  }

  if (lang.startsWith('pl')) {
    return 'pl'
  }

  if (lang.startsWith('ru')) {
    return 'ru'
  }

  if (lang.startsWith('en')) {
    return 'en'
  }

  return 'en'
}
