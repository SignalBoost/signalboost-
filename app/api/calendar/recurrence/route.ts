// Recurrence rule type
export type RecurrenceRule = "weekly" | "biweekly" | "monthly" | "yearly";

export const RECURRENCE_LABELS: Record<string, Record<RecurrenceRule | "none", string>> = {
  en: { none: "One-time", weekly: "Weekly", biweekly: "Every 2 weeks", monthly: "Monthly", yearly: "Yearly" },
  es: { none: "Una vez", weekly: "Semanal", biweekly: "Cada 2 semanas", monthly: "Mensual", yearly: "Anual" },
  pt: { none: "Uma vez", weekly: "Semanal", biweekly: "A cada 2 semanas", monthly: "Mensal", yearly: "Anual" },
  pl: { none: "Jednorazowo", weekly: "Co tydzień", biweekly: "Co 2 tygodnie", monthly: "Co miesiąc", yearly: "Co rok" },
  ru: { none: "Однократно", weekly: "Еженедельно", biweekly: "Каждые 2 недели", monthly: "Ежемесячно", yearly: "Ежегодно" },
};

// Generate future occurrence dates from a start date given a recurrence rule
// Returns up to `count` ISO date strings (YYYY-MM-DD)
export function generateOccurrences(
  startDate: string, // YYYY-MM-DD
  rule: RecurrenceRule,
  count: number = 12
): string[] {
  const dates: string[] = [];
  const base = new Date(startDate + "T12:00:00Z");

  for (let i = 1; i <= count; i++) {
    const next = new Date(base);
    switch (rule) {
      case "weekly":
        next.setUTCDate(base.getUTCDate() + 7 * i);
        break;
      case "biweekly":
        next.setUTCDate(base.getUTCDate() + 14 * i);
        break;
      case "monthly":
        next.setUTCMonth(base.getUTCMonth() + i);
        break;
      case "yearly":
        next.setUTCFullYear(base.getUTCFullYear() + i);
        break;
    }
    dates.push(next.toISOString().split("T")[0]);
  }

  return dates;
}

export const RECURRENCE_ICON: Record<RecurrenceRule, string> = {
  weekly: "↻ W",
  biweekly: "↻ 2W",
  monthly: "↻ M",
  yearly: "↻ Y",
};
