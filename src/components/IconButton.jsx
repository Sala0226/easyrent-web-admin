import React, { useState } from 'react';

// Couleurs par variante : [fond repos, couleur icône, fond au survol]
const VARIANTS = {
  primary: ['rgba(59, 130, 246, 0.1)', '#3b82f6', '#3b82f6'],
  success: ['rgba(16, 185, 129, 0.1)', '#10b981', '#10b981'],
  danger: ['rgba(239, 68, 68, 0.1)', '#ef4444', '#ef4444'],
  warning: ['rgba(245, 158, 11, 0.12)', '#d97706', '#f59e0b'],
  neutral: ['rgba(100, 116, 139, 0.1)', '#64748b', '#64748b'],
};

/**
 * Bouton carré avec une icône.
 *
 * Props :
 *  - icon     : élément React (ex. <EyeIcon />)
 *  - label    : texte de l'infobulle ET du aria-label (obligatoire pour l'accessibilité)
 *  - onClick  : fonction
 *  - variant  : 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
 *  - disabled : booléen
 */
export default function IconButton({
  icon,
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}) {
  const [hovered, setHovered] = useState(false);
  const [bg, color, hoverBg] = VARIANTS[variant] || VARIANTS.primary;
  const active = hovered && !disabled;

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '34px',
        height: '34px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: active ? hoverBg : bg,
        color: active ? '#ffffff' : color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s ease, color 0.15s ease, transform 0.1s ease',
        transform: active ? 'translateY(-1px)' : 'none',
        padding: 0,
      }}
    >
      {icon}
    </button>
  );
}