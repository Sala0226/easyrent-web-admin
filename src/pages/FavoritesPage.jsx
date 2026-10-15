import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import usePaginatedFetch from '../hooks/usePaginatedFetch';
import Pagination from '../components/Pagination';
import { RefreshIcon } from '../components/icons';

export default function FavoritesPage() {
  const { token } = useAuth();

  const {
    items: rawFavorites,
    total,
    page,
    setPage,
    totalPages,
    loading,
    error: fetchError,
    refresh,
  } = usePaginatedFetch('/admin/favorites', 10);

  const favorites = Array.isArray(rawFavorites) ? rawFavorites : [];

  const [stats, setStats] = useState({
    totalFavorites: 0,
    totalProperties: 0,
    totalUsers: 0,
  });

  const fetchStats = async () => {
    try {
      // Calculer les stats à partir des favoris récupérés
      const totalFavorites = favorites.length;
      const propertiesWithFavorites = new Set(favorites.map(f => f.propertyId)).size;
      const totalUsers = new Set(favorites.map(f => f.userId)).size;

      setStats({
        totalFavorites,
        totalProperties: propertiesWithFavorites,
        totalUsers,
      });
    } catch (err) {
      console.error('Erreur chargement stats favoris', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token, favorites]);

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Gestion des Favoris</h1>
          <p style={styles.subtitle}>Suivi des propriétés mises en favoris par les utilisateurs</p>
        </div>
        <button onClick={() => { refresh(); fetchStats(); }} style={styles.refreshButton}>
          <RefreshIcon size={16} /> Actualiser
        </button>
      </div>

      {fetchError && <div style={styles.errorAlert}>{fetchError}</div>}

      {/* KPIs */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>⭐</div>
          <div>
            <p style={styles.kpiLabel}>Total Favoris</p>
            <h3 style={styles.kpiValue}>{stats.totalFavorites}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>🏠</div>
          <div>
            <p style={styles.kpiLabel}>Propriétés Favorisées</p>
            <h3 style={styles.kpiValue}>{stats.totalProperties}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>👥</div>
          <div>
            <p style={styles.kpiLabel}>Utilisateurs Actifs</p>
            <h3 style={styles.kpiValue}>{stats.totalUsers}</h3>
          </div>
        </div>
      </div>

      {/* Tableau des favoris */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Liste des Favoris</h3>
        
        {loading ? (
          <p style={styles.loadingText}>Chargement des données...</p>
        ) : favorites.length === 0 ? (
          <p style={styles.emptyText}>Aucun favori enregistré.</p>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>Propriété</th>
                  <th style={styles.th}>Utilisateur</th>
                  <th style={styles.th}>Date d'ajout</th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((favorite) => (
                  <tr key={favorite.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#0f172a' }}>
                        {favorite.property?.title || 'Bien immobilier'}
                      </strong>
                      <div style={styles.tdSub}>
                        {favorite.property?.city || favorite.property?.address || ''}
                      </div>
                      <div style={styles.tdSub}>
                        {favorite.property?.price 
                          ? `${favorite.property.price.toLocaleString()} FCFA` 
                          : 'N/C'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <strong>{favorite.user?.name || 'Utilisateur'}</strong>
                      <div style={styles.tdSub}>{favorite.user?.email || ''}</div>
                    </td>
                    <td style={styles.td}>
                      {favorite.createdAt 
                        ? new Date(favorite.createdAt).toLocaleDateString('fr-FR') 
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            total={total}
            limit={10}
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
