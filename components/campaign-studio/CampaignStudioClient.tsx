"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import useTranslation from "@/components/i18n/useTranslation";

// The live tool + licensing contact. Swap LICENSE_CONTACT for your real inbox.
const SAAS_AGENCY = "https://saas.signalboostapp.com/agency";
const LICENSE_CONTACT =
  "mailto:partners@signalboostapp.com?subject=Licensing%20Campaign%20Studio";

type Panel = { t: string; b: string };
type Copy = {
  eyebrow: string;
  h1: string;
  sub: string;
  ctaStart: string;
  ctaLicense: string;
  ctaDemo: string;
  outHead: string;
  out: [Panel, Panel, Panel];
  howHead: string;
  how: [Panel, Panel, Panel];
  forkHead: string;
  aTag: string;
  aTitle: string;
  aBody: string;
  aBullets: string[];
  aCta: string;
  bTag: string;
  bTitle: string;
  bBody: string;
  bBullets: string[];
  bCta: string;
  embHead: string;
  emb: [Panel, Panel, Panel];
  finalHead: string;
  finalSub: string;
};

const COPY: Record<string, Copy> = {
  en: {
    eyebrow: "Portable module · Campaign Studio",
    h1: "Your whole campaign — script, voiceover, and video — from one prompt.",
    sub: "Campaign Studio turns a single brief into a finished, branded campaign. Use it as a service, or license the engine and drop it into your own product.",
    ctaStart: "Start free",
    ctaLicense: "License this module",
    ctaDemo: "See it work on your business",
    outHead: "One prompt in. A finished campaign out.",
    out: [
      { t: "Plain-language brief", b: "Describe the product, audience, and tone. No templates to wrangle, no timeline to storyboard." },
      { t: "Studio-grade output", b: "An AI script, natural voiceover, and a brand-overlaid video render — ready to publish." },
      { t: "Your credits or your keys", b: "Prepaid credits with no monthly waste, or bring your own provider keys and run at zero platform cost." },
    ],
    howHead: "How it works",
    how: [
      { t: "1 · Brief", b: "Type one prompt. The script is built around your product, not a generic pitch." },
      { t: "2 · Produce", b: "Approve, and it generates voiceover and video — charged before it spends, never after." },
      { t: "3 · Publish", b: "Send approved output straight to your channels, or hand off the files." },
    ],
    forkHead: "Two ways to run it",
    aTag: "For teams",
    aTitle: "Use it as a service",
    aBody: "Sign up and run campaigns today. Pay only for what you render.",
    aBullets: ["One prompt to finished video", "Natural, studio-grade voiceover", "Prepaid credits, transparent markup", "Five languages built in"],
    aCta: "Start free",
    bTag: "For product teams",
    bTitle: "License the engine",
    bBody: "Campaign Studio is a portable module. Embed the exact engine inside your own product.",
    bBullets: ["Core imports nothing host-specific", "Swap the host, keep the engine", "Bring-your-own-key, zero platform cost", "Isolation-tested, production-proven"],
    bCta: "Talk to us",
    embHead: "Built to be embedded",
    emb: [
      { t: "Clean core, thin host", b: "The render core defines the contracts and imports nothing platform-specific. One thin host file wires it to your wallet and storage." },
      { t: "Billing that never leaks", b: "Reserve-before-produce: insufficient funds never call the provider, and failures refund net-zero. Your margins stay intact." },
      { t: "Own the keys, own the cost", b: "Run on your own provider keys for zero platform cost, or resell render credits at your own markup." },
    ],
    finalHead: "See it produce a campaign in minutes.",
    finalSub: "Start free, or license the engine for your own product.",
  },
  es: {
    eyebrow: "Módulo portátil · Campaign Studio",
    h1: "Toda tu campaña — guion, voz en off y video — desde un solo prompt.",
    sub: "Campaign Studio convierte un solo brief en una campaña terminada y con tu marca. Úsalo como servicio, o licencia el motor e intégralo en tu propio producto.",
    ctaStart: "Empezar gratis",
    ctaLicense: "Licenciar este módulo",
    ctaDemo: "Míralo funcionar con tu negocio",
    outHead: "Un prompt de entrada. Una campaña terminada de salida.",
    out: [
      { t: "Brief en lenguaje natural", b: "Describe el producto, la audiencia y el tono. Sin plantillas que ajustar ni guion gráfico que armar." },
      { t: "Resultado de calidad de estudio", b: "Un guion con IA, voz en off natural y un video renderizado con tu marca — listo para publicar." },
      { t: "Tus créditos o tus llaves", b: "Créditos prepagados sin gasto mensual, o usa tus propias llaves de proveedor y opera con costo cero para la plataforma." },
    ],
    howHead: "Cómo funciona",
    how: [
      { t: "1 · Brief", b: "Escribe un prompt. El guion se construye en torno a tu producto, no un discurso genérico." },
      { t: "2 · Producir", b: "Aprueba y genera la voz en off y el video — se cobra antes de gastar, nunca después." },
      { t: "3 · Publicar", b: "Envía el resultado aprobado directo a tus canales, o entrega los archivos." },
    ],
    forkHead: "Dos formas de usarlo",
    aTag: "Para equipos",
    aTitle: "Úsalo como servicio",
    aBody: "Regístrate y lanza campañas hoy. Paga solo por lo que renderizas.",
    aBullets: ["De un prompt al video terminado", "Voz en off natural, calidad de estudio", "Créditos prepagados, margen transparente", "Cinco idiomas incluidos"],
    aCta: "Empezar gratis",
    bTag: "Para equipos de producto",
    bTitle: "Licencia el motor",
    bBody: "Campaign Studio es un módulo portátil. Integra el mismo motor dentro de tu propio producto.",
    bBullets: ["El núcleo no importa nada específico del host", "Cambia el host, conserva el motor", "Con tus propias llaves, costo cero", "Probado en aislamiento, listo para producción"],
    bCta: "Hablemos",
    embHead: "Diseñado para integrarse",
    emb: [
      { t: "Núcleo limpio, host ligero", b: "El núcleo de render define los contratos y no importa nada específico de la plataforma. Un archivo host ligero lo conecta a tu billetera y almacenamiento." },
      { t: "Facturación que no se fuga", b: "Reservar antes de producir: sin fondos nunca se llama al proveedor, y los fallos reembolsan a saldo cero. Tu margen queda intacto." },
      { t: "Tus llaves, tu costo", b: "Opera con tus propias llaves a costo cero, o revende créditos de render con tu propio margen." },
    ],
    finalHead: "Míralo producir una campaña en minutos.",
    finalSub: "Empieza gratis, o licencia el motor para tu propio producto.",
  },
  pt: {
    eyebrow: "Módulo portátil · Campaign Studio",
    h1: "Toda a sua campanha — roteiro, locução e vídeo — a partir de um único prompt.",
    sub: "O Campaign Studio transforma um único briefing numa campanha pronta e com a sua marca. Use como serviço, ou licencie o motor e integre-o no seu próprio produto.",
    ctaStart: "Começar grátis",
    ctaLicense: "Licenciar este módulo",
    ctaDemo: "Veja funcionar no seu negócio",
    outHead: "Um prompt na entrada. Uma campanha pronta na saída.",
    out: [
      { t: "Briefing em linguagem natural", b: "Descreva o produto, o público e o tom. Sem modelos para ajustar nem storyboard para montar." },
      { t: "Resultado com qualidade de estúdio", b: "Um roteiro com IA, locução natural e um vídeo renderizado com a sua marca — pronto para publicar." },
      { t: "Seus créditos ou suas chaves", b: "Créditos pré-pagos sem desperdício mensal, ou use suas próprias chaves de provedor e opere com custo zero para a plataforma." },
    ],
    howHead: "Como funciona",
    how: [
      { t: "1 · Briefing", b: "Escreva um prompt. O roteiro é construído em torno do seu produto, não de um discurso genérico." },
      { t: "2 · Produzir", b: "Aprove e ele gera a locução e o vídeo — cobrado antes de gastar, nunca depois." },
      { t: "3 · Publicar", b: "Envie o resultado aprovado direto para seus canais, ou entregue os arquivos." },
    ],
    forkHead: "Duas formas de usar",
    aTag: "Para equipes",
    aTitle: "Use como serviço",
    aBody: "Cadastre-se e rode campanhas hoje. Pague apenas pelo que renderizar.",
    aBullets: ["De um prompt ao vídeo pronto", "Locução natural, qualidade de estúdio", "Créditos pré-pagos, margem transparente", "Cinco idiomas incluídos"],
    aCta: "Começar grátis",
    bTag: "Para equipes de produto",
    bTitle: "Licencie o motor",
    bBody: "O Campaign Studio é um módulo portátil. Integre o mesmo motor dentro do seu próprio produto.",
    bBullets: ["O núcleo não importa nada específico do host", "Troque o host, mantenha o motor", "Com suas próprias chaves, custo zero", "Testado em isolamento, pronto para produção"],
    bCta: "Fale conosco",
    embHead: "Feito para ser integrado",
    emb: [
      { t: "Núcleo limpo, host leve", b: "O núcleo de render define os contratos e não importa nada específico da plataforma. Um arquivo host leve o conecta à sua carteira e ao armazenamento." },
      { t: "Cobrança que não vaza", b: "Reservar antes de produzir: sem saldo nunca chama o provedor, e falhas reembolsam a saldo zero. Sua margem fica intacta." },
      { t: "Suas chaves, seu custo", b: "Opere com suas próprias chaves a custo zero, ou revenda créditos de render com sua própria margem." },
    ],
    finalHead: "Veja produzir uma campanha em minutos.",
    finalSub: "Comece grátis, ou licencie o motor para o seu próprio produto.",
  },
  pl: {
    eyebrow: "Moduł przenośny · Campaign Studio",
    h1: "Cała kampania — scenariusz, lektor i wideo — z jednego polecenia.",
    sub: "Campaign Studio zamienia jeden brief w gotową kampanię z Twoją marką. Używaj jako usługi albo licencjonuj silnik i wbuduj go we własny produkt.",
    ctaStart: "Zacznij za darmo",
    ctaLicense: "Licencjonuj ten moduł",
    ctaDemo: "Zobacz, jak działa na Twoim biznesie",
    outHead: "Jedno polecenie na wejściu. Gotowa kampania na wyjściu.",
    out: [
      { t: "Brief w naturalnym języku", b: "Opisz produkt, odbiorców i ton. Bez szablonów do dopasowania i bez storyboardu do układania." },
      { t: "Jakość studyjna na wyjściu", b: "Scenariusz od AI, naturalny lektor i wyrenderowane wideo z Twoją marką — gotowe do publikacji." },
      { t: "Twoje kredyty albo Twoje klucze", b: "Kredyty przedpłacone bez comiesięcznego marnotrawstwa albo własne klucze dostawcy i zerowy koszt dla platformy." },
    ],
    howHead: "Jak to działa",
    how: [
      { t: "1 · Brief", b: "Wpisz jedno polecenie. Scenariusz powstaje wokół Twojego produktu, a nie ogólnego przekazu." },
      { t: "2 · Produkcja", b: "Zatwierdź, a system wygeneruje lektora i wideo — płatność przed wydatkiem, nigdy po." },
      { t: "3 · Publikacja", b: "Wyślij zatwierdzony materiał prosto na swoje kanały albo przekaż pliki." },
    ],
    forkHead: "Dwa sposoby użycia",
    aTag: "Dla zespołów",
    aTitle: "Używaj jako usługi",
    aBody: "Zarejestruj się i uruchamiaj kampanie już dziś. Płać tylko za to, co wyrenderujesz.",
    aBullets: ["Od polecenia do gotowego wideo", "Naturalny lektor w jakości studyjnej", "Kredyty przedpłacone, przejrzysta marża", "Pięć języków w standardzie"],
    aCta: "Zacznij za darmo",
    bTag: "Dla zespołów produktowych",
    bTitle: "Licencjonuj silnik",
    bBody: "Campaign Studio to moduł przenośny. Wbuduj ten sam silnik we własny produkt.",
    bBullets: ["Rdzeń nie importuje niczego specyficznego dla hosta", "Wymień host, zachowaj silnik", "Własne klucze, zerowy koszt platformy", "Przetestowany w izolacji, gotowy produkcyjnie"],
    bCta: "Porozmawiajmy",
    embHead: "Stworzony do wbudowania",
    emb: [
      { t: "Czysty rdzeń, cienki host", b: "Rdzeń renderujący definiuje kontrakty i nie importuje niczego specyficznego dla platformy. Jeden cienki plik hosta łączy go z Twoim portfelem i magazynem." },
      { t: "Rozliczenia, które nie przeciekają", b: "Rezerwacja przed produkcją: brak środków nigdy nie wywoła dostawcy, a błędy zwracają do zera. Twoja marża pozostaje nienaruszona." },
      { t: "Twoje klucze, Twój koszt", b: "Działaj na własnych kluczach przy zerowym koszcie albo odsprzedawaj kredyty renderowania z własną marżą." },
    ],
    finalHead: "Zobacz, jak tworzy kampanię w kilka minut.",
    finalSub: "Zacznij za darmo albo licencjonuj silnik dla własnego produktu.",
  },
  ru: {
    eyebrow: "Переносимый модуль · Campaign Studio",
    h1: "Вся кампания — сценарий, озвучка и видео — из одного запроса.",
    sub: "Campaign Studio превращает один бриф в готовую кампанию с вашим брендом. Используйте как сервис или лицензируйте движок и встройте его в свой продукт.",
    ctaStart: "Начать бесплатно",
    ctaLicense: "Лицензировать модуль",
    ctaDemo: "Посмотрите, как работает на вашем бизнесе",
    outHead: "Один запрос на входе. Готовая кампания на выходе.",
    out: [
      { t: "Бриф простыми словами", b: "Опишите продукт, аудиторию и тон. Без шаблонов и раскадровки." },
      { t: "Результат студийного уровня", b: "Сценарий от ИИ, естественная озвучка и видео с вашим брендом — готово к публикации." },
      { t: "Ваши кредиты или ваши ключи", b: "Предоплаченные кредиты без ежемесячных потерь или собственные ключи провайдера с нулевой стоимостью для платформы." },
    ],
    howHead: "Как это работает",
    how: [
      { t: "1 · Бриф", b: "Введите один запрос. Сценарий строится вокруг вашего продукта, а не общей подачи." },
      { t: "2 · Производство", b: "Подтвердите — и система создаст озвучку и видео: списание до траты, никогда после." },
      { t: "3 · Публикация", b: "Отправьте одобренный результат прямо в свои каналы или передайте файлы." },
    ],
    forkHead: "Два способа использования",
    aTag: "Для команд",
    aTitle: "Используйте как сервис",
    aBody: "Зарегистрируйтесь и запускайте кампании уже сегодня. Платите только за то, что рендерите.",
    aBullets: ["От запроса до готового видео", "Естественная озвучка студийного уровня", "Предоплаченные кредиты, прозрачная наценка", "Пять языков из коробки"],
    aCta: "Начать бесплатно",
    bTag: "Для продуктовых команд",
    bTitle: "Лицензируйте движок",
    bBody: "Campaign Studio — переносимый модуль. Встройте тот же движок в свой продукт.",
    bBullets: ["Ядро не импортирует ничего специфичного для хоста", "Смените хост, сохраните движок", "Свои ключи — нулевая стоимость платформы", "Протестировано изолированно, готово к продакшену"],
    bCta: "Связаться с нами",
    embHead: "Создан для встраивания",
    emb: [
      { t: "Чистое ядро, тонкий хост", b: "Ядро рендера задаёт контракты и не импортирует ничего специфичного для платформы. Один тонкий файл-хост связывает его с вашим кошельком и хранилищем." },
      { t: "Биллинг без утечек", b: "Резерв до производства: при нехватке средств провайдер не вызывается, а сбои возвращают средства в ноль. Ваша маржа не страдает." },
      { t: "Свои ключи, своя стоимость", b: "Работайте на своих ключах с нулевой стоимостью или перепродавайте кредиты рендера со своей наценкой." },
    ],
    finalHead: "Посмотрите, как за минуты создаётся кампания.",
    finalSub: "Начните бесплатно или лицензируйте движок для своего продукта.",
  },
};
const s: Record<string, CSSProperties> = {
  panelH3: { margin: "6px 0 8px", fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: "#fff" },
  forkGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 },
  forkCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 26,
    background: "linear-gradient(180deg, rgba(17,24,39,0.78), rgba(7,10,17,0.86))",
    boxShadow: "0 24px 80px rgba(0,0,0,0.26)",
    backdropFilter: "blur(18px)",
  },
  forkCardLicense: { borderColor: "rgba(245,197,66,0.4)" },
  forkTag: {
    alignSelf: "flex-start",
    borderRadius: 999,
    background: "rgba(245,197,66,0.14)",
    color: "var(--gold)",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "6px 10px",
  },
  forkTitle: { margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" },
  forkBody: { margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.55 },
  bullets: { display: "grid", gap: 9, margin: "2px 0 6px", padding: 0, listStyle: "none" },
  bullet: { display: "flex", gap: 9, color: "rgba(255,255,255,0.82)", fontSize: 13.5, lineHeight: 1.45 },
  tick: { color: "var(--gold)", fontWeight: 900, flex: "0 0 auto" },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    borderRadius: 999,
    background: "var(--gold)",
    color: "#11151c",
    fontWeight: 900,
    fontSize: 13,
    minHeight: 44,
    padding: "0 20px",
    textDecoration: "none",
    boxShadow: "0 18px 40px rgba(245,197,66,0.2)",
  },
  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 13,
    minHeight: 44,
    padding: "0 20px",
    textDecoration: "none",
  },
  demoLink: { color: "var(--gold)", fontWeight: 800, fontSize: 13, textDecoration: "none" },
};

export default function CampaignStudioClient() {
  const { lang } = useTranslation();
  const c = COPY[lang] ?? COPY.en;

  return (
    <main className="cockpit-page">
      <section className="cockpit-hero" style={{ minHeight: "auto", padding: "72px 0 44px" }}>
        <div className="cockpit-orbit" aria-hidden="true" />
        <p className="cockpit-eyebrow">{c.eyebrow}</p>
        <h1 style={{ maxWidth: 880 }}>{c.h1}</h1>
        <p className="cockpit-subtitle">{c.sub}</p>
        <div className="cockpit-actions">
          <a className="cockpit-primary" href={SAAS_AGENCY}>{c.ctaStart}</a>
          <a className="cockpit-secondary" href={LICENSE_CONTACT}>{c.ctaLicense}</a>
        </div>
        <p style={{ marginTop: 14 }}>
          <Link href="/demo" style={s.demoLink}>{c.ctaDemo} →</Link>
        </p>
      </section>

      <section className="cockpit-section">
        <div className="cockpit-section-heading"><h2>{c.outHead}</h2></div>
        <div className="module-detail">
          {c.out.map((p) => <div key={p.t} className="module-detail-panel"><h3 style={s.panelH3}>{p.t}</h3><p>{p.b}</p></div>)}
        </div>
      </section>

      <section className="cockpit-section">
        <div className="cockpit-section-heading"><h2>{c.howHead}</h2></div>
        <div className="module-detail">
          {c.how.map((p) => <div key={p.t} className="module-detail-panel"><span className="telemetry-label">{p.t}</span><p style={{ marginTop: 8 }}>{p.b}</p></div>)}
        </div>
      </section>

      <section className="cockpit-section">
        <div className="cockpit-section-heading"><h2>{c.forkHead}</h2></div>
        <div style={s.forkGrid}>
          <div style={s.forkCard}>
            <span style={s.forkTag}>{c.aTag}</span><h3 style={s.forkTitle}>{c.aTitle}</h3><p style={s.forkBody}>{c.aBody}</p>
            <ul style={s.bullets}>{c.aBullets.map((b) => <li key={b} style={s.bullet}><span style={s.tick}>✓</span><span>{b}</span></li>)}</ul>
            <a style={s.primaryBtn} href={SAAS_AGENCY}>{c.aCta} →</a>
          </div>
          <div style={{ ...s.forkCard, ...s.forkCardLicense }}>
            <span style={s.forkTag}>{c.bTag}</span><h3 style={s.forkTitle}>{c.bTitle}</h3><p style={s.forkBody}>{c.bBody}</p>
            <ul style={s.bullets}>{c.bBullets.map((b) => <li key={b} style={s.bullet}><span style={s.tick}>✓</span><span>{b}</span></li>)}</ul>
            <a style={s.ghostBtn} href={LICENSE_CONTACT}>{c.bCta} →</a>
          </div>
        </div>
      </section>

      <section className="cockpit-section">
        <div className="cockpit-section-heading"><h2>{c.embHead}</h2></div>
        <div className="module-detail">
          {c.emb.map((p) => <div key={p.t} className="module-detail-panel"><h3 style={s.panelH3}>{p.t}</h3><p>{p.b}</p></div>)}
        </div>
      </section>

      <section className="cockpit-section concierge-band">
        <div><p className="cockpit-eyebrow">Campaign Studio</p><h2>{c.finalHead}</h2><p>{c.finalSub}</p></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="cockpit-primary" href={SAAS_AGENCY}>{c.ctaStart}</a>
          <a className="cockpit-secondary" href={LICENSE_CONTACT}>{c.ctaLicense}</a>
        </div>
      </section>
    </main>
  );
}
