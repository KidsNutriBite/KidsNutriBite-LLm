import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import User from '../models/User.model.js';
import DoctorAccess from '../models/DoctorAccess.model.js';
import Profile from '../models/Profile.model.js';
import MealLog from '../models/MealLog.model.js';

// @desc    Request access to a parent's children (via Email)
// @route   POST /api/doctor/request-access
// @access  Private (Doctor)
export const requestAccess = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Parent email is required');
    }

    // 1. Find Parent by Email
    const parent = await User.findOne({ email, role: 'parent' });
    if (!parent) {
        res.status(404);
        throw new Error('Parent not found with that email');
    }

    // 2. Check for existing pending/active request (Generalized for Parent)
    // We check if there's already a PENDING request for this parent without a specific profile
    const existingRequest = await DoctorAccess.findOne({
        doctorId: req.user._id,
        parentId: parent._id,
        profileId: null, // Initial request is generic
        status: 'pending'
    });

    if (existingRequest) {
        res.status(400);
        throw new Error('Request already pending for this parent');
    }

    // 3. Create Request
    const request = await DoctorAccess.create({
        doctorId: req.user._id,
        parentId: parent._id,
        status: 'pending' // Defaults to pending, profileId null
    });

    res.status(201).json(new ApiResponse(201, request, 'Access request sent to parent'));
});

// @desc    Get all active patients
// @route   GET /api/doctor/patients
// @access  Private (Doctor)
export const getMyPatients = asyncHandler(async (req, res) => {
    // Find all ACTIVE access records
    const accessRecords = await DoctorAccess.find({
        doctorId: req.user._id,
        status: 'active',
        profileId: { $ne: null } // Must be linked to a profile
    }).populate('profileId');

    // Map to list of profiles
    const patients = accessRecords.map(record => record.profileId);

    res.status(200).json(new ApiResponse(200, patients));
});

// @desc    Get patient details (Read-Only)
// @route   GET /api/doctor/patients/:id
// @access  Private (Doctor)
export const getPatientDetails = asyncHandler(async (req, res) => {
    // Middleware `checkDoctorAccess` already verified access and fetched profile
    // We fetch meals here manually to ensure read-only
    const profile = req.profile;

    const meals = await MealLog.find({ profileId: profile._id }).sort({ date: -1 }).limit(20);

    res.status(200).json(new ApiResponse(200, { profile, meals }));
});
