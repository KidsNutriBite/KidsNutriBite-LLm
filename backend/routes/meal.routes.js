import express from 'express';
import { logMeal, getMealHistory, deleteFoodItem, getMealsByDate, getMealRecommendations, updateDailyTracking } from '../controllers/meal.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { checkProfileOwnership } from '../middlewares/ownership.middleware.js';
import multer from 'multer';

const checkBodyOwnership = async (req, res, next) => {
    if (req.body.profileId) {
        req.params.id = req.body.profileId;
        return checkProfileOwnership(req, res, next);
    }
    next();
};

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.get('/recommendations', authorize('parent'), getMealRecommendations);

// LOG MEAL
router.post('/', authorize('parent'), upload.any(), checkBodyOwnership, logMeal);

// GET HISTORY
router.get('/history/:id', checkProfileOwnership, getMealHistory);

// GET SPECIFIC DATE
router.get('/by-date/:id/:date', checkProfileOwnership, getMealsByDate);

// UPDATE DAILY TRACKING
router.post('/daily-tracking', authorize('parent'), updateDailyTracking);

// DELETE ITEM
router.delete('/item', authorize('parent'), deleteFoodItem);

export default router;
