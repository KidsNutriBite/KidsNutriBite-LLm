import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 }
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
        time: {
            type: String, // e.g. "08:30 AM"
        },
        mealType: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snack', 'water'],
            required: true,
        },
        foodItems: {
            type: [foodItemSchema],
            default: []
        },
        waterIntake: {
            type: Number, // in ml
            default: 0
        },
        notes: {
            type: String,
            trim: true,
        },
        photoUrl: {
            type: String,
        },
        nutrients: {
            type: Map,
            of: Number, // e.g., { 'calories': 250, 'protein': 10 }
            default: {}
        }
    },
    { timestamps: true }
);

const MealLog = mongoose.model('MealLog', mealLogSchema);

export default MealLog;
