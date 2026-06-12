import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AuthAPI from '../services/authAPI';
import CatalogAPI from '../services/catalogAPI';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    let mounted = true;

    AuthAPI.me()
      .then((currentUser) => {
        if (mounted && currentUser) {
          setUser(currentUser);
          return CatalogAPI.notifications();
        }
        return [];
      })
      .then((items) => {
        if (mounted) setNotifications(items);
      })
      .catch(() => {
        AuthAPI.logout();
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await AuthAPI.login(email, password);
    setUser(data.user);
    const items = await CatalogAPI.notifications().catch(() => []);
    setNotifications(items);
    return data.user?.role === 'admin' ? 'admin' : 'user';
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const data = await AuthAPI.googleAuth(credential);
    if (data.user) {
      setUser(data.user);
      const items = await CatalogAPI.notifications().catch(() => []);
      setNotifications(items);
      return data.user?.role === 'admin' ? 'admin' : 'user';
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    AuthAPI.logout();
    setUser(null);
    setNotifications([]);
  }, []);

  const register = useCallback(async (email, password, name) => {
    const data = await AuthAPI.register({ email, password, name });
    return Boolean(data.user);
  }, []);

  const updateProfile = useCallback((data) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await AuthAPI.deleteAccount();
    logout();
  }, [logout]);

  const addFavorite = useCallback(async (toolId) => {
    const favorites = await CatalogAPI.favorite(toolId, true);
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, favorites };
    });
  }, []);

  const removeFavorite = useCallback(async (toolId) => {
    const favorites = await CatalogAPI.favorite(toolId, false);
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, favorites };
    });
  }, []);

  const isFavorite = useCallback((toolId) => {
    return user?.favorites.includes(toolId) ?? false;
  }, [user?.favorites]);

  const createCollection = useCallback(async (name, description) => {
    const collections = await CatalogAPI.createCollection(name, description);
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, collections };
    });
  }, []);

  const deleteCollection = useCallback((collectionId) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, collections: prev.collections.filter(c => c.id !== collectionId) };
    });
  }, []);

  const addToCollection = useCallback((collectionId, toolId) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        collections: prev.collections.map(c =>
          c.id === collectionId && !c.toolIds.includes(toolId)
            ? { ...c, toolIds: [...c.toolIds, toolId] }
            : c
        )
      };
    });
  }, []);

  const removeFromCollection = useCallback((collectionId, toolId) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        collections: prev.collections.map(c =>
          c.id === collectionId
            ? { ...c, toolIds: c.toolIds.filter(id => id !== toolId) }
            : c
        )
      };
    });
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    notifications,
    unreadNotificationCount,
    login,
    loginWithGoogle,
    logout,
    register,
    updateProfile,
    deleteAccount,
    addFavorite,
    removeFavorite,
    isFavorite,
    createCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
