import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt from '../../locales/pt.json';
import pl from '../../locales/pl.json';
import ru from '../../locales/ru.json';

const translations: Record<string, any> = { en, es, pt, pl, ru };
type LocaleType = 'en' | 'es' | 'pt' | 'pl' | 'ru';

function useTranslation() {
  const router = useRouter();
  const [lang, setLangState] = useState<LocaleType>('en');

  // Sincroniza o estado interno com a detecção automática por IP/Geolocalização do Next.js
  useEffect(() => {
    if (router?.locale && ['en', 'es', 'pt', 'pl', 'ru'].includes(router.locale)) {
      setLangState(router.locale as LocaleType);
    }
  }, [router?.locale]);

  function t(key: string): string {
    const currentDict = translations[lang] || translations['en'];
    // Suporte para busca profunda por ponto (ex: 'partner.featured')
    return key.split('.').reduce((obj, k) => obj?.[k], currentDict) || key;
  }

  function setLang(newLocale: LocaleType) {
    setLangState(newLocale);
    if (router?.push) {
      router.push(router.asPath, router.asPath, { locale: newLocale });
    }
  }

  return { t, lang, setLang };
}

export default useTranslation;
