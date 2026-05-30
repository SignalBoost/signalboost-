"use client";

import React, { useState, useEffect } from 'react';

interface DocumentType {
  id: string;
  title: string;
  updated_at: string;
  content_json?: {
    bodyText?: string;
    version?: string;
  };
}

export default function OfficeDashboard() {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/office/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data || []);
      }
    } catch (err) {
      console.error("Supabase link error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const docTitle = window.prompt("Enter Document Title:", "Untitled Document");
    if (!docTitle) return;

    try {
      const res = await fetch('/api/office/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: docTitle }),
      });

      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error("Write execution failed:", err);
    }
  };

  const startEditing = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setEditTitle(doc.title);
    setEditBody(doc.content_json?.bodyText || '');
  };

  const handleSaveChanges = async () => {
    if (!selectedDoc) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/office/documents', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDoc.id,
          title: editTitle,
          content_json: { bodyText: editBody, version: "1.1" }
        }),
      });

      if (res.ok) {
        setSelectedDoc(null);
        fetchDocuments();
      }
    } catch (err) {
      console.error("Mutation failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="office-portal-container" style={styles.portalContainer}>
      <aside className="office-sidebar" style={styles.sidebar}>
        <div className="workspace-brand" style={styles.brandZone}>
          <span style={styles.brandIcon}>⚡</span>
          <span style={styles.brandText}>SignalOffice</span>
        </div>
        
        <nav style={styles.navStack}>
          <button 
            onClick={() => { setActiveTab('documents'); setSelectedDoc(null); }} 
            style={{...styles.navItem, ...(activeTab === 'documents' && !selectedDoc ? styles.navItemActive : {})}}
          >
            📂 Documents
          </button>
          <button 
            onClick={() => { setActiveTab('workspaces'); setSelectedDoc(null); }} 
            style={{...styles.navItem, ...(activeTab === 'workspaces' ? styles.navItemActive : {})}}
          >
            🏢 Workspaces
          </button>
          <button 
            onClick={() => { setActiveTab('billing'); setSelectedDoc(null); }} 
            style={{...styles.navItem, ...(activeTab === 'billing' ? styles.navItemActive : {})}}
          >
            💳 Plan & Billing
          </button>
        </nav>

        <div style={styles.userFootprint}>
          <div style={styles.avatarPlaceholder}>PM</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>Workspace Admin</div>
            <div style={styles.userRole}>Pro Tier</div>
          </div>
        </div>
      </aside>

      <main className="office-main-content" style={styles.mainContent}>
        {selectedDoc ? (
          <div style={styles.editorCanvas}>
            <header style={styles.canvasHeader}>
              <button onClick={() => setSelectedDoc(null)} style={styles.secondaryButton}>
                ← Back to List
              </button>
              <button onClick={handleSaveChanges} disabled={isSaving} style={styles.primaryActionButton}>
                {isSaving ? 'Saving Changes...' : 'Save Vault Update'}
              </button>
            </header>
            
            <div style={styles.canvasInputs}>
              <input 
                type="text" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={styles.canvasTitleInput}
              />
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                style={styles.canvasTextArea}
                placeholder="Begin crafting your workspace data..."
              />
            </div>
          </div>
        ) : (
          <>
            <header style={styles.headerBar}>
              <div>
                <h1 style={styles.pageTitle}>Workspace Dashboard</h1>
                <p style={styles.pageSubtitle}>Manage your decentralized office tools and secure document vaults.</p>
              </div>
              <button 
                type="button"
                onClick={handleCreateDocument} 
                style={styles.primaryActionButton}
              >
                + New Document
              </button>
            </header>

            <section style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Active Documents</div>
                <div style={styles.metricValue}>{loading ? '...' : documents.length}</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Total Storage Used</div>
                <div style={styles.metricValue}>{loading ? '...' : `${documents.length * 4} KB`}</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Workspace Status</div>
                <div style={{...styles.metricValue, color: '#10b981'}}>Operational</div>
              </div>
            </section>

            {activeTab === 'documents' && (
              <div style={styles.tableWrapper}>
                {loading ? (
                  <div style={{padding: '40px', textAlign: 'center', color: '#8e8e99'}}>Synchronizing with Supabase database vault...</div>
                ) : documents.length === 0 ? (
                  <div style={{padding: '40px', textAlign: 'center', color: '#8e8e99'}}>No data resources found. Click "+ New Document" to initialize one.</div>
                ) : (
                  <table style={styles.documentTable}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableHeaderCell}>Document Title</th>
                        <th style={styles.tableHeaderCell}>Last Modified</th>
                        <th style={styles.tableHeaderCellStyleRight}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id} style={styles.tableBodyRow}>
                          <td style={styles.tableCellTitle}>📄 {doc.title}</td>
                          <td style={styles.tableCellText}>{new Date(doc.updated_at).toLocaleDateString()}</td>
                          <td style={styles.tableCellActions}>
                            <button onClick={() => startEditing(doc)} style={styles.inlineActionButton}>Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab !== 'documents' && (
              <div style={styles.emptyStateCard}>
                <h3>Module Coming Soon</h3>
                <p style={{color: '#8e8e99'}}>The database architecture is live.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  portalContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#070709', color: '#f4f4f6', fontFamily: "'Outfit', sans-serif" },
  sidebar: { width: '260px', backgroundColor: '#0e0e12', borderRight: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', padding: '24px 16px' },
  brandZone: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', paddingLeft: '8px' },
  brandIcon: { fontSize: '20px', color: '#dfa837' },
  brandText: { fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' },
  navStack: { display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 },
  navItem: { display: 'flex', alignItems: 'center', width: '100%', padding: '12px', backgroundColor: 'transparent', border: 'none', borderRadius: '6px', color: '#8e8e99', textAlign: 'left', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' },
  navItemActive: { backgroundColor: 'rgba(255, 255, 255, 0.04)', color: '#f4f4f6', fontWeight: 500 },
  userFootprint: { display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' },
  avatarPlaceholder: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dfa837', color: '#070709', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px' },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '13px', fontWeight: 500 },
  userRole: { fontSize: '11px', color: '#8e8e99' },
  mainContent: { flexGrow: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
  headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  pageTitle: { fontSize: '28px', fontWeight: 600, letterSpacing: '-0.03em', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#8e8e99', margin: '4px 0 0 0' },
  primaryActionButton: { backgroundColor: '#dfa837', color: '#070709', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontSize: '14px' },
  secondaryButton: { backgroundColor: 'rgba(255, 255, 255, 0.04)', color: '#f4f4f6', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontSize: '14px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' },
  metricCard: { backgroundColor: 'rgba(14, 14, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '20px', borderRadius: '8px' },
  metricLabel: { fontSize: '13px', color: '#8e8e99', marginBottom: '8px' },
  metricValue: { fontSize: '24px', fontWeight: 600 },
  tableWrapper: { backgroundColor: 'rgba(14, 14, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', overflow: 'hidden' },
  documentTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  tableHeaderRow: { borderBottom: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(255, 255, 255, 0.01)' },
  tableHeaderCell: { padding: '16px', color: '#8e8e99', fontWeight: 500 },
  tableHeaderCellStyleRight: { padding: '16px', color: '#8e8e99', fontWeight: 500, textAlign: 'right' },
  tableBodyRow: { borderBottom: '1px solid rgba(255, 255, 255, 0.04)' },
  tableCellTitle: { padding: '16px', fontWeight: 500 },
  tableCellText: { padding: '16px', color: '#8e8e99' },
  tableCellActions: { padding: '16px', textAlign: 'right', display: 'flex', justifyContent: 'end', gap: '8px' },
  inlineActionButton: { backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f4f4f6', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  emptyStateCard: { textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(14, 14, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px' },
  editorCanvas: { display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' },
  canvasHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  canvasInputs: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', backgroundColor: 'rgba(14, 14, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '32px', borderRadius: '8px' },
  canvasTitleInput: { backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#f4f4f6', fontSize: '24px', fontWeight: 600, paddingBottom: '12px', width: '100%', outline: 'none' },
  canvasTextArea: { backgroundColor: 'transparent', border: 'none', color: '#8e8e99', fontSize: '16px', lineHeight: '1.6', minHeight: '450px', width: '100%', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }
};
