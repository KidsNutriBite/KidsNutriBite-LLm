import axios from 'axios';

// AI Service is running on port 8000 (FastAPI)
const AI_URL = 'http://localhost:8000';

export const analyzeNutrition = async (age, gender, meals) => {
    try {
        const response = await axios.post(`${AI_URL}/analyze`, {
            age: parseInt(age),
            gender: gender || 'neutral',
            meals: meals.map(m => ({
                name: m.foodItems ? m.foodItems.map(f => f.name).join(', ') : 'Unknown Meal',
                portion: '1 serving' // Defaulting as we might not have precise portion data yet
            }))
        });
        return response.data;
    } catch (error) {
        console.error("AI Analysis Failed:", error);
        throw error;
    }
};
