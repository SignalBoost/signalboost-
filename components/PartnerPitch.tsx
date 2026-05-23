// File: components/PartnerPitch.tsx
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
 * Renders a partner's AI-generated growth pitch in the ACTIVE site language.
 *
 * IMPORTANT — no English fallback (unlike PartnerDescription):
 * each language's pitch is written for that culture (local customs, holidays,
 * gifting seasons, name days, etc.), so an English pitch shown to a Polish
 * reader would lose its whole point. If the active-language pitch is missing,
 * we render nothing rather than showing a culturally-wrong version.
 *
 * English readers still get the English pitch normally.
 */
export function PartnerPitch({
  pitchI18n,
}: {
  pitchI18n?: I18n
}) {
  const { lang } = useTranslation()

  if (!pitchI18n) return null

  const key = lang as keyof I18n
  const text = pitchI18n[key]

  if (!text || !text.trim()) return null

  return <p className="partner-pitch">{text}</p>
}
