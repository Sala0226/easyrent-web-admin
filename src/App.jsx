import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import AdminLayout from './components/AdminLayout';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import VisitsPage from './pages/VisitsPage';
import FavoritesPage from './pages/FavoritesPage';
import logoImage from './assets/logo.png';

// --- Composant pour protéger les routes privées ---
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

// --- Icône œil (affiché / masqué) ---
const EyeIcon = ({ open }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
    {!open && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
);

// --- Page de Connexion ---
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-slate-900 font-sans p-5">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-[420px] border border-white/10">
        <div className="text-center mb-6">
          <img
            src={logoImage}
            alt="EasyRent Logo"
            className="w-20 h-20 rounded-2xl object-cover mb-4 mx-auto shadow-lg shadow-blue-600/30"
          />
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-wide">EASYRENT</h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">Administration de la plateforme</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-xs mb-5 border border-red-200 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-4.5">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adresse Email</label>
            <input
              type="email"
              placeholder="admin@easyrent.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-3 text-sm border border-slate-300 rounded-lg outline-none transition-all bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="mb-4.5">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mot de passe</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-3 pr-11 text-sm border border-slate-300 rounded-lg outline-none transition-all bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bg-none border-none cursor-pointer p-0 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 border-none rounded-lg shadow-lg shadow-orange-600/40 transition-all mt-2.5 tracking-wide ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-orange-600/50 active:scale-[0.98]'
            }`}
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/visits" element={<VisitsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
