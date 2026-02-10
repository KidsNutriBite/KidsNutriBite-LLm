import MealLog from '../models/MealLog.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { mealLogSchema } from '../validators/profile.schema.js';

// @desc    Log a new meal
// @route   POST /api/meals
// @access  Private (Parent)
export const logMeal = asyncHandler(async (req, res) => {
    const validation = mealLogSchema.safeParse(req.body);

    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.errors[0].message);
    }

    // Ownership middleware ensures access to profileId

    const meal = await MealLog.create({
        ...validation.data
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
