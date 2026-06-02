// File: components/tools/SpreadsheetsTool.tsx
// Multi-tenant spreadsheets tool. Reads/writes the Supabase `sheets` table
// (RLS-scoped to the logged-in user, so each person sees only their own).
// Shared by the admin workspace and the customer /app workspace.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#f5c542";
const PANEL = "#0f141b";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";
const INPUT = "#0a0e14";

type Sheet = {
  id: string;
  name: string;
  data: string[][];
  rows: number;
  cols: number;
  updated_at?: string;
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

function emptyGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
}

function normalizeGrid(data: unknown, rows: number, cols: number): string[][] {
  const grid = Array.isArray(data) ? (data as string[][]) : [];
  const out = emptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = grid[r]?.[c];
      if (typeof v === "string") out[r][c] = v;
    }
  }
  return out;
}

export default function SpreadsheetsTool() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
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
        .from("sheets")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const list = (data || []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        name: String(row.name ?? "Untitled sheet"),
        rows: Number(row.rows ?? 20),
        cols: Number(row.cols ?? 8),
        data: normalizeGrid(row.data, Number(row.rows ?? 20), Number(row.cols ?? 8)),
        updated_at: row.updated_at ? String(row.updated_at) : undefined,
      })) as Sheet[];
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

  async function createSheet() {
    setErr(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErr("Please log in first.");
        return;
      }
      const rows = 20;
      const cols = 8;
      const { data, error } = await supabase
        .from("sheets")
        .insert({ user_id: user.id, name: "Untitled sheet", data: emptyGrid(rows, cols), rows, cols })
        .select("*")
        .single();
      if (error) throw error;
      const s: Sheet = {
        id: String(data.id),
        name: String(data.name),
        rows, cols,
        data: emptyGrid(rows, cols),
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

  return (
    <div style={{ color: TEXT, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <button type="button" onClick={() => void createSheet()} style={btnGold}>+ New sheet</button>
        {active && <button type="button" onClick={addRow} style={btnGhost}>+ Row</button>}
        {active && <button type="button" onClick={addCol} style={btnGhost}>+ Column</button>}
        <span style={{ marginLeft: "auto", color: MUTED, fontSize: 12 }}>{saving ? "Saving…" : "All changes saved"}</span>
      </div>

      {err && <p style={{ color: "#ff7b72", fontSize: 13, margin: "0 0 12px" }}>{err}</p>}

      {loading ? (
        <p style={{ color: MUTED }}>Loading…</p>
      ) : sheets.length === 0 ? (
        <div style={{ background: PANEL, border: `1px dashed ${BORDER}`, borderRadius: 14, padding: 28, textAlign: "center", color: MUTED }}>
          No sheets yet. Click <strong style={{ color: GOLD }}>+ New sheet</strong> to create your first one.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sheets.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button type="button" onClick={() => setActiveId(s.id)} style={{ flex: 1, textAlign: "left", padding: "9px 11px", borderRadius: 9, cursor: "pointer", border: `1px solid ${s.id === activeId ? GOLD : BORDER}`, background: s.id === activeId ? "rgba(245,197,66,.1)" : PANEL, color: s.id === activeId ? GOLD : TEXT, fontSize: 13, fontWeight: 700, fontFamily: "inherit", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.name || "Untitled"}
                </button>
                <button type="button" onClick={() => void deleteSheet(s.id)} aria-label="Delete sheet" style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 15 }}>×</button>
              </div>
            ))}
          </div>

          <div>
            {active ? (
              <>
                <input value={active.name} onChange={(e) => rename(e.target.value)} style={{ width: "100%", boxSizing: "border-box", marginBottom: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: INPUT, color: TEXT, fontSize: 15, fontWeight: 800, outline: "none" }} />
                <div style={{ overflow: "auto", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                      <tr>
                        <th style={cornerCell} />
                        {Array.from({ length: active.cols }, (_, c) => (
                          <th key={c} style={headCell}>{colLabel(c)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: active.rows }, (_, r) => (
                        <tr key={r}>
                          <td style={rowHeadCell}>{r + 1}</td>
                          {Array.from({ length: active.cols }, (_, c) => (
                            <td key={c} style={{ padding: 0, border: `1px solid ${BORDER}` }}>
                              <input value={active.data[r]?.[c] ?? ""} onChange={(e) => setCell(r, c, e.target.value)} style={{ width: 110, boxSizing: "border-box", padding: "7px 8px", border: "none", background: "transparent", color: TEXT, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p style={{ color: MUTED }}>Select a sheet on the left, or create a new one.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const btnGold: React.CSSProperties = { padding: "9px 16px", borderRadius: 10, border: "none", background: GOLD, color: "#06060a", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" };
const btnGhost: React.CSSProperties = { padding: "9px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: PANEL, color: TEXT, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" };
const headCell: React.CSSProperties = { background: "#11161d", color: MUTED, fontSize: 11, fontWeight: 800, padding: "6px 8px", border: `1px solid ${BORDER}`, position: "sticky", top: 0 };
const cornerCell: React.CSSProperties = { background: "#11161d", border: `1px solid ${BORDER}`, width: 38 };
const rowHeadCell: React.CSSProperties = { background: "#11161d", color: MUTED, fontSize: 11, fontWeight: 800, padding: "6px 8px", border: `1px solid ${BORDER}`, textAlign: "center" };
