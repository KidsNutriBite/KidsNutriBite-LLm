import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: String, // e.g., "1 cup", "100g"
        required: true,
    },
    calories: {
        type: Number, // Optional placeholder for AI calculation later
    }
}, { _id: false });

const mealLogSchema = new mongoose.Schema(
    {
        profileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        mealType: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snack'],
            required: true,
        },
        foodItems: {
            type: [foodItemSchema], // Array of structured objects
            required: true,
            validate: [
                (val) => val.length > 0,
                'Meal must contain at least one food item'
            ]
        },
        notes: {
            type: String,
            trim: true,
        },
        photoUrl: {
            type: String, // Value for future image upload feature
        },
    },
    { timestamps: true }
);

const MealLog = mongoose.model('MealLog', mealLogSchema);

export default MealLog;
