import express from 'express';
import {
    createProfile,
    getMyProfiles,
    getProfileById,
    updateProfile,
    deleteProfile
} from '../controllers/profile.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { checkProfileOwnership } from '../middlewares/ownership.middleware.js';

const router = express.Router();

router.use(protect); // All routes require login
router.use(authorize('parent', 'doctor')); // Generally accessible, but specific creates are parent only

router.post('/', authorize('parent'), createProfile);
router.get('/', authorize('parent'), getMyProfiles); // Doctors use a different route to see patients

router.route('/:id')
    .get(checkProfileOwnership, getProfileById)
    .put(authorize('parent'), checkProfileOwnership, updateProfile)
    .delete(authorize('parent'), checkProfileOwnership, deleteProfile);

export default router;
