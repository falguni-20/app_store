import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useTenantStore } from "../store/tenantStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from '../components/Loader';
import "./instituteApps.css";

// Helper function to validate JSON
const isValidJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    console.log(e)
    return false;
  }
};

export default function InstituteApps() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { orgId, instituteId, setTenant } = useTenantStore(state => state);
  
  // Ensure the instituteId is set for institute admins
  useEffect(() => {
    if (user && !instituteId) {
      // Find the first institute associated with the user that has INSTITUTE_ADMIN role
      const instituteAdminInst = user.institutes?.find(inst => 
        inst.role === "INSTITUTE_ADMIN"
      );
      
      if (instituteAdminInst) {
        // Set the tenant context with the institute ID
        setTenant({
          orgId: instituteAdminInst.organizationId,
          instituteId: instituteAdminInst.instituteId
        });
      } else if (user.institutes?.length > 0) {
        // If no specific institute admin role, use the first institute
        setTenant({
          orgId: user.institutes[0].organizationId,
          instituteId: user.institutes[0].instituteId
        });
      }
    }
  }, [user, instituteId, orgId, setTenant]);
  const [installingAppId, setInstallingAppId] = useState(null);
  const [appSettings, setAppSettings] = useState("{}");
  const [configuringAppId, setConfiguringAppId] = useState(null);
  const [configuringAppSettings, setConfiguringAppSettings] = useState("{}");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("available"); // available or installed

  // Pagination state for available apps
  const [availableAppsPage, setAvailableAppsPage] = useState(1);
  const [availableAppsLimit, setAvailableAppsLimit] = useState(10);
  
  // Fetch all apps for installation with pagination
  const { data: allAppsResult, isLoading: isLoadingAllApps, error: allAppsError } = useQuery({
    queryKey: ["allApps", availableAppsPage, availableAppsLimit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", availableAppsPage);
      params.append("limit", availableAppsLimit);
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchTerm) params.append("searchTerm", searchTerm);
      
      const response = await api.get(`/view/apps?${params.toString()}`);
      return response.data;
    },
    retry: 1,
    enabled: !!orgId && !!instituteId, // Only run query when tenant context is set
  });
  
  const allApps = allAppsResult?.apps || [];
  const totalAvailableApps = allAppsResult?.total || 0;
  const totalAvailablePages = allAppsResult?.totalPages || 1;

  // Pagination state for installed apps
  const [installedAppsPage, setInstalledAppsPage] = useState(1);
  const [installedAppsLimit, setInstalledAppsLimit] = useState(10);
  
  // Fetch apps installed in the current institute with pagination
  const { data: installedAppsResult, isLoading: isLoadingInstalledApps, error: installedAppsError } = useQuery({
    queryKey: ["installedApps", installedAppsPage, installedAppsLimit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", installedAppsPage);
      params.append("limit", installedAppsLimit);
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchTerm) params.append("searchTerm", searchTerm);
      
      const response = await api.get(`/apps?${params.toString()}`);
      return response.data;
    },
    retry: 1,
    enabled: !!orgId && !!instituteId, // Only run query when tenant context is set
  });
  
  const installedApps = installedAppsResult?.apps || [];
  const totalInstalledApps = installedAppsResult?.total || 0;
  const totalInstalledPages = installedAppsResult?.totalPages || 1;

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

  // Get unique categories for filtering from both available and installed apps
  const allCategories = [
    ...allApps.map(app => app.category),
    ...installedApps.map(installedApp => installedApp.app.category)
  ];
  const categories = [...new Set(allCategories)];

  // Install app mutation
  const installAppMutation = useMutation({
    mutationFn: ({ appId, settings }) => {
      // Parse settings to ensure it's valid JSON
      let parsedSettings = {};
      if (settings && settings.trim() !== "") {
        try {
          parsedSettings = JSON.parse(settings);
        } catch (e) {
          throw new Error("Invalid JSON in settings", e);
        }
      }
      return api.post("/institute/apps/install", { appId, settings: parsedSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["allApps"]);
      queryClient.invalidateQueries(["installedApps"]);
      setInstallingAppId(null);
      setAppSettings("{}");
      toast.success("App installed successfully!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to install app";
      toast.error("Error installing app: " + errorMessage);
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
          throw new Error("Invalid JSON in settings", e);
        }
      }
      return api.put(`/institute/apps/${appId}/configure`, { settings: parsedSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["installedApps"]);
      setConfiguringAppId(null);
      setConfiguringAppSettings("{}");
      toast.success("App configured successfully!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to configure app";
      toast.error("Error configuring app: " + errorMessage);
    }
  });

  // Uninstall app mutation
  const uninstallAppMutation = useMutation({
    mutationFn: (appId) => api.delete(`/institute/apps/${appId}/uninstall`),
    onSuccess: () => {
      queryClient.invalidateQueries(["allApps"]);
      queryClient.invalidateQueries(["installedApps"]);
      toast.success("App uninstalled successfully!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to uninstall app";
      toast.error("Error uninstalling app: " + errorMessage);
    }
  });

  // Toggle app status mutation
  const toggleAppStatusMutation = useMutation({
    mutationFn: ({ appId, enabled }) =>
      api.patch(`/institute/apps/${appId}/status`, { enabled }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["installedApps"]);
      toast.success(`App ${data.enabled ? 'enabled' : 'disabled'} successfully!`);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update app status";
      toast.error("Error updating app status: " + errorMessage);
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
    toast((t) => (
      <div className="toast-confirm">
        Are you sure you want to uninstall this app? This action cannot be undone.
        <div className="toast-buttons">
          <button 
            className="toast-confirm-btn confirm"
            onClick={() => {
              uninstallAppMutation.mutate(appId);
              toast.dismiss(t.id);
            }}
          >
            Yes
          </button>
          <button 
            className="toast-confirm-btn cancel"
            onClick={() => toast.dismiss(t.id)}
          >
            No
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-center"
    });
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



  // Check if tenant context is not yet set
  if (!orgId || !instituteId) {
    return (
      <div className="institute-apps-container">
        <div className="loading-tenant-context">
          <p>Setting up tenant context...</p>
          <p>Please make sure you have institute admin privileges.</p>
        </div>
      </div>
    );
  }

  if (isLoadingAllApps || isLoadingInstalledApps) {
    return (
      <div className="institute-apps-container">
        <Loader message="Loading apps..." />
      </div>
    );
  }

  if (allAppsError || installedAppsError) {
    toast.error("Error loading apps. Please try again later.");
    return (
      <div className="institute-apps-container">
        <div className="error">Failed to load apps.</div>
      </div>
    );
  }

  return (
    <div className="institute-apps-container">
      <div className="header-section">
        <div>
          <h2>Institute Admin Panel</h2>
          <p>Welcome, {user?.name}. Manage apps for your institute.</p>
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
            onClick={() => {
              setActiveTab("available");
              setAvailableAppsPage(1); // Reset to first page when switching tabs
            }}
          >
            Available Apps ({totalAvailableApps})
          </button>
          <button
            className={activeTab === "installed" ? "active-tab" : ""}
            onClick={() => {
              setActiveTab("installed");
              setInstalledAppsPage(1); // Reset to first page when switching tabs
            }}
          >
            Installed Apps ({totalInstalledApps})
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
                    <div className="app-logo-placeholder">APP</div>
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
                    <div className="app-logo-placeholder">APP</div>
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