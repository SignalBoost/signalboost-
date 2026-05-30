
"use client";

export {}; // Força o compilador Next.js/TypeScript a tratar o arquivo estritamente como um módulo isolado

import React, { useState, useEffect } from 'react';

interface Team {
  id: string;
  name: string;
  neighborhood: string;
}

interface Match {
  id: string;
  match_date: string;
  field_location: string;
  status: string;
  home_score: number;
  away_score: number;
  home_team: { name: string; neighborhood: string };
  away_team: { name: string; neighborhood: string };
}

export default function VarzeaDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [fieldLocation, setFieldLocation] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const resMatches = await fetch('/api/varzea/matches');
      if (resMatches.ok) {
        const dataMatches = await resMatches.json();
        setMatches(dataMatches);
      }

      setTeams([
        { id: "jacana-id-placeholder-1", name: "Botafogo do Jaçanã", neighborhood: "Jaçanã" },
        { id: "vilamaria-id-placeholder-2", name: "Vila Maria E.C.", neighborhood: "Vila Maria" },
        { id: "mooca-id-placeholder-3", name: "União da Mooca", neighborhood: "Mooca" },
        { id: "pari-id-placeholder-4", name: "Estrela do Pari", neighborhood: "Pari" }
      ]);

    } catch (err) {
      console.error("Erro ao carregar dados da Várzea:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId || !matchDate || !fieldLocation) {
      alert("Preencha todos os campos para agendar a partida.");
      return;
    }
    if (homeTeamId === awayTeamId) {
      alert("Um time não pode jogar contra ele mesmo.");
      return;
    }

    try {
      const res = await fetch('/api/varzea/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          match_date: new Date(matchDate).toISOString(),
          field_location: fieldLocation
        }),
      });

      if (res.ok) {
        setFieldLocation('');
        setMatchDate('');
        fetchData();
      }
    } catch (err) {
      console.error("Erro ao agendar jogo:", err);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Painel de Agendamentos Várzea</h1>
          <p style={styles.subtitle}>Gerenciamento de rodadas e confrontos do futebol amador de São Paulo.</p>
        </div>
      </header>

      <div style={styles.gridLayout}>
        {/* Formulário de Novo Jogo */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Agendar Novo Jogo</h2>
          <form onSubmit={handleScheduleMatch} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Time Mandante</label>
              <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} style={styles.select}>
                <option value="">Selecione o time</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.neighborhood})</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Time Visitante</label>
              <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} style={styles.select}>
                <option value="">Selecione o time</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.neighborhood})</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data e Horário</label>
              <input type="datetime-local" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Local / Campo</label>
              <input type="text" placeholder="Ex: Campo do Jaçanã" value={fieldLocation} onChange={(e) => setFieldLocation(e.target.value)} style={styles.input} />
            </div>

            <button type="submit" style={styles.button}>Confirmar Partida</button>
          </form>
        </section>

        {/* Tabela de Próximos Jogos */}
        <section style={styles.tableCard}>
          <h2 style={styles.cardTitle}>Agenda de Confrontos</h2>
          {loading ? (
            <div style={styles.statusText}>Sincronizando com o banco da Várzea...</div>
          ) : matches.length === 0 ? (
            <div style={styles.statusText}>Nenhum jogo agendado para as próximas rodadas.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Partida</th>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Local</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} style={styles.tdRow}>
                    <td style={styles.tdTitle}>
                      {match.home_team?.name} <span style={{color: '#dfa837'}}>vs</span> {match.away_team?.name}
                    </td>
                    <td style={styles.td}>{new Date(match.match_date).toLocaleString('pt-BR')}</td>
                    <td style={styles.td}>{match.field_location}</td>
                    <td style={styles.td}>
                      <span style={{...styles.badge, backgroundColor: match.status === 'scheduled' ? 'rgba(223, 168, 55, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: match.status === 'scheduled' ? '#dfa837' : '#10b981'}}>
                        {match.status === 'scheduled' ? 'Agendado' : match.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', backgroundColor: '#070709', color: '#f4f4f6', fontFamily: "'Outfit', sans-serif", padding: '40px' },
  header: { marginBottom: '40px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '20px' },
  title: { fontSize: '28px', fontWeight: 600, letterSpacing: '-0.03em', margin: 0 },
  subtitle: { fontSize: '14px', color: '#8e8e99', margin: '4px 0 0 0' },
  gridLayout: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', maxWidth: '1400px' },
  card: { backgroundColor: '#0e0e12', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '24px', height: 'fit-content' },
  tableCard: { backgroundColor: '#0e0e12', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '24px' },
  cardTitle: { fontSize: '18px', fontWeight: 600, marginTop: 0, marginBottom: '20px', letterSpacing: '-0.01em' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: '#8e8e99', fontWeight: 500 },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '10px', color: '#f4f4f6', fontSize: '14px', outline: 'none' },
  select: { backgroundColor: '#0e0e12', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '10px', color: '#f4f4f6', fontSize: '14px', outline: 'none' },
  button: { backgroundColor: '#dfa837', color: '#070709', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', marginTop: '10px', fontSize: '14px' },
  statusText: { padding: '40px', textAlign: 'center', color: '#8e8e99', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' },
  thRow: { borderBottom: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(255, 255, 255, 0.01)' },
  th: { padding: '12px 16px', color: '#8e8e99', fontWeight: 500 },
  tdRow: { borderBottom: '1px solid rgba(255, 255, 255, 0.04)' },
  tdTitle: { padding: '16px', fontWeight: 500 },
  td: { padding: '16px', color: '#8e8e99' },
  badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }
};
