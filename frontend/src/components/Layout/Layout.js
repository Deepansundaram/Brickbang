import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Materials', href: '/materials', icon: '📦' },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: '🛒' },
    { name: 'Labour Management', href: '/labour', icon: '👷' },
    { name: 'Delay Risk', href: '/delay-risk', icon: '⚠️' },
    { name: 'Reports', href: '/reports', icon: '📈' },
    { name: 'File Upload', href: '/upload', icon: '📁' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.href === location.pathname);
    return currentNav ? currentNav.name : 'Construction AI Management';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">🏗️ Construction AI</h1>
          <p className="sidebar-subtitle">Management System</p>
        </div>

        <nav>
          <ul className="sidebar-nav">
            {navigation.map((item) => (
              <li key={item.name} className="nav-item">
                <Link
                  to={item.href}
                  className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-primary d-md-none mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }} // Hidden on desktop, shown on mobile via CSS
            >
              ☰
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>

          <div className="user-menu">
            <div className="user-info">
              <span>👤</span>
              <span>{user?.full_name || user?.username || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
