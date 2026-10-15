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
    <div style={styles.wrapper}>
      <span style={styles.info}>
        Affichage de <strong>{from}</strong> à <strong>{to}</strong> sur <strong>{parsedTotal}</strong>
      </span>

      {totalPages > 1 && (
        <nav style={styles.controls} aria-label="Pagination">
          <button
            type="button"
            onClick={() => onPageChange(activePage - 1)}
            disabled={activePage <= 1}
            aria-label="Page précédente"
            style={{ ...styles.pageBtn, ...(activePage <= 1 ? styles.disabled : {}) }}
          >
            <ChevronLeftIcon size={16} />
          </button>

          {items.map((item, index) =>
            item === '…' ? (
              <span key={`dots-${index}`} style={styles.dots}>…</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === activePage ? 'page' : undefined}
                style={{
                  ...styles.pageBtn,
                  ...(item === activePage ? styles.pageBtnActive : {}),
                }}
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
            style={{ ...styles.pageBtn, ...(activePage >= totalPages ? styles.disabled : {}) }}
          >
            <ChevronRightIcon size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '16px 4px 0 4px',
    borderTop: '1px solid #f1f5f9',
    marginTop: '8px',
  },
  info: {
    fontSize: '13px',
    color: '#64748b',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pageBtn: {
    minWidth: '34px',
    height: '34px',
    padding: '0 8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pageBtnActive: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    color: '#ffffff',
    border: '1px solid transparent',
    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
  },
  disabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  dots: {
    padding: '0 4px',
    color: '#94a3b8',
    fontWeight: '700',
  },
};