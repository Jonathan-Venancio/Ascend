import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Backend está na porta 8000

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  
  register: (username: string, email: string, password: string) =>
    api.post('/api/auth/register', { username, email, password }),
};

export const skillsAPI = {
  getAll: () => api.get('/api/skills/'),
  create: (data: any) => api.post('/api/skills/', data),
  getById: (id: number) => api.get(`/api/skills/${id}`),
  delete: (id: number) => api.delete(`/api/skills/${id}`),
  acquire: (id: number) => api.post(`/api/skills/${id}/acquire`),
  getMySkills: () => api.get('/api/skills/my/'),
  addMilestone: (skillId: number, data: any) => api.post(`/api/skills/${skillId}/milestones`, data),
  removeMilestone: (skillId: number, level: number) => api.delete(`/api/skills/${skillId}/milestones/${level}`),
};

export const questsAPI = {
  getAll: () => api.get('/api/quests/'),
  create: (data: any) => api.post('/api/quests/', data),
  assign: (id: number) => api.post(`/api/quests/assign/${id}`),
  complete: (questId: number) => api.post('/api/quests/complete', { quest_id: questId }),
  getMyQuests: () => api.get('/api/quests/my/'),
  delete: (id: number) => api.delete(`/api/quests/${id}`),
  generate: (skillId: number) => api.post(`/api/quests/generate/${skillId}`),
};

export const rewardsAPI = {
  getAll: () => api.get('/api/rewards/'),
  create: (data: any) => api.post('/api/rewards/', data),
  buy: (rewardId: number) => api.post('/api/rewards/buy', { reward_id: rewardId }),
  getMyRewards: () => api.get('/api/rewards/my/'),
  delete: (id: number) => api.delete(`/api/rewards/${id}`),
};

export const profileAPI = {
  get: () => api.get('/api/profile/'),
  getStats: () => api.get('/api/profile/stats'),
  updateTitle: (title: string) => api.put('/api/profile/title', { title }),
};

export default api;
