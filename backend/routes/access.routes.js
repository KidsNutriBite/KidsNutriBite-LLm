import express from 'express';
import { getPendingRequests, approveRequest, rejectRequest } from '../controllers/access.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('parent'));

router.get('/requests', getPendingRequests);
router.put('/approve/:requestId', approveRequest);
router.put('/reject/:requestId', rejectRequest);

export default router;
