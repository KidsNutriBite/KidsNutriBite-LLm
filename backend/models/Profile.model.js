import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
    {
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            required: true,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true,
        },
        height: {
            type: Number, // in cm
            required: true,
        },
        weight: {
            type: Number, // in kg
            required: true,
        },
        activityLevel: {
            type: String,
            enum: ['low', 'moderate', 'high'],
            default: 'moderate',
        },
        dietaryPreferences: {
            type: [String], // e.g., 'vegetarian', 'nut-free'
            default: [],
        },
        avatar: {
            type: String,
            required: true, // Mandatory avatar for UI/Kids Mode
            default: 'lion', // Default avatar
        },
        conditions: {
            type: [String], // e.g., 'diabetes', 'celiac'
            default: [],
        },
    },
    { timestamps: true }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
