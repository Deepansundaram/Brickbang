import React, { useState, useEffect } from 'react';

const RealTimeMonitoring = ({ monitoringData }) => {
    const [activeView, setActiveView] = useState('overview');
    const [liveData, setLiveData] = useState(monitoringData || {});
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        setLiveData(monitoringData || generateSampleData());
    }, [monitoringData]);

    useEffect(() => {
        // Simulate real-time updates
        const interval = setInterval(() => {
            setLiveData(prev => ({
                ...prev,
                timestamp: new Date(),
                camera_analysis: {
                    ...prev.camera_analysis,
                    analyses: prev.camera_analysis?.analyses?.map(cam => ({
                        ...cam,
                        timestamp: new Date()
                    }))
                }
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const generateSampleData = () => {
        return {
            timestamp: new Date(),
            overall_health_score: 88,
            camera_analysis: {
                total_cameras: 8,
                active_cameras: 7,
                analyses: [
                    {
                        camera_id: 'CAM_001',
                        location: 'Foundation Area',
                        analysis: {
                            workers_detected: {
                                count: 4,
                                activities: ['concrete_pouring', 'rebar_installation'],
                                safety_compliance: { hard_hats: 4, safety_vests: 4, safety_boots: 3 }
                            },
                            equipment_detected: {
                                active: ['concrete_mixer', 'vibrating_screed'],
                                idle: ['wheelbarrow']
                            },
                            safety_violations: []
                        },
                        alerts: []
                    },
                    {
                        camera_id: 'CAM_002',
                        location: 'Framing Section',
                        analysis: {
                            workers_detected: {
                                count: 6,
                                activities: ['steel_installation', 'welding'],
                                safety_compliance: { hard_hats: 6, safety_vests: 6, safety_boots: 6 }
                            },
                            equipment_detected: {
                                active: ['crane', 'welding_equipment'],
                                idle: []
                            },
                            safety_violations: []
                        },
                        alerts: []
                    }
                ]
            },
            sensor_data: {
                temperature: 28,
                humidity: 65,
                noise_level: 78,
                air_quality: 85,
                vibration: 0.3
            },
            weather_data: {
                current_temperature: 24,
                humidity: 68,
                wind_speed: 12,
                precipitation: 0,
                conditions: 'Partly Cloudy'
            },
            equipment_status: {
                total_equipment: 12,
                active: 8,
                maintenance_needed: 1,
                equipment_list: [
                    { id: 'CRANE_001', type: 'Tower Crane', status: 'active', health: 92 },
                    { id: 'EXCAVATOR_001', type: 'Excavator', status: 'active', health: 88 },
                    { id: 'MIXER_001', type: 'Concrete Mixer', status: 'maintenance', health: 65 }
                ]
            },
            worker_activities: {
                total_workers: 24,
                active: 22,
                on_break: 2,
                productivity_score: 87,
                zones: {
                    foundation: 8,
                    framing: 6,
                    materials: 4,
                    utilities: 4
                }
            },
            material_levels: {
                concrete: { level: 85, status: 'adequate' },
                steel_rebar: { level: 92, status: 'good' },
                lumber: { level: 45, status: 'low' },
                cement: { level: 78, status: 'adequate' }
            },
            safety_status: {
                incidents_today: 0,
                safety_score: 96,
                compliance_rate: 98,
                violations: [],
                last_inspection: '2024-08-24T10:30:00Z'
            }
        };
    };

    const getHealthColor = (score) => {
        if (score >= 90) return '#28a745';
        if (score >= 75) return '#ffc107';
        if (score >= 60) return '#fd7e14';
        return '#dc3545';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': case 'good': case 'adequate':
                return '#28a745';
            case 'maintenance': case 'low': case 'warning':
                return '#ffc107';
            case 'offline': case 'critical': case 'empty':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    return (
        <div className="real-time-monitoring">
            <div className="monitoring-header">
                <h2>📹 Real-Time Construction Site Monitoring</h2>
                <div className="header-stats">
                    <div className="stat">
                        <span className="stat-value">{liveData.overall_health_score}%</span>
                        <span className="stat-label">Site Health</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{liveData.worker_activities?.active || 0}</span>
                        <span className="stat-label">Active Workers</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{liveData.camera_analysis?.active_cameras || 0}</span>
                        <span className="stat-label">Live Cameras</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{liveData.safety_status?.incidents_today || 0}</span>
                        <span className="stat-label">Incidents Today</span>
                    </div>
                </div>
            </div>

            <div className="monitoring-nav">
                <button
                    className={`nav-btn ${activeView === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveView('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`nav-btn ${activeView === 'cameras' ? 'active' : ''}`}
                    onClick={() => setActiveView('cameras')}
                >
                    📹 Camera Feeds
                </button>
                <button
                    className={`nav-btn ${activeView === 'sensors' ? 'active' : ''}`}
                    onClick={() => setActiveView('sensors')}
                >
                    🌡️ Sensors
                </button>
                <button
                    className={`nav-btn ${activeView === 'equipment' ? 'active' : ''}`}
                    onClick={() => setActiveView('equipment')}
                >
                    ⚙️ Equipment
                </button>
                <button
                    className={`nav-btn ${activeView === 'workers' ? 'active' : ''}`}
                    onClick={() => setActiveView('workers')}
                >
                    👥 Workforce
                </button>
                <button
                    className={`nav-btn ${activeView === 'safety' ? 'active' : ''}`}
                    onClick={() => setActiveView('safety')}
                >
                    🛡️ Safety
                </button>
            </div>

            <div className="monitoring-content">
                {activeView === 'overview' && (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <h3>📹 Camera Analysis</h3>
                            <div className="card-content">
                                <div className="metric">
                                    <span className="metric-value">{liveData.camera_analysis?.active_cameras || 0}/{liveData.camera_analysis?.total_cameras || 0}</span>
                                    <span className="metric-label">Cameras Online</span>
                                </div>
                                <div className="status-list">
                                    {liveData.camera_analysis?.analyses?.map((cam, index) => (
                                        <div key={index} className="status-item">
                                            <span className="status-dot status-active"></span>
                                            <span>{cam.camera_id} - {cam.location}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="overview-card">
                            <h3>🌡️ Environmental Sensors</h3>
                            <div className="card-content">
                                <div className="sensor-grid">
                                    <div className="sensor-item">
                                        <span className="sensor-icon">🌡️</span>
                                        <span className="sensor-value">{liveData.sensor_data?.temperature || 0}°C</span>
                                        <span className="sensor-label">Temperature</span>
                                    </div>
                                    <div className="sensor-item">
                                        <span className="sensor-icon">💧</span>
                                        <span className="sensor-value">{liveData.sensor_data?.humidity || 0}%</span>
                                        <span className="sensor-label">Humidity</span>
                                    </div>
                                    <div className="sensor-item">
                                        <span className="sensor-icon">🔊</span>
                                        <span className="sensor-value">{liveData.sensor_data?.noise_level || 0}dB</span>
                                        <span className="sensor-label">Noise Level</span>
                                    </div>
                                    <div className="sensor-item">
                                        <span className="sensor-icon">🍃</span>
                                        <span className="sensor-value">{liveData.sensor_data?.air_quality || 0}%</span>
                                        <span className="sensor-label">Air Quality</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overview-card">
                            <h3>👥 Workforce Status</h3>
                            <div className="card-content">
                                <div className="workforce-overview">
                                    <div className="workforce-stat">
                                        <span className="stat-number">{liveData.worker_activities?.active || 0}</span>
                                        <span className="stat-desc">Active Workers</span>
                                    </div>
                                    <div className="workforce-stat">
                                        <span className="stat-number">{liveData.worker_activities?.productivity_score || 0}%</span>
                                        <span className="stat-desc">Productivity</span>
                                    </div>
                                </div>
                                <div className="zone-distribution">
                                    {liveData.worker_activities?.zones && Object.entries(liveData.worker_activities.zones).map(([zone, count]) => (
                                        <div key={zone} className="zone-item">
                                            <span className="zone-name">{zone.charAt(0).toUpperCase() + zone.slice(1)}</span>
                                            <span className="zone-count">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="overview-card">
                            <h3>🛡️ Safety Overview</h3>
                            <div className="card-content">
                                <div className="safety-metrics">
                                    <div className="safety-metric">
                                        <span className="metric-icon">📊</span>
                                        <span className="metric-value">{liveData.safety_status?.safety_score || 0}%</span>
                                        <span className="metric-label">Safety Score</span>
                                    </div>
                                    <div className="safety-metric">
                                        <span className="metric-icon">✅</span>
                                        <span className="metric-value">{liveData.safety_status?.compliance_rate || 0}%</span>
                                        <span className="metric-label">Compliance</span>
                                    </div>
                                    <div className="safety-metric">
                                        <span className="metric-icon">⚠️</span>
                                        <span className="metric-value">{liveData.safety_status?.incidents_today || 0}</span>
                                        <span className="metric-label">Incidents</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'cameras' && (
                    <div className="cameras-view">
                        <div className="cameras-grid">
                            {liveData.camera_analysis?.analyses?.map((camera, index) => (
                                <div key={index} className="camera-feed">
                                    <div className="camera-header">
                                        <h4>{camera.camera_id}</h4>
                                        <span className="camera-location">{camera.location}</span>
                                        <span className="live-indicator">🔴 LIVE</span>
                                    </div>
                                    <div className="camera-placeholder">
                                        <div className="placeholder-icon">📹</div>
                                        <p>Live Camera Feed</p>
                                        <small>{camera.location}</small>
                                    </div>
                                    <div className="camera-analysis">
                                        <div className="analysis-item">
                                            <span className="analysis-icon">👥</span>
                                            <span>{camera.analysis?.workers_detected?.count || 0} Workers</span>
                                        </div>
                                        <div className="analysis-item">
                                            <span className="analysis-icon">⚙️</span>
                                            <span>{camera.analysis?.equipment_detected?.active?.length || 0} Equipment Active</span>
                                        </div>
                                        <div className="analysis-item">
                                            <span className="analysis-icon">🛡️</span>
                                            <span className={`safety-status ${camera.analysis?.safety_violations?.length === 0 ? 'safe' : 'violation'}`}>
                                                {camera.analysis?.safety_violations?.length === 0 ? 'Compliant' : 'Violations'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeView === 'equipment' && (
                    <div className="equipment-view">
                        <div className="equipment-summary">
                            <div className="summary-item">
                                <span className="summary-number">{liveData.equipment_status?.total_equipment || 0}</span>
                                <span className="summary-label">Total Equipment</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-number">{liveData.equipment_status?.active || 0}</span>
                                <span className="summary-label">Active</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-number">{liveData.equipment_status?.maintenance_needed || 0}</span>
                                <span className="summary-label">Needs Maintenance</span>
                            </div>
                        </div>
                        
                        <div className="equipment-list">
                            {liveData.equipment_status?.equipment_list?.map((equipment, index) => (
                                <div key={index} className="equipment-item">
                                    <div className="equipment-info">
                                        <span className="equipment-id">{equipment.id}</span>
                                        <span className="equipment-type">{equipment.type}</span>
                                    </div>
                                    <div className="equipment-status">
                                        <span 
                                            className={`status-badge status-${equipment.status}`}
                                            style={{ backgroundColor: getStatusColor(equipment.status) }}
                                        >
                                            {equipment.status}
                                        </span>
                                        <div className="health-bar">
                                            <div 
                                                className="health-fill"
                                                style={{ 
                                                    width: `${equipment.health}%`,
                                                    backgroundColor: getHealthColor(equipment.health)
                                                }}
                                            ></div>
                                        </div>
                                        <span className="health-value">{equipment.health}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeView === 'workers' && (
                    <div className="workers-view">
                        <div className="workers-summary">
                            <div className="summary-card">
                                <h4>Workforce Distribution</h4>
                                <div className="zone-chart">
                                    {liveData.worker_activities?.zones && Object.entries(liveData.worker_activities.zones).map(([zone, count]) => (
                                        <div key={zone} className="zone-bar">
                                            <span className="zone-label">{zone}</span>
                                            <div className="bar-container">
                                                <div 
                                                    className="bar-fill"
                                                    style={{ width: `${(count / (liveData.worker_activities?.total_workers || 1)) * 100}%` }}
                                                ></div>
                                                <span className="bar-value">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="summary-card">
                                <h4>Activity Status</h4>
                                <div className="activity-stats">
                                    <div className="activity-stat">
                                        <span className="stat-icon">👷</span>
                                        <span className="stat-value">{liveData.worker_activities?.active || 0}</span>
                                        <span className="stat-label">Active</span>
                                    </div>
                                    <div className="activity-stat">
                                        <span className="stat-icon">☕</span>
                                        <span className="stat-value">{liveData.worker_activities?.on_break || 0}</span>
                                        <span className="stat-label">On Break</span>
                                    </div>
                                    <div className="activity-stat">
                                        <span className="stat-icon">📈</span>
                                        <span className="stat-value">{liveData.worker_activities?.productivity_score || 0}%</span>
                                        <span className="stat-label">Productivity</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'safety' && (
                    <div className="safety-view">
                        <div className="safety-dashboard">
                            <div className="safety-score-card">
                                <h3>Overall Safety Score</h3>
                                <div className="score-circle">
                                    <span className="score-value">{liveData.safety_status?.safety_score || 0}%</span>
                                </div>
                                <p className="score-status">Excellent Safety Performance</p>
                            </div>
                            
                            <div className="safety-metrics-grid">
                                <div className="safety-metric-card">
                                    <span className="metric-icon">✅</span>
                                    <span className="metric-value">{liveData.safety_status?.compliance_rate || 0}%</span>
                                    <span className="metric-label">Compliance Rate</span>
                                </div>
                                <div className="safety-metric-card">
                                    <span className="metric-icon">⚠️</span>
                                    <span className="metric-value">{liveData.safety_status?.incidents_today || 0}</span>
                                    <span className="metric-label">Incidents Today</span>
                                </div>
                                <div className="safety-metric-card">
                                    <span className="metric-icon">🛡️</span>
                                    <span className="metric-value">{liveData.safety_status?.violations?.length || 0}</span>
                                    <span className="metric-label">Active Violations</span>
                                </div>
                            </div>

                            <div className="recent-inspections">
                                <h4>Recent Inspections</h4>
                                <div className="inspection-item">
                                    <span className="inspection-date">
                                        {new Date(liveData.safety_status?.last_inspection || Date.now()).toLocaleDateString()}
                                    </span>
                                    <span className="inspection-type">Safety Compliance Check</span>
                                    <span className="inspection-status status-passed">Passed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="monitoring-footer">
                <p>Last Updated: {new Date(liveData.timestamp).toLocaleString()}</p>
                <button className="btn btn-primary">
                    📊 Generate Report
                </button>
            </div>

            <style jsx>{`
                .real-time-monitoring {
                    padding: 20px;
                    background: #f8f9fa;
                    min-height: 100vh;
                }

                .monitoring-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 15px;
                    margin-bottom: 25px;
                }

                .monitoring-header h2 {
                    margin: 0 0 20px 0;
                    font-size: 28px;
                }

                .header-stats {
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                }

                .stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                }

                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                }

                .stat-label {
                    font-size: 12px;
                    opacity: 0.9;
                }

                .monitoring-nav {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 25px;
                    overflow-x: auto;
                    padding-bottom: 5px;
                }

                .nav-btn {
                    padding: 12px 20px;
                    border: none;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                    white-space: nowrap;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .nav-btn:hover {
                    background: #e9ecef;
                }

                .nav-btn.active {
                    background: #667eea;
                    color: white;
                }

                .monitoring-content {
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                    min-height: 500px;
                }

                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 25px;
                }

                .overview-card {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    border: 1px solid #e9ecef;
                }

                .overview-card h3 {
                    margin: 0 0 20px 0;
                    color: #333;
                    font-size: 18px;
                }

                .metric {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .metric-value {
                    display: block;
                    font-size: 32px;
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 5px;
                }

                .metric-label {
                    color: #666;
                    font-size: 14px;
                }

                .status-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px;
                    background: white;
                    border-radius: 5px;
                    font-size: 14px;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .status-active { background: #28a745; }

                .sensor-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }

                .sensor-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    text-align: center;
                }

                .sensor-icon {
                    font-size: 24px;
                }

                .sensor-value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #333;
                }

                .sensor-label {
                    font-size: 12px;
                    color: #666;
                }

                .workforce-overview {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .workforce-stat {
                    flex: 1;
                    text-align: center;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                }

                .stat-number {
                    display: block;
                    font-size: 28px;
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 5px;
                }

                .stat-desc {
                    font-size: 12px;
                    color: #666;
                }

                .zone-distribution {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .zone-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: white;
                    border-radius: 5px;
                }

                .zone-name {
                    font-size: 14px;
                    color: #333;
                }

                .zone-count {
                    font-weight: bold;
                    color: #667eea;
                }

                .safety-metrics {
                    display: flex;
                    gap: 15px;
                }

                .safety-metric {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                }

                .metric-icon {
                    font-size: 24px;
                }

                .cameras-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                }

                .camera-feed {
                    border: 1px solid #e9ecef;
                    border-radius: 10px;
                    overflow: hidden;
                    background: white;
                }

                .camera-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                }

                .camera-header h4 {
                    margin: 0;
                    color: #333;
                }

                .camera-location {
                    color: #666;
                    font-size: 14px;
                }

                .live-indicator {
                    font-size: 12px;
                    color: #dc3545;
                    font-weight: bold;
                }

                .camera-placeholder {
                    aspect-ratio: 16/9;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(45deg, #f1f1f1, #e9e9e9);
                    color: #666;
                    gap: 10px;
                }

                .placeholder-icon {
                    font-size: 48px;
                    opacity: 0.7;
                }

                .camera-analysis {
                    display: flex;
                    justify-content: space-around;
                    padding: 15px;
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                }

                .analysis-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }

                .analysis-icon {
                    font-size: 16px;
                }

                .safety-status.safe {
                    color: #28a745;
                    font-weight: bold;
                }

                .safety-status.violation {
                    color: #dc3545;
                    font-weight: bold;
                }

                .equipment-view {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }

                .equipment-summary {
                    display: flex;
                    gap: 30px;
                    justify-content: center;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }

                .summary-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .summary-number {
                    font-size: 32px;
                    font-weight: bold;
                    color: #667eea;
                }

                .summary-label {
                    font-size: 14px;
                    color: #666;
                    text-align: center;
                }

                .equipment-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .equipment-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 1px solid #e9ecef;
                }

                .equipment-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .equipment-id {
                    font-weight: bold;
                    color: #333;
                }

                .equipment-type {
                    color: #666;
                    font-size: 14px;
                }

                .equipment-status {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .health-bar {
                    width: 100px;
                    height: 8px;
                    background: #e9ecef;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .health-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s;
                }

                .health-value {
                    font-size: 14px;
                    font-weight: bold;
                    color: #333;
                }

                .workers-view {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }

                .workers-summary {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                }

                .summary-card {
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 1px solid #e9ecef;
                }

                .summary-card h4 {
                    margin: 0 0 20px 0;
                    color: #333;
                }

                .zone-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .zone-bar {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .zone-label {
                    min-width: 80px;
                    font-size: 14px;
                    color: #333;
                    text-transform: capitalize;
                }

                .bar-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #e9ecef;
                    border-radius: 10px;
                    padding: 2px;
                    min-height: 20px;
                }

                .bar-fill {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    height: 16px;
                    border-radius: 8px;
                    transition: width 0.3s;
                    min-width: 20px;
                }

                .bar-value {
                    font-size: 12px;
                    font-weight: bold;
                    color: #333;
                    margin-left: auto;
                    margin-right: 8px;
                }

                .activity-stats {
                    display: flex;
                    gap: 15px;
                }

                .activity-stat {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    text-align: center;
                }

                .stat-icon {
                    font-size: 24px;
                }

                .safety-view {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }

                .safety-dashboard {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 25px;
                    align-items: start;
                }

                .safety-score-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    padding: 30px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border-radius: 15px;
                    text-align: center;
                }

                .safety-score-card h3 {
                    margin: 0;
                    font-size: 18px;
                }

                .score-circle {
                    width: 120px;
                    height: 120px;
                    border: 8px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .score-value {
                    font-size: 32px;
                    font-weight: bold;
                }

                .score-status {
                    margin: 0;
                    font-size: 14px;
                    opacity: 0.9;
                }

                .safety-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-bottom: 25px;
                }

                .safety-metric-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 1px solid #e9ecef;
                    text-align: center;
                }

                .recent-inspections {
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 1px solid #e9ecef;
                }

                .recent-inspections h4 {
                    margin: 0 0 15px 0;
                    color: #333;
                }

                .inspection-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: white;
                    border-radius: 8px;
                }

                .inspection-date {
                    font-size: 14px;
                    color: #666;
                }

                .inspection-type {
                    flex: 1;
                    text-align: center;
                    color: #333;
                }

                .inspection-status {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .status-passed {
                    background: #d4edda;
                    color: #155724;
                }

                .monitoring-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .monitoring-footer p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                @media (max-width: 768px) {
                    .overview-grid {
                        grid-template-columns: 1fr;
                    }

                    .header-stats {
                        justify-content: center;
                        text-align: center;
                    }

                    .cameras-grid {
                        grid-template-columns: 1fr;
                    }

                    .equipment-summary {
                        flex-direction: column;
                        align-items: center;
                    }

                    .workers-summary {
                        grid-template-columns: 1fr;
                    }

                    .safety-dashboard {
                        grid-template-columns: 1fr;
                    }

                    .monitoring-footer {
                        flex-direction: column;
                        gap: 15px;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default RealTimeMonitoring;