"use client";
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const DailyTrackingWidget = ({ dailyLog, profileId, selectedDate, onUpdate }) => {
    const [sleepTime, setSleepTime] = useState('');
    const [wakeTime, setWakeTime] = useState('');
    const [activityType, setActivityType] = useState('');
    const [duration, setDuration] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Reset forms when selectedDate changes
        setSleepTime('');
        setWakeTime('');
        setActivityType(dailyLog?.activityType || '');
        setDuration(dailyLog?.activityMinutes || '');
    }, [selectedDate, dailyLog]);

    const calculateSleepHours = (sleep, wake) => {
        if (!sleep || !wake) return 0;
        const sleepDate = new Date(`2000-01-01T${sleep}`);
        let wakeDate = new Date(`2000-01-01T${wake}`);
        if (wakeDate < sleepDate) {
            wakeDate = new Date(`2000-01-02T${wake}`); // Next day
        }
        return (wakeDate - sleepDate) / (1000 * 60 * 60);
    };

    const handleSaveSleep = async () => {
        if (!sleepTime || !wakeTime) return toast.error("Enter sleep and wake times");
        const hours = calculateSleepHours(sleepTime, wakeTime);
        
        try {
            setSaving(true);
            await api.post('/meals/daily-tracking', {
                profileId,
                date: selectedDate,
                sleepHours: hours
            });
            toast.success("Sleep tracked!");
            onUpdate();
        } catch (e) {
            toast.error("Failed to save sleep");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveActivity = async () => {
        if (!activityType || !duration) return toast.error("Enter activity details");
        
        try {
            setSaving(true);
            await api.post('/meals/daily-tracking', {
                profileId,
                date: selectedDate,
                activityType,
                activityMinutes: parseInt(duration)
            });
            toast.success("Activity tracked!");
            onUpdate();
        } catch (e) {
            toast.error("Failed to save activity");
        } finally {
            setSaving(false);
        }
    };

    // Calculate Macros
    let totalProtein = 0;
    let totalCarbs = 0;
    if (dailyLog) {
        ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(type => {
            if (dailyLog[type]) {
                dailyLog[type].forEach(item => {
                    totalProtein += item.protein || 0;
                    totalCarbs += item.carbs || 0;
                });
            }
        });
    }

    const currentSleep = dailyLog?.sleepHours || 0;
    const currentActivity = dailyLog?.activityMinutes || 0;

    let sleepStatus = "No Data";
    let sleepColor = "text-gray-500";
    if (currentSleep > 0) {
        if (currentSleep < 8) { sleepStatus = "Poor Sleep"; sleepColor = "text-red-500"; }
        else if (currentSleep <= 10) { sleepStatus = "Healthy"; sleepColor = "text-green-500"; }
        else { sleepStatus = "Oversleep"; sleepColor = "text-orange-500"; }
    }

    let activityStatus = "No Data";
    let activityColor = "text-gray-500";
    if (currentActivity > 0) {
        if (currentActivity < 60) { activityStatus = "Inactive"; activityColor = "text-red-500"; }
        else { activityStatus = "Active"; activityColor = "text-green-500"; }
    }

    // Rules for Smart Parent Guide
    const guides = [];
    if (totalProtein < 20 && totalProtein > 0) {
        guides.push("Protein intake is low today. Give eggs, milk, dal daily.");
    }
    if (totalCarbs > 200) {
        guides.push("Carbs are high this week. Reduce junk food, balance meals.");
    }
    if (currentSleep > 0 && currentSleep < 8) {
        guides.push("Child is not getting enough sleep. Make child sleep before 9 PM.");
    } else if (currentSleep >= 8 && currentSleep <= 10) {
        guides.push("Sleep pattern is healthy. Keep up the good routine!");
    }
    if (currentActivity > 0 && currentActivity < 60) {
        guides.push("Child is inactive today. Encourage outdoor play for 1 hour.");
    } else if (currentActivity >= 60) {
        guides.push("Good physical activity! They are burning energy well.");
    }

    return (
        <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sleep Tracking */}
                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 relative">
                    <h3 className="font-black text-indigo-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">💤</span> Sleep Tracking
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sleep Time</label>
                            <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wake Time</label>
                            <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200" />
                        </div>
                    </div>
                    <button onClick={handleSaveSleep} disabled={saving} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition">
                        Save Sleep Data
                    </button>
                    {currentSleep > 0 && (
                        <div className="mt-4 flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                            <span className="text-sm font-bold text-gray-600">{currentSleep.toFixed(1)} Hours tracked</span>
                            <span className={`text-sm font-black ${sleepColor}`}>{sleepStatus}</span>
                        </div>
                    )}
                </div>

                {/* Activity Tracking */}
                <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 relative">
                    <h3 className="font-black text-orange-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🏃</span> Activity Check
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Activity Type</label>
                            <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200">
                                <option value="">Select...</option>
                                <option value="playing">Playing</option>
                                <option value="sports">Sports</option>
                                <option value="walking">Walking/Running</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (mins)</label>
                            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 45" className="w-full p-2 rounded-lg border border-gray-200" />
                        </div>
                    </div>
                    <button onClick={handleSaveActivity} disabled={saving} className="w-full bg-orange-600 text-white font-bold py-2 rounded-lg hover:bg-orange-700 transition">
                        Save Activity Data
                    </button>
                    {currentActivity > 0 && (
                        <div className="mt-4 flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                            <span className="text-sm font-bold text-gray-600">{currentActivity} Mins of {dailyLog?.activityType}</span>
                            <span className={`text-sm font-black ${activityColor}`}>{activityStatus}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Parent Guide */}
            {guides.length > 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                        <span className="text-2xl">🔥</span> Today's Parenting Guide
                    </h3>
                    <ul className="space-y-3">
                        {guides.map((guide, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
                                <span className="mt-0.5">👉</span>
                                <span className="font-medium text-lg leading-snug">{guide}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DailyTrackingWidget;
