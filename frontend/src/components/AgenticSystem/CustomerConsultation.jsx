import React, { useState } from 'react';
import { useApi } from '../../contexts/ApiContext';

const CustomerConsultation = ({ onConsultationComplete }) => {
    const api = useApi();
    const [formData, setFormData] = useState({
        customerName: '',
        contactInfo: '',
        initialQuery: '',
        projectType: 'residential',
        budget: '',
        timeline: '',
        location: '',
        specificRequirements: ''
    });
    const [loading, setLoading] = useState(false);
    const [consultationResult, setConsultationResult] = useState(null);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const startConsultation = async () => {
        setLoading(true);
        try {
            const consultationRequest = {
                initial_query: `${formData.initialQuery}. Project type: ${formData.projectType}, Budget: ${formData.budget}, Timeline: ${formData.timeline}, Location: ${formData.location}. Additional requirements: ${formData.specificRequirements}`,
                customer_name: formData.customerName,
                contact_info: formData.contactInfo
            };

            const result = await api.agentic.startCustomerConsultation(consultationRequest);
            setConsultationResult(result);
            onConsultationComplete?.();
        } catch (error) {
            console.error('Consultation failed:', error);
            alert('Consultation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="customer-consultation">
            <div className="consultation-header">
                <h2>🤝 AI-Powered Customer Consultation</h2>
                <p>Let our AI agents understand your construction needs and generate optimal plans</p>
            </div>

            {!consultationResult ? (
                <div className="consultation-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Customer Name *</label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleInputChange}
                                placeholder="Enter customer name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Information *</label>
                            <input
                                type="text"
                                name="contactInfo"
                                value={formData.contactInfo}
                                onChange={handleInputChange}
                                placeholder="Phone, email, or address"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Project Type *</label>
                            <select
                                name="projectType"
                                value={formData.projectType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                                <option value="renovation">Renovation</option>
                                <option value="infrastructure">Infrastructure</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estimated Budget</label>
                            <input
                                type="text"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                placeholder="e.g., $50,000 - $100,000"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Preferred Timeline</label>
                            <input
                                type="text"
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleInputChange}
                                placeholder="e.g., 6 months, ASAP, flexible"
                            />
                        </div>
                        <div className="form-group">
                            <label>Project Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="City, State/Province"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Project Description & Requirements *</label>
                        <textarea
                            name="initialQuery"
                            value={formData.initialQuery}
                            onChange={handleInputChange}
                            placeholder="Describe your construction project in detail. What do you want to build? What are your specific requirements, preferences, and constraints?"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Additional Specific Requirements</label>
                        <textarea
                            name="specificRequirements"
                            value={formData.specificRequirements}
                            onChange={handleInputChange}
                            placeholder="Any special requirements, materials preferences, design styles, accessibility needs, environmental considerations, etc."
                            rows={3}
                        />
                    </div>

                    <div className="consultation-actions">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={startConsultation}
                            disabled={loading || !formData.customerName || !formData.contactInfo || !formData.initialQuery}
                        >
                            {loading ? 'AI Agents Analyzing...' : '🤖 Start AI Consultation'}
                        </button>
                    </div>

                    {loading && (
                        <div className="consultation-progress">
                            <div className="progress-info">
                                <p>🧠 AI agents are analyzing your requirements...</p>
                                <p>📋 Generating preliminary plans and cost estimates...</p>
                                <p>🎯 Creating personalized recommendations...</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="consultation-results">
                    <div className="results-header">
                        <h3>✅ Consultation Complete</h3>
                        <p>Consultation ID: {consultationResult.consultation_id}</p>
                    </div>

                    <div className="results-content">
                        <div className="result-section">
                            <h4>📋 Next Steps</h4>
                            <ul>
                                {consultationResult.next_steps?.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="result-section">
                            <h4>🎯 AI Analysis Summary</h4>
                            <div className="analysis-summary">
                                <p>Our AI agents have analyzed your requirements and generated a comprehensive consultation report.</p>
                                <p>The consultation includes preliminary plans, cost estimates, timeline projections, and personalized recommendations.</p>
                            </div>
                        </div>

                        <div className="results-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setConsultationResult(null);
                                    setFormData({
                                        customerName: '',
                                        contactInfo: '',
                                        initialQuery: '',
                                        projectType: 'residential',
                                        budget: '',
                                        timeline: '',
                                        location: '',
                                        specificRequirements: ''
                                    });
                                }}
                            >
                                Start New Consultation
                            </button>
                            <button className="btn btn-secondary">
                                Download Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .customer-consultation {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .consultation-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 10px;
                }

                .consultation-form {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .form-row {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .form-group {
                    flex: 1;
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                    color: #333;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 5px;
                    font-size: 14px;
                    transition: border-color 0.3s;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .consultation-actions {
                    text-align: center;
                    margin-top: 30px;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    margin: 0 10px;
                    transition: all 0.3s;
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

                .btn-large {
                    padding: 15px 30px;
                    font-size: 18px;
                }

                .consultation-progress {
                    text-align: center;
                    margin-top: 20px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }

                .progress-info p {
                    margin: 10px 0;
                    color: #666;
                }

                .consultation-results {
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
                    border-radius: 5px;
                }

                .result-section {
                    margin-bottom: 25px;
                    padding: 20px;
                    border-left: 4px solid #667eea;
                    background: #f8f9fa;
                }

                .result-section h4 {
                    margin-top: 0;
                    color: #333;
                }

                .result-section ul {
                    padding-left: 20px;
                }

                .result-section li {
                    margin-bottom: 8px;
                }

                .results-actions {
                    text-align: center;
                    margin-top: 30px;
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #5a6268;
                }
            `}</style>
        </div>
    );
};

export default CustomerConsultation;