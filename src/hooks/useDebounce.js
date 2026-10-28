import { useEffect, useState } from 'react';

/**
 * Retourne la valeur après un délai (utile pour ne pas appeler l'API à chaque frappe).
 *
 * Exemple :
 *   const debouncedSearch = useDebounce(search, 350);
 */
export default function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
