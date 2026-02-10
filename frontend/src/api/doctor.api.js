import api from './axios';

export const requestAccess = async (email) => {
    const response = await api.post('/doctor/request-access', { email });
    return response.data;
};

export const getMyPatients = async () => {
    const response = await api.get('/doctor/patients');
    return response.data;
};

export const getPatientDetails = async (id) => {
    const response = await api.get(`/doctor/patients/${id}`);
    return response.data;
};
