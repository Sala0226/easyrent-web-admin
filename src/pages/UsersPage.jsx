import React, { useEffect, useState } from 'react';
import api from '../services/api';
import usePaginatedFetch from '../hooks/usePaginatedFetch';
import useDebounce from '../hooks/useDebounce';
import IconButton from '../components/IconButton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { 
  FiRefreshCw, 
  FiUsers, 
  FiUser, 
  FiHome, 
  FiShield, 
  FiPower 
} from 'react-icons/fi';

const PAGE_SIZE = 5;

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
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
  } = usePaginatedFetch('/admin/users', PAGE_SIZE, { search: debouncedSearch });

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
    <div className="max-w-7xl mx-auto">
      {notification && (
        <div
          className={`fixed top-5 right-5 text-white px-5 py-3 rounded-lg shadow-lg z-50 font-semibold text-sm ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">Gestion des Utilisateurs</h1>
          <p className="text-sm text-slate-500 mt-1">Gestion centralisée des utilisateurs et des accès</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold cursor-pointer shadow-sm hover:bg-slate-50 transition-colors"
        >
          <FiRefreshCw size={16} /> Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-5 border border-red-200">
          {error}
        </div>
      )}

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-sky-50 text-sky-600">
            <FiUsers size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Total Utilisateurs</p>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.total}</h2>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-green-50 text-green-600">
            <FiUser size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Clients</p>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.clients}</h2>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-orange-50 text-orange-600">
            <FiHome size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Annonceurs</p>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.annonceurs}</h2>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-purple-50 text-purple-600">
            <FiShield size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 m-0">Administrateurs</p>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{stats.admins}</h2>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-lg font-bold text-slate-900">Liste des Utilisateurs</h3>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher un utilisateur..."
          />
        </div>

        {loading ? (
          <p className="text-center py-8 text-slate-500">Chargement des données...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-8 text-slate-500">Aucun utilisateur trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Nom</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Rôle</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 font-semibold">
                        <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                        {user.name || 'Sans nom'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100">{user.email}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700'
                            : user.role === 'ANNONCEUR'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-sky-50 text-sky-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                          user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {user.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100">
                      <IconButton
                        icon={<FiPower size={16} />}
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