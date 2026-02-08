import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useState } from "react"; // Import useState
import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBuilding, FaPlus } from "react-icons/fa";
import Loader from '../components/Loader';
import "./organizationInstitutes.css";

export default function OrganizationInstitutes() {
  const navigate = useNavigate();
  const { orgId } = useParams(); // Get orgId from route parameters
  const user = useAuthStore((state) => state.user);
  const { setTenant } = useTenantStore((state) => state); // Removed instituteId as it's not directly used here
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
    setTenant({ orgId: parseInt(orgId), instituteId: selectedInstituteId });

    const userInstituteMembership = user?.institutes.find(
      (inst) => inst.instituteId === selectedInstituteId && inst.organizationId === parseInt(orgId)
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



  if (isLoading) return (
    <div className="organization-institutes-container">
      <Loader message="Loading institutes..." />
    </div>
  );

  // Check if user has access to this organization
  const userOrg = user?.organizations?.find(o => o.orgId === parseInt(orgId));
  if (!userOrg) {
    return <div>Access denied: You don't belong to this organization</div>;
  }

  return (
    <div className="organization-institutes-container">
      <div className="header-section">
        <div className="page-header">
          <button 
            className="back-btn"
            onClick={() => navigate('/organizations')}
            title="Back to Organizations"
          >
            <FaArrowLeft />
          </button>
          <FaBuilding className="page-icon" />
          <div>
            <h1>Institutes</h1>
            <h2>{userOrg?.orgName}</h2>
          </div>
        </div>
        {/* Only show admin panel button if user has admin rights */}
        {userOrg?.role === 'ORG_ADMIN' || userOrg?.role === 'SUPER_ADMIN' ? (
          <button
            onClick={() => navigate(`/organization/${orgId}/admin`)}
            className="org-admin-btn"
          >
            Switch to Admin Panel
          </button>
        ) : null}
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