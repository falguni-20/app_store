import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore";
import "./dashboard.css";

export default function Dashboard() {
  const [iframeUrl, setIframeUrl] = useState(""); // For launched app iframe
  const user = useAuthStore(state => state.user);
  const { orgId, instituteId } = useTenantStore(state => state);

  // Fetch installed apps
  const { data: apps = [], isLoading, error } = useQuery({
    queryKey: ["apps"],
    queryFn: async () => {
      const res = await api.get("/apps");
      return res.data;
    },
  });

  // Launch app handler
  const launchApp = async (app) => {
    try {
      const res = await api.get(`/apps/${app.app.id}/launch`);
      const { launchUrl, launchToken } = res.data;

      // Open app in iframe
      setIframeUrl(`${launchUrl}?token=${launchToken}`);
    } catch (err) {
      console.error("Failed to launch app", err);
      alert("Failed to launch app: " + (err.response?.data?.message || err.message));
    }
  };

  // Close iframe handler
  const closeIframe = () => {
    setIframeUrl("");
  };

  if (isLoading) return <div className="loading">Loading apps...</div>;
  if (error) return <div className="error">Failed to load apps</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Welcome, {user?.name}</h2>
        <div className="tenant-info">
          <p><strong>Organization:</strong> {user?.organizations.find(o => o.orgId === orgId)?.orgName}</p>
          <p><strong>Institute:</strong> {user?.institutes.find(i => i.instituteId === instituteId)?.instituteName}</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{apps.length}</h3>
          <p>Installed Apps</p>
        </div>
        <div className="stat-card">
          <h3>{apps.filter(app => app.enabled).length}</h3>
          <p>Active Apps</p>
        </div>
        <div className="stat-card">
          <h3>0</h3>
          <p>Recent Activity</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="apps-section">
          <h3>Your Apps</h3>
          
          {apps.length === 0 ? (
            <div className="empty-state">
              <h4>No apps installed</h4>
              <p>Apps installed by your institute admin will appear here</p>
            </div>
          ) : (
            <div className="apps-grid">
              {apps.map((app) => (
                <div className={`app-card ${!app.enabled ? 'disabled' : ''}`} key={app.id}>
                  <div className="app-icon">
                    {app.app.logoUrl ? (
                      <img
                        src={app.app.logoUrl}
                        alt={app.app.name}
                        className="app-logo"
                      />
                    ) : (
                      <div className="app-logo-placeholder">
                        {app.app.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="app-info">
                    <h3 className="app-name">{app.app.name}</h3>
                    <p className="app-category">{app.app.category}</p>
                    <p className="app-description">{app.app.description.substring(0, 100)}{app.app.description.length > 100 ? '...' : ''}</p>
                    
                    <div className="app-status">
                      <span className={`status-badge ${app.enabled ? 'status-active' : 'status-inactive'}`}>
                        {app.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="app-actions">
                      <button
                        className="launch-btn"
                        onClick={() => launchApp(app)}
                        disabled={!app.enabled}
                      >
                        Launch
                      </button>
                      <button className="settings-btn">Settings</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {iframeUrl && (
          <div className="iframe-container">
            <div className="iframe-header">
              <h3>App Preview</h3>
              <button className="close-btn" onClick={closeIframe}>×</button>
            </div>
            <iframe
              src={iframeUrl}
              title="App Preview"
              className="app-iframe"
              allow="geolocation; microphone; camera"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}