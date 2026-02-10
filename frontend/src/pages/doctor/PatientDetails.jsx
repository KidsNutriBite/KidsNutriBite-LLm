
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPatientDetails } from '../../api/doctor.api';
import { getMealFrequency, getPrescriptions, createPrescription } from '../../api/analytics.api';
import MealFrequencyChart from '../../components/charts/MealFrequencyChart';

const PatientDetails = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [meals, setMeals] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    // Analytics Data
    const [chartData, setChartData] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    // Form State
    const [newPrescription, setNewPrescription] = useState({ title: '', instructions: '' });

    const fetchAllData = async () => {
        try {
            const detailRes = await getPatientDetails(id);
            setProfile(detailRes.data.profile);
            setMeals(detailRes.data.meals);

            const chartRes = await getMealFrequency(id);
            setChartData(chartRes.data);

            const prescRes = await getPrescriptions(id);
            setPrescriptions(prescRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const handlePrescribe = async (e) => {
        e.preventDefault();
        try {
            await createPrescription({ profileId: id, ...newPrescription });
            setNewPrescription({ title: '', instructions: '' });
            const prescRes = await getPrescriptions(id);
            setPrescriptions(prescRes.data);
            alert('Prescription sent!');
        } catch (error) {
            alert('Failed to send prescription');
        }
    };

    if (!profile) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const tabs = [
        { id: 'overview', label: 'Clinical Overview', icon: '📊' },
        { id: 'analytics', label: 'Nutrition & Growth', icon: '📈' },
        { id: 'prescriptions', label: 'Prescriptions', icon: '📝' },
    ];

    return (
        <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-5xl shadow-inner">
                    {profile.avatar === 'lion' && '🦁'}
                    {profile.avatar === 'bear' && '🐻'}
                    {profile.avatar === 'rabbit' && '🐰'}
                    {profile.avatar === 'fox' && '🦊'}
                    {profile.avatar === 'cat' && '🐱'}
                    {profile.avatar === 'dog' && '🐶'}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-black text-gray-900">{profile.name}</h1>
                    <p className="text-gray-500 font-medium mb-4">Patient ID: {profile._id}</p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase">Age</p>
                            <p className="font-bold text-gray-900">{profile.age}</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase">Height</p>
                            <p className="font-bold text-gray-900">{profile.height} cm</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase">Weight</p>
                            <p className="font-bold text-gray-900">{profile.weight} kg</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-4 ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-lg shadow-blue-200'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
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
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Diet Log</h2>
                                        {meals.length === 0 ? (
                                            <p className="text-gray-500 italic">No meals logged recently.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {meals.map(meal => (
                                                    <div key={meal._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${meal.mealType === 'Breakfast' ? 'bg-orange-100' :
                                                                    meal.mealType === 'Lunch' ? 'bg-green-100' : 'bg-blue-100'
                                                                }`}>
                                                                {meal.mealType === 'Breakfast' ? '🍳' : meal.mealType === 'Lunch' ? '🥗' : '🍲'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{meal.foodItems.map(f => f.name).join(', ')}</p>
                                                                <p className="text-xs text-gray-500">{new Date(meal.date).toLocaleDateString()} • {meal.mealType}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'analytics' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Nutrition Analytics</h2>
                                    <MealFrequencyChart data={chartData} />
                                </div>
                            )}

                            {activeTab === 'prescriptions' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900">History</h3>
                                        <div className="space-y-4">
                                            {prescriptions.length === 0 && <p className="text-gray-500 italic">No prescriptions found.</p>}
                                            {prescriptions.map(p => (
                                                <div key={p._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-gray-900">{p.title}</h4>
                                                        <span className="text-xs font-bold text-gray-400">{new Date(p.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{p.instructions}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Write Prescription</h3>
                                        <form onSubmit={handlePrescribe} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Title / Diagnosis</label>
                                                <input
                                                    type="text"
                                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors font-medium"
                                                    placeholder="e.g. Dietary Recommendation"
                                                    value={newPrescription.title}
                                                    onChange={e => setNewPrescription({ ...newPrescription, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Instructions</label>
                                                <textarea
                                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors font-medium h-32 resize-none"
                                                    placeholder="Detailed medical advice..."
                                                    value={newPrescription.instructions}
                                                    onChange={e => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <button className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all transform active:scale-95">
                                                Send Prescription
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PatientDetails;
