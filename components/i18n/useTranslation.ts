"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt from '../../locales/pt.json';
import pl from '../../locales/pl.json';
import ru from '../../locales/ru.json';

const translations: Record<string, any> = { en, es, pt, pl, ru };
const supportedLocales = ['en', 'es', 'pt', 'pl', 'ru'] as const;
type LocaleType = (typeof supportedLocales)[number];

function isLocale(locale: string | null | undefined): locale is LocaleType {
  return supportedLocales.includes(locale as LocaleType);
}

function localeFromPathname(pathname: string | null): LocaleType | null {
  const firstSegment = pathname?.split('/').filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : null;
}

function useTranslation() {
  const pathname = usePathname();
  const [lang, setLangState] = useState<LocaleType>('en');

  // Sincroniza o estado interno com o locale salvo ou com o prefixo ativo da URL.
  useEffect(() => {
    const pathLocale = localeFromPathname(pathname);
    const savedLocale = window.localStorage.getItem('signalboost-locale');

    if (pathLocale) {
      setLangState(pathLocale);
    } else if (isLocale(savedLocale)) {
      setLangState(savedLocale);
    }
  }, [pathname]);

  function t(key: string): string {
    const currentDict = translations[lang] || translations['en'];
    // Suporte para busca profunda por ponto (ex: 'partner.featured')
    return key.split('.').reduce((obj, k) => obj?.[k], currentDict) || key;
  }

  function setLang(newLocale: LocaleType) {
    setLangState(newLocale);
    window.localStorage.setItem('signalboost-locale', newLocale);
  }

  return { t, lang, setLang };
}

export default useTranslation;
