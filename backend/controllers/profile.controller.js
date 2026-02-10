import Profile from '../models/Profile.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { profileSchema } from '../validators/profile.schema.js';

// @desc    Create a new child profile
// @route   POST /api/profiles
// @access  Private (Parent)
export const createProfile = asyncHandler(async (req, res) => {
    const validation = profileSchema.safeParse(req.body);

    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.errors[0].message);
    }

    const profile = await Profile.create({
        parentId: req.user._id,
        ...validation.data
    });

    res.status(201).json(new ApiResponse(201, profile, 'Profile created successfully'));
});

// @desc    Get all profiles for logged in parent
// @route   GET /api/profiles
// @access  Private (Parent)
export const getMyProfiles = asyncHandler(async (req, res) => {
    const profiles = await Profile.find({ parentId: req.user._id });
    res.status(200).json(new ApiResponse(200, profiles));
});

// @desc    Get single profile details
// @route   GET /api/profiles/:id
// @access  Private (Owner/Parent)
export const getProfileById = asyncHandler(async (req, res) => {
    // Ownership middleware already fetches and checks profile
    res.status(200).json(new ApiResponse(200, req.profile));
});

// @desc    Update profile
// @route   PUT /api/profiles/:id
// @access  Private (Owner/Parent)
export const updateProfile = asyncHandler(async (req, res) => {
    const validation = profileSchema.partial().safeParse(req.body);

    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.errors[0].message);
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
        req.params.id,
        validation.data,
        { new: true, runValidators: true }
    );

    res.status(200).json(new ApiResponse(200, updatedProfile, 'Profile updated'));
});

// @desc    Delete profile
// @route   DELETE /api/profiles/:id
// @access  Private (Owner/Parent)
export const deleteProfile = asyncHandler(async (req, res) => {
    await Profile.findByIdAndDelete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Profile deleted'));
});
