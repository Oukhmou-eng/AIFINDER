import DashboardSidebar from '../dashboard/DashboardSidebar';
import AdminSidebar from '../admin/AdminSidebar';
import { useAuth } from '../../contexts/auth-context';

export default function Sidebar(){
  const {user, isAuthenticated } = useAuth();


  return (
    <>
    {isAuthenticated && (user.role === 'user' ? 
      <DashboardSidebar />
     : <AdminSidebar /> )}
    </>
  );
}