// File: lib/home/visitor-memory.ts
// Phase 1 of Concierge memory — ANONYMOUS, localStorage-only.
//
// No signup. No backend (Phase 2 adds Supabase sync using this same shape).
// Stores: visitorId, region, language, lastVisit, recent searches, recent
// clicks. Remembers INTENT, not personal life. History is capped. Nothing here
// implies a purchase happened (the returning greeting must stay neutral).
//
// All functions are SSR-safe (guard typeof window) and never throw on quota /
// disabled storage — memory is a nice-to-have, never a hard dependency.

const STORAGE_KEY = "sb_visitor_memory_v1";
const MAX_SEARCHES = 8;
const MAX_CLICKS = 12;

export interface SearchEntry {
  query: string;
  intent?: string;
  destination?: string;
  at: string; // ISO
}

export interface ClickEntry {
  partnerId: string;
  query?: string;
  intent?: string;
  region?: string;
  affiliateUrl?: string;
  at: string; // ISO
}

export interface VisitorMemory {
  visitorId: string;
  region?: string;
  language?: string;
  firstVisit: string;
  lastVisit: string;
  recentSearches: SearchEntry[];
  recentClicks: ClickEntry[];
  // Lightweight inferred intent context (e.g. last destination) for continuity.
  context: { destination?: string; lastIntent?: string };
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeVisitorId(): string {
  // Anonymous, non-PII random id.
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return "anon_" + rand;
}

function emptyMemory(): VisitorMemory {
  const t = nowIso();
  return {
    visitorId: makeVisitorId(),
    firstVisit: t,
    lastVisit: t,
    recentSearches: [],
    recentClicks: [],
    context: {},
  };
}

function read(): VisitorMemory | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisitorMemory;
    if (!parsed || typeof parsed.visitorId !== "string") return null;
    // Defensive defaults for forward-compat.
    parsed.recentSearches = Array.isArray(parsed.recentSearches) ? parsed.recentSearches : [];
    parsed.recentClicks = Array.isArray(parsed.recentClicks) ? parsed.recentClicks : [];
    parsed.context = parsed.context || {};
    return parsed;
  } catch {
    return null;
  }
}

function write(mem: VisitorMemory): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
  } catch {
    /* quota or disabled — ignore, memory is non-essential */
  }
}

/** Get-or-create the visitor memory and stamp lastVisit. Returns null on SSR. */
export function getOrCreateMemory(region?: string, language?: string): VisitorMemory | null {
  if (typeof window === "undefined") return null;
  const existing = read();
  const mem = existing || emptyMemory();
  const isReturning = !!existing;
  if (region) mem.region = region;
  if (language) mem.language = language;
  // Stamp lastVisit AFTER reading, so callers can detect "returning" via the
  // previous lastVisit they captured if needed. We expose isReturning helper.
  mem.lastVisit = nowIso();
  write(mem);
  void isReturning;
  return mem;
}

/** True if a memory already existed before this session (for the greeting). */
export function isReturningVisitor(): boolean {
  return read() !== null;
}

export function getMemory(): VisitorMemory | null {
  return read();
}

/** Record a search; updates inferred context (destination/intent) if provided. */
export function recordSearch(entry: { query: string; intent?: string; destination?: string }): void {
  const mem = read() || emptyMemory();
  const s: SearchEntry = {
    query: entry.query.slice(0, 160),
    intent: entry.intent,
    destination: entry.destination,
    at: nowIso(),
  };
  mem.recentSearches = [s, ...mem.recentSearches].slice(0, MAX_SEARCHES);
  if (entry.destination) mem.context.destination = entry.destination;
  if (entry.intent) mem.context.lastIntent = entry.intent;
  mem.lastVisit = nowIso();
  write(mem);
}

/** Record a partner click (for continuity + Phase 2 performance insights). */
export function recordClick(entry: {
  partnerId: string;
  query?: string;
  intent?: string;
  region?: string;
  affiliateUrl?: string;
}): void {
  const mem = read() || emptyMemory();
  const c: ClickEntry = { ...entry, at: nowIso() };
  mem.recentClicks = [c, ...mem.recentClicks].slice(0, MAX_CLICKS);
  mem.lastVisit = nowIso();
  write(mem);
}

/** The most recent search query, for the returning-visitor greeting. */
export function lastSearchQuery(): string | null {
  const mem = read();
  return mem && mem.recentSearches[0] ? mem.recentSearches[0].query : null;
}

/** Inferred destination context (e.g. "Lima Peru") for follow-up queries. */
export function rememberedDestination(): string | null {
  const mem = read();
  return mem?.context.destination || null;
}

/** Clear all memory (e.g. a "forget me" control). */
export function clearMemory(): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
