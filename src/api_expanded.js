import { api } from './api';

export const loginStudent = async (rollNo) => {
    const response = await api.get(`/auth/student/${rollNo}`);
    return response.data;
};

export const getCourses = async (studentId) => {
    const response = await api.get(`/courses/${studentId}`);
    return response.data;
};

export const getDailyTest = async () => {
    const response = await api.get(`/test/daily`);
    return response.data;
};

export const submitTest = async (eventData) => {
    return await api.post(`/test/submit`, eventData);
};

export const getAnalysis = async (studentId) => {
    const response = await api.get(`/analysis/${studentId}`);
    return response.data;
};
