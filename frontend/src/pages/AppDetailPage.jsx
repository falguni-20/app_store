import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore";
import "./appDetailPage.css";

export default function AppDetailPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { orgId, instituteId } = useTenantStore((s) => s);

  const [settingsInput, setSettingsInput] = useState("");
  const [launchedApp, setLaunchedApp] = useState(null);

  // Fetch app details
  const { data: app, isLoading: isLoadingApp, error: appError } = useQuery({
    queryKey: ["appDetails", appId],
    queryFn: async () => (await api.get(`/apps/details/${appId}`)).data,
  });

  // Fetch installed apps for the current institute to check installation status
  const { data: installedApps = [], isLoading: isLoadingInstalledApps } = useQuery({
    queryKey: ["installedApps"],
    queryFn: async () => (await api.get("/apps")).data,
  });

  const isInstalled = installedApps.some((inst) => inst.app.id === app?.id);
  const installedApp = installedApps.find((inst) => inst.app.id === app?.id);

  // Check if current user is an Institute Admin or Org Admin or Super Admin
  const isInstituteAdmin = user?.institutes?.some(
    inst => inst.instituteId === instituteId && inst.role === "INSTITUTE_ADMIN"
  ) || user?.organizations?.some(
    org => org.orgId === orgId && ["SUPER_ADMIN", "ORG_ADMIN"].includes(org.role)
  );

  const installAppMutation = useMutation({
    mutationFn: (data) =>
      api.post("/institute/apps/install", { appId: Number(appId), settings: JSON.parse(data.settings || '{}') }),
    onSuccess: () => {
      queryClient.invalidateQueries(["installedApps"]); // Re-fetch installed apps
      alert("App installed successfully!");
      navigate("/apps"); // Go back to app store
    },
    onError: (error) => {
        alert("Error installing app: " + (error.response?.data?.message || error.message));
    }
  });

  const launchAppMutation = useMutation({
    mutationFn: (appIdToLaunch) => api.get(`/apps/${appIdToLaunch}/launch`),
    onSuccess: (data) => {
        setLaunchedApp(data.data);
    },
    onError: (error) => {
        alert("Error launching app: " + (error.response?.data?.message || error.message));
        setLaunchedApp(null);
    }
  });

  // Close iframe handler
  const closeIframe = () => {
    setLaunchedApp(null);
  };

  if (isLoadingApp || isLoadingInstalledApps) return <div className="loading">Loading app details...</div>;
  if (appError) return <div className="error">Error loading app: {appError.message}</div>;
  if (!app) return <div className="error">App not found.</div>;

  return (
    <div className="app-detail-page-container">
      <div className="app-detail-header">
        <button onClick={() => navigate("/apps")} className="back-button">
          &larr; Back to App Store
        </button>
        <div className="app-breadcrumb">
          <span>Home</span> &gt; <span>App Store</span> &gt; <span>{app.name}</span>
        </div>
      </div>

      <div className="app-detail-content">
        <div className="app-detail-card">
          <div className="app-detail-header-info">
            <div className="app-detail-icon">
              {app.logoUrl ? (
                <img src={app.logoUrl} alt={app.name} className="app-detail-logo" />
              ) : (
                <div className="app-logo-placeholder">
                  {app.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="app-detail-main-info">
              <h1>{app.name}</h1>
              <div className="app-meta-tags">
                <span className="app-category-tag">{app.category}</span>
                <span className={`app-status-tag ${isInstalled ? 'status-installed' : 'status-available'}`}>
                  {isInstalled ? 'Installed' : 'Available'}
                </span>
              </div>
              <p className="app-description">{app.description}</p>
            </div>
          </div>

          <div className="app-detail-body">
            <div className="app-info-section">
              <h3>About this App</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Category</label>
                  <span>{app.category}</span>
                </div>
                <div className="info-item">
                  <label>Developer</label>
                  <span>System</span>
                </div>
                <div className="info-item">
                  <label>Permissions Required</label>
                  <div className="permissions-list">
                    {app.requiredPermissions && Object.entries(app.requiredPermissions).map(([perm, enabled]) => (
                      <span key={perm} className={`permission-tag ${enabled ? 'granted' : 'denied'}`}>
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="app-actions-section">
              {isInstalled ? (
                <div className="installed-actions">
                  <div className="installation-info">
                    <h4>Installation Details</h4>
                    <p><strong>Status:</strong> Active</p>
                    <p><strong>Installed:</strong> {installedApp ? new Date(installedApp.installedAt).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Settings:</strong> {installedApp ? Object.keys(installedApp.settings).length : 0} parameters configured</p>
                  </div>
                  
                  <div className="installed-app-actions">
                    <button
                      onClick={() => launchAppMutation.mutate(app.id)}
                      disabled={launchAppMutation.isLoading}
                      className="primary-action-btn"
                    >
                      {launchAppMutation.isLoading ? "Launching..." : "Launch App"}
                    </button>
                    <button className="secondary-action-btn">
                      View Settings
                    </button>
                  </div>
                </div>
              ) : (
                isInstituteAdmin ? (
                  <div className="install-section">
                    <h3>Install this App</h3>
                    <p>Install this app for your institute to start using it.</p>
                    
                    <div className="install-form">
                      <label htmlFor="settingsInput">Configuration Settings (JSON):</label>
                      <textarea
                        id="settingsInput"
                        placeholder="Enter initial app settings as JSON (e.g., {&quot;themeColor&quot;: &quot;#00FFAA&quot;, &quot;apiKey&quot;: &quot;abc123&quot;})"
                        value={settingsInput}
                        onChange={(e) => setSettingsInput(e.target.value)}
                        rows="6"
                      ></textarea>
                      
                      <div className="install-actions">
                        <button
                          onClick={() => installAppMutation.mutate({ settings: settingsInput })}
                          disabled={installAppMutation.isLoading}
                          className="primary-action-btn"
                        >
                          {installAppMutation.isLoading ? "Installing..." : "Install App"}
                        </button>
                        <button 
                          onClick={() => setSettingsInput('{"themeColor": "#00FFAA", "apiKey": "abc123"}')}
                          type="button"
                          className="secondary-action-btn"
                        >
                          Load Sample
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="not-authorized">
                    <h3>Installation Required</h3>
                    <p>This app needs to be installed by an Institute Administrator.</p>
                    <p>Contact your admin to install this app for your institute.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {launchedApp && (
          <div className="launched-app-modal">
            <div className="launched-app-content">
              <div className="launched-app-header">
                <h3>{launchedApp.name}</h3>
                <button className="close-btn" onClick={closeIframe}>×</button>
              </div>
              <iframe
                src={`${launchedApp.launchUrl}?token=${launchedApp.launchToken}`}
                title={launchedApp.name}
                className="launched-app-iframe"
                allow="geolocation; microphone; camera"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}