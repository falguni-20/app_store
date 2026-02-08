import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import './userSettings.css';

const UserSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuthStore();

  // Mock state for form values
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleSave = () => {
    // In a real app, this would make an API call
    alert('Settings saved successfully!');
  };

  return (
    <div className="user-settings-container">
      <div className="settings-header">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back
        </button>
        <h1>User Settings</h1>
        <p>Manage your profile, preferences, and account settings</p>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={activeTab === 'preferences' ? 'active' : ''}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
            <button 
              className={activeTab === 'notifications' ? 'active' : ''}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button 
              className={activeTab === 'security' ? 'active' : ''}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </nav>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Avatar</label>
                <div className="avatar-upload">
                  <div className="current-avatar">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${profile.name}&background=random`} 
                      alt="Avatar" 
                      className="avatar-preview"
                    />
                  </div>
                  <button className="change-avatar-btn">Change Avatar</button>
                </div>
              </div>
              
              <button className="save-btn" onClick={handleSave}>Save Changes</button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Preferences</h2>
              
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={profile.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  value={profile.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time (ET)</option>
                  <option value="CST">Central Time (CT)</option>
                  <option value="MST">Mountain Time (MT)</option>
                  <option value="PST">Pacific Time (PT)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Theme</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input type="radio" name="theme" value="light" defaultChecked /> 
                    Light Theme
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="theme" value="dark" /> 
                    Dark Theme
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="theme" value="auto" /> 
                    Auto (System)
                  </label>
                </div>
              </div>
              
              <button className="save-btn" onClick={handleSave}>Save Preferences</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              
              <div className="notification-setting">
                <div className="notification-info">
                  <h3>Email Notifications</h3>
                  <p>Receive updates and alerts via email</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={profile.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="notification-setting">
                <div className="notification-info">
                  <h3>Push Notifications</h3>
                  <p>Receive notifications in your browser</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={profile.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="notification-setting">
                <div className="notification-info">
                  <h3>SMS Notifications</h3>
                  <p>Receive critical alerts via SMS</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={profile.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <button className="save-btn" onClick={handleSave}>Save Notification Settings</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="security-option">
                <div className="security-info">
                  <h3>Change Password</h3>
                  <p>Update your account password</p>
                </div>
                <button className="action-btn">Change Password</button>
              </div>
              
              <div className="security-option">
                <div className="security-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="action-btn">Setup 2FA</button>
              </div>
              
              <div className="security-option">
                <div className="security-info">
                  <h3>Active Sessions</h3>
                  <p>Manage devices where you're logged in</p>
                </div>
                <button className="action-btn">View Sessions</button>
              </div>
              
              <div className="security-option">
                <div className="security-info">
                  <h3>Account Recovery</h3>
                  <p>Set up recovery options for your account</p>
                </div>
                <button className="action-btn">Setup Recovery</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;