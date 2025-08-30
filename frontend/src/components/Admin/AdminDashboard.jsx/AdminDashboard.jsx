import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/ApiContext';
import AdminLogin from './AdminLogin';
import KnowledgeUploadPanel from './KnowledgeUploadPanel';
import PendingReviews from './PendingReviews';
import AuditLogs from './AuditLogs';
import SystemControls from './SystemControls';

const AdminDashboard = () => {
    const api = useApi();
    const [adminInfo, setAdminInfo] = useState(null);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [pendingReviews, setPendingReviews] = useState([]);
    const [systemStatus, setSystemStatus] = useState(null);

    useEffect(() => {
        // Check if admin is already logged in
        const storedAdminInfo = localStorage.getItem('adminInfo');
        if (storedAdminInfo) {
            setAdminInfo(JSON.parse(storedAdminInfo));
            loadDashboardData();
        }
    }, []);

    const loadDashboardData = async () => {
        try {
            const [reviews, status] = await Promise.all([
                api.admin.getPendingReviews(),
                api.agentic.getSystemStatus()
            ]);
            
            setPendingReviews(reviews.pending_reviews);
            setSystemStatus(status);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const handleAdminLogin = (loginResult) => {
        setAdminInfo(loginResult.admin_info);
        localStorage.setItem('adminInfo', JSON.stringify(loginResult.admin_info));
        localStorage.setItem('adminToken', loginResult.admin_info.session_token);
        loadDashboardData();
    };

    const handleLogout = () => {
        setAdminInfo(null);
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('adminToken');
    };

    if (!adminInfo) {
        return <AdminLogin onLogin={handleAdminLogin} />;
    }

    const hasPermission = (permission) => {
        return adminInfo.permissions.includes(permission);
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>🔐 BrickBang Admin Control Center</h1>
                <div className="admin-info">
                    <span className="admin-user">
                        👤 {adminInfo.username} 
                        <span className={`admin-level level-${adminInfo.admin_level.value}`}>
                            Level {adminInfo.admin_level.value}
                        </span>
                    </span>
                    <button className="btn btn-outline-danger" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div className="admin-tabs">
                <button 
                    className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('overview')}
                >
                    📊 Overview
                </button>
                
                {hasPermission('upload_knowledge') && (
                    <button 
                        className={`tab ${selectedTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('upload')}
                    >
                        📁 Upload Knowledge
                    </button>
                )}
                
                {hasPermission('approve_knowledge') && (
                    <button 
                        className={`tab ${selectedTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('reviews')}
                    >
                        ✅ Pending Reviews ({pendingReviews.length})
                    </button>
                )}
                
                {hasPermission('view_audit_logs') && (
                    <button 
                        className={`tab ${selectedTab === 'audit' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('audit')}
                    >
                        📋 Audit Logs
                    </button>
                )}
                
                {hasPermission('system_configuration') && (
                    <button 
                        className={`tab ${selectedTab === 'system' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('system')}
                    >
                        ⚙️ System Controls
                    </button>
                )}
            </div>

            <div className="tab-content">
                {selectedTab === 'overview' && (
                    <div className="overview-panel">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Pending Reviews</h3>
                                <div className="stat-number">{pendingReviews.length}</div>
                            </div>
                            <div className="stat-card">
                                <h3>System Health</h3>
                                <div className="stat-number">
                                    {systemStatus?.system_health?.overall_health || 0}%
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>Active Projects</h3>
                                <div className="stat-number">
                                    {Object.keys(systemStatus?.active_projects || {}).length}
                                </div>
                            </div>
                        </div>
                        
                        <div className="permissions-panel">
                            <h3>Your Permissions</h3>
                            <div className="permissions-grid">
                                {adminInfo.permissions.map(permission => (
                                    <span key={permission} className="permission-badge">
                                        {permission.replace('_', ' ').toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {selectedTab === 'upload' && hasPermission('upload_knowledge') && (
                    <KnowledgeUploadPanel onUploadComplete={loadDashboardData} />
                )}
                
                {selectedTab === 'reviews' && hasPermission('approve_knowledge') && (
                    <PendingReviews 
                        reviews={pendingReviews}
                        onReviewComplete={loadDashboardData}
                    />
                )}
                
                {selectedTab === 'audit' && hasPermission('view_audit_logs') && (
                    <AuditLogs />
                )}
                
                {selectedTab === 'system' && hasPermission('system_configuration') && (
                    <SystemControls 
                        systemStatus={systemStatus}
                        onSystemUpdate={loadDashboardData}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
```