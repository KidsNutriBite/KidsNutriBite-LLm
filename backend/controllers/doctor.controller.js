import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { findNearbyDoctors } from '../services/location.service.js';
import {
    requestAccess as requestAccessService,
    getMyPatients as getMyPatientsService,
    getPatientDetails as getPatientDetailsService,
    updateHealthNotes as updateHealthNotesService
} from '../services/doctor.service.js';

// @desc    Find nearby pediatricians (Public/Parent)
// @route   GET /api/doctor/nearby
// @access  Private (Parent)
export const getNearbyDoctors = asyncHandler(async (req, res) => {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
        res.status(400);
        throw new Error('Latitude and Longitude are required');
    }

    const doctors = await findNearbyDoctors(lat, lng, radius);

    res.status(200).json(new ApiResponse(200, doctors));
});

// @desc    Request access to a parent's children (via Email)
// @route   POST /api/doctor/request-access
// @access  Private (Doctor)
export const requestAccess = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Parent email is required');
    }

    const result = await requestAccessService(req.user._id, email);

    res.status(201).json(new ApiResponse(201, result));
});

// @desc    Get all active patients
// @route   GET /api/doctor/patients
// @access  Private (Doctor)
export const getMyPatients = asyncHandler(async (req, res) => {
    const patients = await getMyPatientsService(req.user._id);
    res.status(200).json(new ApiResponse(200, patients));
});

// @desc    Get patient details (Read-Only)
// @route   GET /api/doctor/patients/:id
// @access  Private (Doctor)
export const getPatientDetails = asyncHandler(async (req, res) => {
    // Service handles Audit Logging and Access Validation
    const data = await getPatientDetailsService(req.user._id, req.params.id);
    res.status(200).json(new ApiResponse(200, data));
});

// @desc    Update patient health notes
// @route   PATCH /api/doctor/patients/:id/notes
// @access  Private (Doctor)
export const updatePatientNotes = asyncHandler(async (req, res) => {
    const { notes } = req.body;
    if (!notes) {
        res.status(400);
        throw new Error('Notes are required');
    }

    const result = await updateHealthNotesService(req.user._id, req.params.id, notes);
    res.status(200).json(new ApiResponse(200, result));
});
