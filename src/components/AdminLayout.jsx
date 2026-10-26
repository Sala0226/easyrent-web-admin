import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';
import { 
  FiGrid, 
  FiUsers, 
  FiHome, 
  FiClipboard, 
  FiStar, 
  FiLogOut, 
  FiMenu 
} from 'react-icons/fi';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de Bord', icon: <FiGrid size={20} /> },
    { path: '/users', label: 'Utilisateurs', icon: <FiUsers size={20} /> },
    { path: '/properties', label: 'Propriétés', icon: <FiHome size={20} /> },
    { path: '/visits', label: 'Demandes de Visite', icon: <FiClipboard size={20} /> },
    { path: '/favorites', label: 'Favoris', icon: <FiStar size={20} /> },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans relative">
      {/* Overlay sombre pour mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isMobileMenuOpen ? 'block md:hidden' : 'hidden'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar latérale */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-[#0c1425] text-white flex flex-col transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center gap-3">
          <img src={logoImage} alt="Logo" className="w-9 h-9 rounded-lg object-cover" />
          <span className="text-lg font-extrabold tracking-wide text-white">EASYRENT</span>
        </div>

        <nav className="p-4 flex flex-col gap-2 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium cursor-pointer text-left transition-all ${
                  isActive
                    ? 'bg-[#1b253b] text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151f33]'
                }`}
              >
                <span className="flex items-center">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={logout}
            className="w-full px-4 py-3 bg-[#151f33] text-rose-400 border border-rose-500/30 rounded-xl font-medium cursor-pointer hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2.5 shadow-sm"
          >
            <FiLogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 md:ml-[260px] flex flex-col w-full">
        {/* Header supérieur */}
        <header className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Bouton Burger (visible sur mobile) */}
            <button
              className="md:hidden bg-none border-none text-xl cursor-pointer text-slate-900 pr-2 flex items-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <FiMenu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 m-0">
              {menuItems.find(m => m.path === location.pathname)?.label || 'Administration'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9.5 h-9.5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 m-0">Administrateur</p>
              <p className="text-xs text-slate-500 m-0">Super Admin</p>
            </div>
          </div>
        </header>

        {/* Zone dynamique des pages */}
        <main className="p-4 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}