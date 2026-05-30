import { useRouter } from 'next/router';
import en from '../../locales/en.json';
import es from '../../locales/es.json';

const translations: Record<string, any> = { en, es };

export function useTranslation() {
  const { locale, asPath, push } = useRouter();
  const currentLocale = locale || 'en';
  const tData = translations[currentLocale] || translations['en'];

  // Função de busca de chaves aninhadas por notação de ponto (ex: 'navbar.reviews')
  const t = (keyString: string): string => {
    return keyString.split('.').reduce((obj, key) => obj?.[key], tData) || keyString;
  };

  const changeLanguage = (newLocale: string) => {
    push(asPath, asPath, { locale: newLocale });
  };

  return { t, currentLocale, changeLanguage };
}
