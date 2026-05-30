import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt from '../../locales/pt.json';
import pl from '../../locales/pl.json';
import ru from '../../locales/ru.json';

const translations: Record<string, any> = { en, es, pt, pl, ru };
type LocaleType = 'en' | 'es' | 'pt' | 'pl' | 'ru';
const supported: LocaleType[] = ['en', 'es', 'pt', 'pl', 'ru'];

function normalizeLocale(value?: string | null): LocaleType {
  const lower = (value || '').toLowerCase();
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('pt')) return 'pt';
  if (lower.startsWith('pl')) return 'pl';
  if (lower.startsWith('ru')) return 'ru';
  return 'en';
}

function useTranslation() {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLangState] = useState<LocaleType>('en');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('signalboost_language') : null;
    const browser = typeof navigator !== 'undefined' ? navigator.language : null;
    const pathLocale = pathname?.split('/').find((part) => supported.includes(part as LocaleType));
    setLangState(normalizeLocale(pathLocale || saved || browser));
  }, [pathname]);

  function t(key: string): string {
    const currentDict = translations[lang] || translations.en;
    return key.split('.').reduce((obj, k) => obj?.[k], currentDict) || key;
  }

  function setLang(newLocale: LocaleType) {
    const safeLocale = supported.includes(newLocale) ? newLocale : 'en';
    setLangState(safeLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('signalboost_language', safeLocale);
      window.localStorage.setItem('site-language', safeLocale);
    }
    router.refresh();
  }

  return { t, lang, setLang };
}

export default useTranslation;
