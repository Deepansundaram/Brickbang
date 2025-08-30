import axios from 'axios';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.Authorization;
    }
  }

  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.api.post('/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  }
  async agentSuggest(message) {
    const res = await this.api.post('/ai/agent', { message });
    return res.suggestion || "No answer received from AI agent.";
}

  get(url, config = {}) {
    return this.api.get(url, config);
  }

  post(url, data, config = {}) {
    return this.api.post(url, data, config);
  }

  put(url, data, config = {}) {
    return this.api.put(url, data, config);
  }

  delete(url, config = {}) {
    return this.api.delete(url, config);
  }
}

export const apiService = new ApiService();
