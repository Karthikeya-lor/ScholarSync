import axios from 'axios';

const API_URL = 'http://localhost:8000'; // In docker it will be relative if proxied, but for now localhost

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ingestEvent = async (eventData) => {
  return await api.post('/events', eventData);
};

export const getDashboardStats = async (studentId) => {
  return await api.get(`/student/${studentId}/dashboard`);
};
