import { useRouter } from 'next/router';
import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt from '../../locales/pt.json';
import pl from '../../locales/pl.json';
import ru from '../../locales/ru.json';

const translations: Record<string, any> = { en, es, pt, pl, ru };

export default function useTranslation() {
  const { locale, asPath, push } = useRouter();
  
  const lang = locale || 'en';
  const tData = translations[lang] || translations['en'];

  const t = (keyString: string): string => {
    return keyString.split('.').reduce((obj, key) => obj?.[key], tData) || keyString;
  };

  const setLang = (newLocale: string) => {
    push(asPath, asPath, { locale: newLocale });
  };

  return { t, lang, setLang };
}
