import express from 'express';
import { requestAccess, getMyPatients, getPatientDetails } from '../controllers/doctor.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { checkDoctorAccess } from '../middlewares/doctor.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('doctor'));

router.post('/request-access', requestAccess);
router.get('/patients', getMyPatients);
router.get('/patients/:id', checkDoctorAccess, getPatientDetails);

export default router;
