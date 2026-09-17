import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const navigate = useNavigate(); 

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const accessToken = response.data.access_token || response.data.token;
      
      if (!accessToken) {
        return { success: false, message: "Le token est introuvable dans la réponse du serveur." };
      }
      
      localStorage.setItem('admin_token', accessToken);
      setToken(accessToken);
      
      navigate('/users', { replace: true }); 
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    navigate('/login', { replace: true }); 
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);