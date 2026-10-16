import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

// Construit la liste des pages à afficher, ex. [1, '…', 4, 5, 6, '…', 12]
const getPageItems = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push('…');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push('…');

  items.push(totalPages);
  return items;
};

export default function Pagination({ page, currentPage, totalPages, total, limit, onPageChange }) {
  // Accepte à la fois 'page' et 'currentPage'
  const activePage = Number(page || currentPage) || 1;
  const parsedTotal = Number(total) || 0;
  const parsedLimit = Number(limit) || 5;

  if (parsedTotal === 0) return null;

  const from = (activePage - 1) * parsedLimit + 1;
  const to = Math.min(activePage * parsedLimit, parsedTotal);
  const items = getPageItems(activePage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-slate-100 mt-2">
      <span className="text-xs sm:text-sm text-slate-500">
        Affichage de <strong>{from}</strong> à <strong>{to}</strong> sur <strong>{parsedTotal}</strong>
      </span>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1.5" aria-label="Pagination">
          <button
            type="button"
            onClick={() => onPageChange(activePage - 1)}
            disabled={activePage <= 1}
            aria-label="Page précédente"
            className={`min-w-[34px] h-[34px] px-2 inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-150 ${
              activePage <= 1 ? 'opacity-45 cursor-not-allowed' : 'hover:bg-slate-50'
            }`}
          >
            <ChevronLeftIcon size={16} />
          </button>

          {items.map((item, index) =>
            item === '…' ? (
              <span key={`dots-${index}`} className="px-1 text-slate-400 font-bold">…</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === activePage ? 'page' : undefined}
                className={`min-w-[34px] h-[34px] px-2 inline-flex items-center justify-center border rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-150 ${
                  item === activePage
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-600/35'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(activePage + 1)}
            disabled={activePage >= totalPages}
            aria-label="Page suivante"
            className={`min-w-[34px] h-[34px] px-2 inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-150 ${
              activePage >= totalPages ? 'opacity-45 cursor-not-allowed' : 'hover:bg-slate-50'
            }`}
          >
            <ChevronRightIcon size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
