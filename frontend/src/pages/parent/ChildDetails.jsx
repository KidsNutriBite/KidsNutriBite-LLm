import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfileById as getProfile } from '../../api/profile.api';
import { getProfileMeals as getMeals, logMeal, deleteMeal } from '../../api/meal.api';
import { getMealFrequency, getPrescriptions } from '../../api/analytics.api';
import { getGrowthHistory, deleteGrowthRecord } from '../../api/growth.api'; // Import API
import MealLogForm from '../../components/parent/MealLogForm';
import Modal from '../../components/common/Modal';
import MealFrequencyChart from '../../components/charts/MealFrequencyChart';
import TipCard from '../../components/common/TipCard';
import GrowthTimeline from '../../components/growth/GrowthTimeline'; // Import Component
import UpdateGrowthModal from '../../components/growth/UpdateGrowthModal'; // Import Component
import NutritionGaps from '../../components/parent/NutritionGaps'; // Import Component

const ChildDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [profile, setProfile] = useState(null);
    const [meals, setMeals] = useState([]);
    const [growthRecords, setGrowthRecords] = useState([]); // Growth State
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Analytics
    const [chartData, setChartData] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isGrowthModalOpen, setIsGrowthModalOpen] = useState(false); // Growth Modal State

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileRes, mealsRes, chartRes, prescRes, growthRes] = await Promise.all([
                getProfile(id),
                getMeals(id),
                getMealFrequency(id),
                getPrescriptions(id),
                getGrowthHistory(id) // Fetch Growth
            ]);
            setProfile(profileRes.data || profileRes);
            setMeals(mealsRes.data || mealsRes || []);
            setChartData(chartRes.data || chartRes || []);
            setPrescriptions(prescRes.data || prescRes || []);
            setGrowthRecords(growthRes.data || growthRes || []);
        } catch (error) {
            console.error(error);
            navigate('/parent/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const refreshGrowth = async () => {
        const res = await getGrowthHistory(id);
        setGrowthRecords(res.data || res || []);
        // Re-fetch profile to update header height/weight
        const profRes = await getProfile(id);
        setProfile(profRes.data || profRes);
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleMealLogged = () => {
        setIsLogModalOpen(false);
        fetchData();
    };

    const handleDelete = async (mealId) => {
        if (window.confirm('Are you sure you want to delete this meal log?')) {
            try {
                await deleteMeal(mealId);
                fetchData();
            } catch (error) {
                console.error('Failed to delete meal:', error);
            }
        }
    };

    const handleGrowthDelete = async (recordId) => {
        if (window.confirm('Are you sure you want to delete this growth record?')) {
            try {
                await deleteGrowthRecord(recordId);
                refreshGrowth();
            } catch (error) {
                console.error('Failed to delete growth record:', error);
                alert("Failed to delete. You can only delete records you created.");
            }
        }
    };

    // Analytics Calculations
    const stats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];

        if (!meals || meals.length === 0) return { meals: 0, avgCal: 0, water: 0, streak: 0 };

        const uniqueDays = new Set(meals.map(m => new Date(m.date).toISOString().split('T')[0]));

        // Avg Calories (Daily Average)
        const totalCals = meals.reduce((acc, m) => acc + (m.nutrients?.calories || 0), 0);
        const avgCal = uniqueDays.size > 0 ? Math.round(totalCals / uniqueDays.size) : 0;

        // Water (Today)
        const waterToday = meals
            .filter(m => new Date(m.date).toISOString().split('T')[0] === todayStr)
            .reduce((acc, m) => acc + (m.waterIntake || 0), 0);

        // Streak Calculation
        let streak = 0;
        let checkDate = new Date();
        const checkDateStr = checkDate.toISOString().split('T')[0];

        let hasToday = uniqueDays.has(checkDateStr);
        let d = new Date(checkDate);

        if (!hasToday) {
            // Check yesterday
            d.setDate(d.getDate() - 1);
            const yesterdayStr = d.toISOString().split('T')[0];
            if (uniqueDays.has(yesterdayStr)) {
                hasToday = true;
            }
        }

        if (hasToday) {
            // Reset date to start checking backwards
            let currentCheck = new Date(d);
            // If we started from yesterday, currentCheck is yesterday. 
            // If we started from today, currentCheck is today.

            // Loop backwards
            while (true) {
                const dateStr = currentCheck.toISOString().split('T')[0];
                if (uniqueDays.has(dateStr)) {
                    streak++;
                    currentCheck.setDate(currentCheck.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        return { meals: meals.length, avgCal, water: (waterToday / 1000).toFixed(1), streak };
    }, [meals]);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!profile) return null;

    const tabs = [
        { id: 'overview', label: 'Overview & Logs', icon: '📊' },
        { id: 'growth', label: 'Growth Timeline', icon: '📏' }, // New Tab
        { id: 'analytics', label: 'Nutrition Trends', icon: '📈' },
        { id: 'prescriptions', label: 'Doctor Actions', icon: '🩺' },
    ];

    return (
        <div className="space-y-8">
            {/* Header / Profile Summary */}
            <div className="glass-panel p-8 rounded-[2rem] relative overflow-hidden">
                <div className="blob-bg top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-white/50 overflow-hidden">
                        {profile.profileImage ? (
                            <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-6xl">
                                {profile.avatar === 'lion' && '🦁'}
                                {profile.avatar === 'bear' && '🐻'}
                                {profile.avatar === 'rabbit' && '🐰'}
                                {profile.avatar === 'fox' && '🦊'}
                                {profile.avatar === 'cat' && '🐱'}
                                {profile.avatar === 'dog' && '🐶'}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black text-gray-900">{profile.name}</h1>
                            <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs uppercase tracking-wider rounded-full self-center md:self-auto">Healthy</span>
                        </div>

                        <p className="text-gray-500 font-medium mb-6">Level {profile.level || 1} Explorer • {profile.xp || 0} XP</p>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <div className="bg-white/50 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 border border-white/60 shadow-sm">
                                🎂 {profile.age} Years
                            </div>
                            <div className="bg-white/50 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 border border-white/60 shadow-sm">
                                {profile.height} cm
                            </div>
                            <div className="bg-white/50 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 border border-white/60 shadow-sm">
                                {profile.weight} kg
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => navigate(`/kids/${profile._id}/dashboard`)}
                            className="bg-gradient-to-r from-blue-400 to-green-500 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-200 transform hover:scale-105 transition-all flex items-center gap-3 border-2 border-white/20"
                        >
                            <div>
                                <div className="text-xs font-bold opacity-90 uppercase tracking-wider">Switch to</div>
                                <div className="text-lg leading-none">Kids Mode</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Column: Vertical Navigation */}
                <div className="lg:col-span-1 space-y-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-4 ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-md border border-gray-50'
                                : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}

                    {/* Streak Widget */}
                    <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100 hidden lg:block">
                        <h4 className="font-bold text-blue-900 mb-4">Weekly Streak</h4>
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <div className="text-3xl font-black text-blue-600">{stats.streak} Days</div>
                                <div className="text-xs text-blue-400 font-bold uppercase">Target: 5 Days</div>
                            </div>
                            <div className="text-4xl">🔥</div>
                        </div>
                        <div className="w-full bg-blue-200 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((stats.streak / 5) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tab Content */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    {/* Daily Tip */}
                                    <div className="w-full">
                                        <TipCard tip={profile.tips?.[0]} childName={profile.name} />
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <p className="text-xs text-gray-400 font-bold uppercase">Meals</p>
                                            <p className="text-2xl font-black text-gray-800">{stats.meals}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <p className="text-xs text-gray-400 font-bold uppercase">Avg Calories</p>
                                            <p className="text-2xl font-black text-gray-800">{stats.avgCal}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <p className="text-xs text-gray-400 font-bold uppercase">Water</p>
                                            <p className="text-2xl font-black text-gray-800">{stats.water}L</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl shadow-lg shadow-indigo-200 text-white flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition" onClick={() => setActiveTab('growth')}>
                                            <p className="text-xs font-bold uppercase opacity-80 mb-1">Current BMI</p>
                                            <p className="text-4xl font-black">{growthRecords.length > 0 ? growthRecords[growthRecords.length - 1].bmi : 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Nutrition Gaps AI Detector */}
                                    <div className="w-full">
                                        <NutritionGaps profile={profile} meals={meals} />
                                    </div>

                                    {/* Recent Logs Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-gray-900">Recent Logs</h2>
                                            <button
                                                onClick={() => setIsLogModalOpen(true)}
                                                className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow hover:bg-blue-600 transition flex items-center gap-2"
                                            >
                                                <span>+</span> Log Meal
                                            </button>
                                        </div>

                                        {meals.length === 0 ? (
                                            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                                                <div className="text-5xl mb-4 grayscale opacity-50">🍽️</div>
                                                <h3 className="text-lg font-bold text-gray-900">No meals logged yet</h3>
                                                <p className="text-gray-500 mb-6">Start tracking {profile.name}'s nutrition today.</p>
                                                <button onClick={() => setIsLogModalOpen(true)} className="text-primary font-bold hover:underline">Log the first meal</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {meals.map((meal) => (
                                                    <div key={meal._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md flex justify-between items-center group">
                                                        <div className="flex items-center gap-4">
                                                            {meal.photoUrl ? (
                                                                <img src={meal.photoUrl} alt="Meal" className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                                                            ) : (
                                                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${meal.mealType === 'breakfast' ? 'bg-orange-100 text-orange-600' :
                                                                    meal.mealType === 'lunch' ? 'bg-green-100 text-green-600' :
                                                                        meal.mealType === 'dinner' ? 'bg-indigo-100 text-indigo-600' :
                                                                            'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {meal.mealType === 'breakfast' && '🍳'}
                                                                    {meal.mealType === 'lunch' && '🥗'}
                                                                    {meal.mealType === 'dinner' && '🍲'}
                                                                    {meal.mealType === 'snack' && '🍎'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 className="font-bold text-lg text-gray-900 capitalize">{meal.mealType}</h4>
                                                                <p className="text-sm text-gray-500">{meal.foodItems.map(i => i.name).join(', ')}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs font-bold text-gray-400">{new Date(meal.date).toLocaleDateString()} at {meal.time || 'N/A'}</span>
                                                                    {meal.nutrients?.calories && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">{meal.nutrients.calories} kcal</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleDelete(meal._id)}
                                                                className="w-10 h-10 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                                                                title="Delete"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'growth' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-gray-900">Growth Timeline</h2>
                                        <button
                                            onClick={() => setIsGrowthModalOpen(true)}
                                            className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow hover:bg-blue-600 transition flex items-center gap-2"
                                        >
                                            <span>📏</span> Update Growth
                                        </button>
                                    </div>
                                    <GrowthTimeline data={growthRecords} onDelete={handleGrowthDelete} />
                                </div>
                            )}

                            {activeTab === 'analytics' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Nutrition Trends</h2>
                                    <MealFrequencyChart data={chartData} />
                                    {/* Add more charts here in future */}
                                </div>
                            )}

                            {activeTab === 'prescriptions' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Doctor's Orders</h2>
                                    {prescriptions.length === 0 ? (
                                        <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
                                            <p className="text-gray-500 font-medium">No prescriptions active at the moment.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {prescriptions.map(p => (
                                                <div key={p._id} className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-primary relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                                                    <div className="relative z-10">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Prescription</span>
                                                            <span className="text-sm text-gray-400 font-medium">{new Date(p.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h3>
                                                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">{p.instructions}</p>
                                                        <div className="mt-4 flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">👨‍⚕️</div>
                                                            <p className="text-sm font-bold text-gray-700">Dr. {p.doctorId.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Log Meal Modal */}
            <Modal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                title={`Log Meal for ${profile.name}`}
                maxWidth="max-w-5xl"
            >
                <MealLogForm
                    profileId={id}
                    onSuccess={handleMealLogged}
                    onCancel={() => setIsLogModalOpen(false)}
                />
            </Modal>

            {/* Update Growth Modal */}
            <UpdateGrowthModal
                isOpen={isGrowthModalOpen}
                onClose={() => setIsGrowthModalOpen(false)}
                childId={id}
                onChanged={refreshGrowth}
            />
        </div>
    );
};

export default ChildDetails;
