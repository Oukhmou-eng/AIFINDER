import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { useNavigate } from 'react-router-dom';
//import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import Sidebar from '../../components/layout/sidebar';
import { Header } from '../../components/layout/header';

export default function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />

      <div className="flex flex-col lg:flex-row gap-6">

        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto pr-4 py-8">
            <Outlet />

          </div>
        </main>
      </div>
    </>
  );
}