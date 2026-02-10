import api from './axios';

export const getPendingRequests = async () => {
    const response = await api.get('/access/requests');
    return response.data;
};

export const approveRequest = async (requestId, profileId) => {
    const response = await api.put(`/access/approve/${requestId}`, { profileId });
    return response.data;
};

export const rejectRequest = async (requestId) => {
    const response = await api.put(`/access/reject/${requestId}`);
    return response.data;
};
