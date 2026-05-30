"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import useTranslation from "@/components/i18n/useTranslation";

type Role = "assistant" | "user";

type ConciergeMessage = {
  id: string;
  role: Role;
  content: string;
};

type PartnerCard = {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
};

type ModuleAction = {
  id: string;
  label: string;
  href: string;
};

type ConciergeResponse = {
  reply?: string;
  partners?: PartnerCard[];
  moduleActions?: ModuleAction[];
};

const messageId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function Concierge() {
  const { t, lang } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [partners, setPartners] = useState<PartnerCard[]>([]);
  const [moduleActions, setModuleActions] = useState<ModuleAction[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const welcomeText = t("concierge.welcome");
  const resetTipText = t("concierge.reset_tip");

  const buildInitialMessages = (): ConciergeMessage[] => [
    {
      id: "concierge-welcome",
      role: "assistant",
      content: welcomeText,
    },
    {
      id: "concierge-reset-tip",
      role: "assistant",
      content: resetTipText,
    },
  ];

  useEffect(() => {
    setMessages(buildInitialMessages());
    // Rebuild the localized starter copy when the active language or dictionary changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, welcomeText, resetTipText]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, partners, moduleActions, open]);

  const resetChat = () => {
    setMessages(buildInitialMessages());
    setPartners([]);
    setModuleActions([]);
    setInput("");
  };

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { id: messageId(), role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          messages: nextMessages.map(({ role, content: text }) => ({ role, content: text })),
          lang,
        }),
      });

      const data = (await res.json()) as ConciergeResponse;
      if (!res.ok) throw new Error(data.reply || "Concierge request failed");

      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: data.reply || t("concierge.error"),
        },
      ]);
      setPartners(data.partners || []);
      setModuleActions(data.moduleActions || []);
    } catch (error) {
      console.error("Concierge send failed", error);
      setMessages((current) => [
        ...current,
        { id: messageId(), role: "assistant", content: t("concierge.error") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="concierge-widget" data-open={open ? "true" : "false"}>
      {open && (
        <section className="concierge-panel" aria-label={t("concierge.title")}>
          <div className="concierge-panel-header">
            <div>
              <p className="concierge-kicker">{t("concierge.kicker")}</p>
              <h2>{t("concierge.title")}</h2>
            </div>
            <button type="button" className="concierge-reset" onClick={resetChat}>
              {t("concierge.reset")}
            </button>
          </div>

          <div ref={scrollRef} className="concierge-messages" aria-live="polite">
            {messages.map((message) => (
              <div className={`concierge-message ${message.role}`} key={message.id}>
                {message.content}
              </div>
            ))}
            {loading && <div className="concierge-message assistant">{t("concierge.thinking")}</div>}

            {(moduleActions.length > 0 || partners.length > 0) && (
              <div className="concierge-results">
                {moduleActions.map((action) => (
                  <a className="concierge-action" href={action.href} key={action.id}>
                    {t(`concierge.modules.${action.id}`) || action.label} <span aria-hidden="true">→</span>
                  </a>
                ))}
                {partners.map((partner) => (
                  <a
                    className="concierge-partner"
                    href={partner.url}
                    key={partner.id}
                    rel="noopener sponsored"
                    target="_blank"
                  >
                    <strong>{partner.name}</strong>
                    <span>{partner.category}</span>
                    <small>{partner.description}</small>
                  </a>
                ))}
              </div>
            )}
          </div>

          <form className="concierge-form" onSubmit={handleSend}>
            <input
              aria-label={t("concierge.input_label")}
              disabled={loading}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("concierge.placeholder")}
              value={input}
            />
            <button disabled={loading || !input.trim()} type="submit">
              {t("concierge.send")}
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        className="concierge-launcher"
        aria-expanded={open}
        aria-label={open ? t("concierge.close") : t("concierge.open")}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "×" : t("concierge.launcher")}
      </button>
    </div>
  );
}
