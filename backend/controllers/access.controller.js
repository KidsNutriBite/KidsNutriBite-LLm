import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import DoctorAccess from '../models/DoctorAccess.model.js';
import User from '../models/User.model.js';

// @desc    Get pending access requests
// @route   GET /api/access/requests
// @access  Private (Parent)
export const getPendingRequests = asyncHandler(async (req, res) => {
    const requests = await DoctorAccess.find({
        parentId: req.user._id,
        status: 'pending',
        profileId: null // General requests waiting for profile assignment
    }).populate('doctorId', 'name email');

    res.status(200).json(new ApiResponse(200, requests));
});

// @desc    Approve access request
// @route   PUT /api/access/approve/:requestId
// @access  Private (Parent)
export const approveRequest = asyncHandler(async (req, res) => {
    const { profileId } = req.body;
    const requestId = req.params.requestId;

    if (!profileId) {
        res.status(400);
        throw new Error('Please select a child profile to share');
    }

    const request = await DoctorAccess.findOne({
        _id: requestId,
        parentId: req.user._id,
        status: 'pending'
    });

    if (!request) {
        res.status(404);
        throw new Error('Request not found or already processed');
    }

    // Update request to ACTIVE and link Profile
    // We modify the EXISTING request record to link it
    request.status = 'active';
    request.profileId = profileId;
    await request.save();

    res.status(200).json(new ApiResponse(200, request, 'Access granted successfully'));
});

// @desc    Reject access request
// @route   PUT /api/access/reject/:requestId
// @access  Private (Parent)
export const rejectRequest = asyncHandler(async (req, res) => {
    const request = await DoctorAccess.findOne({
        _id: req.params.requestId,
        parentId: req.user._id,
        status: 'pending'
    });

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json(new ApiResponse(200, null, 'Request rejected'));
});

// @desc    Invite/Grant Access to a Doctor
// @route   POST /api/access/invite
// @access  Private (Parent)
export const inviteDoctor = asyncHandler(async (req, res) => {
    const { email, profileId } = req.body;

    if (!email || !profileId) {
        res.status(400);
        throw new Error('Doctor email and Child Profile are required');
    }

    // 1. Find Doctor by email
    const doctor = await User.findOne({ email: email.toLowerCase(), role: 'doctor' });

    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found with this email');
    }

    // 2. Check if access already exists
    const existingAccess = await DoctorAccess.findOne({
        doctorId: doctor._id,
        parentId: req.user._id,
        profileId: profileId
    });

    if (existingAccess) {
        if (existingAccess.status === 'active') {
            res.status(400);
            throw new Error('Doctor already has access to this child');
        }
        if (existingAccess.status === 'pending') {
            res.status(400);
            throw new Error('An invitation is already pending');
        }
        // If rejected/revoked, we can reactivate or create new (reactivate logic below)
        existingAccess.status = 'active'; // Direct grant
        await existingAccess.save();
        return res.status(200).json(new ApiResponse(200, existingAccess, 'Access granted successfully'));
    }

    // 3. Create new Access Record (Directly Active for Parent-initiated)
    const newAccess = await DoctorAccess.create({
        doctorId: doctor._id,
        parentId: req.user._id,
        profileId: profileId,
        status: 'active'
    });

    res.status(201).json(new ApiResponse(201, newAccess, 'Invitation sent and access granted'));
});

// @desc    Get list of doctors with active access
// @route   GET /api/access/list
// @access  Private (Parent)
export const getAccessList = asyncHandler(async (req, res) => {
    const accessList = await DoctorAccess.find({
        parentId: req.user._id,
        status: 'active'
    })
        .populate('doctorId', 'name email doctorProfile')
        .populate('profileId', 'name avatar');

    res.status(200).json(new ApiResponse(200, accessList));
});

// @desc    Revoke access
// @route   PUT /api/access/revoke/:requestId
// @access  Private (Parent)
export const revokeAccess = asyncHandler(async (req, res) => {
    const access = await DoctorAccess.findOne({
        _id: req.params.requestId,
        parentId: req.user._id
    });

    if (!access) {
        res.status(404);
        throw new Error('Access record not found');
    }

    // Instead of deleting, we set to rejected/revoked to keep history if needed
    // Or we can just delete. Let's start with hard delete for cleaner state or use 'rejected' as revoked.
    // The requirement says "revoke", so let's remove permissions.

    // Option A: Delete
    // await access.deleteOne();

    // Option B: Set status to rejected (soft delete)
    access.status = 'rejected';
    await access.save();

    res.status(200).json(new ApiResponse(200, null, 'Access revoked successfully'));
});
