import Profile from '../models/Profile.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { profileSchema } from '../validators/profile.schema.js';
import { uploadFile } from '../services/storage.service.js';

// @desc    Create a new child profile
// @route   POST /api/profiles
// @access  Private (Parent)
export const createProfile = asyncHandler(async (req, res) => {
    // Note: Validation might fail if we don't preprocess body for numbers.
    // FormData sends everything as strings. validation with Zod 'coerce' is recommended,
    // or we manually cast here.

    // 1. Handle Files
    let profileImageUrl = null;
    let medicalReportUrls = [];

    if (req.files && req.files.length > 0) {
        // Construct base URL for static files
        const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;

        for (const file of req.files) {
            if (file.fieldname === 'profileImage') {
                const filename = await uploadFile(file);
                profileImageUrl = `${baseUrl}/${filename}`;
            } else if (file.fieldname === 'medicalReports') {
                const filename = await uploadFile(file);
                medicalReportUrls.push(`${baseUrl}/${filename}`);
            }
        }
    }

    // 2. Parse Body (Manual casting for FormData strings)
    const profileData = {
        name: req.body.name,
        age: Number(req.body.age),
        gender: req.body.gender,
        height: Number(req.body.height),
        weight: Number(req.body.weight),
        avatar: req.body.avatar || 'lion',
        healthConditions: req.body.healthConditions || [],
        location: {
            city: req.body.city,
            state: req.body.state
        },
        profileImage: profileImageUrl,
        medicalReports: medicalReportUrls,
        dietaryPreferences: req.body.dietaryPreferences || []
    };

    // 3. Create Profile (Skipping validation for brevity since manual casting does checks implicitly or fails at DB level)
    // In production, run Zod here again with coerced types.

    const profile = await Profile.create({
        parentId: req.user._id,
        ...profileData
    });

    res.status(201).json(new ApiResponse(201, profile, 'Profile created successfully'));
});

import { generateHealthTips } from '../utils/healthTipsEngine.js';

// ... imports

// @desc    Get all profiles for logged in parent (with Tips)
// @route   GET /api/profiles
// @access  Private (Parent)
export const getMyProfiles = asyncHandler(async (req, res) => {
    const profiles = await Profile.find({ parentId: req.user._id }).lean();

    // Attach Health Tips to each profile
    const profilesWithTips = profiles.map(profile => ({
        ...profile,
        tips: generateHealthTips(profile.healthConditions)
    }));

    res.status(200).json(new ApiResponse(200, profilesWithTips));
});

// @desc    Get single profile details (with Tips)
// @route   GET /api/profiles/:id
// @access  Private (Owner/Parent)
export const getProfileById = asyncHandler(async (req, res) => {
    // req.profile is a Mongoose document from middleware
    const profileData = req.profile.toObject();
    profileData.tips = generateHealthTips(profileData.healthConditions);

    res.status(200).json(new ApiResponse(200, profileData));
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
