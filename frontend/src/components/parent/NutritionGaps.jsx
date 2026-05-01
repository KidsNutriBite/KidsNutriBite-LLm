"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeNutrition } from '../../api/ai.api';

const NutritionGaps = ({ profile, meals }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [duration, setDuration] = useState(1); // Default 1 month

    const handleAnalyze = async () => {
        if (!meals || meals.length === 0) {
            setError("Please log at least one meal first to analyze nutrition.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Flatten daily logs into individual food items for AI analysis
            const flatMeals = [];
            // Take last 7 days of logs
            meals.slice(0, 7).forEach(log => {
                ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(type => {
                    if (log[type] && Array.isArray(log[type])) {
                        log[type].forEach(item => {
                            flatMeals.push({
                                name: item.name,
                                quantity: item.quantity || '1 serving',
                                calories: item.calories || 0,
                                protein: item.protein || 0,
                                ...item 
                            });
                        });
                    }
                });
            });

            if (flatMeals.length === 0) {
                setError("No food items found in recent logs.");
                setLoading(false);
                return;
            }

            const result = await analyzeNutrition(profile.age, profile.gender, flatMeals, profile.weight, duration);
            setData(result);
        } catch (err) {
            setError(err.message || "Failed to analyze nutrition. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-indigo-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-indigo-900 flex items-center gap-3">
                            <span className="material-symbols-outlined text-indigo-600 text-3xl">medical_services</span>
                            Clinical Nutrition Analysis
                        </h2>
                        <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">AI-powered assessment of {profile.name}'s dietary intake.</p>
                    </div>

                    {!data && !loading && (
                        <div className="flex items-center gap-3 bg-indigo-50 p-1.5 rounded-2xl border border-indigo-100">
                            <div className="flex gap-1">
                                {[1, 2, 3].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setDuration(m)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${duration === m ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:text-indigo-600'}`}
                                    >
                                        {m}M
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleAnalyze}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-xl shadow-lg shadow-indigo-100 transition-all transform hover:scale-105 flex items-center gap-2 text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">analytics</span>
                                Analyze
                            </button>
                        </div>
                    )}
                    
                    {data && !loading && (
                        <button 
                            onClick={() => setData(null)}
                            className="text-indigo-600 font-bold text-sm hover:underline"
                        >
                            Reset Analysis
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold flex items-center gap-3">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {loading && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
                        <p className="text-gray-500 font-bold animate-pulse">Analyzing micronutrients...</p>
                        <p className="text-xs text-gray-400 mt-2">Checking against pediatric RDA standards for {duration} Month(s)</p>
                    </div>
                )}

                <AnimatePresence>
                    {data && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Score & Summary */}
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-w-[150px] shadow-lg shadow-indigo-200">
                                    <span className="text-xs font-bold uppercase opacity-80 mb-1">Nutrition Score</span>
                                    <span className="text-5xl font-black">{data.score}</span>
                                    <span className="text-xs font-bold mt-2 bg-white/20 px-2 py-1 rounded">/ 100</span>
                                </div>
                                <div className="flex-1 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                    <h3 className="font-bold text-indigo-900 mb-2">Clinical Summary</h3>
                                    <p className="text-gray-700 leading-relaxed">{data.analysis_summary}</p>
                                </div>
                            </div>

                            {/* Deficiencies Grid */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">warning</span>
                                    Detected Gaps & Suggestions
                                </h3>

                                {data.deficiencies?.length === 0 ? (
                                    <div className={`p-6 rounded-2xl border flex items-center gap-4 ${data.score < 20 ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                                        <span className="text-3xl">{data.score < 20 ? '⚠️' : '🎉'}</span>
                                        <div>
                                            <h4 className="font-bold text-lg">{data.score < 20 ? 'Analysis Incomplete' : 'Excellent!'}</h4>
                                            <p>{data.score < 20 ? 'Could not detect specific gaps. Please log more detailed meals.' : 'No significant micronutrient gaps detected based on recent logs.'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {data.deficiencies?.map((gap, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group hover:border-red-200 transition"
                                            >
                                                <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-lg text-gray-800">{gap.nutrient}</h4>
                                                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                                                        {gap.status}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">
                                                    <div>
                                                        <span className="block text-[10px] uppercase font-bold text-gray-400">Current</span>
                                                        <span className="font-bold text-gray-700">{gap.current_estimated}</span>
                                                    </div>
                                                    <div className="text-gray-300">➜</div>
                                                    <div>
                                                        <span className="block text-[10px] uppercase font-bold text-gray-400">Target</span>
                                                        <span className="font-bold text-gray-700">{gap.target}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-green-50 p-3 rounded-xl flex items-start gap-3">
                                                    <span className="mt-0.5 text-green-600 material-symbols-outlined text-lg">lightbulb</span>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-green-700 uppercase block mb-0.5">Quick Fix</span>
                                                        <p className="text-xs font-medium text-gray-700">{gap.suggestion}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Projections Section */}
                            {data.projections && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div className="bg-slate-900 text-white p-6 rounded-3xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <span className="material-symbols-outlined text-6xl">timeline</span>
                                        </div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blue-400">query_stats</span>
                                                Dynamic Forecast
                                            </h3>
                                            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">
                                                {data.projections.percentage_change}
                                            </span>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{data.projections.forecast_duration || `${duration} Month`} Milestone</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black text-white">{data.projections.forecast_weight || data.projections.two_month_forecast}</span>
                                                    <span className="text-xs text-slate-400 font-bold">Goal Weight</span>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-800">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Growth Prediction</p>
                                                <p className="text-sm text-slate-200 leading-relaxed italic">"{data.projections.weight_prediction}"</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-3xl">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined">restaurant_menu</span>
                                            Standout Strategy
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {data.top_foods_to_add?.map((food, idx) => (
                                                <div key={idx} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="font-bold text-sm">{food}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 p-3 bg-white/10 rounded-xl">
                                            <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Clinical Observation</p>
                                            <p className="text-xs italic">{data.projections.warning_signs}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NutritionGaps;
