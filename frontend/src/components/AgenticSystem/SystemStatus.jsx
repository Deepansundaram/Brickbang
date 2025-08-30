import React, { useState, useEffect } from 'react';

const SystemStatus = ({ status, activeProjects, onRefresh }) => {
    const [systemMetrics, setSystemMetrics] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (status) {
            setSystemMetrics(status);
        } else {
            // Generate sample system status data
            setSystemMetrics(generateSampleStatus());
        }
    }, [status]);

    const generateSampleStatus = () => {
        return {
            system_health: {
                overall_health: 92,
                agent_performance: 95,
                monitoring_systems: 90,
                knowledge_base: 88,
                autonomous_operations: 94
            },
            agent_statuses: {
                customer_consultation: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 96,
                    current_tasks: ['Client inquiry processing', 'Proposal generation']
                },
                master: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 98,
                    current_tasks: ['Project oversight', 'Strategic planning']
                },
                engineering: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 94,
                    current_tasks: ['Structural analysis', 'Code compliance check']
                },
                planning: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 91,
                    current_tasks: ['Schedule optimization', 'Resource allocation']
                },
                hr_workforce: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 89,
                    current_tasks: ['Workforce management', 'Skills assessment']
                },
                supply_procurement: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 87,
                    current_tasks: ['Inventory monitoring', 'Supplier coordination']
                },
                finance: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 93,
                    current_tasks: ['Budget tracking', 'Cost analysis']
                },
                monitoring: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 85,
                    current_tasks: ['Site monitoring', 'Data analysis']
                },
                quality: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 97,
                    current_tasks: ['Quality inspections', 'Standard verification']
                },
                safety: {
                    status: 'active',
                    last_action: new Date(),
                    performance_score: 99,
                    current_tasks: ['Safety monitoring', 'Incident prevention']
                }
            },
            active_projects: {
                'Downtown Office Complex': {
                    status: 'in_progress',
                    progress: '68%',
                    health_score: 88,
                    last_update: new Date()
                },
                'Residential Villa Project': {
                    status: 'in_progress',
                    progress: '45%',
                    health_score: 92,
                    last_update: new Date()
                },
                'Industrial Warehouse': {
                    status: 'planning',
                    progress: '15%',
                    health_score: 95,
                    last_update: new Date()
                }
            },
            capabilities: {
                customer_consultation: true,
                contract_analysis: true,
                autonomous_operations: true,
                real_time_monitoring: true,
                multi_modal_learning: true,
                predictive_analytics: true
            },
            monitoring_data: {
                total_cameras: 8,
                active_sensors: 24,
                equipment_tracked: 15,
                workers_monitored: 32,
                safety_incidents_today: 0
            },
            timestamp: new Date()
        };
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            onRefresh?.();
            setSystemMetrics(generateSampleStatus());
        } finally {
            setRefreshing(false);
        }
    };

    const getHealthColor = (score) => {
        if (score >= 95) return '#28a745';
        if (score >= 85) return '#20c997';
        if (score >= 75) return '#ffc107';
        if (score >= 60) return '#fd7e14';
        return '#dc3545';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': case 'in_progress': return '#28a745';
            case 'maintenance': case 'planning': return '#ffc107';
            case 'offline': case 'error': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (!systemMetrics) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading system status...</p>
            </div>
        );
    }

    return (
        <div className="system-status">
            <div className="status-header">
                <h2>🤖 BrickBang AI System Status</h2>
                <div className="header-actions">
                    <div className="last-update">
                        Last updated: {new Date(systemMetrics.timestamp).toLocaleString()}
                    </div>
                    <button 
                        className="btn btn-refresh"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
                    </button>
                </div>
            </div>

            <div className="status-overview">
                <div className="overview-card main-health">
                    <div className="health-score">
                        <div className="score-circle">
                            <span 
                                className="score-value"
                                style={{ color: getHealthColor(systemMetrics.system_health?.overall_health || 0) }}
                            >
                                {systemMetrics.system_health?.overall_health || 0}%
                            </span>
                        </div>
                        <h3>Overall System Health</h3>
                        <p className="health-status">
                            {systemMetrics.system_health?.overall_health >= 95 ? 'Excellent' :
                             systemMetrics.system_health?.overall_health >= 85 ? 'Good' :
                             systemMetrics.system_health?.overall_health >= 75 ? 'Fair' : 'Needs Attention'}
                        </p>
                    </div>
                </div>

                <div className="overview-card">
                    <h3>📊 System Components</h3>
                    <div className="component-metrics">
                        {systemMetrics.system_health && Object.entries(systemMetrics.system_health)
                            .filter(([key]) => key !== 'overall_health')
                            .map(([key, value]) => (
                            <div key={key} className="component-item">
                                <span className="component-name">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <div className="component-bar">
                                    <div 
                                        className="component-fill"
                                        style={{ 
                                            width: `${value}%`,
                                            backgroundColor: getHealthColor(value)
                                        }}
                                    ></div>
                                </div>
                                <span className="component-value">{value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overview-card">
                    <h3>🏗️ Active Projects</h3>
                    <div className="projects-summary">
                        <div className="summary-stat">
                            <span className="stat-number">{Object.keys(systemMetrics.active_projects || {}).length}</span>
                            <span className="stat-label">Total Projects</span>
                        </div>
                        <div className="projects-list">
                            {systemMetrics.active_projects && Object.entries(systemMetrics.active_projects).map(([name, project]) => (
                                <div key={name} className="project-item">
                                    <div className="project-info">
                                        <span className="project-name">{name}</span>
                                        <span className="project-progress">{project.progress}</span>
                                    </div>
                                    <div className="project-health">
                                        <span 
                                            className="health-indicator"
                                            style={{ backgroundColor: getHealthColor(project.health_score) }}
                                        ></span>
                                        <span className="health-score">{project.health_score}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overview-card">
                    <h3>📹 Monitoring Data</h3>
                    <div className="monitoring-stats">
                        <div className="monitoring-stat">
                            <span className="stat-icon">📹</span>
                            <div className="stat-info">
                                <span className="stat-value">{systemMetrics.monitoring_data?.total_cameras || 0}</span>
                                <span className="stat-desc">Cameras</span>
                            </div>
                        </div>
                        <div className="monitoring-stat">
                            <span className="stat-icon">🌡️</span>
                            <div className="stat-info">
                                <span className="stat-value">{systemMetrics.monitoring_data?.active_sensors || 0}</span>
                                <span className="stat-desc">Sensors</span>
                            </div>
                        </div>
                        <div className="monitoring-stat">
                            <span className="stat-icon">⚙️</span>
                            <div className="stat-info">
                                <span className="stat-value">{systemMetrics.monitoring_data?.equipment_tracked || 0}</span>
                                <span className="stat-desc">Equipment</span>
                            </div>
                        </div>
                        <div className="monitoring-stat">
                            <span className="stat-icon">👥</span>
                            <div className="stat-info">
                                <span className="stat-value">{systemMetrics.monitoring_data?.workers_monitored || 0}</span>
                                <span className="stat-desc">Workers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="agents-status">
                <h3>🤖 AI Agents Status</h3>
                <div className="agents-grid">
                    {systemMetrics.agent_statuses && Object.entries(systemMetrics.agent_statuses).map(([agentName, agentData]) => (
                        <div key={agentName} className="agent-card">
                            <div className="agent-header">
                                <div className="agent-title">
                                    <span className="agent-icon">
                                        {agentName === 'customer_consultation' ? '🤝' :
                                         agentName === 'master' ? '🏗️' :
                                         agentName === 'engineering' ? '⚙️' :
                                         agentName === 'planning' ? '📊' :
                                         agentName === 'hr_workforce' ? '👥' :
                                         agentName === 'supply_procurement' ? '🔗' :
                                         agentName === 'finance' ? '💰' :
                                         agentName === 'monitoring' ? '📹' :
                                         agentName === 'quality' ? '✅' :
                                         agentName === 'safety' ? '🛡️' : '🤖'}
                                    </span>
                                    <h4>{agentName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                </div>
                                <span 
                                    className="agent-status"
                                    style={{ backgroundColor: getStatusColor(agentData.status) }}
                                >
                                    {agentData.status}
                                </span>
                            </div>
                            
                            <div className="agent-metrics">
                                <div className="performance-score">
                                    <span className="metric-label">Performance</span>
                                    <div className="performance-bar">
                                        <div 
                                            className="performance-fill"
                                            style={{ 
                                                width: `${agentData.performance_score}%`,
                                                backgroundColor: getHealthColor(agentData.performance_score)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="metric-value">{agentData.performance_score}%</span>
                                </div>
                                
                                <div className="last-action">
                                    <span className="metric-label">Last Action</span>
                                    <span className="metric-value">
                                        {new Date(agentData.last_action).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>

                            {agentData.current_tasks && agentData.current_tasks.length > 0 && (
                                <div className="current-tasks">
                                    <span className="tasks-label">Current Tasks</span>
                                    <div className="tasks-list">
                                        {agentData.current_tasks.map((task, index) => (
                                            <span key={index} className="task-item">{task}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="capabilities-section">
                <h3>🚀 System Capabilities</h3>
                <div className="capabilities-grid">
                    {systemMetrics.capabilities && Object.entries(systemMetrics.capabilities).map(([capability, available]) => (
                        <div key={capability} className={`capability-item ${available ? 'available' : 'unavailable'}`}>
                            <span className="capability-icon">
                                {available ? '✅' : '❌'}
                            </span>
                            <span className="capability-name">
                                {capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="safety-overview">
                <h3>🛡️ Safety Status</h3>
                <div className="safety-card">
                    <div className="safety-stat">
                        <span className="safety-number">{systemMetrics.monitoring_data?.safety_incidents_today || 0}</span>
                        <span className="safety-label">Incidents Today</span>
                    </div>
                    <div className="safety-message">
                        {(systemMetrics.monitoring_data?.safety_incidents_today || 0) === 0 
                            ? "🎉 Zero incidents today - Excellent safety performance!"
                            : "⚠️ Safety attention required"}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .system-status {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .status-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 15px;
                }

                .status-header h2 {
                    margin: 0;
                    font-size: 28px;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .last-update {
                    font-size: 14px;
                    opacity: 0.9;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                }

                .btn-refresh {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                }

                .btn-refresh:hover:not(:disabled) {
                    background: rgba(255,255,255,0.3);
                }

                .btn-refresh:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .status-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 25px;
                    margin-bottom: 40px;
                }

                .overview-card {
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border: 1px solid #e0e0e0;
                }

                .main-health {
                    grid-column: span 1;
                }

                .overview-card h3 {
                    margin: 0 0 20px 0;
                    color: #333;
                    font-size: 18px;
                }

                .health-score {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                    text-align: center;
                }

                .score-circle {
                    width: 120px;
                    height: 120px;
                    border: 8px solid #e9ecef;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8f9fa;
                }

                .score-value {
                    font-size: 32px;
                    font-weight: bold;
                }

                .health-score h3 {
                    margin: 0;
                    color: #333;
                }

                .health-status {
                    margin: 0;
                    color: #666;
                    font-weight: bold;
                }

                .component-metrics {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .component-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .component-name {
                    min-width: 100px;
                    font-size: 14px;
                    color: #333;
                }

                .component-bar {
                    flex: 1;
                    height: 8px;
                    background: #e9ecef;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .component-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s;
                }

                .component-value {
                    min-width: 40px;
                    text-align: right;
                    font-size: 14px;
                    font-weight: bold;
                    color: #333;
                }

                .projects-summary {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .summary-stat {
                    text-align: center;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .stat-number {
                    display: block;
                    font-size: 32px;
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 5px;
                }

                .stat-label {
                    color: #666;
                    font-size: 14px;
                }

                .projects-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .project-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .project-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .project-name {
                    font-size: 14px;
                    font-weight: bold;
                    color: #333;
                }

                .project-progress {
                    font-size: 12px;
                    color: #666;
                }

                .project-health {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .health-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .health-score {
                    font-size: 12px;
                    font-weight: bold;
                    color: #333;
                }

                .monitoring-stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }

                .monitoring-stat {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .stat-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .stat-value {
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                }

                .stat-desc {
                    font-size: 12px;
                    color: #666;
                }

                .agents-status {
                    margin-bottom: 40px;
                }

                .agents-status h3 {
                    margin-bottom: 25px;
                    color: #333;
                    font-size: 24px;
                    text-align: center;
                }

                .agents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 20px;
                }

                .agent-card {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border: 1px solid #e0e0e0;
                    transition: all 0.3s;
                }

                .agent-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                }

                .agent-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .agent-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .agent-icon {
                    font-size: 24px;
                }

                .agent-title h4 {
                    margin: 0;
                    color: #333;
                    font-size: 16px;
                }

                .agent-status {
                    padding: 4px 12px;
                    border-radius: 12px;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .agent-metrics {
                    margin-bottom: 15px;
                }

                .performance-score {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .performance-bar {
                    flex: 1;
                    height: 6px;
                    background: #e9ecef;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .performance-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.3s;
                }

                .metric-label {
                    font-size: 12px;
                    color: #666;
                    min-width: 80px;
                }

                .metric-value {
                    font-size: 12px;
                    font-weight: bold;
                    color: #333;
                    min-width: 40px;
                    text-align: right;
                }

                .last-action {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .current-tasks {
                    padding-top: 15px;
                    border-top: 1px solid #e9ecef;
                }

                .tasks-label {
                    display: block;
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 8px;
                }

                .tasks-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .task-item {
                    padding: 4px 8px;
                    background: #e9f4ff;
                    color: #0056b3;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: bold;
                }

                .capabilities-section {
                    margin-bottom: 40px;
                }

                .capabilities-section h3 {
                    margin-bottom: 20px;
                    color: #333;
                    font-size: 20px;
                    text-align: center;
                }

                .capabilities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }

                .capability-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    border: 1px solid #e0e0e0;
                }

                .capability-item.available {
                    border-color: #28a745;
                }

                .capability-item.unavailable {
                    border-color: #dc3545;
                    opacity: 0.7;
                }

                .capability-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .capability-name {
                    font-size: 14px;
                    color: #333;
                }

                .safety-overview h3 {
                    margin-bottom: 20px;
                    color: #333;
                    font-size: 20px;
                    text-align: center;
                }

                .safety-card {
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border: 1px solid #e0e0e0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .safety-stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .safety-number {
                    font-size: 48px;
                    font-weight: bold;
                    color: #28a745;
                }

                .safety-label {
                    color: #666;
                    font-size: 14px;
                }

                .safety-message {
                    font-size: 18px;
                    font-weight: bold;
                    color: #28a745;
                    text-align: center;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 400px;
                    gap: 20px;
                }

                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .status-header {
                        flex-direction: column;
                        gap: 15px;
                        text-align: center;
                    }

                    .status-overview {
                        grid-template-columns: 1fr;
                    }

                    .agents-grid {
                        grid-template-columns: 1fr;
                    }

                    .capabilities-grid {
                        grid-template-columns: 1fr;
                    }

                    .monitoring-stats {
                        grid-template-columns: 1fr;
                    }

                    .safety-card {
                        flex-direction: column;
                        gap: 20px;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default SystemStatus;