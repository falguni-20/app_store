import { useQuery, useMutation, } from "@tanstack/react-query";
import api from "../api/client";
import { useState, useEffect } from "react";
import { Link, } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import Loader from '../components/Loader';
import "./appStore.css";

export default function AppStore() {
  const user = useAuthStore(state => state.user);
  const [launchedApp, setLaunchedApp] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); 
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const limit = 10;

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); 
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const { data: installedAppsData, isLoading: isLoadingInstalledApps } = useQuery({
    queryKey: ["installedApps", currentPage, categoryFilter, debouncedSearchTerm, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", limit);
      if (categoryFilter) params.append("category", categoryFilter);
      if (debouncedSearchTerm) params.append("searchTerm", debouncedSearchTerm);
      params.append("sortBy", sortBy);

      const response = await api.get(`/apps?${params.toString()}`);
      return response.data;
    },
  });

  const installedApps = installedAppsData?.apps || [];
  const totalApps = installedAppsData?.total || 0;
  const totalPages = Math.ceil(totalApps / limit);

  const uniqueCategories = [
    ...new Set(installedApps.map((app) => app.app.category)),
  ].filter(Boolean); 

  const launchAppMutation = useMutation({
    mutationFn: (appId) => api.get(`/apps/${appId}/launch`),
    onSuccess: (data) => {
      setLaunchedApp(data.data);
    },
    onError: (error) => {
      toast.error("Error launching app: " + (error.response?.data?.message || error.message));
      setLaunchedApp(null);
    }
  });

  const closeIframe = () => {
    setLaunchedApp(null);
  };



  if (isLoadingInstalledApps) return (
    <div className="app-store-container">
      <Loader message="Loading apps..." />
    </div>
  );

  return (
    <div className="app-store-container">
      <div className="app-store-header">
        <div className="header-left">
          <h2>App Store</h2>
        </div>
        <div className="user-info">
          <p>Welcome, <strong>{user?.name}</strong></p>
        </div>
      </div>

      <div className="app-store-filters">
        <div className="filter-group">
          <label htmlFor="categoryFilter">Category:</label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="searchInput">Search:</label>
          <input
            id="searchInput"
            type="text"
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sortSelect">Sort by:</label>
          <select
            id="sortSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="installedAt">Recently Installed</option>
          </select>
        </div>
      </div>

      <div className="app-list">
        {installedApps.length === 0 ? (
          <div className="empty-state">
            <h4>No apps found</h4>
            <p>{categoryFilter || searchTerm ? "Try adjusting your filters" : "No apps are installed for your institute"}</p>
          </div>
        ) : (
          installedApps.map((installedApp) => (
            <Link to={`/apps/details/${installedApp.app.id}`} key={installedApp.id} className="app-card-link">
              <div className={`app-card ${!installedApp.enabled ? 'disabled' : ''}`}>
                <div className="app-icon">
                  <div className="app-logo-placeholder">
                    {installedApp.app.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="app-info">
                  <h3>{installedApp.app.name}</h3>
                  <div className="app-meta">
                    <span className="app-category">{installedApp.app.category}</span>
                    <span className={`app-status ${installedApp.enabled ? 'status-active' : 'status-inactive'}`}>
                      {installedApp.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="app-description">{installedApp.app.description}</p>
                  <div className="app-actions">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        launchAppMutation.mutate(installedApp.app.id);
                      }}
                      disabled={launchAppMutation.isLoading || !installedApp.enabled}
                      className="launch-btn"
                    >
                      {launchAppMutation.isLoading && launchedApp?.appId === installedApp.app.id ? "Launching..." : "Launch App"}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

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
  );
}
