// File: components/tools/SpreadsheetsTool.tsx
// Production spreadsheet workspace backed by the normalized Supabase
// `spreadsheets`, `spreadsheet_columns`, and `spreadsheet_rows` tables. Accounts
// get multiple named operational sheets with typed columns, editable rows,
// filters, sorting, CSV import/export, and number-column analytics.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#f5c542";
const GREEN = "#34d399";
const CYAN = "#22d3ee";
const RED = "#ff6b6b";
const PANEL = "#0f141b";
const PANEL_SOFT = "#111923";
const BORDER = "#263241";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";
const INPUT = "#080d13";

const COLUMN_TYPES = ["text", "number", "date", "select", "checkbox"] as const;
type ColumnType = (typeof COLUMN_TYPES)[number];

type SheetColumn = { id: string; name: string; type: ColumnType; options: string[]; created_at?: string };
type SheetRow = { id: string; cells: Record<string, string>; created_at?: string; updated_at?: string };
type SheetPayload = { version: 2; columns: SheetColumn[]; rows: SheetRow[] };
type Sheet = { id: string; name: string; payload: SheetPayload; updated_at?: string };
type SortState = { columnId: string; direction: "asc" | "desc" } | null;

type DbSheetRow = Record<string, unknown> & { id: string; name?: string; updated_at?: string; spreadsheet_columns?: unknown; spreadsheet_rows?: unknown };

const DEFAULT_COLUMN_TEMPLATES: Array<Omit<SheetColumn, "id">> = [
  { name: "Partner", type: "text", options: [] },
  { name: "Category", type: "select", options: ["Affiliate", "Vendor", "Customer", "Investor"] },
  { name: "Budget", type: "number", options: [] },
  { name: "Due date", type: "date", options: [] },
  { name: "Approved", type: "checkbox", options: [] },
];

function uid(_prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // RFC4122-ish fallback for browsers without randomUUID.
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16)
  );
}

function makeEmptyRow(columns: SheetColumn[]): SheetRow {
  return { id: uid("row"), cells: Object.fromEntries(columns.map((c) => [c.id, ""])) };
}

function defaultPayload(): SheetPayload {
  const columns = DEFAULT_COLUMN_TEMPLATES.map((c) => ({ ...c, id: uid("col"), options: [...c.options] }));
  return { version: 2, columns, rows: [makeEmptyRow(columns), makeEmptyRow(columns), makeEmptyRow(columns)] };
}

function columnName(index: number) {
  let s = "";
  let n = index;
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function normalizePayload(data: unknown, legacyRows = 0, legacyCols = 0): SheetPayload {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const candidate = data as Partial<SheetPayload>;
    if (Array.isArray(candidate.columns) && Array.isArray(candidate.rows)) {
      const columns = candidate.columns.map((col, index) => {
        const raw = col as Partial<SheetColumn>;
        const type = COLUMN_TYPES.includes(raw.type as ColumnType) ? (raw.type as ColumnType) : "text";
        return {
          id: String(raw.id || uid("col")),
          name: String(raw.name || `Column ${index + 1}`),
          type,
          options: Array.isArray(raw.options) ? raw.options.map(String).filter(Boolean) : [],
        };
      });
      const safeColumns = columns.length ? columns : defaultPayload().columns;
      const rows = candidate.rows.map((row) => {
        const raw = row as Partial<SheetRow>;
        const rawCells = raw.cells && typeof raw.cells === "object" ? raw.cells : {};
        return {
          id: String(raw.id || uid("row")),
          cells: Object.fromEntries(safeColumns.map((col) => [col.id, String((rawCells as Record<string, unknown>)[col.id] ?? "")])),
        };
      });
      return { version: 2, columns: safeColumns, rows };
    }
  }

  if (Array.isArray(data)) {
    const grid = data as unknown[][];
    const cols = Math.max(legacyCols || 0, grid[0]?.length || 0, 5);
    const columns = Array.from({ length: cols }, (_, index) => ({ id: uid("col"), name: columnName(index), type: "text" as ColumnType, options: [] }));
    const rows = grid.slice(0, Math.max(legacyRows, grid.length)).map((line) => ({
      id: uid("row"),
      cells: Object.fromEntries(columns.map((col, index) => [col.id, String(line?.[index] ?? "")])),
    }));
    return { version: 2, columns, rows };
  }

  return defaultPayload();
}

function normalizeDbSheet(row: DbSheetRow): Sheet {
  const rawColumns = Array.isArray(row.spreadsheet_columns) ? row.spreadsheet_columns as Array<Record<string, unknown>> : [];
  const columns: SheetColumn[] = rawColumns.map((col, index) => {
    const type = COLUMN_TYPES.includes(col.type as ColumnType) ? col.type as ColumnType : "text";
    return {
      id: String(col.id),
      name: String(col.name || `Column ${index + 1}`),
      type,
      options: [],
      created_at: col.created_at ? String(col.created_at) : undefined,
    };
  });
  const safeColumns = columns.length ? columns : defaultPayload().columns;
  const rawRows = Array.isArray(row.spreadsheet_rows) ? row.spreadsheet_rows as Array<Record<string, unknown>> : [];
  const rows = rawRows.map((dbRow) => {
    const data = dbRow.data && typeof dbRow.data === "object" ? dbRow.data as Record<string, unknown> : {};
    return {
      id: String(dbRow.id),
      cells: Object.fromEntries(safeColumns.map((col) => [col.id, String(data[col.id] ?? "")])),
      created_at: dbRow.created_at ? String(dbRow.created_at) : undefined,
      updated_at: dbRow.updated_at ? String(dbRow.updated_at) : undefined,
    };
  });
  const selectOptions = new Map<string, string[]>();
  safeColumns.filter((col) => col.type === "select").forEach((col) => {
    selectOptions.set(col.id, Array.from(new Set(rows.map((r) => r.cells[col.id]).filter(Boolean))).slice(0, 30));
  });
  return {
    id: String(row.id),
    name: String(row.name || "Untitled sheet"),
    payload: { version: 2, columns: safeColumns.map((col) => ({ ...col, options: col.options.length ? col.options : selectOptions.get(col.id) || [] })), rows },
    updated_at: row.updated_at,
  };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((v) => v.length) || rows.length === 0) rows.push(row);
  return rows;
}

function csvEscape(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function payloadToCsv(payload: SheetPayload, rows: SheetRow[]) {
  return [payload.columns.map((c) => csvEscape(c.name)).join(","), ...rows.map((row) => payload.columns.map((c) => csvEscape(row.cells[c.id] || "")).join(","))].join("\n");
}

function inferColumnType(values: string[]): ColumnType {
  const filled = values.map((v) => v.trim()).filter(Boolean);
  if (!filled.length) return "text";
  if (filled.every((v) => v === "true" || v === "false" || v === "yes" || v === "no" || v === "1" || v === "0")) return "checkbox";
  if (filled.every((v) => Number.isFinite(Number(v.replace(/[$,%]/g, ""))))) return "number";
  if (filled.every((v) => !Number.isNaN(Date.parse(v)))) return "date";
  const unique = new Set(filled);
  if (unique.size > 1 && unique.size <= 8 && unique.size <= Math.max(3, filled.length / 2)) return "select";
  return "text";
}

function csvToPayload(text: string): SheetPayload {
  const rows = parseCsv(text).filter((line) => line.some((cell) => cell.trim().length));
  if (!rows.length) return defaultPayload();
  const header = rows[0];
  const body = rows.slice(1);
  const columns = header.map((name, index) => {
    const values = body.map((line) => line[index] || "");
    const type = inferColumnType(values);
    return { id: uid("col"), name: name.trim() || `Column ${index + 1}`, type, options: type === "select" ? Array.from(new Set(values.filter(Boolean))).slice(0, 20) : [] };
  });
  return {
    version: 2,
    columns,
    rows: body.map((line) => ({ id: uid("row"), cells: Object.fromEntries(columns.map((col, index) => [col.id, line[index] || ""])) })),
  };
}

function toNumber(value: string) {
  const parsed = Number(String(value || "").replace(/[$,%]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function SpreadsheetsTool() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [filterColumn, setFilterColumn] = useState("all");
  const [sort, setSort] = useState<SortState>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = sheets.find((s) => s.id === activeId) || null;

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
        .from("spreadsheets")
        .select("*, spreadsheet_columns(*), spreadsheet_rows(*)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const list = ((data || []) as DbSheetRow[]).map(normalizeDbSheet);
      setSheets(list);
      setActiveId((cur) => cur || list[0]?.id || null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load sheets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function persist(sheet: Sheet) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: sheetError } = await supabase.from("spreadsheets").update({ name: sheet.name }).eq("id", sheet.id);
      if (sheetError) throw sheetError;

      const columnIds = sheet.payload.columns.map((col) => col.id);
      const rowIds = sheet.payload.rows.map((row) => row.id);
      if (columnIds.length) {
        const { error } = await supabase.from("spreadsheet_columns").delete().eq("sheet_id", sheet.id).not("id", "in", `(${columnIds.join(",")})`);
        if (error) throw error;
      }
      if (rowIds.length) {
        const { error } = await supabase.from("spreadsheet_rows").delete().eq("sheet_id", sheet.id).not("id", "in", `(${rowIds.join(",")})`);
        if (error) throw error;
      }
      if (!columnIds.length) await supabase.from("spreadsheet_columns").delete().eq("sheet_id", sheet.id);
      if (!rowIds.length) await supabase.from("spreadsheet_rows").delete().eq("sheet_id", sheet.id);

      const { error: colError } = await supabase.from("spreadsheet_columns").upsert(
        sheet.payload.columns.map((col) => ({ id: col.id, sheet_id: sheet.id, name: col.name, type: col.type })),
        { onConflict: "id" }
      );
      if (colError) throw colError;
      const { error: rowError } = await supabase.from("spreadsheet_rows").upsert(
        sheet.payload.rows.map((row) => ({ id: row.id, sheet_id: sheet.id, data: row.cells })),
        { onConflict: "id" }
      );
      if (rowError) throw rowError;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function queueSave(sheet: Sheet) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void persist(sheet), 500);
  }

  function updateActive(mutator: (sheet: Sheet) => Sheet) {
    if (!active) return;
    const next = mutator(active);
    setSheets((cur) => cur.map((sheet) => (sheet.id === next.id ? next : sheet)));
    queueSave(next);
  }

  async function createSheet() {
    setErr(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first.");
      const payload = defaultPayload();
      const { data, error } = await supabase
        .from("spreadsheets")
        .insert({ account_id: user.id, name: "Operations Sheet" })
        .select("*")
        .single();
      if (error) throw error;
      const sheet = { id: String(data.id), name: String(data.name), payload, updated_at: data.updated_at };
      await persist(sheet);
      setSheets((cur) => [sheet, ...cur]);
      setActiveId(sheet.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create sheet.");
    }
  }

  async function deleteSheet(id: string) {
    if (!confirm("Delete this sheet permanently?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("spreadsheets").delete().eq("id", id);
      if (error) throw error;
      setSheets((cur) => cur.filter((sheet) => sheet.id !== id));
      setActiveId((cur) => (cur === id ? sheets.find((sheet) => sheet.id !== id)?.id || null : cur));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  function renameSheet(name: string) { updateActive((sheet) => ({ ...sheet, name })); }

  function addColumn() {
    updateActive((sheet) => {
      const column = { id: uid("col"), name: `Column ${sheet.payload.columns.length + 1}`, type: "text" as ColumnType, options: [] };
      return { ...sheet, payload: { ...sheet.payload, columns: [...sheet.payload.columns, column], rows: sheet.payload.rows.map((row) => ({ ...row, cells: { ...row.cells, [column.id]: "" } })) } };
    });
  }

  function updateColumn(columnId: string, patch: Partial<SheetColumn>) {
    updateActive((sheet) => ({ ...sheet, payload: { ...sheet.payload, columns: sheet.payload.columns.map((col) => (col.id === columnId ? { ...col, ...patch } : col)) } }));
  }

  function deleteColumn(columnId: string) {
    updateActive((sheet) => {
      const columns = sheet.payload.columns.filter((col) => col.id !== columnId);
      const rows = sheet.payload.rows.map((row) => {
        const { [columnId]: _removed, ...cells } = row.cells;
        return { ...row, cells };
      });
      return { ...sheet, payload: { ...sheet.payload, columns: columns.length ? columns : sheet.payload.columns, rows } };
    });
  }

  function addRow() { updateActive((sheet) => ({ ...sheet, payload: { ...sheet.payload, rows: [...sheet.payload.rows, makeEmptyRow(sheet.payload.columns)] } })); }
  function deleteRow(rowId: string) { updateActive((sheet) => ({ ...sheet, payload: { ...sheet.payload, rows: sheet.payload.rows.filter((row) => row.id !== rowId) } })); }
  function updateCell(rowId: string, columnId: string, value: string) {
    updateActive((sheet) => ({ ...sheet, payload: { ...sheet.payload, rows: sheet.payload.rows.map((row) => (row.id === rowId ? { ...row, cells: { ...row.cells, [columnId]: value } } : row)) } }));
  }

  const visibleRows = useMemo(() => {
    if (!active) return [];
    const needle = filterText.trim().toLowerCase();
    let rows = active.payload.rows.filter((row) => {
      if (!needle) return true;
      const haystack = filterColumn === "all" ? Object.values(row.cells).join(" ") : row.cells[filterColumn] || "";
      return haystack.toLowerCase().includes(needle);
    });
    if (sort) {
      const col = active.payload.columns.find((c) => c.id === sort.columnId);
      rows = [...rows].sort((a, b) => {
        const av = a.cells[sort.columnId] || "";
        const bv = b.cells[sort.columnId] || "";
        let result = 0;
        if (col?.type === "number") result = (toNumber(av) ?? Number.NEGATIVE_INFINITY) - (toNumber(bv) ?? Number.NEGATIVE_INFINITY);
        else if (col?.type === "date") result = Date.parse(av || "0") - Date.parse(bv || "0");
        else result = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
        return sort.direction === "asc" ? result : -result;
      });
    }
    return rows;
  }, [active, filterColumn, filterText, sort]);

  const stats = useMemo(() => {
    if (!active) return [];
    return active.payload.columns.filter((col) => col.type === "number").map((col) => {
      const values = visibleRows.map((row) => toNumber(row.cells[col.id] || "")).filter((v): v is number => v !== null);
      const sum = values.reduce((a, b) => a + b, 0);
      return { col, count: values.length, sum, avg: values.length ? sum / values.length : 0, min: values.length ? Math.min(...values) : 0, max: values.length ? Math.max(...values) : 0 };
    });
  }, [active, visibleRows]);

  async function importCsv(file: File) {
    const text = await file.text();
    const payload = csvToPayload(text);
    updateActive((sheet) => ({ ...sheet, name: sheet.name || file.name.replace(/\.csv$/i, ""), payload }));
  }

  function exportCsv() {
    if (!active) return;
    const blob = new Blob([payloadToCsv(active.payload, visibleRows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${active.name.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "sheet"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={styles.shell}><div style={styles.card}>Loading spreadsheets…</div></div>;

  return (
    <div style={styles.shell}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHead}>
          <strong>Sheets</strong>
          <button type="button" style={styles.miniGoldButton} onClick={() => void createSheet()}>New</button>
        </div>
        <div style={styles.sheetList}>
          {sheets.map((sheet) => (
            <button key={sheet.id} type="button" style={{ ...styles.sheetTab, ...(sheet.id === activeId ? styles.sheetTabActive : {}) }} onClick={() => setActiveId(sheet.id)}>
              <span>{sheet.name}</span>
              <small>{sheet.payload.rows.length} rows</small>
            </button>
          ))}
          {!sheets.length && <p style={styles.emptyText}>Create your first operational sheet to manage partners, budgets, inventory, or forecasts.</p>}
        </div>
      </div>

      <div style={styles.workspace}>
        {err && <div style={styles.error}>{err}</div>}
        {!active ? (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>No sheet selected</h2>
            <p style={styles.muted}>Create a named sheet to start managing operational data.</p>
            <button type="button" style={styles.goldButton} onClick={() => void createSheet()}>Create sheet</button>
          </div>
        ) : (
          <>
            <div style={styles.toolbar}>
              <input aria-label="Sheet name" value={active.name} onChange={(e) => renameSheet(e.target.value)} style={styles.titleInput} />
              <span style={styles.statusPill}>{saving ? "Saving…" : "Saved to Supabase"}</span>
              <button type="button" style={styles.darkButton} onClick={() => fileRef.current?.click()}>Import CSV</button>
              <button type="button" style={styles.darkButton} onClick={exportCsv}>Export CSV</button>
              <button type="button" style={styles.dangerButton} onClick={() => void deleteSheet(active.id)}>Delete sheet</button>
              <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) void importCsv(file); e.currentTarget.value = ""; }} />
            </div>

            <div style={styles.controls}>
              <label style={styles.controlLabel}>Filter
                <input value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder="Search any row" style={styles.input} />
              </label>
              <label style={styles.controlLabel}>Column
                <select value={filterColumn} onChange={(e) => setFilterColumn(e.target.value)} style={styles.input}>
                  <option value="all">All columns</option>
                  {active.payload.columns.map((col) => <option key={col.id} value={col.id}>{col.name}</option>)}
                </select>
              </label>
              <div style={styles.rowCount}>Showing <strong>{visibleRows.length}</strong> of <strong>{active.payload.rows.length}</strong> rows</div>
              <button type="button" style={styles.goldButton} onClick={addRow}>Add row</button>
              <button type="button" style={styles.darkButton} onClick={addColumn}>Add column</button>
            </div>

            <div style={styles.statsGrid}>
              {stats.map((item) => (
                <div key={item.col.id} style={styles.statCard}>
                  <strong>{item.col.name}</strong>
                  <span>Sum {item.sum.toLocaleString()}</span>
                  <span>Avg {item.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span>Min {item.min.toLocaleString()} · Max {item.max.toLocaleString()}</span>
                </div>
              ))}
              {!stats.length && <div style={styles.statCard}>Add a number column to see sum, average, minimum, and maximum.</div>}
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {active.payload.columns.map((col) => (
                      <th key={col.id} style={styles.th}>
                        <button type="button" style={styles.sortButton} onClick={() => setSort((cur) => cur?.columnId === col.id && cur.direction === "asc" ? { columnId: col.id, direction: "desc" } : { columnId: col.id, direction: "asc" })}>
                          {col.name} {sort?.columnId === col.id ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
                        </button>
                        <div style={styles.columnEditor}>
                          <input value={col.name} onChange={(e) => updateColumn(col.id, { name: e.target.value })} style={styles.columnInput} aria-label={`Rename ${col.name}`} />
                          <select value={col.type} onChange={(e) => updateColumn(col.id, { type: e.target.value as ColumnType })} style={styles.columnInput} aria-label={`Type for ${col.name}`}>
                            {COLUMN_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                          </select>
                          {col.type === "select" && <input value={col.options.join(", ")} onChange={(e) => updateColumn(col.id, { options: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })} placeholder="Options" style={styles.columnInput} />}
                          <button type="button" style={styles.iconDanger} onClick={() => deleteColumn(col.id)} aria-label={`Delete ${col.name}`}>×</button>
                        </div>
                      </th>
                    ))}
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.id}>
                      {active.payload.columns.map((col) => (
                        <td key={col.id} style={styles.td}>{renderCell(col, row.cells[col.id] || "", (value) => updateCell(row.id, col.id, value))}</td>
                      ))}
                      <td style={styles.td}><button type="button" style={styles.iconDanger} onClick={() => deleteRow(row.id)}>Delete</button></td>
                    </tr>
                  ))}
                  {!visibleRows.length && <tr><td style={styles.td} colSpan={active.payload.columns.length + 1}>No rows match the current filter.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function renderCell(col: SheetColumn, value: string, onChange: (value: string) => void) {
  if (col.type === "checkbox") return <input type="checkbox" checked={value === "true" || value === "1" || value === "yes"} onChange={(e) => onChange(e.target.checked ? "true" : "false")} />;
  if (col.type === "select") return <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.cellInput}><option value="">—</option>{col.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  return <input value={value} onChange={(e) => onChange(e.target.value)} type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"} style={styles.cellInput} />;
}

const styles: Record<string, CSSProperties> = {
  shell: { display: "grid", gridTemplateColumns: "minmax(190px, 250px) minmax(0, 1fr)", gap: 16, color: TEXT },
  sidebar: { border: `1px solid ${BORDER}`, borderRadius: 20, background: "linear-gradient(180deg,rgba(15,20,27,.96),rgba(8,12,18,.96))", padding: 14, minHeight: 420 },
  sidebarHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 },
  sheetList: { display: "grid", gap: 8 },
  sheetTab: { border: `1px solid ${BORDER}`, background: "rgba(255,255,255,.03)", color: TEXT, borderRadius: 14, padding: 12, textAlign: "left", cursor: "pointer", display: "grid", gap: 4 },
  sheetTabActive: { borderColor: GREEN, boxShadow: "0 0 0 1px rgba(52,211,153,.25), 0 0 24px rgba(52,211,153,.12)" },
  workspace: { minWidth: 0, display: "grid", gap: 14 },
  card: { border: `1px solid ${BORDER}`, borderRadius: 20, background: PANEL, padding: 20 },
  cardTitle: { margin: "0 0 8px", fontSize: 22 },
  muted: { color: MUTED, margin: "0 0 14px" },
  emptyText: { color: MUTED, fontSize: 13, lineHeight: 1.5 },
  error: { border: "1px solid rgba(255,107,107,.35)", color: "#ffd1d1", background: "rgba(255,107,107,.1)", borderRadius: 14, padding: 12 },
  toolbar: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, border: `1px solid ${BORDER}`, borderRadius: 18, background: PANEL, padding: 12 },
  titleInput: { flex: "1 1 240px", border: "none", borderBottom: `1px solid ${BORDER}`, background: "transparent", color: TEXT, fontSize: 22, fontWeight: 900, padding: 8, outline: "none" },
  statusPill: { border: "1px solid rgba(52,211,153,.32)", color: GREEN, background: "rgba(52,211,153,.08)", borderRadius: 999, padding: "7px 11px", fontSize: 12, fontWeight: 800 },
  controls: { display: "flex", flexWrap: "wrap", alignItems: "end", gap: 10, border: `1px solid ${BORDER}`, borderRadius: 18, background: PANEL_SOFT, padding: 12 },
  controlLabel: { display: "grid", gap: 5, color: MUTED, fontSize: 12, fontWeight: 800 },
  input: { minHeight: 38, border: `1px solid ${BORDER}`, borderRadius: 12, background: INPUT, color: TEXT, padding: "0 11px" },
  rowCount: { color: MUTED, padding: "10px 4px", marginRight: "auto" },
  goldButton: { border: "none", borderRadius: 12, background: `linear-gradient(135deg,${GOLD},#dfa837)`, color: "#05070a", fontWeight: 900, padding: "10px 14px", cursor: "pointer" },
  miniGoldButton: { border: "none", borderRadius: 999, background: `linear-gradient(135deg,${GOLD},#dfa837)`, color: "#05070a", fontWeight: 900, padding: "7px 10px", cursor: "pointer" },
  darkButton: { border: `1px solid ${BORDER}`, borderRadius: 12, background: "rgba(255,255,255,.04)", color: TEXT, fontWeight: 800, padding: "10px 14px", cursor: "pointer" },
  dangerButton: { border: "1px solid rgba(255,107,107,.35)", borderRadius: 12, background: "rgba(255,107,107,.08)", color: "#ffd1d1", fontWeight: 800, padding: "10px 14px", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 },
  statCard: { border: `1px solid ${BORDER}`, borderRadius: 16, background: "linear-gradient(180deg,rgba(34,211,238,.07),rgba(52,211,153,.04))", padding: 12, display: "grid", gap: 5, color: MUTED, fontSize: 12 },
  tableWrap: { overflow: "auto", border: `1px solid ${BORDER}`, borderRadius: 18, background: PANEL },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 840 },
  th: { position: "sticky", top: 0, zIndex: 1, background: "#0b1118", borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`, padding: 10, verticalAlign: "top", minWidth: 190 },
  td: { borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`, padding: 8, verticalAlign: "middle" },
  sortButton: { width: "100%", border: "none", background: "transparent", color: CYAN, fontWeight: 900, textAlign: "left", cursor: "pointer", marginBottom: 8 },
  columnEditor: { display: "grid", gap: 6 },
  columnInput: { minHeight: 30, border: `1px solid ${BORDER}`, borderRadius: 9, background: INPUT, color: TEXT, padding: "0 8px", fontSize: 12 },
  cellInput: { width: "100%", minHeight: 36, border: `1px solid rgba(255,255,255,.08)`, borderRadius: 10, background: INPUT, color: TEXT, padding: "0 10px" },
  iconDanger: { border: "1px solid rgba(255,107,107,.32)", borderRadius: 10, background: "rgba(255,107,107,.08)", color: RED, fontWeight: 900, padding: "6px 9px", cursor: "pointer" },
};
