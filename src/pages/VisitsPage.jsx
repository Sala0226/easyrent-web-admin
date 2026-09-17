import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function VisitsPage() {
  const { token } = useAuth();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupération des demandes de visite depuis l'API
  const fetchVisits = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/visits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setVisits(data.visits || data);
      } else {
        setError(data.message || 'Erreur lors du chargement des demandes de visite.');
      }
    } catch (err) {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [token]);

  // Actions de validation ou de refus d'une visite
  const handleAction = async (id, actionType) => {
    try {
      const response = await fetch(`http://localhost:3000/visits/${id}/${actionType}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchVisits(); // Actualiser la liste après l'action
      } else {
        const data = await response.json();
        alert(data.message || 'Erreur lors du traitement de l’action.');
      }
    } catch (err) {
      alert('Impossible de contacter le serveur.');
    }
  };

  // Calcul dynamique des KPIs
  const totalVisits = visits.length;
  const pendingVisits = visits.filter(v => v.status === 'pending' || v.status === 'en attente').length;
  const acceptedVisits = visits.filter(v => v.status === 'accepted' || v.status === 'accepté').length;
  const refusedVisits = visits.filter(v => v.status === 'refused' || v.status === 'refusé').length;

  return (
    <div style={styles.container}>
      {/* En-tête de la page */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Demandes de Visite</h1>
          <p style={styles.subtitle}>Suivi et modération des programmations de visite</p>
        </div>
        <button onClick={fetchVisits} style={styles.refreshButton}>
          🔄 Actualiser
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* Grille des KPIs */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>📅</div>
          <div>
            <p style={styles.kpiLabel}>Total Demandes</p>
            <h3 style={styles.kpiValue}>{totalVisits}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>⏳</div>
          <div>
            <p style={styles.kpiLabel}>En Attente</p>
            <h3 style={styles.kpiValue}>{pendingVisits}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>✅</div>
          <div>
            <p style={styles.kpiLabel}>Acceptées</p>
            <h3 style={styles.kpiValue}>{acceptedVisits}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>❌</div>
          <div>
            <p style={styles.kpiLabel}>Refusées</p>
            <h3 style={styles.kpiValue}>{refusedVisits}</h3>
          </div>
        </div>
      </div>

      {/* Tableau des Visites */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Liste des Demandes de Visite</h3>
        
        {loading ? (
          <p style={styles.loadingText}>Chargement des données...</p>
        ) : visits.length === 0 ? (
          <p style={styles.emptyText}>Aucune demande de visite enregistrée.</p>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>Propriété</th>
                  <th style={styles.th}>Demandeur</th>
                  <th style={styles.th}>Date souhaitée</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit._id || visit.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#0f172a' }}>{visit.property?.title || 'Bien immobilier'}</strong>
                      <div style={styles.tdSub}>{visit.property?.city || ''}</div>
                    </td>
                    <td style={styles.td}>
                      <strong>{visit.user?.name || visit.visitorName || 'Utilisateur'}</strong>
                      <div style={styles.tdSub}>{visit.user?.email || visit.visitorEmail || ''}</div>
                    </td>
                    <td style={styles.td}>
                      {visit.date ? new Date(visit.date).toLocaleDateString() : 'Non spécifiée'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: (visit.status === 'accepted' || visit.status === 'accepté') ? '#d1fae5' : (visit.status === 'refused' || visit.status === 'refusé') ? '#fee2e2' : '#fef3c7',
                        color: (visit.status === 'accepted' || visit.status === 'accepté') ? '#065f46' : (visit.status === 'refused' || visit.status === 'refusé') ? '#991b1b' : '#92400e',
                      }}>
                        {visit.status || 'En attente'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleAction(visit._id || visit.id, 'accept')}
                          style={styles.acceptBtn}
                        >
                          Valider
                        </button>
                        <button 
                          onClick={() => handleAction(visit._id || visit.id, 'refuse')}
                          style={styles.refuseBtn}
                        >
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  refreshButton: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #fee2e2',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #e2e8f0',
  },
  kpiIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 'bold',
  },
  kpiLabel: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600',
  },
  kpiValue: {
    margin: '4px 0 0 0',
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    padding: '20px',
  },
  tableTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHeader: {
    borderBottom: '2px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#334155',
  },
  tdSub: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  acceptBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  refuseBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loadingText: {
    textAlign: 'center',
    padding: '30px',
    color: '#64748b',
  },
  emptyText: {
    textAlign: 'center',
    padding: '30px',
    color: '#64748b',
  },
};