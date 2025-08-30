import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/ApiContext';
import CustomerConsultation from './CustomerConsultation';
import ContractAnalysis from './ContractAnalysis';
import SystemTraining from './SystemTraining';
import RealTimeMonitoring from './RealTimeMonitoring';
import ProjectOperations from './ProjectOperations';
import SystemStatus from './SystemStatus';

const AgenticControlCenter = () => {
    const api = useApi();
    const [systemStatus, setSystemStatus] = useState(null);
    const [activeProjects, setActiveProjects] = useState([]);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSystemData();
        
        // Set up real-time updates
        const interval = setInterval(loadSystemData, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const loadSystemData = async () => {
        try {
            const status = await api.agentic.getSystemStatus();
            setSystemStatus(status);
            setActiveProjects(Object.keys(status.active_projects || {}));
        } catch (error) {
            console.error('Failed to load system data:', error);
        }
    };

    const handleEmergency = async (emergencyType, projectName, description) => {
        try {
            const response = await api.agentic.handleEmergency({
                emergency_type: emergencyType,
                project_name: projectName,
                description: description
            });
            
            alert('Emergency handled autonomously!');
            loadSystemData();
        } catch (error) {
            console.error('Emergency response failed:', error);
        }
    };

    return (
        <div className="agentic-control-center">
            {/* Header */}
            <div className="control-center-header">
                <h1>🤖 BrickBang Agentic AI Control Center</h1>
                <div className="system-health">
                    <span className={`health-indicator ${systemStatus?.system_health?.overall_health > 90 ? 'excellent' : 'good'}`}>
                        System Health: {systemStatus?.system_health?.overall_health || 0}%
                    </span>
                </div>
                <button 
                    className="btn btn-danger"
                    onClick={() => handleEmergency('general', 'current_project', 'Manual emergency trigger')}
                >
                    🚨 Emergency Response
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="control-tabs">
                <button 
                    className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('overview')}
                >
                    📊 Overview
                </button>
                <button 
                    className={`tab ${selectedTab === 'consultation' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('consultation')}
                >
                    👥 Customer Consultation
                </button>
                <button 
                    className={`tab ${selectedTab === 'contract' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('contract')}
                >
                    📋 Contract Analysis
                </button>
                <button 
                    className={`tab ${selectedTab === 'operations' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('operations')}
                >
                    ⚙️ Operations
                </button>
                <button 
                    className={`tab ${selectedTab === 'training' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('training')}
                >
                    🎓 System Training
                </button>
                <button 
                    className={`tab ${selectedTab === 'monitoring' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('monitoring')}
                >
                    📹 Real-Time Monitoring
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {selectedTab === 'overview' && (
                    <SystemStatus 
                        status={systemStatus} 
                        activeProjects={activeProjects}
                        onRefresh={loadSystemData}
                    />
                )}
                
                {selectedTab === 'consultation' && (
                    <CustomerConsultation onConsultationComplete={loadSystemData} />
                )}
                
                {selectedTab === 'contract' && (
                    <ContractAnalysis onAnalysisComplete={loadSystemData} />
                )}
                
                {selectedTab === 'operations' && (
                    <ProjectOperations 
                        activeProjects={activeProjects}
                        onOperationComplete={loadSystemData}
                    />
                )}
                
                {selectedTab === 'training' && (
                    <SystemTraining onTrainingComplete={loadSystemData} />
                )}
                
                {selectedTab === 'monitoring' && (
                    <RealTimeMonitoring monitoringData={systemStatus?.monitoring_data} />
                )}
            </div>

            {/* Agent Status Grid */}
            <div className="agent-status-grid">
                <h2>🤖 Agent Status</h2>
                <div className="agents-grid">
                    {systemStatus?.agent_statuses && Object.entries(systemStatus.agent_statuses).map(([agentName, agentStatus]) => (
                        <div key={agentName} className="agent-card">
                            <h3>{agentName.replace('_', ' ').toUpperCase()}</h3>
                            <div className={`status ${agentStatus.status}`}>
                                {agentStatus.status}
                            </div>
                            <div className="performance">
                                Performance: {agentStatus.performance_score}%
                            </div>
                            <div className="last-action">
                                Last Action: {new Date(agentStatus.last_action).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgenticControlCenter;

