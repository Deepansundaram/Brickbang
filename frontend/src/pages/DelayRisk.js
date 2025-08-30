import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';

const DelayRisk = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const api = useApi();

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const data = await api.ai.getPredictions();
      setPredictions(data);
      if (data.length > 0) {
        setPrediction(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runPrediction = async () => {
    try {
      setLoading(true);
      const result = await api.ai.predictDelay({});
      setPrediction(result);
      loadPredictions();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score > 0.6) return { level: 'High', class: 'danger' };
    if (score > 0.3) return { level: 'Medium', class: 'warning' };
    return { level: 'Low', class: 'success' };
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🤖 AI Delay Risk Prediction</h3>
          <button 
            className="btn btn-primary" 
            onClick={runPrediction}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Run New Prediction'}
          </button>
        </div>
        <div className="card-body">
          {prediction ? (
            <div>
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className={`stat-card ${getRiskLevel(prediction.delay_risk_score).class}`}>
                    <div className="stat-value">
                      {Math.round(prediction.delay_risk_score * 100)}%
                    </div>
                    <div className="stat-label">Overall Risk Score</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card warning">
                    <div className="stat-value">
                      {Math.round(prediction.material_impact * 100)}%
                    </div>
                    <div className="stat-label">Material Impact</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card primary">
                    <div className="stat-value">
                      {Math.round(prediction.weather_impact * 100)}%
                    </div>
                    <div className="stat-label">Weather Impact</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card success">
                    <div className="stat-value">
                      {Math.round(prediction.labour_impact * 100)}%
                    </div>
                    <div className="stat-label">Labour Impact</div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h5>Contributing Factors</h5>
                  <ul>
                    {JSON.parse(prediction.contributing_factors || '[]').map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5>Recommended Actions</h5>
                  <ul>
                    {JSON.parse(prediction.recommended_actions || '[]').map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p>No predictions available. Run a new prediction to get AI insights.</p>
            </div>
          )}
        </div>
      </div>

      {predictions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Prediction History</h3>
          </div>
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Risk Score</th>
                  <th>Material Impact</th>
                  <th>Weather Impact</th>
                  <th>Labour Impact</th>
                </tr>
              </thead>
              <tbody>
                {predictions.slice(0, 10).map(pred => (
                  <tr key={pred.id}>
                    <td>{new Date(pred.prediction_date).toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${getRiskLevel(pred.delay_risk_score).class}`}>
                        {Math.round(pred.delay_risk_score * 100)}%
                      </span>
                    </td>
                    <td>{Math.round(pred.material_impact * 100)}%</td>
                    <td>{Math.round(pred.weather_impact * 100)}%</td>
                    <td>{Math.round(pred.labour_impact * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelayRisk;
