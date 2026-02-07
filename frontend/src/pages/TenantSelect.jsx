import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore";
import "./tenant.css";

export default function TenantSelect() {
  const user = useAuthStore((s) => s.user);
  const setTenant = useTenantStore((s) => s.setTenant);
  const navigate = useNavigate();

  const [orgId, setOrgId] = useState("");
  const [instId, setInstId] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!orgId || !instId) return;

    setTenant({
      orgId: Number(orgId),
      instituteId: Number(instId),
    });

    navigate("/");
  };

  return (
    <div className="tenant-page">
      <form className="tenant-card" onSubmit={submit}>
        <h2>Select Organization & Institute</h2>

        <label className="tenant-label">Organization</label>
        <select
          className="tenant-select"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
        >
          <option value="">Select organization</option>
          {user.organizations.map((o) => (
            <option key={o.orgId} value={o.orgId}>
              {o.orgName}
            </option>
          ))}
        </select>

        <label className="tenant-label">Institute</label>
        <select
          className="tenant-select"
          value={instId}
          onChange={(e) => setInstId(e.target.value)}
        >
          <option value="">Select institute</option>
          {user.institutes.map((i) => (
            <option key={i.instituteId} value={i.instituteId}>
              {i.instituteName}
            </option>
          ))}
        </select>

        <button className="tenant-btn">
          Continue
        </button>
      </form>
    </div>
  );
}
