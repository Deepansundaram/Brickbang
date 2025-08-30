import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/ApiContext';

const KnowledgeImportCenter = () => {
    const api = useApi();
    const [knowledgeStatus, setKnowledgeStatus] = useState(null);
    const [importProgress, setImportProgress] = useState({});
    const [selectedDomain, setSelectedDomain] = useState('building_codes');

    const knowledgeDomains = [
        { id: 'building_codes', name: 'Building Codes & Standards', icon: '📋' },
        { id: 'construction_methods', name: 'Construction Methods', icon: '🔨' },
        { id: 'materials', name: 'Material Properties', icon: '🧱' },
        { id: 'safety_protocols', name: 'Safety Protocols', icon: '🦺' },
        { id: 'cost_data', name: 'Cost Data', icon: '💰' },
        { id: 'project_management', name: 'Project Management', icon: '📊' },
        { id: 'equipment_specs', name: 'Equipment Specifications', icon: '⚙️' },
        { id: 'regulatory_compliance', name: 'Regulatory Compliance', icon: '⚖️' }
    ];

    const expertDatasets = [
        { name: 'RSMeans Cost Database', type: 'cost_data', priority: 'high' },
        { name: 'OSHA Safety Standards', type: 'safety_regulations', priority: 'high' },
        { name: 'International Building Code', type: 'building_codes', priority: 'high' },
        { name: 'CSI MasterFormat', type: 'specifications', priority: 'medium' },
        { name: 'ENR Project Database', type: 'project_data', priority: 'medium' },
        { name: 'ASTM Material Standards', type: 'materials', priority: 'high' }
    ];

    useEffect(() => {
        loadKnowledgeStatus();
    }, []);

    const loadKnowledgeStatus = async () => {
        try {
            const status = await api.knowledge.getKnowledgeStatus();
            setKnowledgeStatus(status);
        } catch (error) {
            console.error('Failed to load knowledge status:', error);
        }
    };

    const handleBulkImport = async () => {
        try {
            // Import building codes
            const buildingCodesResult = await api.knowledge.importBuildingCodes({
                sources: [
                    { name: 'International Building Code 2021', type: 'pdf', path: '/datasets/ibc_2021.pdf' },
                    { name: 'Local Building Codes', type: 'web', url: 'https://local-building-dept.gov/codes' },
                    { name: 'OSHA Construction Standards', type: 'api', endpoint: 'https://api.osha.gov/construction-standards' }
                ],
                domain: 'building_codes',
                priority: 'high'
            });

            // Import construction methods
            const methodsResult = await api.knowledge.importConstructionMethods({
                sources: [
                    { name: 'Concrete Construction Video Series', type: 'video', path: '/training_videos/concrete_methods.mp4' },
                    { name: 'Steel Construction Manual', type: 'technical_manual', path: '/manuals/steel_construction.pdf' },
                    { name: 'Foundation Construction Case Studies', type: 'case_study', path: '/case_studies/foundations.pdf' }
                ],
                domain: 'construction_methods',
                priority: 'high'
            });

            // Import expert datasets
            const datasetsResult = await api.knowledge.importExpertDatasets({
                dataset_sources: expertDatasets.map(dataset => ({
                    name: dataset.name,
                    type: dataset.type,
                    priority: dataset.priority
                })),
                import_type: 'comprehensive'
            });

            alert('Bulk import completed successfully!');
            loadKnowledgeStatus();

        } catch (error) {
            console.error('Bulk import failed:', error);
            alert('Bulk import failed. Please check the console for details.');
        }
    };

    const handleOptimizePipeline = async () => {
        try {
            const result = await api.knowledge.optimizeTrainingPipeline();
            alert(`Pipeline optimized! Performance improvement: ${result.performance_improvement}`);
            loadKnowledgeStatus();
        } catch (error) {
            console.error('Pipeline optimization failed:', error);
        }
    };

    const handleCreateTrainingScenarios = async () => {
        try {
            const result = await api.knowledge.createTrainingScenarios();
            alert(`Created ${result.training_scenarios.scenarios_created} training scenarios!`);
        } catch (error) {
            console.error('Training scenarios creation failed:', error);
        }
    };

    return (
        <div className="knowledge-import-center">
            <div className="center-header">
                <h1>🧠 Expert Knowledge Import Center</h1>
                <div className="quick-actions">
                    <button className="btn btn-primary" onClick={handleBulkImport}>
                        📥 Bulk Import All
                    </button>
                    <button className="btn btn-success" onClick={handleOptimizePipeline}>
                        ⚡ Optimize Pipeline
                    </button>
                    <button className="btn btn-info" onClick={handleCreateTrainingScenarios}>
                        🎓 Create Training Scenarios
                    </button>
                </div>
            </div>

            {/* Knowledge Status Overview */}
            <div className="knowledge-overview">
                <h2>📊 Knowledge Base Status</h2>
                <div className="status-grid">
                    {knowledgeDomains.map(domain => (
                        <div key={domain.id} className="domain-card">
                            <div className="domain-icon">{domain.icon}</div>
                            <div className="domain-name">{domain.name}</div>
                            <div className="domain-stats">
                                <div className="stat">
                                    <span className="stat-label">Documents:</span>
                                    <span className="stat-value">
                                        {knowledgeStatus?.knowledge_stores?.[domain.id]?.document_count || 0}
                                    </span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Quality:</span>
                                    <span className="stat-value">
                                        {knowledgeStatus?.knowledge_stores?.[domain.id]?.quality_score || 0}/10
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Expert Datasets */}
            <div className="expert-datasets">
                <h2>📚 Expert Datasets</h2>
                <div className="datasets-grid">
                    {expertDatasets.map((dataset, index) => (
                        <div key={index} className="dataset-card">
                            <div className="dataset-header">
                                <h3>{dataset.name}</h3>
                                <span className={`priority ${dataset.priority}`}>
                                    {dataset.priority}
                                </span>
                            </div>
                            <div className="dataset-type">{dataset.type}</div>
                            <button className="btn btn-sm btn-outline-primary">
                                Import Dataset
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Import Progress */}
            {Object.keys(importProgress).length > 0 && (
                <div className="import-progress">
                    <h2>📈 Import Progress</h2>
                    {Object.entries(importProgress).map(([domain, progress]) => (
                        <div key={domain} className="progress-item">
                            <div className="progress-label">{domain}</div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="progress-text">{progress}%</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KnowledgeImportCenter;
```
