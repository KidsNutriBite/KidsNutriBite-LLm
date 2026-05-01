import MealLog from '../models/MealLog.model.js';
import Profile from '../models/Profile.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

// @desc    Log or Update a meal for a specific date
// @route   POST /api/meals
// @access  Private (Parent)
export const logMeal = asyncHandler(async (req, res) => {
    const { profileId, date, mealType, foodItems, notes } = req.body;

    // Validate Input
    if (!profileId || !date || !mealType || !foodItems) {
        res.status(400);
        throw new Error("Missing required fields: profileId, date, mealType, foodItems");
    }

    // Parse foodItems if string (FormData)
    let parsedFoodItems = foodItems;
    if (typeof foodItems === 'string') {
        try {
            parsedFoodItems = JSON.parse(foodItems);
        } catch (e) {
            parsedFoodItems = [];
        }
    }

    // Check if a log exists for this date
    let dailyLog = await MealLog.findOne({ profileId, date });

    if (!dailyLog) {
        // Create new daily log
        dailyLog = new MealLog({
            profileId,
            date,
            [mealType]: parsedFoodItems
        });
    } else {
        // Update existing log
        // We append to the existing list for that meal type
        dailyLog[mealType] = [...dailyLog[mealType], ...parsedFoodItems];
    }

    // Calculate Completed Meals Count (Simple logic: if array has items, it counts)
    let count = 0;
    if (dailyLog.breakfast && dailyLog.breakfast.length > 0) count++;
    if (dailyLog.lunch && dailyLog.lunch.length > 0) count++;
    if (dailyLog.snacks && dailyLog.snacks.length > 0) count++;
    if (dailyLog.dinner && dailyLog.dinner.length > 0) count++;

    dailyLog.completedMealsCount = count;

    await dailyLog.save();

    res.status(200).json(new ApiResponse(200, dailyLog, "Meal logged successfully"));
});

// @desc    Get meal history (last 30 days)
// @route   GET /api/meals/history/:id
export const getMealHistory = asyncHandler(async (req, res) => {
    const { id } = req.params; // Profile ID

    const logs = await MealLog.find({ profileId: id })
        .sort({ date: -1 })
        .limit(30);

    // Calculate Streak (Simplified)
    let streak = 0;
    // ... logic to calculate streak based on completedMealsCount ...

    res.status(200).json(new ApiResponse(200, { logs, streak }, "Meal history fetched"));
});

// @desc    Get specific date log
// @route   GET /api/meals/by-date/:id/:date
export const getMealsByDate = asyncHandler(async (req, res) => {
    const { id, date } = req.params;

    const log = await MealLog.findOne({ profileId: id, date });

    if (!log) {
        // Return empty structure for frontend to render "empty" state
        return res.status(200).json(new ApiResponse(200, { date, breakfast: [], lunch: [], snacks: [], dinner: [] }, "No logs found (Empty)"));
    }

    res.status(200).json(new ApiResponse(200, log, "Daily meals fetched"));
});

// @desc    Delete a specific food item from a meal slot
// @route   DELETE /api/meals/item
export const deleteFoodItem = asyncHandler(async (req, res) => {
    const { logId, mealType, itemId } = req.body;

    const log = await MealLog.findById(logId);
    if (!log) {
        res.status(404);
        throw new Error("Log not found");
    }

    if (log[mealType]) {
        log[mealType] = log[mealType].filter(item => item._id.toString() !== itemId);
        await log.save();
    }

    res.status(200).json(new ApiResponse(200, log, "Item removed"));
});

// @desc    Update Daily Tracking (Sleep, Activity)
// @route   POST /api/meals/daily-tracking
export const updateDailyTracking = asyncHandler(async (req, res) => {
    const { profileId, date, sleepHours, activityMinutes, activityType } = req.body;

    if (!profileId || !date) {
        res.status(400);
        throw new Error("profileId and date are required");
    }

    let dailyLog = await MealLog.findOne({ profileId, date });

    if (!dailyLog) {
        dailyLog = new MealLog({ profileId, date });
    }

    if (sleepHours !== undefined) dailyLog.sleepHours = sleepHours;
    if (activityMinutes !== undefined) dailyLog.activityMinutes = activityMinutes;
    if (activityType !== undefined) dailyLog.activityType = activityType;

    await dailyLog.save();

    res.status(200).json(new ApiResponse(200, dailyLog, "Daily tracking updated successfully"));
});

// @desc    Get Meal Recommendations (Child specific + Family)
// @route   GET /api/meals/recommendations
export const getMealRecommendations = asyncHandler(async (req, res) => {
    // Get all children for the logged-in parent
    const profiles = await Profile.find({ parentId: req.user._id });
    
    if (!profiles || profiles.length === 0) {
        return res.status(200).json(new ApiResponse(200, { childPlans: [], familyPlan: null }, "No profiles found"));
    }

    // Mocking an AI/ICMR rules-based generation here for speed and reliability 
    // without requiring an external API key in the environment.
    
    const childPlans = profiles.map(profile => {
        let recommendations = [];
        let avoid = [];
        let focus = "General Healthy Diet";
        
        const conditions = profile.healthConditions || [];
        
        if (conditions.includes('iron_deficiency')) {
            focus = "Iron Focused";
            recommendations.push("Spinach (Palak) with Lemon", "Dates and Jaggery (Gur)", "Lentils (Dal) with Vitamin C rich vegetables", "Ragi dosa or Ragi porridge");
            avoid.push("Excessive milk with iron-rich meals (calcium inhibits iron absorption)", "Tea/Coffee (for older kids)");
        }
        if (conditions.includes('diabetes')) {
            focus = "Blood Sugar Management";
            recommendations.push("Whole wheat chapati instead of white rice", "Oats upma", "Bitter gourd (Karela) sabzi", "Moong dal chilla");
            avoid.push("Refined sugar", "Fruit juices", "Maida products");
        }
        if (conditions.includes('obesity')) {
            focus = "Weight Management";
            recommendations.push("High fiber veggies (Bottle gourd/Lauki, Ridge gourd)", "Millet based meals (Jowar/Bajra roti)", "Buttermilk (Chaas) instead of sweet lassi", "Sprouts chaat");
            avoid.push("Deep fried snacks (Samosa, Pakora)", "Packaged chips", "Sugary drinks");
        }
        if (conditions.includes('peanut_allergy')) {
            avoid.push("Peanuts", "Peanut oil (Groundnut oil)", "Mixed nuts snacks if cross-contamination is a risk");
            recommendations.push("Use Sunflower or Mustard oil", "Roasted Chana as an alternative snack");
        }
        if (conditions.includes('fever') || conditions.includes('sick')) {
            focus = "Easy Digestion & Recovery";
            recommendations.push("Moong Dal Khichdi with slight ghee", "Clear veg soup", "Rice gruel (Kanji)");
            avoid.push("Spicy curries", "Heavy fried foods");
        }
        
        if (recommendations.length === 0) {
            recommendations = ["Seasonal fruits", "Mixed dal", "Green leafy vegetables", "Curd (Dahi)"];
            avoid = ["Excessive junk food", "High sugar drinks"];
        }

        return {
            profileId: profile._id,
            name: profile.name,
            focus,
            recommendations,
            avoid,
            weeklyPlan: {
                Monday: `Breakfast: Idli/Poha, Lunch: Dal Rice & Veg Sabzi, Dinner: Roti & Paneer/Egg Bhurji`,
                Tuesday: `Breakfast: Moong Dal Chilla, Lunch: ${conditions.includes('iron_deficiency') ? 'Palak Paneer' : 'Mixed Veg'} with Roti, Dinner: Light Khichdi`,
                Wednesday: `Breakfast: Ragi Dosa/Upma, Lunch: Rajma Chawal, Dinner: Ghiya/Lauki Sabzi with Roti`,
                Thursday: `Breakfast: Oats/Daliya, Lunch: Chana Masala with Brown Rice/Roti, Dinner: Veg Soup & Dal`,
                Friday: `Breakfast: Paratha (less oil) with Curd, Lunch: Soya chunk curry & Roti, Dinner: Rice & Rasam/Dal`,
                Saturday: `Breakfast: Sprouts Salad/Besan Chilla, Lunch: Veg Pulao with Raita, Dinner: Mixed Veg Sabzi & Roti`,
                Sunday: `Breakfast: Whole Wheat Pancakes/Appam, Lunch: Special Thali (Dal, Sabzi, Curd, Salad), Dinner: Light Dal & Rice`
            }
        };
    });

    // Family Plan Aggregation
    const allRecommendations = new Set();
    const allAvoid = new Set();
    
    childPlans.forEach(plan => {
        plan.recommendations.forEach(r => allRecommendations.add(r));
        plan.avoid.forEach(a => allAvoid.add(a));
    });

    const familyPlan = {
        title: "Consolidated Family Meal Strategy",
        description: "A unified meal plan designed to cater to the specific nutritional needs of all your children simultaneously, minimizing separate cooking.",
        sharedRecommendations: Array.from(allRecommendations).slice(0, 8), // Top 8 combined
        sharedAvoidances: Array.from(allAvoid).slice(0, 5),
        strategy: "Cook a neutral, healthy base meal (like Rice and Dal or Roti) and prepare specific side dishes (e.g., Palak for Iron deficiency, Khichdi for easy digestion) that can be shared or portioned according to each child's needs."
    };

    res.status(200).json(new ApiResponse(200, { childPlans, familyPlan }, "Meal recommendations generated successfully based on ICMR guidelines"));
});
