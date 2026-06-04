import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth-context';
import { CompareProvider } from './contexts/compare-context';
import { Toaster } from './components/ui/sonner';
import HomePage from './pages/HomePage';
import { BrowserRouter } from 'react-router-dom';
import ToolDetailPage from './pages/ToolDetailPage';
import ToolsPage from './pages/ToolsPage';
import SearchPage from './pages/SearchPage';
import RegisterPage from './pages/RegisterPage';
import RankingPage from './pages/RankingPage';
import ProposeToolPage from './pages/ProposeToolPage';
//import ProfilePage from './pages/ProfilePage';
import ModelsPage from './pages/ModelsPage';
import ModelDetailPage from './pages/ModelDetailPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CompareModelsPage from './pages/CompareModelsPage';
import ComparePage from './pages/ComparePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import DashboardFavorites from './pages/dashboard/DashboardFavorites';
import DashboardReviews from './pages/dashboard/DashboardReviews';
import DashboardCollections from './pages/dashboard/DashboardCollections';
import DashboardProposals from './pages/dashboard/DashboardProposals';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardNotifications from './pages/dashboard/DashboardNotifications';
import ProfilePage from './pages/dashboard/ProfilePage';

// Pages Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTools from './pages/admin/AdminTools';
import AdminCategories from './pages/admin/AdminCategories';
import AdminModels from './pages/admin/AdminModels';
import AdminReports from './pages/admin/AdminReports';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import ProposalDetailPage from './pages/admin/ProposalDetailPage';
//import './globals.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/admin" element={<AdminPage />} /> */}
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:slug" element={<CategoryPage />} />
            <Route path="/compare/models" element={<CompareModelsPage />} />
            <Route path="/compare" element={<ComparePage />} />

            {/*<Route path="/dashboard" element={<DashboardPage />} /> */}

            {/* Routes Dashboard (utilisateur) */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="favorites" element={<DashboardFavorites />} />
              <Route path="reviews" element={<DashboardReviews />} />
              <Route path="notifications" element={<DashboardNotifications />} />
              <Route path="collections" element={<DashboardCollections />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="proposals" element={<DashboardProposals />} />
            </Route>

            {/* Routes Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tools" element={<AdminTools />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="models" element={<AdminModels />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="proposals/:id" element={<ProposalDetailPage />} />
            </Route>

            {/* 404 - à ajouter */}
            <Route path="*" element={<NotFoundPage />} />

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/models/:id" element={<ModelDetailPage />} />
            {/*<Route path="/profile" element={<ProfilePage />} />*/}
            <Route path="/propose-tool" element={<ProposeToolPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/:slug" element={<ToolDetailPage />} />
          </Routes>
          <Toaster />
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;