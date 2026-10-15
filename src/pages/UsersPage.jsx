import React, { useEffect, useState } from 'react';
import api from '../services/api';
import usePaginatedFetch from '../hooks/usePaginatedFetch';
import IconButton from '../components/IconButton';
import Pagination from '../components/Pagination';
import { PowerIcon, RefreshIcon } from '../components/icons';

const PAGE_SIZE = 5;

export default function UsersPage() {
  const {
    items: users,
    setItems: setUsers,
    page,
    setPage,
    total,
    totalPages,
    loading,
    error,
    refresh,
  } = usePaginatedFetch('/admin/users', PAGE_SIZE);

  const [stats, setStats] = useState({ total: 0, clients: 0, annonceurs: 0, admins: 0 });
  const [notification, setNotification] = useState(null);

  // Les KPIs viennent du dashboard (la liste ne contient plus que 5 éléments)
  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      if (data?.users) setStats(data.users);
    } catch (err) {
      console.error('Erreur chargement des statistiques utilisateurs :', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/users/${id}`, { isActive: !currentStatus });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u)));
      showNotification(
        currentStatus ? 'Compte désactivé avec succès.' : 'Compte activé avec succès.',
        'success'
      );
    } catch (err) {
      showNotification('Erreur lors de la modification du statut.', 'error');
    }
  };

  const handleRefresh = () => {
    refresh();
    fetchStats();
  };

  return (
    <div style={styles.container}>
      {notification && (
        <div
          style={{
            ...styles.toast,
            backgroundColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
          }}
        >
          {notification.message}
        </div>
      )}

      {/* En-tête de la page */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Gestion des Utilisateurs</h1>
          <p style={styles.subtitle}>Gestion centralisée des utilisateurs et des accès</p>
        </div>
        <button onClick={handleRefresh} style={styles.refreshButton}>
          <RefreshIcon size={16} /> Actualiser
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* Cartes KPI */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#e0f2fe', color: '#0284c7' }}>👥</div>
          <div>
            <p style={styles.kpiLabel}>Total Utilisateurs</p>
            <h2 style={styles.kpiValue}>{stats.total}</h2>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#dcfce7', color: '#16a34a' }}>🔎</div>
          <div>
            <p style={styles.kpiLabel}>Clients</p>
            <h2 style={styles.kpiValue}>{stats.clients}</h2>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#ffedd5', color: '#ea580c' }}>🏠</div>
          <div>
            <p style={styles.kpiLabel}>Annonceurs</p>
            <h2 style={styles.kpiValue}>{stats.annonceurs}</h2>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#f3e8ff', color: '#9333ea' }}>🛡️</div>
          <div>
            <p style={styles.kpiLabel}>Administrateurs</p>
            <h2 style={styles.kpiValue}>{stats.admins}</h2>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Liste des Utilisateurs</h3>

        {loading ? (
          <p style={styles.infoText}>Chargement des données...</p>
        ) : users.length === 0 ? (
          <p style={styles.infoText}>Aucun utilisateur trouvé.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Rôle</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                  >
                    <td style={styles.td}>
                      <div style={styles.userName}>
                        <span style={styles.avatar}>
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                        {user.name || 'Sans nom'}
                      </div>
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor:
                            user.role === 'ADMIN'
                              ? '#f3e8ff'
                              : user.role === 'ANNONCEUR'
                              ? '#ffedd5'
                              : '#e0f2fe',
                          color:
                            user.role === 'ADMIN'
                              ? '#7e22ce'
                              : user.role === 'ANNONCEUR'
                              ? '#c2410c'
                              : '#0369a1',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                          color: user.isActive ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {user.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <IconButton
                        icon={<PowerIcon />}
                        label={user.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                        variant={user.isActive ? 'danger' : 'success'}
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    zIndex: 1000,
    fontWeight: '600',
    fontSize: '14px',
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
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
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
    padding: '20px',
  },
  tableTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '600',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'inline-block',
  },
  infoText: {
    textAlign: 'center',
    padding: '30px',
    color: '#64748b',
  },
};