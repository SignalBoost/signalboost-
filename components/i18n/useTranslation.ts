import useTranslation from '../components/i18n/useTranslation';

export default function HomeCockpit() {
  const { t } = useTranslation();

  return (
    <h1>{t('homepage.title')}</h1>
  );
}
