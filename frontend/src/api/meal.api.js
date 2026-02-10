import api from './axios';

export const logMeal = async (mealData) => {
    const response = await api.post('/meals', mealData);
    return response.data;
};

export const getProfileMeals = async (profileId, date) => {
    const params = date ? { date } : {};
    const response = await api.get(`/meals/profile/${profileId}`, { params });
    return response.data;
};

export const deleteMeal = async (mealId) => {
    const response = await api.delete(`/meals/${mealId}`);
    return response.data;
};
