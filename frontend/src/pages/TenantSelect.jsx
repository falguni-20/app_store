import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore";
import "./tenant.css";

export default function TenantSelect() {
  const user = useAuthStore((s) => s.user);
  const setTenant = useTenantStore((s) => s.setTenant);
  const navigate = useNavigate();

  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedInstId, setSelectedInstId] = useState("");

  // Directly use the organizations and institutes arrays from the user object
  const organizations = user?.organizations || [];
  const institutes = user?.institutes || [];

  // Filter institutes based on selected organization
  // Now `inst.organizationId` should be available
  const availableInstitutes = selectedOrgId
    ? institutes.filter((inst) => inst.organizationId === Number(selectedOrgId))
    : [];

  // Define handleTenantSelection using useCallback to prevent re-creation on every render
  const handleTenantSelection = useCallback((orgId, instituteId) => {
    console.log("handleTenantSelection called with:", { orgId, instituteId });
    setTenant({
      orgId: orgId,
      instituteId: instituteId,
    });

    // Determine redirection based on roles
    // Access role directly from the organization/institute object
    const selectedOrg = organizations.find(o => o.orgId === orgId);
    const selectedInst = institutes.find(i => i.instituteId === instituteId);

    console.log("Selected Org for redirection:", selectedOrg);
    console.log("Selected Inst for redirection:", selectedInst);

    if (selectedOrg?.role === "SUPER_ADMIN") {
      navigate("/admin/apps");
    } else if (selectedOrg?.role === "ORG_ADMIN") { // Organization Admin
      navigate("/organization/institutes"); // Org admins go to see/select institutes in their org
    } else if (selectedInst?.role === "INSTITUTE_ADMIN") { // Institute Admin
      navigate("/institute/apps");
    } else { // Regular User
      navigate("/apps"); // Regular users go to the app store for their selected institute
    }
  }, [setTenant, navigate, organizations, institutes]); // Dependencies for useCallback

  // --- Start Debugging Logs ---
  console.log("--- TenantSelect Component State ---");
  console.log("User:", user);
  // No longer need Org Roles and Institute Roles derived if directly using user.organizations/institutes
  
  // --- End Debugging Logs ---

  useEffect(() => {
    // Auto-select if only one organization
    if (organizations.length === 1 && !selectedOrgId) {
      console.log("Auto-selecting single organization:", organizations[0].orgId);
      setSelectedOrgId(organizations[0].orgId.toString());
    }
  }, [organizations, selectedOrgId, handleTenantSelection]);

  useEffect(() => {
    // Auto-select if only one institute available for the selected organization
    if (availableInstitutes.length === 1 && !selectedInstId) {
      console.log("Auto-selecting single institute:", availableInstitutes[0].instituteId);
      setSelectedInstId(availableInstitutes[0].instituteId.toString());
    }
  }, [availableInstitutes, selectedInstId, handleTenantSelection]);

  useEffect(() => {
    // If both are auto-selected, submit automatically
    // The `organizations.length === 1 && availableInstitutes.length === 1` condition is important here.
    if (selectedOrgId && selectedInstId && organizations.length === 1 && availableInstitutes.length === 1) {
      console.log("Auto-submitting tenant selection.");
      handleTenantSelection(Number(selectedOrgId), Number(selectedInstId));
    }
  }, [selectedOrgId, selectedInstId, organizations, availableInstitutes, handleTenantSelection]);


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("handleSubmit called. selectedOrgId:", selectedOrgId, "selectedInstId:", selectedInstId);

    const selectedOrg = organizations.find(o => o.orgId === Number(selectedOrgId));
    const isSuperAdminWithNoInstitutes = selectedOrg?.role === "SUPER_ADMIN" && institutes.length === 0;

    if (selectedOrgId && (selectedInstId || isSuperAdminWithNoInstitutes)) {
      // If super admin with no institutes, pass null for instituteId
      const instituteIdToPass = isSuperAdminWithNoInstitutes ? null : Number(selectedInstId);
      handleTenantSelection(Number(selectedOrgId), instituteIdToPass);
    } else {
        alert("Please select both an Organization and an Institute.");
    }
  };

  if (!user) {
    console.log("User not found, redirecting to /login");
    // This navigation should ideally be in a useEffect or handled by ProtectedRoute
    // For now, keep as is to avoid breaking existing flow until user confirms
    navigate("/login");
    return null;
  }

  return (
    <div className="tenant-page">
      <form className="tenant-card" onSubmit={handleSubmit}>
        <h2>Select Organization & Institute</h2>

        {organizations.length > 0 && ( // Condition already updated
          <>
            <label className="tenant-label">Organization</label>
            <select
              className="tenant-select"
              value={selectedOrgId}
              onChange={(e) => {
                console.log("Organization selected:", e.target.value);
                setSelectedOrgId(e.target.value);
                setSelectedInstId(""); // Reset institute when organization changes
              }}
            >
              <option value="">Select organization</option>
              {organizations.map((o) => (
                <option key={o.orgId} value={o.orgId}> {/* Use o.orgId and o.orgName */}
                  {o.orgName}
                </option>
              ))}
            </select>
          </>
        )}

        {selectedOrgId && availableInstitutes.length > 0 && (
          <>
            <label className="tenant-label">Institute</label>
            <select
              className="tenant-select"
              value={selectedInstId}
              onChange={(e) => {
                console.log("Institute selected:", e.target.value);
                setSelectedInstId(e.target.value);
              }}
            >
              <option value="">Select institute</option>
              {availableInstitutes.map((i) => (
                <option key={i.instituteId} value={i.instituteId}> {/* Use i.instituteId and i.instituteName */}
                  {i.instituteName}
                </option>
              ))}
            </select>
          </>
        )}

        <button
          className="tenant-btn"
          type="submit"
          disabled={
            !selectedOrgId || // Org must always be selected
            (!selectedInstId && !(
              organizations.find(o => o.orgId === Number(selectedOrgId))?.role === "SUPER_ADMIN" &&
              institutes.length === 0
            ))
          }
        >
          Continue
        </button>
      </form>
    </div>
  );
}