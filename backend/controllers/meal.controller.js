import MealLog from '../models/MealLog.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { mealLogSchema } from '../validators/profile.schema.js';

import { uploadFile } from '../services/storage.service.js';

// @desc    Log a new meal
// @route   POST /api/meals
// @access  Private (Parent)
export const logMeal = asyncHandler(async (req, res) => {
    // 1. Handle File Upload
    let photoUrl = null;
    if (req.files && req.files.length > 0) {
        const file = req.files.find(f => f.fieldname === 'photo');
        if (file) {
            const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;
            const filename = await uploadFile(file);
            photoUrl = `${baseUrl}/${filename}`;
        }
    }

    // 2. Prepare Data (Parse JSON strings from FormData)
    let bodyData = { ...req.body };

    // FormData sends arrays/objects as strings
    if (typeof bodyData.foodItems === 'string') {
        try {
            bodyData.foodItems = JSON.parse(bodyData.foodItems);
        } catch (e) {
            console.error("Failed to parse foodItems", e);
            bodyData.foodItems = [];
        }
    }

    if (typeof bodyData.nutrients === 'string') {
        try {
            bodyData.nutrients = JSON.parse(bodyData.nutrients);
        } catch (e) {
            bodyData.nutrients = {};
        }
    }

    if (bodyData.waterIntake) {
        bodyData.waterIntake = Number(bodyData.waterIntake);
    }

    // 3. Validate
    const validation = mealLogSchema.safeParse(bodyData);

    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.errors[0].message);
    }

    // 4. Create Meal
    const meal = await MealLog.create({
        ...validation.data,
        photoUrl: photoUrl, // Use uploaded URL
        nutrients: validation.data.nutrients || {}
    });

    res.status(201).json(new ApiResponse(201, meal, 'Meal logged successfully'));
});

// @desc    Get meals for a profile (by date or range)
// @route   GET /api/meals/profile/:id
// @access  Private (Owner)
export const getProfileMeals = asyncHandler(async (req, res) => {
    // req.profile is attached by ownership middleware (via :id param)
    const { date } = req.query;

    let query = { profileId: req.params.id };

    if (date) {
        // Simple day matching
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
    }

    const meals = await MealLog.find(query).sort({ date: -1 });
    res.status(200).json(new ApiResponse(200, meals));
});

// @desc    Delete a meal log
// @route   DELETE /api/meals/:id
// @access  Private (Owner)
export const deleteMeal = asyncHandler(async (req, res) => {
    const meal = await MealLog.findById(req.params.id).populate('profileId');

    if (!meal) {
        res.status(404);
        throw new Error('Meal not found');
    }

    // Manual ownership check since we are looking up by Meal ID, not Profile ID directly
    if (meal.profileId.parentId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to modify this meal log');
    }

    await meal.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Meal deleted'));
});
