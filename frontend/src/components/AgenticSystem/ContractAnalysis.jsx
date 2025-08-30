import React, { useState } from 'react';
import { useApi } from '../../contexts/ApiContext';

const ContractAnalysis = ({ onAnalysisComplete }) => {
    const api = useApi();
    const [contractData, setContractData] = useState({
        contractContent: '',
        projectName: '',
        clientName: '',
        projectType: 'residential'
    });
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleInputChange = (e) => {
        setContractData({
            ...contractData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setContractData({
                ...contractData,
                contractContent: e.target.result
            });
        };
        reader.readAsText(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const analyzeContract = async () => {
        if (!contractData.contractContent || !contractData.projectName || !contractData.clientName) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const analysisRequest = {
                contract_content: contractData.contractContent,
                project_name: contractData.projectName,
                client_name: contractData.clientName,
                project_type: contractData.projectType
            };

            const result = await api.agentic.analyzeContract(analysisRequest);
            setAnalysisResult(result);
            onAnalysisComplete?.();
        } catch (error) {
            console.error('Contract analysis failed:', error);
            alert('Contract analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const sampleContract = `CONSTRUCTION CONTRACT

Project: Residential Home Construction
Client: John Smith
Contractor: BrickBang Construction

SCOPE OF WORK:
- Construction of 2,500 sq ft single-family home
- Foundation: Concrete slab foundation
- Framing: Wood frame construction
- Roofing: Asphalt shingles
- Exterior: Brick veneer and vinyl siding

TIMELINE: 6 months from start date
BUDGET: $285,000

QUALITY STANDARDS:
- All work to comply with local building codes
- Materials to meet or exceed specified standards
- Professional inspections at key milestones

PAYMENT SCHEDULE:
- 10% down payment upon signing
- 25% upon foundation completion
- 25% upon framing completion
- 25% upon substantial completion
- 15% upon final completion

This is a sample contract for demonstration purposes.`;

    return (
        <div className="contract-analysis">
            <div className="analysis-header">
                <h2>📋 AI Contract Analysis & Project Planning</h2>
                <p>Upload your contract and let our Master Construction Agent analyze every detail</p>
            </div>

            {!analysisResult ? (
                <div className="analysis-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Project Name *</label>
                            <input
                                type="text"
                                name="projectName"
                                value={contractData.projectName}
                                onChange={handleInputChange}
                                placeholder="Enter project name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Client Name *</label>
                            <input
                                type="text"
                                name="clientName"
                                value={contractData.clientName}
                                onChange={handleInputChange}
                                placeholder="Enter client name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Project Type</label>
                            <select
                                name="projectType"
                                value={contractData.projectType}
                                onChange={handleInputChange}
                            >
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                                <option value="renovation">Renovation</option>
                                <option value="infrastructure">Infrastructure</option>
                            </select>
                        </div>
                    </div>

                    <div className="contract-upload">
                        <label>Contract Content *</label>
                        
                        <div className="upload-options">
                            <div
                                className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="upload-content">
                                    <div className="upload-icon">📄</div>
                                    <p>Drag and drop your contract file here</p>
                                    <p className="upload-subtext">or</p>
                                    <input
                                        type="file"
                                        id="fileUpload"
                                        accept=".txt,.pdf,.doc,.docx"
                                        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="fileUpload" className="upload-btn">
                                        Choose File
                                    </label>
                                </div>
                            </div>

                            <div className="sample-contract">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setContractData({
                                        ...contractData,
                                        contractContent: sampleContract
                                    })}
                                >
                                    Use Sample Contract
                                </button>
                            </div>
                        </div>

                        <div className="contract-text">
                            <textarea
                                name="contractContent"
                                value={contractData.contractContent}
                                onChange={handleInputChange}
                                placeholder="Or paste your contract content here..."
                                rows={15}
                                className="contract-textarea"
                            />
                        </div>
                    </div>

                    <div className="analysis-features">
                        <h3>🧠 AI Analysis Capabilities</h3>
                        <div className="features-grid">
                            <div className="feature-item">
                                <span className="feature-icon">📊</span>
                                <span>Project Scope Analysis</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💰</span>
                                <span>Budget & Financial Terms</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⏰</span>
                                <span>Timeline Requirements</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✅</span>
                                <span>Quality Standards</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⚠️</span>
                                <span>Risk Assessment</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">👥</span>
                                <span>Stakeholder Responsibilities</span>
                            </div>
                        </div>
                    </div>

                    <div className="analysis-actions">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={analyzeContract}
                            disabled={loading || !contractData.contractContent || !contractData.projectName || !contractData.clientName}
                        >
                            {loading ? '🤖 AI Agents Analyzing...' : '🔍 Analyze Contract & Plan Project'}
                        </button>
                    </div>

                    {loading && (
                        <div className="analysis-progress">
                            <div className="progress-steps">
                                <div className="progress-step">
                                    <span className="step-icon">⚡</span>
                                    <span>Master Agent analyzing contract terms...</span>
                                </div>
                                <div className="progress-step">
                                    <span className="step-icon">🏗️</span>
                                    <span>Engineering Agent validating technical specs...</span>
                                </div>
                                <div className="progress-step">
                                    <span className="step-icon">📅</span>
                                    <span>Planning Agent creating project schedule...</span>
                                </div>
                                <div className="progress-step">
                                    <span className="step-icon">🎯</span>
                                    <span>Delegating to specialized agents...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="analysis-results">
                    <div className="results-header">
                        <h3>✅ Contract Analysis Complete</h3>
                        <p>Project: <strong>{contractData.projectName}</strong></p>
                        <p>Client: <strong>{contractData.clientName}</strong></p>
                    </div>

                    <div className="results-summary">
                        <div className="summary-card">
                            <h4>🎯 Analysis Status</h4>
                            <p className="status-success">
                                {analysisResult.message || 'Contract analyzed and project planned successfully'}
                            </p>
                            <p>✅ Autonomous operations are ready to begin</p>
                        </div>

                        <div className="summary-card">
                            <h4>🤖 Agent Coordination</h4>
                            <p>All specialized agents have created comprehensive plans:</p>
                            <ul>
                                <li>📊 Master Agent: Strategic oversight and coordination</li>
                                <li>🏗️ Engineering Agent: Technical validation complete</li>
                                <li>📅 Planning Agent: Project schedule optimized</li>
                                <li>👥 HR Agent: Workforce plan ready</li>
                                <li>🔗 Supply Chain Agent: Procurement strategy set</li>
                                <li>💰 Finance Agent: Budget analysis complete</li>
                                <li>✅ Quality Agent: QA procedures established</li>
                                <li>🛡️ Safety Agent: Safety protocols activated</li>
                            </ul>
                        </div>

                        <div className="summary-card">
                            <h4>🚀 Next Steps</h4>
                            <div className="next-steps">
                                <button className="btn btn-primary">
                                    🏃‍♂️ Start Daily Operations
                                </button>
                                <button className="btn btn-secondary">
                                    📊 View Detailed Analysis
                                </button>
                                <button className="btn btn-secondary">
                                    📋 Generate Project Report
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="results-actions">
                        <button
                            className="btn btn-outline"
                            onClick={() => {
                                setAnalysisResult(null);
                                setContractData({
                                    contractContent: '',
                                    projectName: '',
                                    clientName: '',
                                    projectType: 'residential'
                                });
                            }}
                        >
                            Analyze New Contract
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .contract-analysis {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .analysis-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 10px;
                }

                .analysis-form {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .form-row {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 25px;
                }

                .form-group {
                    flex: 1;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: bold;
                    color: #333;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 5px;
                    font-size: 14px;
                    transition: border-color 0.3s;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .contract-upload {
                    margin-bottom: 30px;
                }

                .contract-upload label {
                    display: block;
                    margin-bottom: 15px;
                    font-weight: bold;
                    font-size: 16px;
                    color: #333;
                }

                .upload-options {
                    margin-bottom: 20px;
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }

                .drag-drop-zone {
                    flex: 1;
                    border: 3px dashed #ccc;
                    border-radius: 10px;
                    padding: 40px;
                    text-align: center;
                    transition: all 0.3s;
                    background: #f8f9fa;
                }

                .drag-drop-zone.active {
                    border-color: #667eea;
                    background: #e8f0fe;
                }

                .upload-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }

                .upload-icon {
                    font-size: 48px;
                    opacity: 0.6;
                }

                .upload-subtext {
                    color: #666;
                    margin: 10px 0;
                }

                .upload-btn {
                    background: #667eea;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .upload-btn:hover {
                    background: #5a6fd8;
                }

                .sample-contract {
                    flex-shrink: 0;
                }

                .contract-textarea {
                    width: 100%;
                    padding: 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 5px;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.5;
                    resize: vertical;
                }

                .contract-textarea:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .analysis-features {
                    margin: 30px 0;
                    padding: 25px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }

                .analysis-features h3 {
                    margin-top: 0;
                    margin-bottom: 20px;
                    color: #333;
                    text-align: center;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .feature-icon {
                    font-size: 20px;
                }

                .analysis-actions {
                    text-align: center;
                    margin: 30px 0;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    margin: 0 10px 10px 0;
                    transition: all 0.3s;
                    text-decoration: none;
                    display: inline-block;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                }

                .btn-primary:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn-outline {
                    background: transparent;
                    border: 2px solid #667eea;
                    color: #667eea;
                }

                .btn-large {
                    padding: 15px 30px;
                    font-size: 18px;
                }

                .analysis-progress {
                    margin: 30px 0;
                    padding: 25px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }

                .progress-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .progress-step {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    animation: pulse 2s infinite;
                }

                .step-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                @keyframes pulse {
                    0% { opacity: 0.8; }
                    50% { opacity: 1; }
                    100% { opacity: 0.8; }
                }

                .analysis-results {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .results-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: #d4edda;
                    border-radius: 10px;
                }

                .results-summary {
                    display: grid;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .summary-card {
                    padding: 25px;
                    border: 1px solid #e0e0e0;
                    border-radius: 10px;
                    background: #f8f9fa;
                }

                .summary-card h4 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #333;
                }

                .status-success {
                    color: #28a745;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .summary-card ul {
                    margin: 15px 0;
                    padding-left: 20px;
                }

                .summary-card li {
                    margin-bottom: 8px;
                }

                .next-steps {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .results-actions {
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                }

                @media (max-width: 768px) {
                    .form-row,
                    .upload-options {
                        flex-direction: column;
                    }
                    
                    .next-steps {
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default ContractAnalysis;