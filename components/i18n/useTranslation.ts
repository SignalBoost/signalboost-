import { useState } from 'react';
import en from '../../locales/en.json';
import es from '../../locales/es.json';

const translations = { en, es };

export default function useTranslation() {
  const [lang, setLang] = useState('en');

  function t(key: string) {
    return translations[lang][key] || key;
  }

  return { t, lang, setLang };
}
