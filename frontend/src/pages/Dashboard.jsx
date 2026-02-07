import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api/client";
import "./dashboard.css";

export default function Dashboard() {
  const [iframeUrl, setIframeUrl] = useState(""); // For launched app iframe

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
    }
  };

  if (isLoading) return <div className="loading">Loading apps...</div>;
  if (error) return <div className="error">Failed to load apps</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Installed Apps</h2>

      <div className="apps-grid">
        {apps.map((a) => (
          <div className="app-card" key={a.id}>
            {a.app.logoUrl && (
              <img
                src={a.app.logoUrl}
                alt={a.app.name}
                className="app-logo"
              />
            )}
            <h3 className="app-name">{a.app.name}</h3>
            <p className="app-category">{a.app.category}</p>
            <div className="app-buttons">
              <button
                className="launch-btn"
                onClick={() => launchApp(a)}
              >
                Launch
              </button>
              <button className="settings-btn">Settings</button>
            </div>
          </div>
        ))}
      </div>

      {iframeUrl && (
        <div className="iframe-container">
          <h3>App Preview</h3>
          <iframe
            src={iframeUrl}
            title="App Preview"
            style={{
              width: "100%",
              height: "600px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              marginTop: "20px",
            }}
          />
        </div>
      )}
    </div>
  );
}
