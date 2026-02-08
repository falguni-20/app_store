import { Routes, Route, Navigate } from "react-router-dom";
import { Fragment, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TenantSelect from "./pages/TenantSelect";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./guards/ProtectedRoute";
import AdminApps from "./pages/AdminApps";
import InstituteApps from "./pages/InstituteApps";
import AppStore from "./pages/AppStore";
import AppDetailPage from "./pages/AppDetailPage";
import OrganizationInstitutes from "./pages/OrganizationInstitutes"; // New import
import OrganizationAdmin from "./pages/OrganizationAdmin"; // New import
import OrganizationSelector from "./pages/OrganizationSelector"; // New import
import DummyApp from "./pages/DummyApp"; // New import
import UserSettings from "./pages/UserSettings"; // New import
import { useAuthStore } from "./store/authStore";

export default function App() {
  const initializeAuth = useAuthStore(state => state.initializeAuth);

  useEffect(() => {
    // Initialize auth state when app starts
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Fragment>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tenant" element={<ProtectedRoute><TenantSelect /></ProtectedRoute>} />
        <Route path="/admin/apps" element={<ProtectedRoute adminOnly={true}><AdminApps /></ProtectedRoute>} />
        <Route path="/institute/apps" element={<ProtectedRoute><InstituteApps /></ProtectedRoute>} />
        <Route path="/organization/:orgId/institutes" element={<ProtectedRoute><OrganizationInstitutes /></ProtectedRoute>} /> {/* Updated route with orgId param - accessible to anyone in the org */}
        <Route path="/organizations" element={<ProtectedRoute><OrganizationSelector /></ProtectedRoute>} /> {/* Updated route - accessible to all authenticated users */}
        <Route path="/organization/:orgId/admin" element={<ProtectedRoute orgAdminOnly={true}><OrganizationAdmin /></ProtectedRoute>} /> {/* Updated route with orgId param */}
        <Route path="/apps" element={<ProtectedRoute><AppStore /></ProtectedRoute>} />
        <Route path="/apps/details/:appId" element={<ProtectedRoute><AppDetailPage /></ProtectedRoute>} />
        <Route path="/dummy-app" element={<DummyApp />} /> {/* Public route for dummy app */}
        <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
      <Toaster />
    </Fragment>
  );
}
