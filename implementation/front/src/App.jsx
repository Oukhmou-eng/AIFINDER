import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import CataloguePage from "./pages/CataloguePage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { currentUser } from "./database.js";

function AdminRoute() {
  if (currentUser.role !== "admin") {
    return <Navigate to="/" />;
  }
  return <AdminDashboard />;
}

function UserRoute() {
  if (currentUser.role !== "user" && currentUser.role !== "admin") {
    return <Navigate to="/" />;
  }
  return <UserDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalogue" element={<CataloguePage />} />
      <Route path="/detail" element={<DetailPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/user" element={<UserRoute />} />
      <Route path="/admin" element={<AdminRoute />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
