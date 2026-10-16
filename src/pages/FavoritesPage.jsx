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
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">Gestion des Favoris</h1>
          <p className="text-sm text-slate-500 mt-1">Suivi des propriétés mises en favoris par les utilisateurs</p>
        </div>
        <button
          onClick={() => { refresh(); fetchStats(); }}
          className="px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold cursor-pointer shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <RefreshIcon size={16} /> Actualiser
        </button>
      </div>

      {fetchError && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-5 border border-red-200">
          {fetchError}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-amber-50 text-amber-500 font-bold">
            ⭐
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Total Favoris</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.totalFavorites}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-blue-50 text-blue-500 font-bold">
            🏠
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Propriétés Favorisées</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.totalProperties}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-emerald-50 text-emerald-500 font-bold">
            👥
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Utilisateurs Actifs</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.totalUsers}</h3>
          </div>
        </div>
      </div>

      {/* Tableau des favoris */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-5">Liste des Favoris</h3>

        {loading ? (
          <p className="text-center py-8 text-slate-500">Chargement des données...</p>
        ) : favorites.length === 0 ? (
          <p className="text-center py-8 text-slate-500">Aucun favori enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Propriété</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Date d'ajout</th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((favorite) => (
                  <tr key={favorite.id} className="border-b border-slate-100">
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      <strong className="text-slate-900">
                        {favorite.property?.title || 'Bien immobilier'}
                      </strong>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {favorite.property?.city || favorite.property?.address || ''}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {favorite.property?.price
                          ? `${favorite.property.price.toLocaleString()} FCFA`
                          : 'N/C'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      <strong>{favorite.user?.name || 'Utilisateur'}</strong>
                      <div className="text-xs text-slate-500 mt-0.5">{favorite.user?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
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
