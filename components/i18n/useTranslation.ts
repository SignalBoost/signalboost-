import { useRouter } from 'next/router';
import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt from '../../locales/pt.json';
import pl from '../../locales/pl.json';
import ru from '../../locales/ru.json';

const translations: Record<string, any> = { en, es, pt, pl, ru };

// EXPORTAÇÃO NOMEADA EXATA QUE OS SEUS COMPONENTES SASS ESPERAM
export function useTranslation() {
  const router = useRouter();
  
  // Se o router não estiver pronto ou locale for undefined, assume 'en'
  const lang = router?.locale || 'en';
  const tData = translations[lang] || translations['en'];

  // Busca profunda de chaves por ponto (ex: 'partner.featured')
  const t = (keyString: string): string => {
    if (!keyString) return '';
    return keyString.split('.').reduce((obj, key) => obj?.[key], tData) || keyString;
  };

  const setLang = (newLocale: string) => {
    if (router?.push) {
      router.push(router.asPath, router.asPath, { locale: newLocale });
    }
  };

  return { t, lang, setLang };
}
