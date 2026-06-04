// src/pages/admin/AdminLayout.jsx
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/sidebar';
import { Header } from '../../components/layout/header';

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Vérification admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
}