"use client";

import React, { useState } from 'react';

export default function OfficeDashboard() {
  const [activeTab, setActiveTab] = useState('documents');
  
  // High-fidelity stub data mimicking our office_documents schema structure
  const [documents] = useState([
    { id: '1', title: 'Q2 Operational Strategy', updated_at: '2 hours ago', size: '14 KB' },
    { id: '2', title: 'Cross-Border Localization Parameters', updated_at: 'Yesterday', size: '42 KB' },
    { id: '3', title: 'Affiliate Pipeline Capital Allocation', updated_at: 'May 25, 2026', size: '128 KB' },
  ]);

  return (
    <div className="office-portal-container" style={styles.portalContainer}>
      {/* Lateral Structural Workspace Navigation */}
      <aside className="office-sidebar" style={styles.sidebar}>
        <div className="workspace-brand" style={styles.brandZone}>
          <span style={styles.brandIcon}>⚡</span>
          <span style={styles.brandText}>SignalOffice</span>
        </div>
        
        <nav style={styles.navStack}>
          <button 
            onClick={() => setActiveTab('documents')} 
            style={{...styles.navItem, ...(activeTab === 'documents' ? styles.navItemActive : {})}}
          >
            📂 Documents
          </button>
          <button 
            onClick={() => setActiveTab('workspaces')} 
            style={{...styles.navItem, ...(activeTab === 'workspaces' ? styles.navItemActive : {})}}
          >
            🏢 Workspaces
          </button>
          <button 
            onClick={() => setActiveTab('billing')} 
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

      {/* Primary Workspace Activity Hub */}
      <main className="office-main-content" style={styles.mainContent}>
        <header style={styles.headerBar}>
          <div>
            <h1 style={styles.pageTitle}>Workspace Dashboard</h1>
            <p style={styles.pageSubtitle}>Manage your decentralized office tools and secure document vaults.</p>
          </div>
          <button style={styles.primaryActionButton}>
            + New Document
          </button>
        </header>

        {/* Analytical Aggregates Section */}
        <section style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Active Documents</div>
            <div style={styles.metricValue}>{documents.length}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Storage Used</div>
            <div style={styles.metricValue}>184 KB</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Workspace Status</div>
            <div style={styles.metricValue} style={{...styles.metricValue, color: '#10b981'}}>Operational</div>
          </div>
        </section>

        {/* Dynamic Context Render based on Navigation Selection */}
        {activeTab === 'documents' && (
          <div style={styles.tableWrapper}>
            <table style={styles.documentTable}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeaderCell}>Document Title</th>
                  <th style={styles.tableHeaderCell}>Last Modified</th>
                  <th style={styles.tableHeaderCell}>Data Footprint</th>
                  <th style={styles.tableHeaderCellStyleRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={styles.tableBodyRow}>
                    <td style={styles.tableCellTitle}>📄 {doc.title}</td>
                    <td style={styles.tableCellText}>{doc.updated_at}</td>
                    <td style={styles.tableCellText}>{doc.size}</td>
                    <td style={styles.tableCellActions}>
                      <button style={styles.inlineActionButton}>Edit</button>
                      <button style={styles.inlineDangerButton}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab !== 'documents' && (
          <div style={styles.emptyStateCard}>
            <h3>Module Coming Soon</h3>
            <p style={{color: '#8e8e99'}}>The database architecture is live. This UI view is currently being provisioned.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Inline Style Tokens for Zero-Configuration Compilation
const styles: Record<string, React.CSSProperties> = {
  portalContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#070709',
    color: '#f4f4f6',
    fontFamily: "'Outfit', sans-serif",
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#0e0e12',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
  },
  brandZone: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '40px',
    paddingLeft: '8px',
  },
  brandIcon: {
    fontSize: '20px',
    color: '#dfa837',
  },
  brandText: {
    fontSize: '18px',
    fontWeight: 600,
    letterSpacing: '-0.02em',
  },
  navStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#8e8e99',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: '#f4f4f6',
    fontWeight: 500,
  },
  userFootprint: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  avatarPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#dfa837',
    color: '#070709',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '13px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 500,
  },
  userRole: {
    fontSize: '11px',
    color: '#8e8e99',
  },
  mainContent: {
    flexGrow: 1,
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 600,
    letterSpacing: '-0.03em',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#8e8e99',
    margin: '4px 0 0 0',
  },
  primaryActionButton: {
    backgroundColor: '#dfa837',
    color: '#070709',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '14px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '40px',
  },
  metricCard: {
    backgroundColor: 'rgba(14, 14, 18, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '20px',
    borderRadius: '8px',
  },
  metricLabel: {
    fontSize: '13px',
    color: '#8e8e99',
    marginBottom: '8px',
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 600,
  },
  tableWrapper: {
    backgroundColor: 'rgba(14, 14, 18, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  documentTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  tableHeaderCell: {
    padding: '16px',
    color: '#8e8e99',
    fontWeight: 500,
  },
  tableHeaderCellStyleRight: {
    padding: '16px',
    color: '#8e8e99',
    fontWeight: 500,
    textAlign: 'right',
  },
  tableBodyRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  tableCellTitle: {
    padding: '16px',
    fontWeight: 500,
  },
  tableCellText: {
    padding: '16px',
    color: '#8e8e99',
  },
  tableCellActions: {
    padding: '16px',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'end',
    gap: '8px',
  },
  inlineActionButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f4f4f6',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  inlineDangerButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  emptyStateCard: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'rgba(14, 14, 18, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
  },
};
