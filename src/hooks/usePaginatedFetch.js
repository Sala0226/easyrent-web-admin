import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Récupère une liste paginée depuis le back (format { data, total, page, limit, totalPages }).
 *
 * Les filtres optionnels sont envoyés en query params (ex. { search: 'ali' }).
 * Quand les filtres changent, la pagination revient automatiquement à la page 1.
 *
 * Exemple :
 *   const { items, page, setPage, total, totalPages, loading, error, refresh, setItems }
 *     = usePaginatedFetch('/admin/users', 5, { search });
 */
export default function usePaginatedFetch(endpoint, limit = 5, filters = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // La clé sérialisée évite de relancer la requête à chaque nouveau render
  // alors que les filtres n'ont pas réellement changé.
  const filtersKey = JSON.stringify(filters ?? {});
  const appliedFiltersKey = useRef(filtersKey);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Les filtres ont changé : on repart de la première page.
      if (appliedFiltersKey.current !== filtersKey) {
        appliedFiltersKey.current = filtersKey;
        if (page !== 1) {
          setPage(1);
          return;
        }
      }

      setLoading(true);
      setError('');
      try {
        const activeFilters = filtersKey ? JSON.parse(filtersKey) : {};
        const { data } = await api.get(endpoint, {
          params: { page, limit, ...activeFilters },
        });
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
  }, [endpoint, page, limit, reloadKey, filtersKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return { items, setItems, page, setPage, total, totalPages, limit, loading, error, refresh };
}
