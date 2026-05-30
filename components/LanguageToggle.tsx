"use client";

import React from "react";
import useTranslation from "@/components/i18n/useTranslation";

export default function LanguageToggle() {
  const { lang, setLang } = useTranslation();

  return (
    <div style={styles.toggleContainer}>
      <button 
        onClick={() => setLang('en')} 
        disabled={lang === 'en'}
        style={{ ...styles.toggleBtn, ...(lang === 'en' ? styles.active : {}) }}
      >
        EN
      </button>
      <button 
        onClick={() => setLang('es')} 
        disabled={lang === 'es'}
        style={{ ...styles.toggleBtn, ...(lang === 'es' ? styles.active : {}) }}
      >
        ES
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toggleContainer: {
    display: 'flex',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    width: 'fit-content'
  },
  toggleBtn: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  active: {
    backgroundColor: '#dfa837',
    color: '#030305',
    cursor: 'default'
  }
};
