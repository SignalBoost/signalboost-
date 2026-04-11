import { useTranslation } from "next-i18next";

const Header = () => {
  const { t } = useTranslation("common");

  return (
    <header>
      <h1>{t("welcome")}</h1>
      <nav>
        <a href="/travel">{t("travel")}</a>
        <a href="/fashion">{t("fashion")}</a>
        <a href="/tech">{t("tech")}</a>
        <a href="/food">{t("food")}</a>
      </nav>
    </header>
  );
};

export default Header;
