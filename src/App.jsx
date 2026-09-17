import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import UsersPage from './pages/UsersPage';
import AdminLayout from './components/AdminLayout';
import PropertiesPage from './pages/PropertiesPage';
import VisitsPage from './pages/VisitsPage'; 
import logoImage from './assets/logo.png';

// --- Composant pour protéger les routes privées ---
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

// --- Page de Connexion ---
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        <div style={loginStyles.header}>
          <img src={logoImage} alt="EasyRent Logo" style={loginStyles.logo} />
          <h1 style={loginStyles.title}>EASYRENT</h1>
          <p style={loginStyles.subtitle}>Administration de la plateforme</p>
        </div>

        {error && <div style={loginStyles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={loginStyles.form}>
          <div style={loginStyles.inputGroup}>
            <label style={loginStyles.label}>Adresse Email</label>
            <input 
              type="email" 
              placeholder="admin@easyrent.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={loginStyles.input}
            />
          </div>

          <div style={loginStyles.inputGroup}>
            <label style={loginStyles.label}>Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={loginStyles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...loginStyles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Composant Principal App ---
export default function App() {
  useEffect(() => {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = logoImage;
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Routes protégées intégrées dans le Layout Admin (Sidebar + Header) */}
          <Route element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/visits" element={<VisitsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// --- Styles CSS en objets ---
const loginStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at center, #1e40af 0%, #0f172a 100%)',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    padding: '40px 35px',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  logo: {
    width: '80px',
    height: '80px',
    borderRadius: '18px',
    objectFit: 'cover',
    marginBottom: '15px',
    boxShadow: '0 8px 20px rgba(29, 78, 216, 0.3)',
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '0.5px',
  },
  subtitle: {
    margin: '6px 0 0 0',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
    border: '1px solid #fee2e2',
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
    color: '#0f172a',
  },
  button: {
    width: '100%',
    padding: '13px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)',
    transition: 'transform 0.1s ease, filter 0.2s',
    marginTop: '10px',
    letterSpacing: '0.3px',
  },
};

const pageStyles = {
  container: {
    fontSize: '18px', 
    fontWeight: '600', 
    color: '#475569',
    padding: '20px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  }
};