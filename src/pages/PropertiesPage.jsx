import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import usePaginatedFetch from '../hooks/usePaginatedFetch';
import useDebounce from '../hooks/useDebounce';
import Pagination from '../components/Pagination';
import IconButton from '../components/IconButton';
import SearchInput from '../components/SearchInput';
import { 
  FiRefreshCw, 
  FiHome, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle, 
  FiEye, 
  FiPower 
} from 'react-icons/fi';

export default function PropertiesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const {
    items: rawProperties,
    total,
    page,
    setPage,
    totalPages,
    loading,
    error: fetchError,
    refresh,
  } = usePaginatedFetch('/admin/properties', 5, { search: debouncedSearch });

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
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">Gestion des Propriétés</h1>
          <p className="text-sm text-slate-500 mt-1">Suivi global et modération des annonces immobilières</p>
        </div>
        <button
          onClick={() => { refresh(); fetchDashboard(); }}
          className="px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold cursor-pointer shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <FiRefreshCw size={16} /> Actualiser
        </button>
      </div>

      {displayError && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-5 border border-red-200">
          {displayError}
        </div>
      )}

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-blue-50 text-blue-500 font-bold">
            <FiHome size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Total Propriétés</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{dashboardStats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-emerald-50 text-emerald-500 font-bold">
            <FiCheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Validées</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{dashboardStats.validated}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-amber-50 text-amber-500 font-bold">
            <FiClock size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">En Attente</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{dashboardStats.pending}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-red-50 text-red-500 font-bold">
            <FiXCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Refusées / Suspendues</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">
              {(dashboardStats.refused || 0) + (dashboardStats.suspended || 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Tableau des Annonces */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-lg font-bold text-slate-900">Liste des Annonces</h3>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher un titre, une ville..."
          />
        </div>

        {loading ? (
          <p className="text-center py-8 text-slate-500">Chargement des données...</p>
        ) : properties.length === 0 ? (
          <p className="text-center py-8 text-slate-500">Aucune propriété trouvée sur la plateforme.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Titre / Bien</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Prix</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Favoris</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => {
                  const favCount = prop._count?.favorites || 0;
                  const isPending = prop.status === 'EN_ATTENTE';
                  const isValidated = prop.status === 'VALIDEE';

                  return (
                    <tr key={prop.id} className="border-b border-slate-100">
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        <strong className="text-slate-900">{prop.title}</strong>
                        <div className="text-xs text-slate-500 mt-0.5">{prop.city || prop.address}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{prop.type}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        <strong>{prop.price ? `${prop.price.toLocaleString()} FCFA` : 'N/C'}</strong>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-xs">
                          ⭐ {favCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                            isValidated
                              ? 'bg-emerald-50 text-emerald-700'
                              : isPending
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        <div className="flex gap-2">
                          {/* Voir les détails */}
                          <IconButton
                            icon={<FiEye size={16} />}
                            tooltip="Voir les détails"
                            onClick={() => navigate(`/properties/${prop.id}`)}
                          />

                          {/* Suspendre ou Activer la propriété */}
                          <IconButton
                            icon={
                              <FiPower
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