import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'Rechercher...',
  className = '',
}) {
  return (
    <div className={`relative w-full sm:w-64 ${className}`}>
      <FiSearch
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0 p-0"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
}
