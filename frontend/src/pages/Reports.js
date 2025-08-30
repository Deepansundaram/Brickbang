import React from 'react';

const Reports = () => {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Reports & Analytics</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <button className="btn btn-primary btn-lg w-100 mb-3">
                📦 Materials Report
              </button>
            </div>
            <div className="col-md-4">
              <button className="btn btn-success btn-lg w-100 mb-3">
                👷 Labour Report
              </button>
            </div>
            <div className="col-md-4">
              <button className="btn btn-warning btn-lg w-100 mb-3">
                💰 Financial Report
              </button>
            </div>
          </div>
          <p className="text-center">Select a report type to generate and download detailed analytics.</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;