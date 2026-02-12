import express from 'express';
import { requestAccess, getMyPatients, getPatientDetails, getNearbyDoctors, updatePatientNotes } from '../controllers/doctor.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { checkDoctorAccess } from '../middlewares/doctor.middleware.js';

const router = express.Router();

// Public/Parent Routes (Protected by Token)
router.get('/nearby', protect, authorize('parent'), getNearbyDoctors);

// Doctor Routes
router.use(protect, authorize('doctor'));

router.post('/request-access', requestAccess);
router.get('/patients', getMyPatients);
router.get('/patients/:id', checkDoctorAccess, getPatientDetails);
router.patch('/patients/:id/notes', checkDoctorAccess, updatePatientNotes);

export default router;
