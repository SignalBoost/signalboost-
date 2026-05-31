import type { ReviewLanguage } from "@/lib/reviews/types";

export const reviewCopy: Record<ReviewLanguage, { requestSubject: string; requestBody: string; reminder: string; landingTitle: string; landingSubtitle: string; negativeRoute: string; positiveRoute: string }> = {
  en: {
    requestSubject: "How was your visit?",
    requestBody: "Share a quick rating so our team can celebrate wins and fix problems fast.",
    reminder: "Friendly reminder: your feedback helps the local team improve.",
    landingTitle: "Tell us about your experience",
    landingSubtitle: "It takes less than one minute and you can add photos or video.",
    positiveRoute: "Thanks! We will help you share this on public review platforms.",
    negativeRoute: "We routed this privately so a manager can resolve it first.",
  },
  es: {
    requestSubject: "¿Cómo fue tu visita?",
    requestBody: "Comparte una calificación rápida para celebrar aciertos y corregir problemas.",
    reminder: "Recordatorio: tus comentarios ayudan al equipo local a mejorar.",
    landingTitle: "Cuéntanos sobre tu experiencia",
    landingSubtitle: "Toma menos de un minuto y puedes agregar fotos o video.",
    positiveRoute: "¡Gracias! Te ayudaremos a compartirlo en plataformas públicas.",
    negativeRoute: "Lo enviamos en privado para que un gerente pueda resolverlo primero.",
  },
  pt: {
    requestSubject: "Como foi sua visita?",
    requestBody: "Compartilhe uma avaliação rápida para celebrarmos acertos e corrigirmos problemas.",
    reminder: "Lembrete: seu feedback ajuda a equipe local a melhorar.",
    landingTitle: "Conte como foi sua experiência",
    landingSubtitle: "Leva menos de um minuto e você pode adicionar fotos ou vídeo.",
    positiveRoute: "Obrigado! Vamos ajudar você a publicar em plataformas públicas.",
    negativeRoute: "Enviamos em privado para um gerente resolver primeiro.",
  },
  pl: {
    requestSubject: "Jak minęła wizyta?",
    requestBody: "Wystaw krótką ocenę, aby zespół mógł świętować sukcesy i szybko naprawiać problemy.",
    reminder: "Przypomnienie: Twoja opinia pomaga lokalnemu zespołowi się poprawiać.",
    landingTitle: "Opowiedz nam o swoim doświadczeniu",
    landingSubtitle: "Zajmie to mniej niż minutę; możesz dodać zdjęcia lub film.",
    positiveRoute: "Dziękujemy! Pomożemy udostępnić opinię publicznie.",
    negativeRoute: "Przekazaliśmy to prywatnie, aby menedżer mógł najpierw pomóc.",
  },
  ru: {
    requestSubject: "Как прошёл ваш визит?",
    requestBody: "Оставьте короткую оценку, чтобы команда могла отметить успехи и быстро исправить проблемы.",
    reminder: "Напоминание: ваш отзыв помогает местной команде становиться лучше.",
    landingTitle: "Расскажите о своём опыте",
    landingSubtitle: "Это займёт меньше минуты; можно добавить фото или видео.",
    positiveRoute: "Спасибо! Мы поможем опубликовать отзыв на публичных площадках.",
    negativeRoute: "Мы отправили это приватно, чтобы менеджер сначала решил вопрос.",
  },
};

export function normalizeReviewLanguage(value?: string): ReviewLanguage {
  if (value === "es" || value === "pt" || value === "pl" || value === "ru") return value;
  return "en";
}
