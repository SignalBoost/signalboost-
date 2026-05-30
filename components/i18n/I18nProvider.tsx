// File: components/i18n/I18nProvider.tsx
'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { detectLanguage } from '@/lib/i18n/detectLanguage'
import { loadLanguage, type Dict } from '@/lib/i18n/loadLanguage'
import {
  LANGUAGE_COOKIE,
  LEGACY_LANGUAGE_COOKIE,
  MANUAL_LANGUAGE_COOKIE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  normalizeLocale,
} from '@/lib/i18n/language'

type I18nContextType = {
  lang: string
  dict: Dict
  setLang: (lang: string) => void
}

const I18nContext =
  createContext<I18nContextType | null>(null)

function readCookie(name: string) {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
}


function writeLanguageCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

function persistLanguage(value: string, manual = false) {
  localStorage.setItem(LANGUAGE_COOKIE, value)
  localStorage.setItem(LEGACY_LANGUAGE_COOKIE, value)
  writeLanguageCookie(LANGUAGE_COOKIE, value)
  writeLanguageCookie(LEGACY_LANGUAGE_COOKIE, value)
  if (manual) {
    localStorage.setItem('signalboost_language_prompted', '1')
    writeLanguageCookie(MANUAL_LANGUAGE_COOKIE, '1')
  }
}

async function detectMexicoLanguage() {
  if (typeof window === 'undefined') return null

  try {
    const res = await fetch('/api/geo', { cache: 'no-store' })
    if (!res.ok) return null

    const data = (await res.json()) as { country?: string }
    return data.country?.toUpperCase() === 'MX' ? 'es' : null
  } catch {
    return null
  }
}

async function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en'
  }
  const saved =
    localStorage.getItem(LANGUAGE_COOKIE) ||
    localStorage.getItem(LEGACY_LANGUAGE_COOKIE) ||
    readCookie(LANGUAGE_COOKIE) ||
    readCookie(LEGACY_LANGUAGE_COOKIE)
  if (isSupportedLocale(saved)) {
    return saved
  }

  const countryLang = await detectMexicoLanguage()
  if (countryLang && isSupportedLocale(countryLang)) {
    return countryLang
  }

  const browser =
    navigator.languages?.[0] ||
    navigator.language ||
    null
  const browserLang = normalizeLocale(browser)
  if (isSupportedLocale(browserLang)) {
    return browserLang
  }
  const detected = normalizeLocale(detectLanguage())
  if (isSupportedLocale(detected)) {
    return detected
  }
  return 'en'
}

export function I18nProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [lang, setLangState] = useState('en')
  const [dict, setDict] = useState<Dict>({})

  useEffect(() => {
    async function init() {
      const initialLang = await getInitialLanguage()
      const loaded = await loadLanguage(initialLang)
      setLangState(initialLang)
      setDict(loaded)
      persistLanguage(initialLang)
    }
    init()
  }, [])

  const setLang = async (newLang: string) => {
    const normalized = normalizeLocale(newLang)
    const safeLang = SUPPORTED_LOCALES.includes(normalized)
      ? normalized
      : 'en'
    persistLanguage(safeLang, true)
    const loaded = await loadLanguage(safeLang)
    setLangState(safeLang)
    setDict(loaded)
  }

  return (
    <I18nContext.Provider
      value={{
        lang,
        dict,
        setLang,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error(
      'useI18n must be used inside I18nProvider'
    )
  }
  return ctx
}
