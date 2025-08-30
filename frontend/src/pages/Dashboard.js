import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import AIChatBox from '../components/AIChatBox/AIChatBox';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const api = useApi();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.reports.getDashboard();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <>
      <div>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-value">{stats?.total_materials || 0}</div>
            <div className="stat-label">Total Materials</div>
          </div>

          <div className={`stat-card ${stats?.low_stock_count > 0 ? 'warning' : 'success'}`}>
            <div className="stat-value">{stats?.low_stock_count || 0}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>

          <div className="stat-card warning">
            <div className="stat-value">{stats?.pending_orders || 0}</div>
            <div className="stat-label">Pending Orders</div>
          </div>

          <div className="stat-card primary">
            <div className="stat-value">{stats?.active_workers || 0}</div>
            <div className="stat-label">Active Workers</div>
          </div>

          <div className="stat-card success">
            <div className="stat-value">{Math.round(stats?.task_completion_rate || 0)}%</div>
            <div className="stat-label">Task Completion Rate</div>
          </div>

          <div
            className={`stat-card ${
              stats?.current_delay_risk > 0.6
                ? 'danger'
                : stats?.current_delay_risk > 0.3
                ? 'warning'
                : 'success'
            }`}
          >
            <div className="stat-value">
              {Math.round((stats?.current_delay_risk || 0) * 100)}%
            </div>
            <div className="stat-label">Delay Risk Score</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="d-flex gap-2 flex-wrap">
              <Link to="/materials" className="btn btn-primary">
                📦 Manage Materials
              </Link>
              <Link to="/purchase-orders" className="btn btn-success">
                🛒 Create Purchase Order
              </Link>
              <Link to="/labour" className="btn btn-warning">
                👷 Assign Tasks
              </Link>
              <Link to="/delay-risk" className="btn btn-danger">
                ⚠️ Check Delay Risk
              </Link>
              <Link to="/reports" className="btn btn-primary">
                📈 View Reports
              </Link>
            </div>
          </div>
        </div>

        {stats?.low_stock_count > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚠️ Attention Required</h3>
            </div>
            <div className="card-body">
              <div className="alert alert-warning">
                <strong>{stats.low_stock_count} materials</strong> are running low on stock. 
                <Link to="/materials" className="btn btn-sm btn-warning ml-2">
                  View Low Stock Items
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Project Overview</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h5>Current Status</h5>
                <ul>
                  <li><strong>Materials:</strong> {stats?.total_materials} items tracked</li>
                  <li><strong>Workers:</strong> {stats?.active_workers} active personnel</li>
                  <li><strong>Tasks:</strong> {stats?.completed_tasks} of {stats?.total_tasks} completed</li>
                  <li><strong>Orders:</strong> {stats?.pending_orders} pending delivery</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h5>AI Insights</h5>
                <div className="mb-2">
                  <strong>Delay Risk: </strong>
                  <span
                    className={
                      stats?.current_delay_risk > 0.6
                        ? 'text-danger'
                        : stats?.current_delay_risk > 0.3
                        ? 'text-warning'
                        : 'text-success'
                    }
                  >
                    {stats?.current_delay_risk > 0.6
                      ? 'High'
                      : stats?.current_delay_risk > 0.3
                      ? 'Medium'
                      : 'Low'}
                  </span>
                </div>
                <Link to="/delay-risk" className="btn btn-sm btn-primary">
                  View AI Predictions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Box should be outside main content */}
      <AIChatBox />
    </>
  );
};

export default Dashboard;
