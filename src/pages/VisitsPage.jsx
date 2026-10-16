import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import usePaginatedFetch from '../hooks/usePaginatedFetch';
import Pagination from '../components/Pagination';
import { RefreshIcon } from '../components/icons';

export default function VisitsPage() {
  const { token } = useAuth();

  const LIMIT = 5;

  const {
    items: rawVisits,
    total,
    page,
    setPage,
    totalPages,
    loading,
    error: fetchError,
    refresh,
  } = usePaginatedFetch('/admin/visits', LIMIT);

  const visits = Array.isArray(rawVisits) ? rawVisits : [];

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    refused: 0
  });

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data && res.data.visits) {
        setStats({
          total: res.data.visits.total || 0,
          pending: res.data.visits.pending || 0,
          accepted: res.data.visits.accepted || 0,
          refused: res.data.visits.refused || 0
        });
      }
    } catch (err) {
      console.error('Erreur chargement dashboard visits', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [token]);

  // Fonction pour formater et traduire le statut en français
  const formatStatus = (status) => {
    if (!status) return 'En attente';
    const upper = status.toUpperCase();
    if (upper === 'ACCEPTED' || upper === 'ACCEPTEE') return 'Acceptée';
    if (upper === 'REFUSED' || upper === 'REFUSEE') return 'Refusée';
    if (upper === 'PENDING' || upper === 'EN_ATTENTE') return 'En attente';
    return status;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">Demandes de Visite</h1>
          <p className="text-sm text-slate-500 mt-1">Suivi global des programmations de visite sur la plateforme</p>
        </div>
        <button
          onClick={() => { refresh(); fetchDashboardStats(); }}
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

      {/* Grille des KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-blue-50 text-blue-500 font-bold">
            📅
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Total Demandes</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-amber-50 text-amber-500 font-bold">
            ⏳
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">En Attente</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.pending}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-emerald-50 text-emerald-500 font-bold">
            ✅
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Acceptées</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.accepted}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-red-50 text-red-500 font-bold">
            🚫
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Refusées</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.refused}</h3>
          </div>
        </div>
      </div>

      {/* Tableau des Visites */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-5">Liste des Demandes de Visite</h3>

        {loading ? (
          <p className="text-center py-8 text-slate-500">Chargement des données...</p>
        ) : visits.length === 0 ? (
          <p className="text-center py-8 text-slate-500">Aucune demande de visite enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Propriété</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Demandeur</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Date souhaitée</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Annonceur</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => {
                  const status = (visit.status || '').toUpperCase();
                  const isAccepted = status === 'ACCEPTEE' || status === 'ACCEPTED';
                  const isRefused = status === 'REFUSEE' || status === 'REFUSED';
                  const frenchStatus = formatStatus(visit.status);

                  return (
                    <tr key={visit.id || visit._id} className="border-b border-slate-100">
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        <strong className="text-slate-900">{visit.property?.title || 'Bien immobilier'}</strong>
                        <div className="text-xs text-slate-500 mt-0.5">{visit.property?.city || visit.property?.address || ''}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        <strong>{visit.user?.name || visit.visitorName || 'Utilisateur'}</strong>
                        <div className="text-xs text-slate-500 mt-0.5">{visit.user?.email || visit.visitorEmail || ''}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        {visit.date ? new Date(visit.date).toLocaleDateString() : 'Non spécifiée'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-700'
                              : isRefused
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {frenchStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        <strong className="text-slate-700">
                          {visit.owner?.name || 'Non assigné'}
                        </strong>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {visit.owner?.email || ''}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && visits.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
