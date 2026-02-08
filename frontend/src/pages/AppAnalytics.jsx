import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useState } from "react";
import "./appAnalytics.css";

export default function AppAnalytics() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Fetch installed apps with usage data
  const { data: installedApps = [], isLoading, error: appsError } = useQuery({
    queryKey: ["installedAppsAnalytics"],
    queryFn: async () => {
      const response = await api.get("/analytics/apps");
      return response.data;
    },
    retry: 1,
  });

  // Fetch app usage details if an app is selected
  const { data: appUsageDetails = null, isLoading: isDetailsLoading, error: detailsError } = useQuery({
    queryKey: ["appUsageDetails", selectedApp?.id, dateRange],
    queryFn: async () => {
      if (!selectedApp) return null;
      
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const response = await api.get(`/analytics/apps/${selectedApp.id}/usage?${params}`);
      return response.data;
    },
    enabled: !!selectedApp,
    retry: 1,
  });

  if (appsError) {
    return (
      <div className="app-analytics-container">
        <div className="error">Error loading analytics data: {appsError.message}</div>
      </div>
    );
  }

  if (isLoading) return <div className="analytics-loading">Loading analytics...</div>;

  return (
    <div className="app-analytics-container">
      <h2>App Analytics & Monitoring</h2>
      
      <div className="analytics-filters">
        <div className="date-range-selector">
          <label>Start Date:</label>
          <input 
            type="date" 
            value={dateRange.start} 
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
          />
        </div>
        <div className="date-range-selector">
          <label>End Date:</label>
          <input 
            type="date" 
            value={dateRange.end} 
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
          />
        </div>
      </div>

      <div className="analytics-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{installedApps.reduce((sum, app) => sum + (app.usageCount || 0), 0)}</h3>
            <p>Total App Launches</p>
          </div>
          <div className="stat-card">
            <h3>{installedApps.length}</h3>
            <p>Installed Apps</p>
          </div>
          <div className="stat-card">
            <h3>{installedApps.filter(app => app.enabled).length}</h3>
            <p>Active Apps</p>
          </div>
        </div>
      </div>

      <div className="installed-apps-list">
        <h3>Installed Apps</h3>
        {installedApps.length === 0 ? (
          <p>No apps installed.</p>
        ) : (
          <div className="app-cards">
            {installedApps.map((app) => (
              <div 
                key={app.id} 
                className={`app-card ${selectedApp?.id === app.id ? 'selected' : ''}`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="app-header">
                  {app.app.logoUrl ? (
                    <img src={app.app.logoUrl} alt={app.app.name} className="app-logo" />
                  ) : (
                    <div className="app-logo-placeholder">APP</div>
                  )}
                  <div className="app-info">
                    <h4>{app.app.name}</h4>
                    <span className={`app-status ${app.enabled ? 'active' : 'inactive'}`}>
                      {app.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="app-stats">
                  <div className="stat">
                    <span className="stat-value">{app.usageCount || 0}</span>
                    <span className="stat-label">Launches</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{app.lastUsed ? new Date(app.lastUsed).toLocaleDateString() : 'Never'}</span>
                    <span className="stat-label">Last Used</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedApp && (
        <div className="app-details-panel">
          <h3>{selectedApp.app.name} - Usage Details</h3>
          
          {isDetailsLoading ? (
            <div className="details-loading">Loading details...</div>
          ) : appUsageDetails ? (
            <div className="app-usage-details">
              <div className="usage-metrics">
                <div className="metric">
                  <h4>Total Launches</h4>
                  <p>{appUsageDetails.totalLaunches}</p>
                </div>
                <div className="metric">
                  <h4>Unique Users</h4>
                  <p>{appUsageDetails.uniqueUsers}</p>
                </div>
                <div className="metric">
                  <h4>Avg Session Time</h4>
                  <p>{appUsageDetails.avgSessionTime}s</p>
                </div>
                <div className="metric">
                  <h4>Last Launched</h4>
                  <p>{appUsageDetails.lastLaunched ? new Date(appUsageDetails.lastLaunched).toLocaleString() : 'Never'}</p>
                </div>
              </div>
              
              <div className="usage-chart">
                <h4>Usage Over Time</h4>
                <div className="chart-placeholder">
                  {/* Chart would go here - for now just showing placeholder */}
                  <p>Usage chart visualization would appear here</p>
                </div>
              </div>
              
              <div className="recent-activity">
                <h4>Recent Activity</h4>
                <div className="activity-list">
                  {appUsageDetails.recentActivity?.slice(0, 5).map((activity, index) => (
                    <div key={index} className="activity-item">
                      <span className="timestamp">{new Date(activity.timestamp).toLocaleString()}</span>
                      <span className="user">{activity.user}</span>
                      <span className="action">{activity.action}</span>
                    </div>
                  )) || <p>No recent activity</p>}
                </div>
              </div>
            </div>
          ) : (
            <p>Select an app to view detailed analytics.</p>
          )}
        </div>
      )}
    </div>
  );
}