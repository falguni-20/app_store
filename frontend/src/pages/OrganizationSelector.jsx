import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaPlus, FaChevronRight } from "react-icons/fa";
import Loader from '../components/Loader';
import "./organizationSelector.css";

export default function OrganizationSelector() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { setTenant } = useTenantStore((state) => state);

  // Get all organizations where user has admin rights
  const { data: organizations = [], isLoading: isLoadingOrganizations } = useQuery({
    queryKey: ["adminOrganizations"],
    queryFn: async () => {
      // Only return organizations where user has admin rights
      return user?.organizations?.filter(org => 
        org.role === "ORG_ADMIN" || org.role === "SUPER_ADMIN"
      ) || [];
    },
    enabled: !!user,
  });

  const handleOrganizationSelect = (orgId) => {
    // Set the selected organization in tenant store
    setTenant({ orgId: parseInt(orgId), instituteId: null });

    // Navigate to the admin panel for the selected organization
    navigate(`/organization/${orgId}/admin`);
  };

  // Show loader if organizations are loading
  if (isLoadingOrganizations) {
    return (
      <div className="organization-selector-container">
        <Loader message="Loading organizations..." />
      </div>
    );
  }

  return (
    <div className="organization-selector-container">
      <div className="header-section">
        <div className="page-header">
          <button
            className="back-btn"
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
            </svg>
          </button>
          <FaBuilding className="page-icon" />
          <div>
            <h1>Organization Dashboard</h1>
            <p>Manage your organization's institutes, users, and applications</p>
          </div>
        </div>
      </div>

      {organizations.length === 0 ? (
        <div className="empty-state">
          <FaBuilding size={60} color="#cbd5e1" />
          <h3>No Organizations Found</h3>
          <p>You don't have admin access to any organizations yet</p>
        </div>
      ) : (
        <div className="selection-card">
          <div className="card-header">
            <h2>Select Organization</h2>
            <p className="card-subtitle">Choose an organization to manage its institutes, users, and apps</p>
          </div>
          
          <div className="org-selection-wrapper">
            <label className="selector-label">Organization</label>
            <select
              className="selector-dropdown"
              onChange={(e) => handleOrganizationSelect(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Choose an organization...</option>
              {organizations.map((org) => (
                <option key={org.orgId} value={org.orgId}>
                  {org.orgName} {org.role ? `(${org.role})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="selection-info">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-value">{organizations.length}</div>
                <div className="info-label">Organizations</div>
              </div>
              <div className="info-item">
                <div className="info-value">--</div>
                <div className="info-label">Total Institutes</div>
              </div>
              <div className="info-item">
                <div className="info-value">--</div>
                <div className="info-label">Total Users</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}