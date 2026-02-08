import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore"; // Import useTenantStore

export default function ProtectedRoute({ children, adminOnly, orgAdminOnly }) { // Add orgAdminOnly prop
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const { orgId } = useTenantStore((s) => s); // Get selected orgId

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Check for SUPER_ADMIN access
  if (adminOnly) {
    const isSuperAdmin = user?.organizations?.some(org => org.role === "SUPER_ADMIN");
    if (!isSuperAdmin) {
        return <Navigate to="/" replace />;
    }
  }

  // Check for ORG_ADMIN access
  if (orgAdminOnly) {
    const isOrgAdmin = user?.organizations?.some(org => org.orgId === orgId && org.role === "ORG_ADMIN");
    if (!isOrgAdmin) {
        return <Navigate to="/" replace />;
    }
  }

  return children;
}
