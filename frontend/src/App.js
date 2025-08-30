import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import PurchaseOrders from './pages/PurchaseOrders';
import Labour from './pages/Labour';
import DelayRisk from './pages/DelayRisk';
import Reports from './pages/Reports';
import Upload from './pages/Upload';
import Settings from './pages/Settings';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AgenticControlCenter  from './components/AgenticSystem/AgenticControlCenter';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/materials" element={
                <ProtectedRoute>
                  <Layout>
                    <Materials />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/purchase-orders" element={
                <ProtectedRoute>
                  <Layout>
                    <PurchaseOrders />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/labour" element={
                <ProtectedRoute>
                  <Layout>
                    <Labour />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/agentic" element={
  <ProtectedRoute>
    <Layout>
      <AgenticControlCenter />
    </Layout>
  </ProtectedRoute>
} />
              <Route path="/delay-risk" element={
                <ProtectedRoute>
                  <Layout>
                    <DelayRisk />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Layout>
                    <Upload />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </ApiProvider>
    </AuthProvider>
  );
}

export default App;
