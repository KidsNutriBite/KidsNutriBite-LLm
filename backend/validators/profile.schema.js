import { z } from 'zod';

export const profileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().int().positive('Age must be a positive number'),
    gender: z.enum(['male', 'female', 'other']),
    height: z.number().positive('Height must be positive'),
    weight: z.number().positive('Weight must be positive'),
    activityLevel: z.enum(['low', 'moderate', 'high']).optional(),
    dietaryPreferences: z.array(z.string()).optional(),
    avatar: z.string().min(1, 'Avatar selection is required'),
    conditions: z.array(z.string()).optional(),
});

export const mealLogSchema = z.object({
    profileId: z.string().min(1, 'Profile ID is required'),
    date: z.string().or(z.date()).optional(), // Helper to allow string input
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    foodItems: z.array(
        z.object({
            name: z.string().min(1, 'Food name is required'),
            quantity: z.string().min(1, 'Quantity is required'),
        })
    ).min(1, 'At least one food item is required'),
    notes: z.string().optional(),
});
