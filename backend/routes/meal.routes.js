import express from 'express';
import { logMeal, getProfileMeals, deleteMeal } from '../controllers/meal.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { checkProfileOwnership } from '../middlewares/ownership.middleware.js';

import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post('/', authorize('parent'), upload.any(), checkProfileOwnership, logMeal); // Body must contain profileId
router.get('/profile/:id', checkProfileOwnership, getProfileMeals);
router.delete('/:id', authorize('parent'), deleteMeal);

export default router;
