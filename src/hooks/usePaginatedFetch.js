import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Récupère une liste paginée depuis le back (format { data, total, page, limit, totalPages }).
 *
 * Exemple :
 *   const { items, page, setPage, total, totalPages, loading, error, refresh, setItems }
 *     = usePaginatedFetch('/admin/users', 5);
 */
export default function usePaginatedFetch(endpoint, limit = 5) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(endpoint, { params: { page, limit } });
        if (cancelled) return;

        const pages = data.totalPages || 1;
        setItems(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(pages);

        // Si la page courante n'existe plus (ex. dernier élément supprimé), on recule
        if (page > pages) setPage(pages);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Erreur lors du chargement des données.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [endpoint, page, limit, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return { items, setItems, page, setPage, total, totalPages, limit, loading, error, refresh };
}