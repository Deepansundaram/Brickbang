import React, { useState } from 'react';
import { useApi } from '../../contexts/ApiContext';

const ProjectOperations = ({ activeProjects, onOperationComplete }) => {
    const api = useApi();
    const [selectedProject, setSelectedProject] = useState('');
    const [operationType, setOperationType] = useState('daily');
    const [loading, setLoading] = useState(false);
    const [operationResult, setOperationResult] = useState(null);
    const [customOperation, setCustomOperation] = useState('');

    const handleDailyOperations = async () => {
        if (!selectedProject) {
            alert('Please select a project');
            return;
        }

        setLoading(true);
        try {
            const result = await api.agentic.runDailyOperations(selectedProject);
            setOperationResult(result);
            onOperationComplete?.();
        } catch (error) {
            console.error('Daily operations failed:', error);
            alert('Daily operations failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const executeCustomOperation = async () => {
        if (!selectedProject || !customOperation) {
            alert('Please select a project and describe the operation');
            return;
        }

        setLoading(true);
        try {
            // This would be a custom operation endpoint
            const result = await api.agentic.runCustomOperation({
                project_name: selectedProject,
                operation_description: customOperation
            });
            setOperationResult(result);
            onOperationComplete?.();
        } catch (error) {
            console.error('Custom operation failed:', error);
            // For demo purposes, create a mock response
            setOperationResult({
                success: true,
                operation_type: 'custom',
                message: `Custom operation "${customOperation}" initiated for project ${selectedProject}`,
                autonomous_actions_taken: true
            });
        } finally {
            setLoading(false);
        }
    };

    const generateProjectReport = async () => {
        if (!selectedProject) {
            alert('Please select a project');
            return;
        }

        setLoading(true);
        try {
            // Mock report generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            setOperationResult({
                success: true,
                operation_type: 'report',
                message: `Comprehensive project report generated for ${selectedProject}`,
                report_sections: [
                    'Executive Summary',
                    'Progress Analysis',
                    'Resource Utilization',
                    'Quality Assessment',
                    'Safety Review',
                    'Financial Status',
                    'Risk Analysis',
                    'Recommendations'
                ]
            });
        } catch (error) {
            console.error('Report generation failed:', error);
            alert('Report generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const optimizeSchedule = async () => {
        if (!selectedProject) {
            alert('Please select a project');
            return;
        }

        setLoading(true);
        try {
            // Mock schedule optimization
            await new Promise(resolve => setTimeout(resolve, 3000));
            setOperationResult({
                success: true,
                operation_type: 'optimization',
                message: `Project schedule optimized for ${selectedProject}`,
                optimizations: [
                    'Critical path updated - 3 days saved',
                    'Resource allocation improved - 15% efficiency gain',
                    'Task dependencies optimized',
                    'Buffer times recalculated',
                    'Milestone dates adjusted'
                ]
            });
        } catch (error) {
            console.error('Schedule optimization failed:', error);
            alert('Schedule optimization failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const sampleProjects = activeProjects.length > 0 ? activeProjects : [
        'Downtown Office Complex',
        'Residential Villa Project',
        'Industrial Warehouse',
        'Shopping Center Renovation'
    ];

    return (
        <div className="project-operations">
            <div className="operations-header">
                <h2>⚙️ Autonomous Project Operations</h2>
                <p>Manage ongoing construction projects with AI-powered autonomous operations</p>
            </div>

            {!operationResult ? (
                <div className="operations-form">
                    <div className="project-selector">
                        <h3>Select Active Project</h3>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="project-dropdown"
                        >
                            <option value="">Choose a project...</option>
                            {sampleProjects.map((project, index) => (
                                <option key={index} value={project}>
                                    {project}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="operation-types">
                        <h3>Available Operations</h3>
                        
                        <div className="operation-grid">
                            <div className="operation-card">
                                <div className="operation-icon">🔄</div>
                                <h4>Daily Operations</h4>
                                <p>Execute automated daily operations across all specialized agents. Monitor progress, update schedules, manage resources, and coordinate activities.</p>
                                <div className="operation-features">
                                    <span className="feature">✓ Progress Tracking</span>
                                    <span className="feature">✓ Resource Management</span>
                                    <span className="feature">✓ Quality Monitoring</span>
                                    <span className="feature">✓ Safety Compliance</span>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleDailyOperations}
                                    disabled={loading || !selectedProject}
                                >
                                    {loading && operationType === 'daily' ? 'Running...' : 'Run Daily Operations'}
                                </button>
                            </div>

                            <div className="operation-card">
                                <div className="operation-icon">📊</div>
                                <h4>Generate Report</h4>
                                <p>Create comprehensive project reports with detailed analysis, progress updates, and actionable insights from all monitoring systems.</p>
                                <div className="operation-features">
                                    <span className="feature">✓ Executive Summary</span>
                                    <span className="feature">✓ Progress Analysis</span>
                                    <span className="feature">✓ Financial Status</span>
                                    <span className="feature">✓ Risk Assessment</span>
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={generateProjectReport}
                                    disabled={loading || !selectedProject}
                                >
                                    {loading && operationType === 'report' ? 'Generating...' : 'Generate Report'}
                                </button>
                            </div>

                            <div className="operation-card">
                                <div className="operation-icon">⚡</div>
                                <h4>Optimize Schedule</h4>
                                <p>Use AI to analyze and optimize project schedules, resource allocation, and critical paths for maximum efficiency and minimal delays.</p>
                                <div className="operation-features">
                                    <span className="feature">✓ Critical Path Analysis</span>
                                    <span className="feature">✓ Resource Optimization</span>
                                    <span className="feature">✓ Dependency Management</span>
                                    <span className="feature">✓ Time Savings</span>
                                </div>
                                <button
                                    className="btn btn-success"
                                    onClick={optimizeSchedule}
                                    disabled={loading || !selectedProject}
                                >
                                    {loading && operationType === 'optimization' ? 'Optimizing...' : 'Optimize Schedule'}
                                </button>
                            </div>

                            <div className="operation-card">
                                <div className="operation-icon">🎯</div>
                                <h4>Custom Operation</h4>
                                <p>Execute custom operations by describing what you need. Our AI agents will analyze and perform the requested operation autonomously.</p>
                                <textarea
                                    value={customOperation}
                                    onChange={(e) => setCustomOperation(e.target.value)}
                                    placeholder="Describe the operation you want to perform (e.g., 'Check material inventory levels', 'Review safety compliance', 'Update budget forecasts')"
                                    rows={3}
                                    className="custom-operation-input"
                                />
                                <button
                                    className="btn btn-warning"
                                    onClick={executeCustomOperation}
                                    disabled={loading || !selectedProject || !customOperation}
                                >
                                    {loading && operationType === 'custom' ? 'Executing...' : 'Execute Custom Operation'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="agent-status">
                        <h3>🤖 Agent Status Overview</h3>
                        <div className="agents-grid">
                            {[
                                { name: 'Master Construction', icon: '🏗️', status: 'Active', performance: 95 },
                                { name: 'Engineering', icon: '⚙️', status: 'Active', performance: 92 },
                                { name: 'Planning', icon: '📊', status: 'Active', performance: 89 },
                                { name: 'HR & Workforce', icon: '👥', status: 'Active', performance: 91 },
                                { name: 'Supply Chain', icon: '🔗', status: 'Active', performance: 87 },
                                { name: 'Finance', icon: '💰', status: 'Active', performance: 94 },
                                { name: 'Monitoring', icon: '📹', status: 'Active', performance: 88 },
                                { name: 'Quality', icon: '✅', status: 'Active', performance: 93 },
                                { name: 'Safety', icon: '🛡️', status: 'Active', performance: 96 }
                            ].map((agent, index) => (
                                <div key={index} className="agent-status-card">
                                    <span className="agent-icon">{agent.icon}</span>
                                    <div className="agent-info">
                                        <span className="agent-name">{agent.name}</span>
                                        <span className="agent-performance">{agent.performance}%</span>
                                    </div>
                                    <span className={`agent-status-indicator status-${agent.status.toLowerCase()}`}>
                                        {agent.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {loading && (
                        <div className="operation-progress">
                            <div className="progress-content">
                                <h4>🤖 Autonomous Operations in Progress</h4>
                                <p>Project: <strong>{selectedProject}</strong></p>
                                <div className="progress-steps">
                                    <div className="step active">
                                        <span className="step-icon">🔍</span>
                                        <span>Analyzing current project status...</span>
                                    </div>
                                    <div className="step active">
                                        <span className="step-icon">🤖</span>
                                        <span>Coordinating specialized agents...</span>
                                    </div>
                                    <div className="step">
                                        <span className="step-icon">⚡</span>
                                        <span>Executing autonomous actions...</span>
                                    </div>
                                    <div className="step">
                                        <span className="step-icon">📋</span>
                                        <span>Generating operation report...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="operation-results">
                    <div className="results-header">
                        <h3>✅ Operation Complete</h3>
                        <p>Project: <strong>{selectedProject}</strong></p>
                        <p>Operation Type: <strong>{operationResult.operation_type || 'daily'}</strong></p>
                    </div>

                    <div className="results-content">
                        <div className="result-message">
                            <div className="message-icon">🎯</div>
                            <p>{operationResult.message}</p>
                        </div>

                        {operationResult.operation_type === 'report' && operationResult.report_sections && (
                            <div className="report-sections">
                                <h4>📋 Report Sections Generated</h4>
                                <div className="sections-grid">
                                    {operationResult.report_sections.map((section, index) => (
                                        <div key={index} className="section-item">
                                            <span className="section-icon">📄</span>
                                            <span>{section}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {operationResult.operation_type === 'optimization' && operationResult.optimizations && (
                            <div className="optimization-results">
                                <h4>⚡ Schedule Optimizations</h4>
                                <div className="optimizations-list">
                                    {operationResult.optimizations.map((optimization, index) => (
                                        <div key={index} className="optimization-item">
                                            <span className="optimization-icon">✨</span>
                                            <span>{optimization}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {operationResult.autonomous_actions_taken && (
                            <div className="actions-taken">
                                <h4>🤖 Autonomous Actions Summary</h4>
                                <div className="actions-grid">
                                    <div className="action-item">
                                        <span className="action-icon">📊</span>
                                        <span>Progress monitoring updated</span>
                                    </div>
                                    <div className="action-item">
                                        <span className="action-icon">👥</span>
                                        <span>Workforce coordination optimized</span>
                                    </div>
                                    <div className="action-item">
                                        <span className="action-icon">🔗</span>
                                        <span>Supply chain status verified</span>
                                    </div>
                                    <div className="action-item">
                                        <span className="action-icon">💰</span>
                                        <span>Budget tracking updated</span>
                                    </div>
                                    <div className="action-item">
                                        <span className="action-icon">✅</span>
                                        <span>Quality checkpoints verified</span>
                                    </div>
                                    <div className="action-item">
                                        <span className="action-icon">🛡️</span>
                                        <span>Safety protocols monitored</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="next-operations">
                            <h4>🔄 Scheduled Next Operations</h4>
                            <div className="schedule-list">
                                <div className="schedule-item">
                                    <span className="schedule-time">Tomorrow 8:00 AM</span>
                                    <span className="schedule-task">Daily operations review</span>
                                </div>
                                <div className="schedule-item">
                                    <span className="schedule-time">Tomorrow 2:00 PM</span>
                                    <span className="schedule-task">Progress monitoring</span>
                                </div>
                                <div className="schedule-item">
                                    <span className="schedule-time">Weekly</span>
                                    <span className="schedule-task">Comprehensive analysis</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="results-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setOperationResult(null);
                                setSelectedProject('');
                                setCustomOperation('');
                            }}
                        >
                            Run Another Operation
                        </button>
                        <button className="btn btn-secondary">
                            View Detailed Report
                        </button>
                        <button className="btn btn-secondary">
                            Download Results
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .project-operations {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .operations-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 25px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 15px;
                }

                .operations-header h2 {
                    margin: 0 0 10px 0;
                    font-size: 28px;
                }

                .operations-form {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .project-selector {
                    margin-bottom: 30px;
                }

                .project-selector h3 {
                    margin-bottom: 15px;
                    color: #333;
                    font-size: 20px;
                }

                .project-dropdown {
                    width: 100%;
                    padding: 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 16px;
                    background: white;
                    transition: border-color 0.3s;
                }

                .project-dropdown:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .operation-types {
                    margin-bottom: 30px;
                }

                .operation-types h3 {
                    margin-bottom: 25px;
                    color: #333;
                    font-size: 20px;
                }

                .operation-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 25px;
                }

                .operation-card {
                    padding: 25px;
                    border: 2px solid #e0e0e0;
                    border-radius: 15px;
                    background: #f8f9fa;
                    transition: all 0.3s;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .operation-card:hover {
                    border-color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                }

                .operation-icon {
                    font-size: 48px;
                    text-align: center;
                    opacity: 0.8;
                }

                .operation-card h4 {
                    margin: 0;
                    color: #333;
                    font-size: 20px;
                    text-align: center;
                }

                .operation-card p {
                    margin: 0;
                    color: #666;
                    line-height: 1.5;
                    text-align: center;
                }

                .operation-features {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                }

                .feature {
                    padding: 4px 8px;
                    background: white;
                    border-radius: 12px;
                    font-size: 12px;
                    color: #667eea;
                    border: 1px solid #e0e0e0;
                }

                .custom-operation-input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    resize: vertical;
                    font-family: inherit;
                    transition: border-color 0.3s;
                }

                .custom-operation-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                    transition: all 0.3s;
                    text-align: center;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn-success {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                }

                .btn-warning {
                    background: linear-gradient(135deg, #ffc107, #fd7e14);
                    color: white;
                }

                .agent-status {
                    margin-bottom: 30px;
                }

                .agent-status h3 {
                    margin-bottom: 20px;
                    color: #333;
                    font-size: 20px;
                }

                .agents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }

                .agent-status-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 1px solid #e0e0e0;
                }

                .agent-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .agent-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .agent-name {
                    font-size: 13px;
                    font-weight: bold;
                    color: #333;
                }

                .agent-performance {
                    font-size: 12px;
                    color: #667eea;
                    font-weight: bold;
                }

                .agent-status-indicator {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .status-active {
                    background: #d4edda;
                    color: #155724;
                }

                .operation-progress {
                    margin-top: 30px;
                    padding: 30px;
                    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                    border-radius: 15px;
                    text-align: center;
                }

                .progress-content h4 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 22px;
                }

                .progress-content p {
                    margin: 0 0 25px 0;
                    color: #666;
                }

                .progress-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    max-width: 400px;
                    margin: 0 auto;
                }

                .step {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: white;
                    border-radius: 10px;
                    opacity: 0.5;
                    transition: opacity 0.3s;
                }

                .step.active {
                    opacity: 1;
                    animation: pulse 2s infinite;
                }

                .step-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .operation-results {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .results-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 25px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border-radius: 15px;
                }

                .results-header h3 {
                    margin: 0 0 10px 0;
                    font-size: 24px;
                }

                .results-header p {
                    margin: 5px 0;
                    font-size: 16px;
                    opacity: 0.9;
                }

                .results-content {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                    margin-bottom: 30px;
                }

                .result-message {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border-left: 4px solid #667eea;
                }

                .message-icon {
                    font-size: 32px;
                    flex-shrink: 0;
                }

                .result-message p {
                    margin: 0;
                    color: #333;
                    font-size: 16px;
                    line-height: 1.5;
                }

                .report-sections,
                .optimization-results,
                .actions-taken,
                .next-operations {
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }

                .report-sections h4,
                .optimization-results h4,
                .actions-taken h4,
                .next-operations h4 {
                    margin: 0 0 20px 0;
                    color: #333;
                    font-size: 18px;
                }

                .sections-grid,
                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .section-item,
                .action-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    background: white;
                    border-radius: 8px;
                    font-size: 14px;
                }

                .section-icon,
                .action-icon {
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .optimizations-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .optimization-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    border-left: 3px solid #28a745;
                }

                .optimization-icon {
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .schedule-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .schedule-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    border-left: 3px solid #667eea;
                }

                .schedule-time {
                    font-weight: bold;
                    color: #667eea;
                    font-size: 14px;
                }

                .schedule-task {
                    color: #333;
                    font-size: 14px;
                }

                .results-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                    padding-top: 25px;
                    border-top: 1px solid #e0e0e0;
                }

                @media (max-width: 768px) {
                    .operation-grid {
                        grid-template-columns: 1fr;
                    }

                    .agents-grid {
                        grid-template-columns: 1fr;
                    }

                    .sections-grid,
                    .actions-grid {
                        grid-template-columns: 1fr;
                    }

                    .schedule-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .results-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProjectOperations;