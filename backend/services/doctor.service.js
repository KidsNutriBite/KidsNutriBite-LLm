import DoctorAccess from '../models/DoctorAccess.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Profile from '../models/Profile.model.js';
import MealLog from '../models/MealLog.model.js';
import User from '../models/User.model.js';
import { createNotification } from './notification.service.js';

/**
 * Request access to a child profile via parent email
 */
export const requestAccess = async (doctorId, parentEmail) => {
    const parent = await User.findOne({ email: parentEmail, role: 'parent' });
    if (!parent) {
        throw new Error('Parent with this email not found');
    }

    // Find profiles for this parent
    const profiles = await Profile.find({ parentId: parent._id });
    if (profiles.length === 0) {
        throw new Error('This parent has no child profiles yet');
    }

    const requests = [];
    for (const profile of profiles) {
        // Check existing
        const existing = await DoctorAccess.findOne({ doctorId, profileId: profile._id });
        if (!existing) {
            const req = await DoctorAccess.create({
                doctorId,
                profileId: profile._id,
                status: 'pending'
            });
            requests.push(req);

            // Notify Parent
            await createNotification(
                parent._id,
                `A Doctor has requested access to ${profile.name}'s profile.`,
                'system',
                doctorId
            );
        }
    }

    if (requests.length === 0) {
        return { message: 'Access requests already sent or exist.' };
    }

    return { message: `Access requested for ${requests.length} children.`, requests };
};

/**
 * Get all patients (profiles) that the doctor has access to
 */
export const getMyPatients = async (doctorId) => {
    const accesses = await DoctorAccess.find({ doctorId, status: 'active' }).populate('profileId');
    return accesses.map(a => a.profileId).filter(p => p !== null);
};

/**
 * Validate if a doctor has ACTIVE access to a profile
 * Logs the attempt to AuditLog
 */
export const validateAccess = async (doctorId, profileId, action = 'VIEW_ATTEMPT') => {
    // 1. Check Access Record
    const access = await DoctorAccess.findOne({
        doctorId,
        profileId,
        status: 'active'
    });

    const status = access ? 'ALLOWED' : 'DENIED';

    // 2. Create Audit Log (Async, don't block)
    AuditLog.create({
        doctorId,
        profileId,
        action,
        status
    }).catch(err => console.error('Audit Log Failed:', err));

    // 3. Return or Throw
    if (!access) {
        throw new Error('Access Denied: You do not have permission to view this patient.');
    }

    return true;
};

/**
 * Get full patient details (Profile + Meals + Generated Summary)
 */
export const getPatientDetails = async (doctorId, profileId) => {
    // 1. Validate Access
    await validateAccess(doctorId, profileId, 'VIEW_ATTEMPT');

    // 2. Fetch Data Parallelly
    const [profile, meals] = await Promise.all([
        Profile.findById(profileId),
        MealLog.find({ profileId }).sort({ date: -1 }).limit(50)
    ]);

    if (!profile) throw new Error('Profile not found');

    return {
        profile,
        meals,
        // We could add more analysis here later
    };
};

/**
 * Update health notes for a patient
 */
export const updateHealthNotes = async (doctorId, profileId, note) => {
    // 1. Validate Access
    await validateAccess(doctorId, profileId, 'UPDATE_NOTES');

    const profile = await Profile.findById(profileId);
    if (!profile) throw new Error('Profile not found');

    profile.healthNotes = note;
    await profile.save();

    // Notify Parent
    await createNotification(
        profile.parentId,
        `New health note added for ${profile.name}.`,
        'doctor_message',
        doctorId
    );

    return profile;
};
