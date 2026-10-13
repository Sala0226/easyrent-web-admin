import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, advertisers: 0, admins: 0 },
    properties: { total: 0, available: 0, rented: 0, pending: 0 },
    visits: { total: 0, pending: 0, accepted: 0, refused: 0 }
  });

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données depuis le backend endpoint dashboard
      const dashboardResponse = await api.get('/admin/dashboard');
      
      if (dashboardResponse.data) {
        setStats(dashboardResponse.data);
      } else {
        // Fallback: récupérer les données séparément si le dashboard endpoint ne retourne pas tout
        const [usersRes, propertiesRes, visitsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/properties'),
          api.get('/visits')
        ]);

        const users = usersRes.data || [];
        const properties = propertiesRes.data.properties || propertiesRes.data || [];
        const visits = visitsRes.data.visits || visitsRes.data || [];

        setStats({
          users: {
            total: users.length,
            active: users.filter(u => u.isActive).length,
            advertisers: users.filter(u => u.role === 'ANNONCEUR' || u.role === 'ADVERTISER').length,
            admins: users.filter(u => u.role === 'ADMIN').length
          },
          properties: {
            total: properties.length,
            available: properties.filter(p => p.status === 'available' || p.status === 'disponible').length,
            rented: properties.filter(p => p.status === 'rented' || p.status === 'loué').length,
            pending: properties.filter(p => p.status === 'pending' || p.status === 'en attente').length
          },
          visits: {
            total: visits.length,
            pending: visits.filter(v => v.status === 'pending' || v.status === 'en attente').length,
            accepted: visits.filter(v => v.status === 'accepted' || v.status === 'accepté').length,
            refused: visits.filter(v => v.status === 'refused' || v.status === 'refusé').length
          }
        });
      }
    } catch (err) {
      setError('Impossible de charger les statistiques du tableau de bord.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div style={styles.centerMessage}>
        <div style={styles.loadingSpinner}></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerMessage}>
        <div style={styles.errorCard}>
          <span style={styles.errorIcon}>⚠️</span>
          <p>{error}</p>
          <button onClick={fetchDashboardStats} style={styles.retryButton}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tableau de Bord</h1>
          <p style={styles.subtitle}>Vue d'ensemble de la plateforme EasyRent</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={fetchDashboardStats} style={styles.refreshButton}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Cartes statistiques principales */}
      <div style={styles.mainStatsGrid}>
        {/* Carte Utilisateurs */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
              👥
            </div>
            <div style={styles.cardHeaderContent}>
              <p style={styles.cardLabel}>Utilisateurs</p>
              <h2 style={styles.cardValue}>{stats.users.total}</h2>
            </div>
          </div>
          <div style={styles.cardDivider}></div>
          <div style={styles.cardDetails}>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>✅</span>
              <span style={styles.detailText}>Actifs: <strong>{stats.users.active}</strong></span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>🏠</span>
              <span style={styles.detailText}>Annonceurs: <strong>{stats.users.advertisers}</strong></span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>🛡️</span>
              <span style={styles.detailText}>Admins: <strong>{stats.users.admins}</strong></span>
            </div>
          </div>
        </div>

        {/* Carte Propriétés */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              🏠
            </div>
            <div style={styles.cardHeaderContent}>
              <p style={styles.cardLabel}>Propriétés</p>
              <h2 style={styles.cardValue}>{stats.properties.total}</h2>
            </div>
          </div>
          <div style={styles.cardDivider}></div>
          <div style={styles.cardDetails}>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>✅</span>
              <span style={styles.detailText}>Disponibles: <strong>{stats.properties.available}</strong></span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>🔑</span>
              <span style={styles.detailText}>Louées: <strong>{stats.properties.rented}</strong></span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>⏳</span>
              <span style={styles.detailText}>En attente: <strong>{stats.properties.pending}</strong></span>
            </div>
          </div>
        </div>

        {/* Carte Visites */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              📅
            </div>
            <div style={styles.cardHeaderContent}>
              <p style={styles.cardLabel}>Visites</p>
              <h2 style={styles.cardValue}>{stats.visits.total}</h2>
            </div>
          </div>
          <div style={styles.cardDivider}></div>
          <div style={styles.cardDetails}>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>⏳</span>
              <span style={styles.detailText}>En attente: <strong>{stats.visits.pending}</strong></span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>✅</span>
              <span style={styles.detailText}>Acceptées: <strong>{stats.visits.accepted}</strong></span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>❌</span>
              <span style={styles.detailText}>Refusées: <strong>{stats.visits.refused}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Actions Rapides */}
      <div style={styles.quickActionsSection}>
        <h3 style={styles.sectionTitle}>Actions Rapides</h3>
        <div style={styles.actionsGrid}>
          <button style={styles.actionCard} onClick={() => window.location.href = '/users'}>
            <span style={styles.actionIcon}>👥</span>
            <div>
              <p style={styles.actionTitle}>Gérer les Utilisateurs</p>
              <p style={styles.actionSubtitle}>Activer/désactiver des comptes</p>
            </div>
          </button>
          <button style={styles.actionCard} onClick={() => window.location.href = '/properties'}>
            <span style={styles.actionIcon}>🏠</span>
            <div>
              <p style={styles.actionTitle}>Voir les Propriétés</p>
              <p style={styles.actionSubtitle}>Gérer les annonces</p>
            </div>
          </button>
          <button style={styles.actionCard} onClick={() => window.location.href = '/visits'}>
            <span style={styles.actionIcon}>📅</span>
            <div>
              <p style={styles.actionTitle}>Demandes de Visite</p>
              <p style={styles.actionSubtitle}>Valider/refuser les visites</p>
            </div>
          </button>
        </div>
      </div>

      {/* Statistiques additionnelles */}
      <div style={styles.additionalStats}>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>📊</div>
          <div>
            <p style={styles.infoLabel}>Taux d'activation</p>
            <p style={styles.infoValue}>
              {stats.users.total > 0 
                ? Math.round((stats.users.active / stats.users.total) * 100) 
                : 0}%
            </p>
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🎯</div>
          <div>
            <p style={styles.infoLabel}>Taux de disponibilité</p>
            <p style={styles.infoValue}>
              {stats.properties.total > 0 
                ? Math.round((stats.properties.available / stats.properties.total) * 100) 
                : 0}%
            </p>
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>⚡</div>
          <div>
            <p style={styles.infoLabel}>Visites en attente</p>
            <p style={styles.infoValue}>{stats.visits.pending}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '0',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  centerMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#64748b',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    maxWidth: '400px',
  },
  errorIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '15px',
  },
  retryButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  refreshButton: {
    padding: '12px 20px',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
  },
  mainStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
  },
  cardIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardLabel: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardValue: {
    margin: '4px 0 0 0',
    fontSize: '32px',
    fontWeight: '800',
    color: '#0f172a',
  },
  cardDivider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '0 24px',
  },
  cardDetails: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  detailIcon: {
    fontSize: '16px',
  },
  detailText: {
    fontSize: '14px',
    color: '#475569',
  },
  quickActionsSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'left',
  },
  actionIcon: {
    fontSize: '32px',
  },
  actionTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  actionSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  additionalStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  infoIcon: {
    fontSize: '28px',
  },
  infoLabel: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    margin: '4px 0 0 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
  },
};
