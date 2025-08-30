import React, { createContext, useContext } from 'react';
import { apiService } from '../services/apiService';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const value = {
    admin: {
  login: (data) => apiService.post('/api/admin/login', data),
  uploadKnowledge: (formData) => apiService.post('/api/admin/knowledge/upload', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    }
  }),
  reviewKnowledge: (data) => apiService.post('/api/admin/knowledge/review', data),
  getPendingReviews: () => apiService.get('/api/admin/knowledge/pending-reviews'),
  getAuditLogs: () => apiService.get('/api/admin/audit/logs'),
  optimizePipeline: () => apiService.post('/api/admin/system/optimize-pipeline'),
  rollbackDeployment: (uploadId) => apiService.delete(`/api/admin/knowledge/rollback/${uploadId}`),
},
knowledge: {
  importBuildingCodes: (data) => apiService.post('/api/knowledge/import-building-codes', data),
  importConstructionMethods: (data) => apiService.post('/api/knowledge/import-construction-methods', data),
  importExpertDatasets: (data) => apiService.post('/api/knowledge/import-expert-datasets', data),
  createTrainingScenarios: () => apiService.post('/api/knowledge/create-training-scenarios'),
  optimizeTrainingPipeline: () => apiService.post('/api/knowledge/optimize-training-pipeline'),
  getKnowledgeStatus: () => apiService.get('/api/knowledge/knowledge-status'),
},
    // Materials API
    materials: {
      getAll: (params) => apiService.get('/api/materials/', { params }),
      getLowStock: () => apiService.get('/api/materials/low-stock'),
      getById: (id) => apiService.get(`/api/materials/${id}`),
      create: (data) => apiService.post('/api/materials/', data),
      update: (id, data) => apiService.put(`/api/materials/${id}`, data),
      delete: (id) => apiService.delete(`/api/materials/${id}`),
      reorder: (id, quantity) => apiService.post(`/api/materials/${id}/reorder`, { quantity })
    },

    // Purchase Orders API
    purchaseOrders: {
      getAll: (params) => apiService.get('/api/purchase-orders/', { params }),
      getById: (id) => apiService.get(`/api/purchase-orders/${id}`),
      create: (data) => apiService.post('/api/purchase-orders/', data),
      update: (id, data) => apiService.put(`/api/purchase-orders/${id}`, data),
      receive: (id) => apiService.post(`/api/purchase-orders/${id}/receive`)
    },

    // Labour API
    labour: {
      getWorkers: (params) => apiService.get('/api/labour/workers', { params }),
      createWorker: (data) => apiService.post('/api/labour/workers', data),
      updateWorker: (id, data) => apiService.put(`/api/labour/workers/${id}`, data),
      getTasks: (params) => apiService.get('/api/labour/tasks', { params }),
      createTask: (data) => apiService.post('/api/labour/tasks', data),
      updateTask: (id, data) => apiService.put(`/api/labour/tasks/${id}`, data),
      getTimeLogs: (params) => apiService.get('/api/labour/time-logs', { params }),
      createTimeLog: (data) => apiService.post('/api/labour/time-logs', data),
      getProductivity: (workerId, days) => apiService.get(`/api/labour/productivity/${workerId}`, { params: { days_back: days } })
    },

    // Reports API
    reports: {
      getDashboard: () => apiService.get('/api/reports/dashboard'),
      getMaterialsReport: (format = 'json') => apiService.get('/api/reports/materials-report', { params: { format } }),
      getLabourReport: (days = 30, format = 'json') => apiService.get('/api/reports/labour-report', { params: { days_back: days, format } }),
      getFinancialReport: (days = 30) => apiService.get('/api/reports/financial-report', { params: { days_back: days } })
    },

    // AI Predictions API including the agentSuggest method
    ai: {
      predictDelay: (data) => apiService.post('/api/ai/predict-delay', data),
      getPredictions: (params) => apiService.get('/api/ai/predictions', { params }),
      getSupplierRecommendations: (materialId, quantity) => apiService.get('/api/ai/recommendations/suppliers', { params: { material_id: materialId, quantity } }),
      getManpowerRecommendations: () => apiService.get('/api/ai/recommendations/manpower'),
      forecastDemand: (materialId, days = 30) => apiService.get(`/api/ai/material-demand-forecast/${materialId}`, { params: { days_ahead: days } }),
      agentSuggest: (message) => apiService.post('/api/ai/agent', { message }),  // <-- Added for AI Chat
    },
    agentic: {
  // Customer consultation
  startCustomerConsultation: (data) => apiService.post('/api/agentic/customer-consultation', data),
  
  // Contract analysis
  analyzeContract: (data) => apiService.post('/api/agentic/analyze-contract', data),
  
  // Daily operations
  runDailyOperations: (projectName) => apiService.post(`/api/agentic/daily-operations/${projectName}`),
  
  // System training
  trainSystem: (formData) => apiService.post('/api/agentic/train-system', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // System status
  getSystemStatus: () => apiService.get('/api/agentic/system-status'),
  
  // Emergency response
  handleEmergency: (data) => apiService.post('/api/agentic/emergency-response', data),
},

    // File Upload API
    upload: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiService.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};
