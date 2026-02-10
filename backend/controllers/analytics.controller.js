import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import Prescription from '../models/Prescription.model.js';
import MealLog from '../models/MealLog.model.js';
import mongoose from 'mongoose';

// @desc    Get meal frequency analytics (Last 7 Days)
// @route   GET /api/analytics/meal-frequency/:profileId
// @access  Private (Doctor/Parent - Verified by ownership/access middleware)
export const getMealFrequency = asyncHandler(async (req, res) => {
    const { profileId } = req.params;

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const data = await MealLog.aggregate([
        {
            $match: {
                profileId: new mongoose.Types.ObjectId(profileId),
                date: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } } // Sort by date ascending
    ]);

    // Fill in missing days with 0
    // (Optional enhancement: handled on frontend or here. Let's keep it simple for now and just return data)

    res.status(200).json(new ApiResponse(200, data));
});

// @desc    Create a prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
export const createPrescription = asyncHandler(async (req, res) => {
    const { profileId, title, instructions } = req.body;

    if (!profileId || !title || !instructions) {
        res.status(400);
        throw new Error('All fields are required');
    }

    // (Middleware already checks if doctor has access to this profileId)

    const prescription = await Prescription.create({
        doctorId: req.user._id,
        profileId,
        title,
        instructions
    });

    res.status(201).json(new ApiResponse(201, prescription, 'Prescription created'));
});

// @desc    Get prescriptions for a profile
// @route   GET /api/prescriptions/:profileId
// @access  Private (Doctor/Parent)
export const getPrescriptions = asyncHandler(async (req, res) => {
    const { profileId } = req.params;

    const prescriptions = await Prescription.find({ profileId })
        .populate('doctorId', 'name')
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, prescriptions));
});
