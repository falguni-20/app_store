import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TenantSelect from "./pages/TenantSelect";
import ProtectedRoute from "./guards/ProtectedRoute";
import AdminApps from "./pages/AdminApps";
import InstituteApps from "./pages/InstituteApps";
import AppStore from "./pages/AppStore";
import AppDetailPage from "./pages/AppDetailPage";
import OrganizationInstitutes from "./pages/OrganizationInstitutes"; // New import
import OrganizationAdmin from "./pages/OrganizationAdmin"; // New import
import AppAnalytics from "./pages/AppAnalytics"; // New import
import DummyApp from "./pages/DummyApp"; // New import
import UserSettings from "./pages/UserSettings"; // New import

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/tenant" element={<ProtectedRoute><TenantSelect /></ProtectedRoute>} />
      <Route path="/admin/apps" element={<ProtectedRoute adminOnly={true}><AdminApps /></ProtectedRoute>} />
      <Route path="/institute/apps" element={<ProtectedRoute><InstituteApps /></ProtectedRoute>} />
      <Route path="/organization/institutes" element={<ProtectedRoute orgAdminOnly={true}><OrganizationInstitutes /></ProtectedRoute>} /> {/* New route */}
      <Route path="/organization/admin" element={<ProtectedRoute orgAdminOnly={true}><OrganizationAdmin /></ProtectedRoute>} /> {/* New route */}
      <Route path="/analytics" element={<ProtectedRoute><AppAnalytics /></ProtectedRoute>} />
      <Route path="/apps" element={<ProtectedRoute><AppStore /></ProtectedRoute>} />
      <Route path="/apps/details/:appId" element={<ProtectedRoute><AppDetailPage /></ProtectedRoute>} />
      <Route path="/dummy-app" element={<DummyApp />} /> {/* Public route for dummy app */}
      <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  );
}
