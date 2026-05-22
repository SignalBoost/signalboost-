// File: components/PartnerDescription.tsx
'use client'

import { useTranslation } from '@/components/i18n/useTranslation'

type I18n = {
  en?: string
  pt?: string
  es?: string
  pl?: string
  ru?: string
}

/**
 * Renders a partner's description in the active site language.
 * - Uses the language from the i18n hook (browser/localStorage driven).
 * - Falls back: active language -> English (i18n) -> legacy `description`.
 * The partner page stays a static Server Component; only this text is dynamic.
 */
export function PartnerDescription({
  description,
  descriptionI18n,
}: {
  description: string
  descriptionI18n?: I18n
}) {
  const { lang } = useTranslation()

  const resolve = (): string => {
    if (descriptionI18n) {
      const key = lang as keyof I18n
      const wanted = descriptionI18n[key]
      if (wanted && wanted.trim()) return wanted
      if (descriptionI18n.en && descriptionI18n.en.trim()) return descriptionI18n.en
    }
    return description || ''
  }

  const text = resolve()
  if (!text) return null

  return <p className="partner-description">{text}</p>
}
