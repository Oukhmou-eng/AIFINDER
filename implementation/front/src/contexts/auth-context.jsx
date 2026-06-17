import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AuthAPI from '../services/authAPI';
import CatalogAPI from '../services/catalogAPI';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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
      .catch((error) => {
        // Ne déconnecter que si l'erreur est une non-authentification (401) ou token absent
        if (error?.response?.status === 401 || !getToken()) {
          AuthAPI.logout();
        }
        // Sinon, on garde l'utilisateur tel quel (pas de token, pas de user)
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
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

  const removeFromCollection = useCallback(async (collectionId, toolId) => {
    const collections = await CatalogAPI.removeToolFromCollection(collectionId, toolId);
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, collections };
    });
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
    return collections;
  }, []);

  const deleteCollection = useCallback(async (collectionId) => {
    const collections = await CatalogAPI.deleteCollection(collectionId);
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, collections };
    });
  }, []);

  const addToCollection = useCallback(async (collectionId, toolId) => {
    const collections = await CatalogAPI.addToolToCollection(collectionId, toolId);
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, collections };
    });
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      const updated = await CatalogAPI.markNotificationAsRead(notificationId);
      setNotifications(updated);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const updated = await CatalogAPI.markAllNotificationsAsRead();
      setNotifications(updated);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const updated = await CatalogAPI.deleteNotification(notificationId);
      setNotifications(updated);
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading: loading,
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
    deleteNotification,
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
