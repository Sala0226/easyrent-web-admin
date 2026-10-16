import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RefreshIcon } from '../components/icons';

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
        // Utiliser les stats du dashboard endpoint pour les totaux
        // Mais récupérer tous les utilisateurs pour calculer correctement les actifs
        const dashboardData = dashboardResponse.data;

        try {
          // Récupérer tous les utilisateurs sans pagination
          const usersRes = await api.get('/admin/users?limit=1000');
          const users = Array.isArray(usersRes.data)
            ? usersRes.data
            : Array.isArray(usersRes.data?.users)
            ? usersRes.data.users
            : Array.isArray(usersRes.data?.data)
            ? usersRes.data.data
            : [];

          setStats({
            users: {
              total: users.length,
              active: users.filter(u => u.isActive || u.status === 'active').length,
              advertisers: users.filter(u => u.role === 'ANNONCEUR' || u.role === 'ADVERTISER').length,
              admins: users.filter(u => u.role === 'ADMIN').length
            },
            properties: {
              total: dashboardData.properties?.total || 0,
              available: dashboardData.properties?.available || 0,
              rented: dashboardData.properties?.rented || 0,
              pending: dashboardData.properties?.pending || 0
            },
            visits: {
              total: dashboardData.visits?.total || 0,
              pending: dashboardData.visits?.pending || 0,
              accepted: dashboardData.visits?.accepted || 0,
              refused: dashboardData.visits?.refused || 0
            }
          });
        } catch (usersErr) {
          console.log('Could not fetch users details:', usersErr);
          // Fallback: utiliser les stats du dashboard
          setStats({
            users: {
              total: dashboardData.users?.total || 0,
              active: dashboardData.users?.active || 0,
              advertisers: dashboardData.users?.annonceurs || dashboardData.users?.advertisers || 0,
              admins: dashboardData.users?.admins || 0
            },
            properties: {
              total: dashboardData.properties?.total || 0,
              available: dashboardData.properties?.available || 0,
              rented: dashboardData.properties?.rented || 0,
              pending: dashboardData.properties?.pending || 0
            },
            visits: {
              total: dashboardData.visits?.total || 0,
              pending: dashboardData.visits?.pending || 0,
              accepted: dashboardData.visits?.accepted || 0,
              refused: dashboardData.visits?.refused || 0
            }
          });
        }
      } else {
        // Fallback: récupérer les données séparément si le dashboard endpoint ne retourne pas tout
        const [usersRes, propertiesRes, visitsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/properties'),
          api.get('/visits')
        ]);

        // Handle different response structures for users
        const users = Array.isArray(usersRes.data)
          ? usersRes.data
          : Array.isArray(usersRes.data?.users)
          ? usersRes.data.users
          : Array.isArray(usersRes.data?.data)
          ? usersRes.data.data
          : [];
        const properties = propertiesRes.data.properties || propertiesRes.data || [];
        const visits = visitsRes.data.visits || visitsRes.data || [];

        setStats({
          users: {
            total: users.length,
            active: users.filter(u => u.isActive || u.status === 'active').length,
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-5"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-[400px]">
          <span className="text-5xl block mb-4">⚠️</span>
          <p>{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-5 px-5 py-2.5 bg-blue-500 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 m-0">Tableau de Bord</h1>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de la plateforme EasyRent</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDashboardStats}
            className="px-5 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold cursor-pointer shadow-sm hover:bg-slate-50 transition-all"
          >
            <RefreshIcon size={16} /> Actualiser
          </button>
        </div>
      </div>

      {/* Cartes statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Carte Utilisateurs */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-blue-50 text-blue-500">
            👥
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Utilisateurs</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1 mb-0">{stats.users.total}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-0">
              Actifs: {stats.users.active} | Annonceurs: {stats.users.advertisers}
            </p>
          </div>
        </div>

        {/* Carte Propriétés */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-amber-50 text-amber-500">
            🏠
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Propriétés</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1 mb-0">{stats.properties.total}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-0">
              Disponibles: {stats.properties.available} | Louées: {stats.properties.rented}
            </p>
          </div>
        </div>

        {/* Carte Visites */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-emerald-50 text-emerald-500">
            📅
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Visites</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1 mb-0">{stats.visits.total}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-0">
              En attente: {stats.visits.pending} | Acceptées: {stats.visits.accepted} | Refusées: {stats.visits.refused}
            </p>
          </div>
        </div>
      </div>

      {/* Section Actions Rapides */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-5">Actions Rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all shadow-sm hover:shadow-md text-left"
            onClick={() => window.location.href = '/users'}
          >
            <span className="text-3xl">👥</span>
            <div>
              <p className="text-sm font-bold text-slate-900 m-0">Gérer les Utilisateurs</p>
              <p className="text-xs text-slate-500 mt-1 mb-0">Activer/désactiver des comptes</p>
            </div>
          </button>
          <button
            className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all shadow-sm hover:shadow-md text-left"
            onClick={() => window.location.href = '/properties'}
          >
            <span className="text-3xl">🏠</span>
            <div>
              <p className="text-sm font-bold text-slate-900 m-0">Voir les Propriétés</p>
              <p className="text-xs text-slate-500 mt-1 mb-0">Gérer les annonces</p>
            </div>
          </button>
          <button
            className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all shadow-sm hover:shadow-md text-left"
            onClick={() => window.location.href = '/visits'}
          >
            <span className="text-3xl">📅</span>
            <div>
              <p className="text-sm font-bold text-slate-900 m-0">Demandes de Visite</p>
              <p className="text-xs text-slate-500 mt-1 mb-0">Valider/refuser les visites</p>
            </div>
          </button>
        </div>
      </div>

      {/* Statistiques additionnelles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="text-2xl">📊</div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Taux d'activation</p>
            <p className="text-lg font-bold text-slate-900 mt-1 mb-0">
              {stats.users.total > 0
                ? Math.round((stats.users.active / stats.users.total) * 100)
                : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="text-2xl">🎯</div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Taux de disponibilité</p>
            <p className="text-lg font-bold text-slate-900 mt-1 mb-0">
              {stats.properties.total > 0
                ? Math.round((stats.properties.available / stats.properties.total) * 100)
                : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="text-2xl">⚡</div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Visites en attente</p>
            <p className="text-lg font-bold text-slate-900 mt-1 mb-0">{stats.visits.pending}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
