import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, auth }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await auth?.getUser?.();
        setUser(u ?? null);
      } catch (error) {
        console.error('[AuthContext] Error loading user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  const value = {
    user,
    loading,
    signIn: (...args) => auth?.signIn?.(...args),
    signUp: (...args) => auth?.signUp?.(...args),
    signOut: (...args) => auth?.signOut?.(...args),
    isAdmin: () => user?.role === 'admin',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
