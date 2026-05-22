// File: components/LanguageToggle.tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/components/i18n/useTranslation'

// Display names for each supported language (shown as the "Local" option).
const LANG_NAMES: Record<string, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  pl: 'Polski',
  ru: 'Русский',
}

/**
 * Local / English toggle, mirroring the site's two-state model.
 * - "Local" = the non-English language the browser detected (pt/es/pl/ru).
 * - If the visitor's local language IS English, only English shows (no toggle).
 * Calls setLang from the i18n provider; the choice persists via localStorage.
 */
export function LanguageToggle() {
  const { lang, setLang } = useTranslation()

  // The local (non-English) language available to this visitor. Derived once
  // from the browser, so the toggle target is stable even after switching.
  const [local, setLocal] = useState<string | null>(null)

  useEffect(() => {
    const fromBrowser = (
      navigator.languages?.[0] ||
      navigator.language ||
      'en'
    ).toLowerCase()
    let detected = 'en'
    if (fromBrowser.startsWith('pt')) detected = 'pt'
    else if (fromBrowser.startsWith('es')) detected = 'es'
    else if (fromBrowser.startsWith('pl')) detected = 'pl'
    else if (fromBrowser.startsWith('ru')) detected = 'ru'
    // If the saved language is non-English, prefer it as the "local" target
    // (covers a returning visitor who already picked a local language).
    if (lang !== 'en' && lang in LANG_NAMES) detected = lang
    setLocal(detected === 'en' ? null : detected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // English-only visitor: nothing to toggle.
  if (!local) {
    return (
      <div className="lang-toggle" aria-label="Language">
        <span className="lang-toggle-static">🌐 English</span>
        <style>{TOGGLE_CSS}</style>
      </div>
    )
  }

  const isEnglish = lang === 'en'

  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <span className="lang-toggle-globe" aria-hidden="true">🌐</span>
      <button
        type="button"
        className={`lang-toggle-btn ${!isEnglish ? 'is-active' : ''}`}
        aria-pressed={!isEnglish}
        onClick={() => setLang(local)}
      >
        {LANG_NAMES[local]}
      </button>
      <button
        type="button"
        className={`lang-toggle-btn ${isEnglish ? 'is-active' : ''}`}
        aria-pressed={isEnglish}
        onClick={() => setLang('en')}
      >
        English
      </button>
      <style>{TOGGLE_CSS}</style>
    </div>
  )
}

const TOGGLE_CSS = `
.lang-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
  background: #111822;
  border: 1px solid #1e2630;
  font-family: Arial, Helvetica, sans-serif;
}
.lang-toggle-globe { padding: 0 4px 0 6px; font-size: 13px; }
.lang-toggle-static {
  padding: 6px 10px; font-size: 13px; color: #9aa8b8; font-weight: 600;
}
.lang-toggle-btn {
  appearance: none;
  border: none;
  background: transparent;
  color: #9aa8b8;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 11px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
  font-family: inherit;
}
.lang-toggle-btn:hover { color: #e6edf3; }
.lang-toggle-btn.is-active {
  background: linear-gradient(135deg, #f5c542, #d9a92e);
  color: #0d1117;
}
`
