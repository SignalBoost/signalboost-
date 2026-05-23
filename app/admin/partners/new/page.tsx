// File: app/admin/partners/new/page.tsx
'use client'

import { useState } from 'react'

const GOLD = '#f5c542'
const DARK = '#0d1117'
const PANEL = '#0f141b'
const CARD = '#111822'
const BORDER = '#1e2630'
const TEXT = '#e6edf3'
const MUTED = '#9aa8b8'

const LANG_NAMES: Record<string, string> = {
  en: 'English', pt: 'Português', es: 'Español', pl: 'Polski', ru: 'Русский',
}

interface GeneratedPartner {
  id: string
  name: string
  regions: string[]
  url: string
  category: string
  category_key: string
  category_label: string
  network: string
  logo: string
  description: string
  description_i18n: Record<string, string>
  pitch_i18n: Record<string, string>
  tier: number
  featured: boolean
  travel_related: boolean
  regional_urls: Record<string, string>
  placements: Record<string, string[]>
}

export default function NewPartnerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [partner, setPartner] = useState<GeneratedPartner | null>(null)
  const [copied, setCopied] = useState(false)

  async function generate() {
    const value = url.trim()
    if (!value) { setError('Paste a partner URL first.'); return }
    setLoading(true); setError(null); setPartner(null); setCopied(false)
    try {
      const res = await fetch('/api/admin/generate-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) setError('You need to be logged in. Open /auth/login first.')
        else if (res.status === 403) setError('This account is not an admin.')
        else setError((data && data.error) || 'Generation failed.')
        return
      }
      setPartner(data.partner as GeneratedPartner)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const json = partner ? JSON.stringify(partner, null, 2) : ''

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copy failed — select the text manually.')
    }
  }

  const hasPlaceholders = partner
    ? json.includes('PASTE_AFFILIATE_URL_HERE')
    : false

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: DARK,
        color: TEXT,
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '48px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>
          Partner Generator
        </h1>
        <p style={{ color: MUTED, fontSize: 14.5, margin: '0 0 24px', lineHeight: 1.55 }}>
          Paste a partner&apos;s website URL. The AI drafts the catalog entry with
          descriptions and culture-specific pitches in all 5 languages. Review it,
          paste your real affiliate URLs in place of the placeholders, then add it
          to <code style={{ color: GOLD }}>public/partners.json</code>.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void generate() }}
            placeholder="https://partner-website.com"
            style={{
              flex: '1 1 320px', minWidth: 0, padding: '13px 15px', borderRadius: 10,
              border: `1px solid ${BORDER}`, background: CARD, color: TEXT,
              fontSize: 15, fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={() => void generate()}
            disabled={loading}
            style={{
              padding: '13px 22px', borderRadius: 10, border: 'none',
              cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
              color: DARK, fontWeight: 800, fontSize: 15,
              background: `linear-gradient(135deg, ${GOLD}, #d9a92e)`,
            }}
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 15px', borderRadius: 10, marginBottom: 18,
            background: 'rgba(248,133,122,0.08)', border: '1px solid rgba(248,133,122,0.3)',
            color: '#f8857a', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {partner && (
          <div style={{ display: 'grid', gap: 18 }}>
            {/* Quick human-readable preview */}
            <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{partner.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, padding: '3px 9px', borderRadius: 6, background: 'rgba(245,197,66,0.14)' }}>
                  {partner.category_label}
                </span>
                <span style={{ fontSize: 12, color: MUTED }}>
                  {partner.regions.join(', ')} · {partner.network}
                </span>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {Object.keys(LANG_NAMES).map((l) => (
                  <div key={l} style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                      {LANG_NAMES[l]}
                    </div>
                    <div style={{ fontSize: 13.5, marginBottom: 4 }}>
                      {partner.description_i18n?.[l] || <span style={{ color: MUTED }}>—</span>}
                    </div>
                    <div style={{ fontSize: 13, color: MUTED, fontStyle: 'italic' }}>
                      {partner.pitch_i18n?.[l] || <span>(no pitch)</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw JSON to copy */}
            <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>partners.json entry</span>
                <button
                  onClick={() => void copyJson()}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: `1px solid ${BORDER}`,
                    background: copied ? 'rgba(63,185,80,0.15)' : CARD,
                    color: copied ? '#3fb950' : TEXT, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {copied ? 'Copied ✓' : 'Copy JSON'}
                </button>
              </div>

              {hasPlaceholders && (
                <div style={{
                  fontSize: 12.5, color: GOLD, marginBottom: 10, padding: '8px 11px',
                  borderRadius: 8, background: 'rgba(245,197,66,0.1)', border: '1px solid rgba(245,197,66,0.3)',
                }}>
                  ⚠ Replace every <strong>PASTE_AFFILIATE_URL_HERE</strong> with your real
                  tracked affiliate link before committing.
                </div>
              )}

              <pre style={{
                margin: 0, padding: 14, borderRadius: 10, background: DARK,
                border: `1px solid ${BORDER}`, color: TEXT, fontSize: 12.5,
                lineHeight: 1.5, overflowX: 'auto', whiteSpace: 'pre',
                fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
              }}>
                {json}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
