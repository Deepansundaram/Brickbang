import React from 'react';

const Settings = () => {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⚙️ Settings</h3>
        </div>
        <div className="card-body">
          <h5>User Management</h5>
          <p>Manage user accounts and permissions.</p>
          <button className="btn btn-primary mb-3">Manage Users</button>

          <h5>Project Configuration</h5>
          <p>Configure project settings and preferences.</p>
          <button className="btn btn-success mb-3">Project Settings</button>

          <h5>Notification Preferences</h5>
          <p>Set up alerts and notifications.</p>
          <button className="btn btn-warning">Notification Settings</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;