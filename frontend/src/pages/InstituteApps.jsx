import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import "./instituteApps.css";

// Helper function to validate JSON
const isValidJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    console.log("error",e)
    return false;
  }
};

export default function InstituteApps() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [installingAppId, setInstallingAppId] = useState(null);
  const [appSettings, setAppSettings] = useState("{}");
  const [configuringAppId, setConfiguringAppId] = useState(null);
  const [configuringAppSettings, setConfiguringAppSettings] = useState("{}");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("available"); // available or installed

  // Fetch all apps for installation
  const { data: allAppsResult, isLoading: isLoadingAllApps, error: allAppsError } = useQuery({
    queryKey: ["allApps"],
    queryFn: async () => {
      const response = await api.get("/view/apps");
      return response.data;
    },
    retry: 1,
  });
  const allApps = Array.isArray(allAppsResult) ? allAppsResult : [];

  // Fetch apps installed in the current institute
  const { data: installedAppsResult, isLoading: isLoadingInstalledApps, error: installedAppsError } = useQuery({
    queryKey: ["installedApps"],
    queryFn: async () => {
      const response = await api.get("/apps");
      return response.data;
    },
    retry: 1,
  });
  const installedApps = Array.isArray(installedAppsResult) ? installedAppsResult : [];

  // Filter out apps that are already installed
  const availableApps = allApps.filter(
    (app) => !installedApps.some((installed) => installed.app.id === app.id)
  );

  // Filter apps based on search term and category
  const filteredAvailableApps = availableApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredInstalledApps = installedApps.filter(app => {
    const matchesSearch = app.app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.app.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filtering
  const categories = [...new Set([...allApps.map(app => app.category)])];

  // Install app mutation
  const installAppMutation = useMutation({
    mutationFn: ({ appId, settings }) => {
      // Parse settings to ensure it's valid JSON
      let parsedSettings = {};
      if (settings && settings.trim() !== "") {
        try {
          parsedSettings = JSON.parse(settings);
        } catch (e) {
          throw new Error("Invalid JSON in settings",e);
        }
      }
      return api.post("/institute/apps/install", { appId, settings: parsedSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["allApps"]);
      queryClient.invalidateQueries(["installedApps"]);
      setInstallingAppId(null);
      setAppSettings("{}");
    },
    onError: (error) => {
      console.error("Install app error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to install app";
      alert("Error installing app: " + errorMessage);
    }
  });

  // Configure app mutation
  const configureAppMutation = useMutation({
    mutationFn: ({ appId, settings }) => {
      // Parse settings to ensure it's valid JSON
      let parsedSettings = {};
      if (settings && settings.trim() !== "") {
        try {
          parsedSettings = JSON.parse(settings);
        } catch (e) {
          throw new Error("Invalid JSON in settings",e);
        }
      }
      return api.put(`/institute/apps/${appId}/configure`, { settings: parsedSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["installedApps"]);
      setConfiguringAppId(null);
      setConfiguringAppSettings("{}");
    },
    onError: (error) => {
      console.error("Configure app error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to configure app";
      alert("Error configuring app: " + errorMessage);
    }
  });

  // Uninstall app mutation
  const uninstallAppMutation = useMutation({
    mutationFn: (appId) => api.delete(`/institute/apps/${appId}/uninstall`),
    onSuccess: () => {
      queryClient.invalidateQueries(["allApps"]);
      queryClient.invalidateQueries(["installedApps"]);
    },
    onError: (error) => {
      console.error("Uninstall app error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to uninstall app";
      alert("Error uninstalling app: " + errorMessage);
    }
  });

  // Toggle app status mutation
  const toggleAppStatusMutation = useMutation({
    mutationFn: ({ appId, enabled }) => 
      api.patch(`/institute/apps/${appId}/status`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries(["installedApps"]);
    },
    onError: (error) => {
      console.error("Toggle app status error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update app status";
      alert("Error updating app status: " + errorMessage);
    }
  });

  const handleInstallClick = (appId) => {
    setInstallingAppId(appId);
    setAppSettings("{}"); // Initialize with empty JSON object
  };

  const handleInstallSubmit = (e, appId) => {
    e.preventDefault();
    installAppMutation.mutate({ appId, settings: appSettings });
  };

  const handleConfigureClick = (installedApp) => {
    setConfiguringAppId(installedApp.app.id);
    setConfiguringAppSettings(JSON.stringify(installedApp.settings || {}, null, 2));
  };

  const handleConfigureSubmit = (e, appId) => {
    e.preventDefault();
    configureAppMutation.mutate({ appId, settings: configuringAppSettings });
  };

  const handleUninstall = (appId) => {
    if (window.confirm("Are you sure you want to uninstall this app? This action cannot be undone.")) {
      uninstallAppMutation.mutate(appId);
    }
  };

  const handleToggleAppStatus = (appId, currentStatus) => {
    toggleAppStatusMutation.mutate({ appId, enabled: !currentStatus });
  };

  const handleCancelInstall = () => {
    setInstallingAppId(null);
    setAppSettings("{}");
  };

  const handleCancelConfigure = () => {
    setConfiguringAppId(null);
    setConfiguringAppSettings("{}");
  };

  if (isLoadingAllApps || isLoadingInstalledApps) {
    return (
      <div className="institute-apps-container">
        <div className="loading">Loading apps...</div>
      </div>
    );
  }

  if (allAppsError || installedAppsError) {
    return (
      <div className="institute-apps-container">
        <div className="error">Error loading apps. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="institute-apps-container">
      <div className="header-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Institute Admin Panel</h2>
            <p>Welcome, {user?.name}. Manage apps for your institute.</p>
          </div>
          <button 
            onClick={() => navigate('/analytics')} 
            className="analytics-link-btn"
          >
            View Analytics
          </button>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-filter-controls">
          <input
            type="text"
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="tabs">
          <button 
            className={activeTab === "available" ? "active-tab" : ""}
            onClick={() => setActiveTab("available")}
          >
            Available Apps ({filteredAvailableApps.length})
          </button>
          <button 
            className={activeTab === "installed" ? "active-tab" : ""}
            onClick={() => setActiveTab("installed")}
          >
            Installed Apps ({filteredInstalledApps.length})
          </button>
        </div>
      </div>

      {activeTab === "available" && (
        <div className="available-apps-section">
          <h3>Available Apps</h3>
          
          {filteredAvailableApps.length === 0 ? (
            <div className="no-apps-message">
              {availableApps.length === 0 
                ? "No apps available for installation." 
                : "No apps match your search criteria."}
            </div>
          ) : (
            <div className="app-grid">
              {filteredAvailableApps.map((app) => (
                <div key={app.id} className="app-card">
                  <div className="app-header">
                    {app.logoUrl ? (
                      <img src={app.logoUrl} alt={app.name} className="app-logo" />
                    ) : (
                      <div className="app-logo-placeholder">APP</div>
                    )}
                    <div className="app-info">
                      <h4>{app.name}</h4>
                      <span className="app-category">{app.category}</span>
                    </div>
                  </div>
                  
                  <p className="app-description">{app.description}</p>
                  
                  <div className="app-actions">
                    {installingAppId === app.id ? (
                      <form onSubmit={(e) => handleInstallSubmit(e, app.id)} className="settings-form">
                        <label>App Settings (JSON):</label>
                        <div className="json-editor-wrapper">
                          <textarea
                            value={appSettings}
                            onChange={(e) => setAppSettings(e.target.value)}
                            rows="6"
                            cols="40"
                            placeholder='{"themeColor": "#00FFAA", "apiKey": "abc123", ...}'
                            className={`settings-textarea ${isValidJson(appSettings) ? '' : 'invalid-json'}`}
                          />
                          {!isValidJson(appSettings) && appSettings.trim() !== '' && (
                            <div className="json-error">Invalid JSON format</div>
                          )}
                        </div>
                        <div className="form-actions">
                          <button 
                            type="submit" 
                            disabled={installAppMutation.isLoading || !isValidJson(appSettings)}
                            className="confirm-btn"
                          >
                            {installAppMutation.isLoading ? "Installing..." : "Install App"}
                          </button>
                          <button 
                            type="button" 
                            onClick={handleCancelInstall}
                            disabled={installAppMutation.isLoading}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => handleInstallClick(app.id)}
                        className="install-btn"
                      >
                        Install App
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "installed" && (
        <div className="installed-apps-section">
          <h3>Installed Apps</h3>
          
          {filteredInstalledApps.length === 0 ? (
            <div className="no-apps-message">
              {installedApps.length === 0 
                ? "No apps installed yet." 
                : "No installed apps match your search criteria."}
            </div>
          ) : (
            <div className="app-grid">
              {filteredInstalledApps.map((installedApp) => (
                <div key={installedApp.id} className="app-card installed">
                  <div className="app-header">
                    {installedApp.app.logoUrl ? (
                      <img src={installedApp.app.logoUrl} alt={installedApp.app.name} className="app-logo" />
                    ) : (
                      <div className="app-logo-placeholder">APP</div>
                    )}
                    <div className="app-info">
                      <h4>{installedApp.app.name}</h4>
                      <span className="app-category">{installedApp.app.category}</span>
                    </div>
                  </div>
                  
                  <p className="app-description">{installedApp.app.description}</p>
                  
                  <div className="app-meta">
                    <div className="meta-item">
                      <strong>Installed:</strong> {new Date(installedApp.installedAt).toLocaleDateString()}
                    </div>
                    <div className="meta-item">
                      <strong>Status:</strong> 
                      <span className={installedApp.enabled ? "status-active" : "status-inactive"}>
                        {installedApp.enabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="app-actions">
                    {configuringAppId === installedApp.app.id ? (
                      <form onSubmit={(e) => handleConfigureSubmit(e, installedApp.app.id)} className="settings-form">
                        <label>App Settings (JSON):</label>
                        <div className="json-editor-wrapper">
                          <textarea
                            value={configuringAppSettings}
                            onChange={(e) => setConfiguringAppSettings(e.target.value)}
                            rows="6"
                            cols="40"
                            className={`settings-textarea ${isValidJson(configuringAppSettings) ? '' : 'invalid-json'}`}
                          />
                          {!isValidJson(configuringAppSettings) && configuringAppSettings.trim() !== '' && (
                            <div className="json-error">Invalid JSON format</div>
                          )}
                        </div>
                        <div className="form-actions">
                          <button 
                            type="submit" 
                            disabled={configureAppMutation.isLoading || !isValidJson(configuringAppSettings)}
                            className="confirm-btn"
                          >
                            {configureAppMutation.isLoading ? "Saving..." : "Save Settings"}
                          </button>
                          <button 
                            type="button" 
                            onClick={handleCancelConfigure}
                            disabled={configureAppMutation.isLoading}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="installed-app-actions">
                        <button 
                          onClick={() => handleConfigureClick(installedApp)}
                          className="configure-btn"
                        >
                          Configure
                        </button>
                        <button 
                          onClick={() => handleToggleAppStatus(installedApp.app.id, installedApp.enabled)}
                          className={installedApp.enabled ? "disable-btn" : "enable-btn"}
                          disabled={toggleAppStatusMutation.isLoading}
                        >
                          {toggleAppStatusMutation.isLoading 
                            ? (installedApp.enabled ? "Disabling..." : "Enabling...") 
                            : (installedApp.enabled ? "Disable" : "Enable")}
                        </button>
                        <button 
                          onClick={() => handleUninstall(installedApp.app.id)}
                          className="uninstall-btn"
                          disabled={uninstallAppMutation.isLoading}
                        >
                          {uninstallAppMutation.isLoading ? "Uninstalling..." : "Uninstall"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}