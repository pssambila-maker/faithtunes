import { createContext, useContext, useEffect, useState } from 'react';
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
  logout as firebaseLogout,
  subscribeToAuthChanges
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await loginWithEmail(email, password);
    return result.user;
  };

  const signup = async (email, password) => {
    const result = await signupWithEmail(email, password);
    return result.user;
  };

  const googleSignIn = async () => {
    const result = await loginWithGoogle();
    return result.user;
  };

  const logout = async () => {
    await firebaseLogout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    googleSignIn,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
