import React, { useState } from 'react';

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

  const variantClasses = {
    primary: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white',
    success: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white',
    warning: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white',
    neutral: 'bg-slate-500/10 text-slate-500 hover:bg-slate-500 hover:text-white',
  };

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
      className={`w-8.5 h-8.5 inline-flex items-center justify-center border-none rounded-lg cursor-pointer transition-all duration-150 p-0 ${
        active ? '-translate-y-1' : ''
      } ${variantClasses[variant] || variantClasses.primary} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {icon}
    </button>
  );
}
