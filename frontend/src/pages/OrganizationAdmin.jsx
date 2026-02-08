import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaBuilding, FaUsers, FaCog, FaPlus, FaUserPlus, FaEdit, FaTrashAlt, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import { ClipLoader } from 'react-spinners';
import Loader from '../components/Loader';
import "./organizationAdmin.css";

export default function OrganizationAdmin() {
  const navigate = useNavigate();
  const { orgId } = useParams(); // Get orgId from route parameters
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // State for managing tabs and forms
  const [activeTab, setActiveTab] = useState("users"); // users, institutes, apps
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("USER");

  // Check if user has access to this organization
  const hasAccess = user?.organizations?.some(
    (org) => org.orgId === parseInt(orgId) && (org.role === "ORG_ADMIN" || org.role === "SUPER_ADMIN")
  );

  // Fetch organization details
  const { data: organization, isLoading: isLoadingOrg } = useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      if (!hasAccess) return null; // Don't fetch if no access
      const response = await api.get(`/organizations/${orgId}`);
      return response.data;
    },
    enabled: !!orgId && hasAccess,
  });

  // Fetch organization users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["organizationUsers", orgId],
    queryFn: async () => {
      if (!hasAccess) return []; // Don't fetch if no access
      const response = await api.get(`/organizations/${orgId}/users`);
      return response.data;
    },
    enabled: !!orgId && hasAccess,
  });

  // Fetch organization institutes
  const { data: institutes = [], isLoading: isLoadingInstitutes } = useQuery({
    queryKey: ["organizationInstitutes", orgId],
    queryFn: async () => {
      if (!hasAccess) return []; // Don't fetch if no access
      const response = await api.get(`/organizations/${orgId}/institutes`);
      return response.data;
    },
    enabled: !!orgId && hasAccess,
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      const response = await api.post(`/organizations/${orgId}/invite`, {
        email,
        role,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationUsers", orgId] });
      toast.success("User invited successfully");
      setShowInviteForm(false);
      setInviteEmail("");
      setInviteRole("USER");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to invite user");
    },
  });

  // Handle invite form submission
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    inviteUserMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  // Check access after hooks are called
  if (!hasAccess) {
    return (
      <div className="organization-admin-container">
        <div className="access-denied">Access denied</div>
      </div>
    );
  }

  // Loading state
  if (isLoadingOrg || isLoadingUsers || isLoadingInstitutes) {
    return <Loader message="Loading organization data..." />;
  }

  return (
    <div className="organization-admin-container">
      <div className="header-section">
        <div className="org-header">
          <button 
            className="back-button" 
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <FaArrowLeft />
          </button>
          <h2>
            <FaBuilding className="icon" /> {organization?.name} Administration
          </h2>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <FaUsers className="icon" /> Users
          </button>
          <button 
            className={`tab ${activeTab === "institutes" ? "active" : ""}`}
            onClick={() => setActiveTab("institutes")}
          >
            <FaBuilding className="icon" /> Institutes
          </button>
          <button 
            className={`tab ${activeTab === "apps" ? "active" : ""}`}
            onClick={() => setActiveTab("apps")}
          >
            <FaCog className="icon" /> Apps
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "users" && (
          <div className="users-tab">
            <div className="section-header">
              <h3>Organization Users</h3>
              <button 
                className="btn-primary"
                onClick={() => setShowInviteForm(!showInviteForm)}
              >
                <FaUserPlus className="icon" /> {showInviteForm ? "Cancel" : "Invite User"}
              </button>
            </div>

            {showInviteForm && (
              <form className="invite-form" onSubmit={handleInviteSubmit}>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter user email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="USER">User</option>
                    <option value="ORG_ADMIN">Organization Admin</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={inviteUserMutation.isPending}
                >
                  {inviteUserMutation.isPending ? "Inviting..." : "Send Invitation"}
                </button>
              </form>
            )}

            <div className="users-list">
              {users.map((user) => (
                <div key={user.id} className="user-item">
                  <div className="user-info">
                    <strong>{user.name}</strong> ({user.email})
                  </div>
                  <div className="user-role">
                    Role: {user.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "institutes" && (
          <div className="institutes-tab">
            <div className="section-header">
              <h3>Organization Institutes</h3>
              <button 
                className="btn-primary"
                onClick={() => navigate(`/organization/${orgId}/institutes`)}
              >
                <FaPlus className="icon" /> Manage Institutes
              </button>
            </div>

            <div className="institutes-list">
              {institutes.map((institute) => (
                <div key={institute.id} className="institute-item">
                  <div className="institute-info">
                    <strong>{institute.name}</strong>
                  </div>
                  <div className="institute-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => navigate(`/organization/${orgId}/institutes/${institute.id}/admin`)}
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "apps" && (
          <div className="apps-tab">
            <div className="section-header">
              <h3>Organization Apps</h3>
              <button 
                className="btn-primary"
                onClick={() => navigate("/admin/apps")}
              >
                <FaCog className="icon" /> Manage Apps
              </button>
            </div>
            
            <p>Manage applications for this organization.</p>
          </div>
        )}
      </div>
    </div>
  );
}