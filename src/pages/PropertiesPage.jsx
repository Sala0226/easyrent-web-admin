import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PropertiesPage() {
  const { token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fonction de récupération des propriétés depuis l'API
  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
     const response = await fetch('http://localhost:3000/properties', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
      const data = await response.json();
      if (response.ok) {
        setProperties(data.properties || data); // Ajustement selon le format de ton API
      } else {
        setError(data.message || 'Erreur lors du chargement des propriétés.');
      }
    } catch (err) {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [token]);

  // Calcul dynamique des KPIs
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'available' || p.status === 'disponible').length;
  const rentedProperties = properties.filter(p => p.status === 'rented' || p.status === 'loué').length;
  const pendingProperties = properties.filter(p => p.status === 'pending' || p.status === 'en attente').length;

  return (
    <div style={styles.container}>
      {/* En-tête de la page */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Gestion des Propriétés</h1>
          <p style={styles.subtitle}>Suivi global et modération des annonces immobilières</p>
        </div>
        <button onClick={fetchProperties} style={styles.refreshButton}>
          🔄 Actualiser
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* Grille des KPIs */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>🏠</div>
          <div>
            <p style={styles.kpiLabel}>Total Propriétés</p>
            <h3 style={styles.kpiValue}>{totalProperties}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>✅</div>
          <div>
            <p style={styles.kpiLabel}>Disponibles</p>
            <h3 style={styles.kpiValue}>{availableProperties}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>🔑</div>
          <div>
            <p style={styles.kpiLabel}>Loués / Occupés</p>
            <h3 style={styles.kpiValue}>{rentedProperties}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>⏳</div>
          <div>
            <p style={styles.kpiLabel}>En Attente</p>
            <h3 style={styles.kpiValue}>{pendingProperties}</h3>
          </div>
        </div>
      </div>

      {/* Tableau des Propriétés */}
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
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop._id || prop.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#0f172a' }}>{prop.title}</strong>
                      <div style={styles.tdSub}>{prop.city || prop.address}</div>
                    </td>
                    <td style={styles.td}>{prop.type || 'Appartement'}</td>
                    <td style={styles.td}>
                      <strong>{prop.price ? `${prop.price} FCFA` : 'N/C'}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: (prop.status === 'available' || prop.status === 'disponible') ? '#d1fae5' : '#fee2e2',
                        color: (prop.status === 'available' || prop.status === 'disponible') ? '#065f46' : '#991b1b',
                      }}>
                        {prop.status || 'Actif'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn}>Détails</button>
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
  actionBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
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