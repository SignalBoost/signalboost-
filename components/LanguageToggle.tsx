import useTranslation from './useTranslation';

export default function LanguageToggle() {
  const { lang, setLang } = useTranslation();

  return (
    <div style={styles.toggleContainer}>
      <button onClick={() => setLang('en')} disabled={lang === 'en'}>
        English
      </button>
      <button onClick={() => setLang('es')} disabled={lang === 'es'}>
        Español
      </button>
    </div>
  );
}

const styles = {
  toggleContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
};
