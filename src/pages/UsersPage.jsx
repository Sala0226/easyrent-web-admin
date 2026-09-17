import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // ➡️ Import du contexte d'authentification

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const { logout } = useAuth(); // ➡️ Récupération de la fonction logout

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('Impossible de charger les utilisateurs (Accès refusé ou erreur serveur).');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/users/${id}`, { isActive: !currentStatus });
      setUsers(users.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
      showNotification(`Statut de l'utilisateur mis à jour avec succès !`, 'success');
    } catch (err) {
      showNotification(`Erreur lors de la modification du statut.`, 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;
  const advertiserUsers = users.filter(u => u.role === 'ANNONCEUR' || u.role === 'ADVERTISER').length;

  if (loading) return <div style={styles.centerMessage}>Chargement du tableau de bord...</div>;
  if (error) return <div style={{ ...styles.centerMessage, color: '#e53e3e' }}>{error}</div>;

  return (
    <div style={styles.dashboardContainer}>
      {notification && (
        <div style={{
          ...styles.toast,
          backgroundColor: notification.type === 'success' ? '#22c55e' : '#ef4444'
        }}>
          {notification.message}
        </div>
      )}

      {/* Header avec les actions */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tableau de Bord EasyRent</h1>
          <p style={styles.subtitle}>Gestion centralisée des utilisateurs et des accès</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={fetchUsers} style={styles.refreshButton}>Actualiser</button>
          <button onClick={logout} style={styles.logoutButton}>Se déconnecter</button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#e0f2fe', color: '#0284c7' }}>👥</div>
          <div>
            <p style={styles.kpiLabel}>Total Utilisateurs</p>
            <h2 style={styles.kpiValue}>{totalUsers}</h2>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#dcfce7', color: '#16a34a' }}>✅</div>
          <div>
            <p style={styles.kpiLabel}>Comptes Actifs</p>
            <h2 style={styles.kpiValue}>{activeUsers}</h2>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#ffedd5', color: '#ea580c' }}>🏠</div>
          <div>
            <p style={styles.kpiLabel}>Annonceurs</p>
            <h2 style={styles.kpiValue}>{advertiserUsers}</h2>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#f3e8ff', color: '#9333ea' }}>🛡️</div>
          <div>
            <p style={styles.kpiLabel}>Administrateurs</p>
            <h2 style={styles.kpiValue}>{adminUsers}</h2>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Liste des Utilisateurs</h3>
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
                <tr key={user.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={styles.td}>
                    <div style={styles.userName}>
                      <span style={styles.avatar}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                      {user.name || 'Sans nom'}
                    </div>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.roleBadge,
                      backgroundColor: user.role === 'ADMIN' ? '#f3e8ff' : user.role === 'ANNONCEUR' ? '#ffedd5' : '#e0f2fe',
                      color: user.role === 'ADMIN' ? '#7e22ce' : user.role === 'ANNONCEUR' ? '#c2410c' : '#0369a1'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                      color: user.isActive ? '#15803d' : '#b91c1c'
                    }}>
                      {user.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: user.isActive ? '#ef4444' : '#22c55e'
                      }}
                    >
                      {user.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    padding: '30px',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  centerMessage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    fontWeight: '600',
    color: '#475569',
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  refreshButton: {
    padding: '10px 18px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)',
  },
  logoutButton: {
    padding: '10px 18px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
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
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #e2e8f0',
  },
  kpiIcon: {
    width: '50px',
    height: '50px',
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
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  tableTitle: {
    margin: 0,
    padding: '20px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    borderBottom: '1px solid #e2e8f0',
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
    padding: '14px 20px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '14px 20px',
    fontSize: '14px',
    color: '#334155',
    borderBottom: '1px solid #e2e8f0',
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
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  actionButton: {
    padding: '6px 14px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
};