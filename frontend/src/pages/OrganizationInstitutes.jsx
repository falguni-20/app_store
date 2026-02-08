import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useState } from "react"; // Import useState
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore";
import { useNavigate } from "react-router-dom";
import "./organizationInstitutes.css";

export default function OrganizationInstitutes() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { orgId, setTenant } = useTenantStore((state) => state); // Removed instituteId as it's not directly used here
  const queryClient = useQueryClient(); // Initialize queryClient

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInstituteName, setNewInstituteName] = useState("");

  // Fetch institutes for the current organization
  const { data: institutes = [], isLoading } = useQuery({
    queryKey: ["organizationInstitutes", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await api.get(`/organizations/${orgId}/institutes`);
      return response.data;
    },
    enabled: !!orgId,
  });

  const createInstituteMutation = useMutation({
    mutationFn: (instituteName) =>
      api.post(`/organizations/${orgId}/institutes`, { name: instituteName }),
    onSuccess: () => {
      queryClient.invalidateQueries(["organizationInstitutes", orgId]); // Re-fetch institutes
      setNewInstituteName("");
      setShowCreateForm(false);
    },
    onError: (error) => {
      alert("Error creating institute: " + (error.response?.data?.message || error.message));
    }
  });

  const handleCreateInstituteSubmit = (e) => {
    e.preventDefault();
    if (newInstituteName.trim()) {
      createInstituteMutation.mutate(newInstituteName);
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

  if (isLoading) return <div>Loading institutes...</div>;

  return (
    <div className="organization-institutes-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Institutes in {user?.organizations.find(o => o.orgId === orgId)?.orgName}</h2>
        <button 
          onClick={() => navigate('/organization/admin')}
          className="org-admin-btn"
        >
          Organization Admin Panel
        </button>
      </div>

      <div className="create-institute-section">
        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "Create New Institute"}
        </button>
        {showCreateForm && (
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
              <button onClick={() => handleInstituteClick(institute.id)}>View/Manage Institute</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}