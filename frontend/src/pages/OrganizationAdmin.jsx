import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore";
import { useNavigate } from "react-router-dom";
import "./organizationAdmin.css";

export default function OrganizationAdmin() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { orgId, setTenant } = useTenantStore((state) => state);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("institutes"); // institutes, users, settings
  const [showCreateInstituteForm, setShowCreateInstituteForm] = useState(false);
  const [newInstituteName, setNewInstituteName] = useState("");
  const [showInviteUserForm, setShowInviteUserForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("USER");
  const [showUpdateOrgForm, setShowUpdateOrgForm] = useState(false);
  const [updatedOrgName, setUpdatedOrgName] = useState("");

  // Fetch institutes for the current organization
  const { data: institutes = [], isLoading: institutesLoading } = useQuery({
    queryKey: ["organizationInstitutes", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await api.get(`/organizations/${orgId}/institutes`);
      return response.data;
    },
    enabled: !!orgId,
  });

  // Fetch users in the current organization
  const { data: orgUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["organizationUsers", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await api.get(`/organizations/${orgId}/users`);
      return response.data;
    },
    enabled: !!orgId,
  });

  // Create institute mutation
  const createInstituteMutation = useMutation({
    mutationFn: (instituteName) =>
      api.post(`/organizations/${orgId}/institutes`, { name: instituteName }),
    onSuccess: () => {
      queryClient.invalidateQueries(["organizationInstitutes", orgId]);
      setNewInstituteName("");
      setShowCreateInstituteForm(false);
    },
    onError: (error) => {
      alert("Error creating institute: " + (error.response?.data?.message || error.message));
    }
  });

  // Invite user to organization mutation
  const inviteUserMutation = useMutation({
    mutationFn: ({ email, role }) =>
      api.post(`/organizations/${orgId}/users/invite`, { email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries(["organizationUsers", orgId]);
      setInviteEmail("");
      setInviteRole("USER");
      setShowInviteUserForm(false);
    },
    onError: (error) => {
      alert("Error inviting user: " + (error.response?.data?.message || error.message));
    }
  });

  // Update organization mutation
  const updateOrganizationMutation = useMutation({
    mutationFn: ({ orgId, name }) =>
      api.put(`/organization-management/${orgId}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(["organizationUsers"]); // This might trigger a re-fetch that updates user data
      setUpdatedOrgName("");
      setShowUpdateOrgForm(false);
      // Note: We may need to update the user's organization name in the store
      // For now, we'll show a success message
      alert("Organization updated successfully!");
    },
    onError: (error) => {
      alert("Error updating organization: " + (error.response?.data?.message || error.message));
    }
  });

  const handleCreateInstituteSubmit = (e) => {
    e.preventDefault();
    if (newInstituteName.trim()) {
      createInstituteMutation.mutate(newInstituteName);
    }
  };

  const handleInviteUserSubmit = (e) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      inviteUserMutation.mutate({ email: inviteEmail, role: inviteRole });
    }
  };

  const handleUpdateOrgSubmit = (e) => {
    e.preventDefault();
    if (updatedOrgName.trim()) {
      updateOrganizationMutation.mutate({ orgId, name: updatedOrgName });
    }
  };

  const handleInstituteClick = (selectedInstituteId) => {
    setTenant({ orgId, instituteId: selectedInstituteId });

    const userInstituteMembership = user?.institutes.find(
      (inst) => inst.instituteId === selectedInstituteId && inst.organizationId === orgId
    );
    const instituteRole = userInstituteMembership?.role;

    if (instituteRole === "INSTITUTE_ADMIN") {
      navigate("/institute/apps");
    } else if (instituteRole === "USER") {
      navigate("/apps");
    } else {
      navigate("/apps");
    }
  };

  const currentOrg = user?.organizations.find(o => o.orgId === orgId);

  if (institutesLoading || usersLoading) return <div>Loading...</div>;

  return (
    <div className="organization-admin-container">
      <h2>Organization Admin: {currentOrg?.orgName}</h2>
      
      <div className="tabs">
        <button 
          className={activeTab === "institutes" ? "active-tab" : ""} 
          onClick={() => setActiveTab("institutes")}
        >
          Institutes
        </button>
        <button 
          className={activeTab === "users" ? "active-tab" : ""} 
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button 
          className={activeTab === "settings" ? "active-tab" : ""} 
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "institutes" && (
          <div className="institutes-tab">
            <div className="create-institute-section">
              <button onClick={() => setShowCreateInstituteForm(!showCreateInstituteForm)}>
                {showCreateInstituteForm ? "Cancel" : "Create New Institute"}
              </button>
              {showCreateInstituteForm && (
                <form className="create-institute-form" onSubmit={handleCreateInstituteSubmit}>
                  <input
                    type="text"
                    placeholder="Institute Name"
                    value={newInstituteName}
                    onChange={(e) => setNewInstituteName(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={createInstituteMutation.isLoading}>
                    {createInstituteMutation.isLoading ? "Creating..." : "Add Institute"}
                  </button>
                </form>
              )}
            </div>

            {institutes.length === 0 ? (
              <p>No institutes found for this organization.</p>
            ) : (
              <div className="institute-list">
                {institutes.map((institute) => (
                  <div key={institute.id} className="institute-card">
                    <h3>{institute.name}</h3>
                    <p>ID: {institute.id}</p>
                    <button onClick={() => handleInstituteClick(institute.id)}>
                      Manage Institute
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-tab">
            <div className="invite-user-section">
              <button onClick={() => setShowInviteUserForm(!showInviteUserForm)}>
                {showInviteUserForm ? "Cancel" : "Invite User to Organization"}
              </button>
              {showInviteUserForm && (
                <form className="invite-user-form" onSubmit={handleInviteUserSubmit}>
                  <input
                    type="email"
                    placeholder="User Email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="USER">User</option>
                    <option value="ORG_ADMIN">Organization Admin</option>
                  </select>
                  <button type="submit" disabled={inviteUserMutation.isLoading}>
                    {inviteUserMutation.isLoading ? "Inviting..." : "Send Invitation"}
                  </button>
                </form>
              )}
            </div>

            {orgUsers.length === 0 ? (
              <p>No users found in this organization.</p>
            ) : (
              <div className="user-list">
                {orgUsers.map((user) => (
                  <div key={user.id} className="user-card">
                    <h3>{user.user.name}</h3>
                    <p>Email: {user.user.email}</p>
                    <p>Role: {user.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-tab">
            <h3>Organization Settings</h3>
            <p>Current Organization: {currentOrg?.orgName}</p>
            <p>Organization ID: {orgId}</p>
            <p>Total Institutes: {institutes.length}</p>
            <p>Total Users: {orgUsers.length}</p>
            
            <div className="update-org-section">
              <button onClick={() => setShowUpdateOrgForm(!showUpdateOrgForm)}>
                {showUpdateOrgForm ? "Cancel" : "Update Organization Name"}
              </button>
              {showUpdateOrgForm && (
                <form className="update-org-form" onSubmit={handleUpdateOrgSubmit}>
                  <input
                    type="text"
                    placeholder="New Organization Name"
                    value={updatedOrgName}
                    onChange={(e) => setUpdatedOrgName(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={updateOrganizationMutation.isLoading}>
                    {updateOrganizationMutation.isLoading ? "Updating..." : "Update Organization"}
                  </button>
                </form>
              )}
            </div>
            
            <div className="actions">
              <button className="btn-danger" onClick={() => {
                if (window.confirm("Are you sure you want to deactivate this organization? This action cannot be undone.")) {
                  // TODO: Implement organization deactivation
                  alert("Organization deactivation is not implemented in this demo");
                }
              }}>
                Deactivate Organization
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}