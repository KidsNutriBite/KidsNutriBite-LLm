import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import DoctorAccess from '../models/DoctorAccess.model.js';

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
