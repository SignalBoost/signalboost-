"use client";

import { useEffect, useRef, useState } from "react";
import useTranslation from "@/components/i18n/useTranslation";
import { useRegion, REGIONS } from "@/lib/region";
import type { SupportedLocale } from "@/lib/i18n/language";

// One compact globe control that opens a small panel holding BOTH the region
// and language pickers. Region still drives partner filtering — it's just
// tucked inside this menu instead of being its own pill.
const LOCALES: Array<{ locale: SupportedLocale; label: string }> = [
  { locale: "en", label: "English" },
  { locale: "es", label: "Español" },
  { locale: "pt", label: "Português" },
  { locale: "pl", label: "Polski" },
  { locale: "ru", label: "Русский" },
];

export default function LocaleMenu() {
  const { lang, setLang } = useTranslation();
  const [region, setRegion] = useRegion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="lm-wrap" ref={ref}>
      <button type="button" className="lm-trigger" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="lm-globe" aria-hidden="true">🌐</span>
        <span className="lm-code">{lang.toUpperCase()}</span>
        <span className="lm-caret" aria-hidden="true">▾</span>
      </button>

      <div className={open ? "lm-panel lm-panel-open" : "lm-panel"} role="menu">
        <div className="lm-row">
          <span className="lm-row-label">Region</span>
          <select className="lm-select" aria-label="Select your region" value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
        </div>
        <div className="lm-row">
          <span className="lm-row-label">Language</span>
          <select className="lm-select" aria-label="Select site language" value={lang} onChange={(e) => setLang(e.target.value as SupportedLocale)}>
            {LOCALES.map(({ locale, label }) => (
              <option key={locale} value={locale}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <style>{LM_CSS}</style>
    </div>
  );
}

const LM_CSS = `
.lm-wrap{position:relative;display:inline-flex;}
.lm-trigger{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.82);font-size:12px;font-weight:800;padding:7px 12px;cursor:pointer;font-family:inherit;white-space:nowrap;transition:border-color .15s ease,background .15s ease;}
.lm-trigger:hover{border-color:rgba(245,197,66,.4);background:rgba(245,197,66,.08);color:#fff;}
.lm-globe{font-size:13px;line-height:1;}
.lm-caret{font-size:9px;opacity:.7;}
.lm-panel{position:absolute;top:calc(100% + 10px);right:0;min-width:210px;display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:linear-gradient(180deg,rgba(18,18,26,.98),rgba(10,10,16,.98));box-shadow:0 24px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.05);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .16s ease,transform .16s ease,visibility .16s;z-index:1100;}
.lm-panel-open{opacity:1;visibility:visible;transform:translateY(0);}
.lm-row{display:flex;flex-direction:column;gap:4px;}
.lm-row-label{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#dfa837;}
.lm-select{appearance:auto;width:100%;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:rgba(255,255,255,.05);color:#fff;font-size:13px;font-weight:700;padding:8px 10px;cursor:pointer;font-family:inherit;}
.lm-select option{background:#12121a;color:#fff;}
`;
