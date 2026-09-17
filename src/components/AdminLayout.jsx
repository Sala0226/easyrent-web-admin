import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/users', label: 'Utilisateurs', icon: '👥' },
    { path: '/properties', label: 'Propriétés', icon: '🏠' },
    { path: '/visits', label: 'Demandes de Visite', icon: '📅' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Ferme le menu sur mobile après un clic
  };

  return (
    <div style={styles.layoutContainer}>
      {/* Injection des media queries CSS pour gérer le responsive proprement */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: ${isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
          .admin-main-content {
            margin-left: 0 !important;
          }
          .burger-btn {
            display: block !important;
          }
          .admin-overlay {
            display: ${isMobileMenuOpen ? 'block' : 'none'} !important;
          }
        }
      `}</style>

      {/* Overlay sombre pour mobile */}
      <div 
        className="admin-overlay"
        style={styles.overlay} 
        onClick={() => setIsMobileMenuOpen(false)} 
      />

      {/* Sidebar latérale */}
      <aside className="admin-sidebar" style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <img src={logoImage} alt="Logo" style={styles.logo} />
          <span style={styles.brandName}>EASYRENT</span>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                style={{
                  ...styles.navItem,
                  backgroundColor: isActive ? 'rgba(234, 88, 12, 0.15)' : 'transparent',
                  color: isActive ? '#f97316' : '#94a3b8',
                  borderLeft: isActive ? '4px solid #f97316' : '4px solid transparent',
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={logout} style={styles.logoutButton}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="admin-main-content" style={styles.mainContent}>
        {/* Header supérieur */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            {/* Bouton Burger (masqué sur web, visible sur mobile) */}
            <button 
              className="burger-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              style={styles.burgerButton}
              aria-label="Menu"
            >
              ☰
            </button>
            <h2 style={styles.headerTitle}>
              {menuItems.find(m => m.path === location.pathname)?.label || 'Administration'}
            </h2>
          </div>

          <div style={styles.adminProfile}>
            <div style={styles.avatarMini}>A</div>
            <div>
              <p style={styles.adminName}>Administrateur</p>
              <p style={styles.adminRole}>Super Admin</p>
            </div>
          </div>
        </header>

        {/* Zone dynamique des pages */}
        <main style={styles.contentBody}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  layoutContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    position: 'relative',
  },
  overlay: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
    zIndex: 100,
    transition: 'transform 0.3s ease-in-out',
    transform: 'translateX(0)', // Visible par défaut sur Web
  },
  sidebarHeader: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #1e293b',
  },
  logo: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    color: '#ffffff',
  },
  nav: {
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  navIcon: {
    fontSize: '18px',
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #1e293b',
  },
  logoutButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  mainContent: {
    flex: 1,
    marginLeft: '260px', // Décale le contenu sur Web pour laisser la place à la sidebar
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    height: '70px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    position: 'sticky',
    top: 0,
    zIndex: 9,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  burgerButton: {
    display: 'none', // Masqué par défaut sur Web, affiché via la media query sur mobile
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#0f172a',
    padding: '0 8px 0 0',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
  },
  adminProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarMini: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  adminName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  adminRole: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
  },
  contentBody: {
    padding: '30px',
    flex: 1,
  },
};