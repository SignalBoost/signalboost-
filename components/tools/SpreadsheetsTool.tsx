// File: components/tools/SpreadsheetsTool.tsx
// Multi-tenant spreadsheets tool. Reads/writes the Supabase `sheets` table
// (RLS-scoped to the logged-in user, so each person sees only their own).
// Shared by the admin workspace and the customer /app workspace.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#f5c542";
const GOLD_DEEP = "#dfa837";
const PANEL = "#0f141b";
const PANEL_SOFT = "rgba(15,20,27,.72)";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";
const INPUT = "#0a0e14";
const GREEN = "#34d399";

const COLUMN_TYPES = ["Text", "Number", "Date", "Currency", "Status"];

type Sheet = {
  id: string;
  name: string;
  data: string[][];
  rows: number;
  cols: number;
  updated_at?: string;
};

type ColumnStat = {
  label: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
};

function colLabel(i: number): string {
  let s = "";
  let n = i;
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function columnName(i: number): string {
  const names = ["Name", "Revenue", "Status", "Owner", "Launch date", "Budget", "Region", "Notes"];
  return names[i] ?? `Column ${colLabel(i)}`;
}

function columnType(i: number): string {
  return COLUMN_TYPES[i % COLUMN_TYPES.length];
}

function emptyGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
}

function starterGrid(rows: number, cols: number): string[][] {
  const seed = emptyGrid(rows, cols);
  const sample = [
    ["Partner forecast", "12450", "Active", "Maya", "2026-06-08", "3200", "US", "Ready for sync"],
    ["Paid social test", "8900", "Review", "Andre", "2026-06-12", "1800", "EU", "Needs creative"],
    ["Inventory refresh", "15300", "Active", "Nina", "2026-06-18", "4100", "LATAM", "CSV imported"],
  ];
  sample.forEach((row, r) => {
    row.forEach((value, c) => {
      if (r < rows && c < cols) seed[r][c] = value;
    });
  });
  return seed;
}

function normalizeGrid(data: unknown, rows: number, cols: number): string[][] {
  const grid = Array.isArray(data) ? (data as string[][]) : [];
  const out = emptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = grid[r]?.[c];
      if (typeof v === "string") out[r][c] = v;
      else if (v !== undefined && v !== null) out[r][c] = String(v);
    }
  }
  return out;
}

function countFilledRows(data: string[][]): number {
  return data.filter((row) => row.some((cell) => cell.trim())).length;
}

function formatDate(value?: string): string {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function csvEscape(value: string): string {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(sheet: Sheet): string {
  return sheet.data.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function parseCsv(csv: string): string[][] {
  return csv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, "").replace(/""/g, '"')));
}

function getStats(sheet: Sheet | null): ColumnStat[] {
  if (!sheet) return [];
  return Array.from({ length: sheet.cols }, (_, c) => {
    const nums = sheet.data
      .map((row) => Number(row[c]))
      .filter((value) => Number.isFinite(value));
    const sum = nums.reduce((total, value) => total + value, 0);
    return {
      label: colLabel(c),
      count: nums.length,
      sum,
      avg: nums.length ? sum / nums.length : 0,
      min: nums.length ? Math.min(...nums) : 0,
      max: nums.length ? Math.max(...nums) : 0,
    };
  }).filter((stat) => stat.count > 0).slice(0, 4);
}

export default function SpreadsheetsTool() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const active = sheets.find((s) => s.id === activeId) || null;
  const filteredSheets = sheets.filter((s) => s.name.toLowerCase().includes(filter.toLowerCase()));
  const stats = useMemo(() => getStats(active), [active]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErr("Please log in to use spreadsheets.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("sheets")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const list = (data || []).map((row: Record<string, unknown>) => {
        const rows = Number(row.rows ?? 20);
        const cols = Number(row.cols ?? 8);
        return {
          id: String(row.id),
          name: String(row.name ?? "Untitled sheet"),
          rows,
          cols,
          data: normalizeGrid(row.data, rows, cols),
          updated_at: row.updated_at ? String(row.updated_at) : undefined,
        };
      }) as Sheet[];
      setSheets(list);
      setActiveId((cur) => cur || (list[0]?.id ?? null));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load sheets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  async function createSheet() {
    setErr(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErr("Please log in first.");
        return;
      }
      const rows = 12;
      const cols = 8;
      const dataGrid = starterGrid(rows, cols);
      const { data, error } = await supabase
        .from("sheets")
        .insert({ user_id: user.id, name: "Growth operations", data: dataGrid, rows, cols })
        .select("*")
        .single();
      if (error) throw error;
      const s: Sheet = {
        id: String(data.id),
        name: String(data.name),
        rows,
        cols,
        data: normalizeGrid(data.data, rows, cols),
        updated_at: data.updated_at ? String(data.updated_at) : undefined,
      };
      setSheets((cur) => [s, ...cur]);
      setActiveId(s.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create sheet.");
    }
  }

  function queueSave(sheet: Sheet) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void persist(sheet), 700);
  }

  async function persist(sheet: Sheet) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("sheets")
        .update({ name: sheet.name, data: sheet.data, rows: sheet.rows, cols: sheet.cols })
        .eq("id", sheet.id);
      if (error) throw error;
      setSheets((cur) => cur.map((s) => (s.id === sheet.id ? { ...s, updated_at: new Date().toISOString() } : s)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function updateActive(mut: (s: Sheet) => Sheet) {
    if (!active) return;
    const next = mut(active);
    setSheets((cur) => cur.map((s) => (s.id === next.id ? next : s)));
    queueSave(next);
  }

  function setCell(r: number, c: number, value: string) {
    updateActive((s) => {
      const data = s.data.map((row) => row.slice());
      data[r][c] = value;
      return { ...s, data };
    });
  }

  function rename(name: string) {
    updateActive((s) => ({ ...s, name }));
  }

  function addRow() {
    updateActive((s) => ({ ...s, rows: s.rows + 1, data: [...s.data, Array.from({ length: s.cols }, () => "")] }));
  }

  function addCol() {
    updateActive((s) => ({ ...s, cols: s.cols + 1, data: s.data.map((row) => [...row, ""]) }));
  }

  async function deleteSheet(id: string) {
    if (!confirm("Delete this sheet permanently?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("sheets").delete().eq("id", id);
      if (error) throw error;
      setSheets((cur) => cur.filter((s) => s.id !== id));
      setActiveId((cur) => (cur === id ? null : cur));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not delete sheet.");
    }
  }

  function exportCsv() {
    if (!active) return;
    const blob = new Blob([toCsv(active)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.name || "sheet"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv(file?: File) {
    if (!file || !active) return;
    const grid = parseCsv(await file.text());
    const rows = Math.max(grid.length, 1);
    const cols = Math.max(...grid.map((row) => row.length), active.cols, 1);
    updateActive((s) => ({ ...s, rows, cols, data: normalizeGrid(grid, rows, cols) }));
  }

  return (
    <div style={styles.pageShell}>
      <section style={styles.hero} aria-labelledby="spreadsheets-title">
        <div>
          <p style={styles.eyebrow}>SaaS Station / Data operations</p>
          <h1 id="spreadsheets-title" style={styles.title}>Spreadsheets cockpit</h1>
          <p style={styles.subtitle}>Manage structured sheets, inline rows, CSV movement, and column telemetry in one synced workspace.</p>
        </div>
        <div style={styles.heroStatus}>
          <span style={styles.statusDot} />
          {saving ? "Syncing sheet changes" : "Sync health nominal"}
        </div>
      </section>

      {err && <p style={styles.error}>{err}</p>}

      {loading ? (
        <p style={styles.muted}>Loading spreadsheet station…</p>
      ) : (
        <div style={styles.grid}>
          <aside style={styles.sheetListPanel} aria-label="Sheet list panel">
            <div style={styles.panelHeader}>
              <div>
                <p style={styles.panelKicker}>SheetListPanel</p>
                <h2 style={styles.panelTitle}>Sheets</h2>
              </div>
              <button type="button" onClick={() => void createSheet()} style={styles.iconButton} aria-label="New sheet">+</button>
            </div>
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter sheets…" style={styles.search} />
            <div style={styles.sheetCards}>
              {filteredSheets.length === 0 ? (
                <div style={styles.emptyState}>No sheets match this view. Create a new sheet to start tracking rows.</div>
              ) : filteredSheets.map((sheet) => (
                <article key={sheet.id} style={sheet.id === activeId ? styles.sheetCardActive : styles.sheetCard}>
                  <button type="button" onClick={() => setActiveId(sheet.id)} style={styles.sheetCardButton}>
                    <strong>{sheet.name || "Untitled"}</strong>
                    <span>{countFilledRows(sheet.data)} populated rows • {sheet.cols} columns</span>
                    <small>Last updated {formatDate(sheet.updated_at)}</small>
                  </button>
                  <button type="button" onClick={() => void deleteSheet(sheet.id)} style={styles.deleteButton} aria-label={`Delete ${sheet.name}`}>×</button>
                </article>
              ))}
            </div>
            <button type="button" onClick={() => void createSheet()} style={styles.newSheetButton}>NewSheetButton</button>
          </aside>

          <main style={styles.sheetView} aria-label="Selected sheet view">
            {active ? (
              <>
                <div style={styles.sheetToolbar}>
                  <input value={active.name} onChange={(e) => rename(e.target.value)} style={styles.sheetNameInput} aria-label="Selected sheet name" />
                  <button type="button" onClick={addCol} style={styles.ghostButton}>+ Column</button>
                </div>

                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.cornerCell}>#</th>
                        {Array.from({ length: active.cols }, (_, c) => (
                          <th key={c} style={styles.headCell}>
                            <div style={styles.columnHeader}>
                              <span style={styles.columnName}>{columnName(c)}</span>
                              <small>{columnType(c)}</small>
                              <span style={styles.columnControls}>↕ sort · ⌕ filter</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: active.rows }, (_, r) => (
                        <tr key={r}>
                          <td style={styles.rowHeadCell}>RowItem {r + 1}</td>
                          {Array.from({ length: active.cols }, (_, c) => (
                            <td key={c} style={styles.cell}>
                              <input value={active.data[r]?.[c] ?? ""} onChange={(e) => setCell(r, c, e.target.value)} style={styles.cellInput} aria-label={`Row ${r + 1} ${columnName(c)}`} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={styles.lowerGrid}>
                  <section style={styles.panelCard} aria-label="Import export panel">
                    <p style={styles.panelKicker}>ImportExportPanel</p>
                    <h3 style={styles.smallTitle}>CSV lanes</h3>
                    <p style={styles.muted}>ImportCSVButton and ExportCSVButton keep this sheet portable.</p>
                    <div style={styles.buttonRow}>
                      <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={(e) => void importCsv(e.target.files?.[0])} />
                      <button type="button" onClick={() => fileInput.current?.click()} style={styles.ghostButton}>ImportCSVButton</button>
                      <button type="button" onClick={exportCsv} style={styles.primaryButton}>ExportCSVButton</button>
                    </div>
                  </section>

                  <section style={styles.panelCard} aria-label="Stats panel">
                    <p style={styles.panelKicker}>StatsPanel</p>
                    <h3 style={styles.smallTitle}>RowCount: {countFilledRows(active.data)} / {active.rows}</h3>
                    <div style={styles.statsGrid}>
                      {stats.length === 0 ? <p style={styles.muted}>Add numeric values to see sum, avg, min/max.</p> : stats.map((stat) => (
                        <div key={stat.label} style={styles.statCard}>
                          <strong>Column {stat.label}</strong>
                          <span>Σ {stat.sum.toLocaleString()}</span>
                          <small>avg {stat.avg.toFixed(1)} · min {stat.min} · max {stat.max}</small>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <button type="button" onClick={addRow} style={styles.addRowButton}>AddRowButton</button>
              </>
            ) : (
              <div style={styles.emptyState}>Select a sheet on the left, or create a new one.</div>
            )}
          </main>
        </div>
      )}

      <footer style={styles.footer}>Footer: status ready • sync health {saving ? "syncing" : "healthy"}</footer>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  pageShell: { color: TEXT, fontFamily: "'Outfit', system-ui, sans-serif", display: "flex", flexDirection: "column", gap: 18 },
  hero: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, padding: 24, border: `1px solid ${BORDER}`, borderRadius: 24, background: "radial-gradient(circle at top left, rgba(52,211,153,.16), transparent 38%), rgba(10,14,20,.82)" },
  eyebrow: { margin: 0, color: GREEN, fontSize: 12, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" },
  title: { margin: "8px 0 8px", color: "#fff", fontSize: 34, lineHeight: 1, letterSpacing: "-.03em" },
  subtitle: { margin: 0, color: MUTED, maxWidth: 680, lineHeight: 1.55 },
  heroStatus: { display: "inline-flex", alignItems: "center", gap: 8, color: "#d1fae5", border: "1px solid rgba(52,211,153,.25)", borderRadius: 999, padding: "8px 12px", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" },
  statusDot: { width: 8, height: 8, borderRadius: 999, background: GREEN, boxShadow: "0 0 18px rgba(52,211,153,.8)" },
  error: { color: "#ff7b72", fontSize: 13, margin: 0 },
  muted: { color: MUTED, fontSize: 13, lineHeight: 1.5, margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "minmax(240px, 300px) minmax(0, 1fr)", gap: 18, alignItems: "start" },
  sheetListPanel: { background: PANEL_SOFT, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 16, position: "sticky", top: 86 },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  panelKicker: { color: GOLD_DEEP, fontSize: 10, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase", margin: 0 },
  panelTitle: { color: "#fff", fontSize: 20, margin: "3px 0 0" },
  iconButton: { width: 34, height: 34, borderRadius: 12, border: "none", background: GOLD, color: "#06060a", fontWeight: 900, fontSize: 20, cursor: "pointer" },
  search: { width: "100%", boxSizing: "border-box", background: INPUT, border: `1px solid ${BORDER}`, borderRadius: 12, color: TEXT, padding: "10px 12px", outline: "none", marginBottom: 12 },
  sheetCards: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflow: "auto" },
  sheetCard: { display: "flex", alignItems: "stretch", border: `1px solid ${BORDER}`, borderRadius: 14, background: "rgba(6,8,12,.56)", overflow: "hidden" },
  sheetCardActive: { display: "flex", alignItems: "stretch", border: `1px solid ${GREEN}`, borderRadius: 14, background: "rgba(52,211,153,.10)", overflow: "hidden" },
  sheetCardButton: { flex: 1, textAlign: "left", background: "transparent", border: "none", color: TEXT, cursor: "pointer", padding: 12, display: "flex", flexDirection: "column", gap: 5, fontFamily: "inherit" },
  deleteButton: { background: "transparent", border: "none", borderLeft: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", padding: "0 10px", fontSize: 18 },
  newSheetButton: { width: "100%", marginTop: 12, padding: "11px 14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, color: "#06060a", fontWeight: 900, cursor: "pointer" },
  sheetView: { minWidth: 0, background: PANEL_SOFT, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 16 },
  sheetToolbar: { display: "flex", gap: 10, marginBottom: 12 },
  sheetNameInput: { flex: 1, boxSizing: "border-box", padding: "11px 13px", borderRadius: 12, border: `1px solid ${BORDER}`, background: INPUT, color: TEXT, fontSize: 16, fontWeight: 900, outline: "none" },
  tableWrap: { overflow: "auto", border: `1px solid ${BORDER}`, borderRadius: 14, background: "rgba(6,8,12,.52)" },
  table: { borderCollapse: "collapse", width: "100%", minWidth: 760 },
  cornerCell: { width: 92, background: "#11161d", color: MUTED, border: `1px solid ${BORDER}`, padding: 10, fontSize: 11 },
  headCell: { minWidth: 140, background: "#11161d", color: TEXT, border: `1px solid ${BORDER}`, padding: 0, verticalAlign: "top" },
  columnHeader: { display: "flex", flexDirection: "column", gap: 4, padding: 10, textAlign: "left" },
  columnName: { fontSize: 13, fontWeight: 900 },
  columnControls: { color: MUTED, fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" },
  rowHeadCell: { width: 92, background: "rgba(17,22,29,.82)", color: MUTED, fontSize: 11, fontWeight: 800, border: `1px solid ${BORDER}`, padding: "0 10px", whiteSpace: "nowrap" },
  cell: { padding: 0, border: `1px solid ${BORDER}` },
  cellInput: { width: "100%", minWidth: 140, boxSizing: "border-box", padding: "9px 10px", border: "none", background: "transparent", color: TEXT, fontSize: 13, outline: "none", fontFamily: "inherit" },
  lowerGrid: { display: "grid", gridTemplateColumns: "minmax(220px, .8fr) minmax(280px, 1.2fr)", gap: 12, marginTop: 12 },
  panelCard: { border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, background: "rgba(6,8,12,.45)" },
  smallTitle: { color: "#fff", margin: "4px 0 8px", fontSize: 16 },
  buttonRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 },
  ghostButton: { padding: "10px 13px", borderRadius: 11, border: `1px solid ${BORDER}`, background: PANEL, color: TEXT, fontWeight: 800, cursor: "pointer" },
  primaryButton: { padding: "10px 13px", borderRadius: 11, border: "none", background: GREEN, color: "#04100b", fontWeight: 900, cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginTop: 12 },
  statCard: { display: "flex", flexDirection: "column", gap: 4, padding: 10, borderRadius: 12, background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.18)", fontSize: 12 },
  addRowButton: { width: "100%", marginTop: 12, padding: "11px 14px", borderRadius: 12, border: "1px dashed rgba(52,211,153,.5)", background: "rgba(52,211,153,.08)", color: "#bbf7d0", fontWeight: 900, cursor: "pointer" },
  emptyState: { color: MUTED, border: `1px dashed ${BORDER}`, borderRadius: 14, padding: 18, textAlign: "center", lineHeight: 1.5 },
  footer: { color: MUTED, fontSize: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 14 },
};
