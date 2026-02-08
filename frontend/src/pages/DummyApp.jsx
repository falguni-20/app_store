import { useState, useEffect } from 'react';
import './dummyApp.css';

const DummyApp = () => {
  const [decodedToken, setDecodedToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      try {
        // Decode JWT token (without verification for demo purposes)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        setDecodedToken(JSON.parse(jsonPayload));
      } catch (error) {
        console.error('Error decoding token:', error);
        setDecodedToken({ error: 'Invalid token' });
      }
    } else {
      setDecodedToken({ error: 'No token provided' });
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="dummy-app-container">Loading app...</div>;
  }

  if (decodedToken?.error) {
    return (
      <div className="dummy-app-container">
        <h1>Error: {decodedToken.error}</h1>
        <p>Please make sure you're accessing this app through the app store.</p>
      </div>
    );
  }

  return (
    <div className="dummy-app-container">
      <header className="app-header">
        <h1>Welcome to the Dummy App!</h1>
        <p>This is a sample app demonstrating the multi-tenant app store integration.</p>
      </header>

      <section className="app-content">
        <h2>App Information</h2>
        <div className="info-card">
          <h3>User Details</h3>
          <p><strong>User ID:</strong> {decodedToken.userId}</p>
          <p><strong>Username:</strong> User {decodedToken.userId}</p>
        </div>

        <div className="info-card">
          <h3>Tenant Information</h3>
          <p><strong>Institute ID:</strong> {decodedToken.instituteId}</p>
          <p><strong>Organization ID:</strong> {decodedToken.orgId}</p>
          <p><strong>App ID:</strong> {decodedToken.appId}</p>
        </div>

        <div className="info-card">
          <h3>Permissions</h3>
          <pre>{JSON.stringify(decodedToken.permissions, null, 2)}</pre>
        </div>

        <div className="info-card">
          <h3>Settings</h3>
          <pre>{JSON.stringify(decodedToken.settings, null, 2)}</pre>
        </div>
      </section>

      <footer className="app-footer">
        <p>This app is securely integrated with the multi-tenant app store platform.</p>
        <p>All data is properly scoped to your organization and institute.</p>
      </footer>
    </div>
  );
};

export default DummyApp;