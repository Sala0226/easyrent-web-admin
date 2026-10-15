import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import usePaginatedFetch from '../hooks/usePaginatedFetch';
import Pagination from '../components/Pagination';
import IconButton from '../components/IconButton';
import { EyeIcon, PowerIcon, RefreshIcon } from '../components/icons';

export default function PropertiesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const {
    items: rawProperties,
    total,
    page,
    setPage,
    totalPages,
    loading,
    error: fetchError,
    refresh,
  } = usePaginatedFetch('/admin/properties', 5);

  const properties = Array.isArray(rawProperties) ? rawProperties : [];

  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    pending: 0,
    validated: 0,
    refused: 0,
    suspended: 0,
  });

  const [actionError, setActionError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data && res.data.properties) {
        setDashboardStats(res.data.properties);
      }
    } catch (err) {
      console.error('Erreur chargement dashboard properties', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionError('');
    try {
      await api.patch(`/admin/properties/${id}/status`, { status: newStatus });
      refresh();
      fetchDashboard();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Erreur lors de la modification du statut.');
    }
  };

  const displayError = actionError || fetchError;

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Gestion des Propriétés</h1>
          <p style={styles.subtitle}>Suivi global et modération des annonces immobilières</p>
        </div>
        <button onClick={() => { refresh(); fetchDashboard(); }} style={styles.refreshButton}>
          <RefreshIcon size={16} /> Actualiser
        </button>
      </div>

      {displayError && <div style={styles.errorAlert}>{displayError}</div>}

      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>🏠</div>
          <div>
            <p style={styles.kpiLabel}>Total Propriétés</p>
            <h3 style={styles.kpiValue}>{dashboardStats.total}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>✅</div>
          <div>
            <p style={styles.kpiLabel}>Validées</p>
            <h3 style={styles.kpiValue}>{dashboardStats.validated}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>⏳</div>
          <div>
            <p style={styles.kpiLabel}>En Attente</p>
            <h3 style={styles.kpiValue}>{dashboardStats.pending}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>🚫</div>
          <div>
            <p style={styles.kpiLabel}>Refusées / Suspendues</p>
            <h3 style={styles.kpiValue}>{(dashboardStats.refused || 0) + (dashboardStats.suspended || 0)}</h3>
          </div>
        </div>
      </div>

      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Liste des Annonces</h3>

        {loading ? (
          <p style={styles.loadingText}>Chargement des données...</p>
        ) : properties.length === 0 ? (
          <p style={styles.emptyText}>Aucune propriété trouvée sur la plateforme.</p>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>Titre / Bien</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Prix</th>
                  <th style={styles.th}>Favoris</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => {
                  const favCount = prop._count?.favorites || 0;
                  const isPending = prop.status === 'EN_ATTENTE';
                  const isValidated = prop.status === 'VALIDEE';

                  return (
                    <tr key={prop.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong style={{ color: '#0f172a' }}>{prop.title}</strong>
                        <div style={styles.tdSub}>{prop.city || prop.address}</div>
                      </td>
                      <td style={styles.td}>{prop.type}</td>
                      <td style={styles.td}>
                        <strong>{prop.price ? `${prop.price.toLocaleString()} FCFA` : 'N/C'}</strong>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.favoriteBadge}>⭐ {favCount}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: isValidated ? '#d1fae5' : isPending ? '#fef3c7' : '#fee2e2',
                          color: isValidated ? '#065f46' : isPending ? '#92400e' : '#991b1b',
                        }}>
                          {prop.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {/* Voir les détails */}
                          <IconButton
                            icon={<EyeIcon size={16} />}
                            tooltip="Voir les détails"
                            onClick={() => navigate(`/properties/${prop.id}`)}
                          />

                          {/* Suspendre ou Activer la propriété */}
                          <IconButton
                            icon={
                              <PowerIcon
                                size={16}
                                color={prop.status === 'SUSPENDUE' ? '#10b981' : '#ef4444'}
                              />
                            }
                            tooltip={prop.status === 'SUSPENDUE' ? 'Activer la propriété' : 'Suspendre la propriété'}
                            onClick={() => handleUpdateStatus(prop.id, prop.status === 'SUSPENDUE' ? 'VALIDEE' : 'SUSPENDUE')}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && properties.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            limit={5}
            onPageChange={setPage}
          />
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  favoriteBadge: {
    fontWeight: '600',
    color: '#d97706',
    backgroundColor: '#fef3c7',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
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