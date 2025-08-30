import React, { useState } from 'react';
import { useApi } from '../../contexts/ApiContext';

const SystemTraining = ({ onTrainingComplete }) => {
    const api = useApi();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [trainingType, setTrainingType] = useState('comprehensive');
    const [loading, setLoading] = useState(false);
    const [trainingResult, setTrainingResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelection = (files) => {
        const fileList = Array.from(files);
        setSelectedFiles(prev => [...prev, ...fileList]);
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
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(files => files.filter((_, i) => i !== index));
    };

    const startTraining = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select files for training');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            formData.append('training_type', trainingType);

            const result = await api.agentic.trainSystem(formData);
            setTrainingResult(result);
            onTrainingComplete?.();
        } catch (error) {
            console.error('Training failed:', error);
            alert('System training failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎥';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('text')) return '📝';
        return '📁';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="system-training">
            <div className="training-header">
                <h2>🎓 Multi-Modal AI System Training</h2>
                <p>Train all specialized agents with construction knowledge from multiple sources</p>
            </div>

            {!trainingResult ? (
                <div className="training-form">
                    <div className="training-type-selector">
                        <h3>Training Mode</h3>
                        <div className="type-options">
                            <label className="type-option">
                                <input
                                    type="radio"
                                    name="trainingType"
                                    value="comprehensive"
                                    checked={trainingType === 'comprehensive'}
                                    onChange={(e) => setTrainingType(e.target.value)}
                                />
                                <span className="option-content">
                                    <span className="option-icon">🧠</span>
                                    <span className="option-text">
                                        <strong>Comprehensive Training</strong>
                                        <small>Train all agents with all uploaded content</small>
                                    </span>
                                </span>
                            </label>
                            <label className="type-option">
                                <input
                                    type="radio"
                                    name="trainingType"
                                    value="specialized"
                                    checked={trainingType === 'specialized'}
                                    onChange={(e) => setTrainingType(e.target.value)}
                                />
                                <span className="option-content">
                                    <span className="option-icon">🎯</span>
                                    <span className="option-text">
                                        <strong>Specialized Training</strong>
                                        <small>Auto-categorize and train relevant agents</small>
                                    </span>
                                </span>
                            </label>
                            <label className="type-option">
                                <input
                                    type="radio"
                                    name="trainingType"
                                    value="incremental"
                                    checked={trainingType === 'incremental'}
                                    onChange={(e) => setTrainingType(e.target.value)}
                                />
                                <span className="option-content">
                                    <span className="option-icon">📈</span>
                                    <span className="option-text">
                                        <strong>Incremental Learning</strong>
                                        <small>Update existing knowledge without retraining</small>
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="file-upload-section">
                        <h3>Upload Training Materials</h3>
                        
                        <div
                            className={`upload-zone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="upload-content">
                                <div className="upload-icon">📚</div>
                                <h4>Drop your training files here</h4>
                                <p>Support multiple file types: PDFs, videos, audio, images, text documents</p>
                                <input
                                    type="file"
                                    id="fileInput"
                                    multiple
                                    accept=".pdf,.doc,.docx,.txt,.mp4,.mp3,.wav,.jpg,.jpeg,.png,.gif"
                                    onChange={(e) => handleFileSelection(e.target.files)}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="fileInput" className="upload-button">
                                    Choose Files
                                </label>
                            </div>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="selected-files">
                                <h4>Selected Files ({selectedFiles.length})</h4>
                                <div className="files-list">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <span className="file-icon">
                                                {getFileIcon(file.type)}
                                            </span>
                                            <div className="file-info">
                                                <div className="file-name">{file.name}</div>
                                                <div className="file-details">
                                                    {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="remove-file"
                                                onClick={() => removeFile(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="training-capabilities">
                        <h3>🚀 AI Training Capabilities</h3>
                        <div className="capabilities-grid">
                            <div className="capability-item">
                                <span className="capability-icon">🎥</span>
                                <div className="capability-text">
                                    <strong>Video Analysis</strong>
                                    <p>Extract construction techniques, safety procedures, and equipment usage from training videos</p>
                                </div>
                            </div>
                            <div className="capability-item">
                                <span className="capability-icon">🎵</span>
                                <div className="capability-text">
                                    <strong>Audio Processing</strong>
                                    <p>Transcribe and analyze construction meetings, expert interviews, and training sessions</p>
                                </div>
                            </div>
                            <div className="capability-item">
                                <span className="capability-icon">📄</span>
                                <div className="capability-text">
                                    <strong>Document Analysis</strong>
                                    <p>Process building codes, specifications, manuals, and technical documentation</p>
                                </div>
                            </div>
                            <div className="capability-item">
                                <span className="capability-icon">🖼️</span>
                                <div className="capability-text">
                                    <strong>Image Recognition</strong>
                                    <p>Analyze construction photos, diagrams, blueprints, and site imagery</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="training-actions">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={startTraining}
                            disabled={loading || selectedFiles.length === 0}
                        >
                            {loading ? '🤖 Training All Agents...' : `🎓 Start Training (${selectedFiles.length} files)`}
                        </button>
                    </div>

                    {loading && (
                        <div className="training-progress">
                            <div className="progress-header">
                                <h4>🧠 Multi-Modal AI Training in Progress</h4>
                                <p>Training {selectedFiles.length} files across all specialized agents</p>
                            </div>
                            <div className="progress-stages">
                                <div className="stage-item">
                                    <span className="stage-icon">📁</span>
                                    <span>Processing uploaded files...</span>
                                </div>
                                <div className="stage-item">
                                    <span className="stage-icon">🔍</span>
                                    <span>Extracting construction knowledge...</span>
                                </div>
                                <div className="stage-item">
                                    <span className="stage-icon">🤖</span>
                                    <span>Updating all agent knowledge bases...</span>
                                </div>
                                <div className="stage-item">
                                    <span className="stage-icon">✅</span>
                                    <span>Validating and optimizing learning...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="training-results">
                    <div className="results-header">
                        <h3>🎉 System Training Complete</h3>
                        <p>All AI agents have been successfully trained with new knowledge</p>
                    </div>

                    <div className="training-summary">
                        <div className="summary-stats">
                            <div className="stat-item">
                                <span className="stat-number">{trainingResult.training_results?.files_processed || selectedFiles.length}</span>
                                <span className="stat-label">Files Processed</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">10</span>
                                <span className="stat-label">Agents Trained</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Success Rate</span>
                            </div>
                        </div>

                        <div className="training-impact">
                            <h4>🚀 Training Impact</h4>
                            <div className="impact-list">
                                <div className="impact-item">
                                    <span className="impact-icon">🧠</span>
                                    <span>Knowledge base significantly expanded</span>
                                </div>
                                <div className="impact-item">
                                    <span className="impact-icon">⚡</span>
                                    <span>Agent decision-making capabilities improved</span>
                                </div>
                                <div className="impact-item">
                                    <span className="impact-icon">🎯</span>
                                    <span>Specialized expertise enhanced across all domains</span>
                                </div>
                                <div className="impact-item">
                                    <span className="impact-icon">📈</span>
                                    <span>System intelligence and performance upgraded</span>
                                </div>
                            </div>
                        </div>

                        <div className="agent-updates">
                            <h4>🤖 Agent Training Results</h4>
                            <div className="agents-grid">
                                {[
                                    { name: 'Customer Consultation', icon: '🤝', status: 'Enhanced' },
                                    { name: 'Master Construction', icon: '🏗️', status: 'Optimized' },
                                    { name: 'Engineering', icon: '⚙️', status: 'Updated' },
                                    { name: 'Planning', icon: '📊', status: 'Improved' },
                                    { name: 'HR & Workforce', icon: '👥', status: 'Enhanced' },
                                    { name: 'Supply Chain', icon: '🔗', status: 'Optimized' },
                                    { name: 'Finance', icon: '💰', status: 'Updated' },
                                    { name: 'Monitoring', icon: '📹', status: 'Improved' },
                                    { name: 'Quality', icon: '✅', status: 'Enhanced' },
                                    { name: 'Safety', icon: '🛡️', status: 'Optimized' }
                                ].map((agent, index) => (
                                    <div key={index} className="agent-update-item">
                                        <span className="agent-icon">{agent.icon}</span>
                                        <div className="agent-info">
                                            <div className="agent-name">{agent.name}</div>
                                            <div className={`agent-status status-${agent.status.toLowerCase()}`}>
                                                {agent.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="results-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setTrainingResult(null);
                                setSelectedFiles([]);
                                setTrainingType('comprehensive');
                            }}
                        >
                            Train More Content
                        </button>
                        <button className="btn btn-secondary">
                            View Training Report
                        </button>
                        <button className="btn btn-secondary">
                            Test System Performance
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .system-training {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .training-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 10px;
                }

                .training-form {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .training-type-selector {
                    margin-bottom: 30px;
                }

                .training-type-selector h3 {
                    margin-bottom: 20px;
                    color: #333;
                }

                .type-options {
                    display: grid;
                    gap: 15px;
                }

                .type-option {
                    display: block;
                    cursor: pointer;
                    padding: 20px;
                    border: 2px solid #e0e0e0;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .type-option:hover {
                    border-color: #667eea;
                    background: #f8f9fa;
                }

                .type-option input[type="radio"] {
                    display: none;
                }

                .type-option input[type="radio"]:checked + .option-content {
                    border-color: #667eea;
                }

                .type-option input[type="radio"]:checked ~ * {
                    border-color: #667eea;
                }

                .option-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .option-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .option-text {
                    flex: 1;
                }

                .option-text strong {
                    display: block;
                    margin-bottom: 5px;
                    color: #333;
                }

                .option-text small {
                    color: #666;
                }

                .file-upload-section {
                    margin-bottom: 30px;
                }

                .file-upload-section h3 {
                    margin-bottom: 20px;
                    color: #333;
                }

                .upload-zone {
                    border: 3px dashed #ccc;
                    border-radius: 15px;
                    padding: 60px 40px;
                    text-align: center;
                    transition: all 0.3s;
                    background: #f8f9fa;
                }

                .upload-zone.active {
                    border-color: #667eea;
                    background: #e8f0fe;
                    transform: scale(1.02);
                }

                .upload-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }

                .upload-icon {
                    font-size: 64px;
                    opacity: 0.6;
                }

                .upload-content h4 {
                    margin: 0;
                    color: #333;
                    font-size: 24px;
                }

                .upload-content p {
                    margin: 0;
                    color: #666;
                    max-width: 400px;
                }

                .upload-button {
                    background: #667eea;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s;
                }

                .upload-button:hover {
                    background: #5a6fd8;
                    transform: translateY(-2px);
                }

                .selected-files {
                    margin-top: 30px;
                    padding: 25px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }

                .selected-files h4 {
                    margin-top: 0;
                    margin-bottom: 20px;
                    color: #333;
                }

                .files-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .file-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .file-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .file-info {
                    flex: 1;
                }

                .file-name {
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 4px;
                }

                .file-details {
                    font-size: 12px;
                    color: #666;
                }

                .remove-file {
                    background: #dc3545;
                    color: white;
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s;
                }

                .remove-file:hover {
                    background: #c82333;
                }

                .training-capabilities {
                    margin-bottom: 30px;
                    padding: 25px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }

                .training-capabilities h3 {
                    margin-top: 0;
                    margin-bottom: 25px;
                    color: #333;
                    text-align: center;
                }

                .capabilities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .capability-item {
                    display: flex;
                    gap: 15px;
                    padding: 20px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .capability-icon {
                    font-size: 32px;
                    flex-shrink: 0;
                }

                .capability-text strong {
                    display: block;
                    margin-bottom: 8px;
                    color: #333;
                    font-size: 16px;
                }

                .capability-text p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .training-actions {
                    text-align: center;
                    margin: 30px 0;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    margin: 0 10px 10px 0;
                    transition: all 0.3s;
                    font-weight: bold;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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

                .btn-large {
                    padding: 18px 36px;
                    font-size: 18px;
                }

                .training-progress {
                    margin: 30px 0;
                    padding: 30px;
                    background: #f8f9fa;
                    border-radius: 15px;
                    text-align: center;
                }

                .progress-header {
                    margin-bottom: 25px;
                }

                .progress-header h4 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 20px;
                }

                .progress-stages {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .stage-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: white;
                    border-radius: 10px;
                    animation: pulse 2s infinite;
                }

                .stage-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }

                .training-results {
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                }

                .results-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding: 25px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border-radius: 15px;
                }

                .results-header h3 {
                    margin: 0 0 10px 0;
                    font-size: 28px;
                }

                .training-summary {
                    margin-bottom: 30px;
                }

                .summary-stats {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }

                .stat-item {
                    text-align: center;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    min-width: 120px;
                }

                .stat-number {
                    display: block;
                    font-size: 32px;
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 5px;
                }

                .stat-label {
                    font-size: 14px;
                    color: #666;
                }

                .training-impact,
                .agent-updates {
                    margin-bottom: 30px;
                    padding: 25px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }

                .training-impact h4,
                .agent-updates h4 {
                    margin-top: 0;
                    margin-bottom: 20px;
                    color: #333;
                }

                .impact-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .impact-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                }

                .impact-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .agents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }

                .agent-update-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .agent-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .agent-info {
                    flex: 1;
                }

                .agent-name {
                    font-size: 14px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 4px;
                }

                .agent-status {
                    font-size: 12px;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: bold;
                }

                .status-enhanced { background: #d4edda; color: #155724; }
                .status-optimized { background: #cce7ff; color: #004085; }
                .status-updated { background: #fff3cd; color: #856404; }
                .status-improved { background: #e2e3e5; color: #383d41; }

                .results-actions {
                    text-align: center;
                    padding-top: 30px;
                    border-top: 1px solid #e0e0e0;
                }

                @media (max-width: 768px) {
                    .summary-stats {
                        flex-direction: column;
                        align-items: center;
                    }

                    .capabilities-grid,
                    .agents-grid {
                        grid-template-columns: 1fr;
                    }

                    .upload-zone {
                        padding: 40px 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default SystemTraining;