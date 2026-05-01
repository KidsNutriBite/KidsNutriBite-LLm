import axios from 'axios';

// AI Service is running on port 8000 (FastAPI)
const AI_URL = 'http://localhost:8000';

export const analyzeNutrition = async (age, gender, meals, weight, durationMonths = 1) => {
    try {
        const response = await axios.post(`${AI_URL}/analyze`, {
            age: parseInt(age),
            gender: gender || 'neutral',
            weight: parseFloat(weight) || 0,
            duration_months: parseInt(durationMonths),
            meals: meals.map(m => ({
                name: m.name || 'Unknown Food',
                portion: m.quantity || '1 serving',
                calories: m.calories || 0,
                protein: m.protein || 0
            }))
        });
        return response.data;
    } catch (error) {
        if (error.code === 'ERR_NETWORK') {
            console.error("AI Analysis Failed: AI Backend Server (FastAPI) is not running on port 8000.");
            throw new Error("AI Backend Server is offline. Please start the nutrikid-backend service.");
        }
        console.error("AI Analysis Failed:", error.response?.data || error.message);
        throw error;
    }
};
