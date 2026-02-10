import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileById } from '../../api/profile.api';
import { getKidStats } from '../../api/game.api';
import { motion, AnimatePresence } from 'framer-motion';
import KidsModal from '../../components/common/KidsModal';
import FoodBuddyChat from '../../components/kids/FoodBuddyChat';

const KidsDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', icon: '' });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profRes, statsRes] = await Promise.all([
                    getProfileById(id),
                    getKidStats(id)
                ]);
                setProfile(profRes.data || profRes);
                setStats(statsRes.data || statsRes);
            } catch (error) {
                console.error("Error loading kids data", error);
            }
        };
        loadData();
    }, [id]);

    const openModal = (title, message, icon) => {
        setModalConfig({ isOpen: true, title, message, icon });
    };

    const closeModal = () => {
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    if (!profile || !stats) return <div className="text-center text-primary text-3xl font-black mt-20 animate-pulse">Loading adventure... 🚀</div>;

    // XP Logic: stats.currentXP is total XP. Level is floor(XP/100)+1. 
    // Progress bar within level is XP % 100.
    const currentXP = stats.currentXP || 0;
    const level = Math.floor(currentXP / 100) + 1;
    const progress = currentXP % 100;

    // Daily Quests Data
    const hasBreakfast = stats.dailyQuests?.breakfast || false;
    const waterIntake = stats.dailyQuests?.water || 0;

    return (
        <div className="flex flex-col h-screen w-full relative z-10 bg-background-light dark:bg-background-dark overflow-hidden">
            <KidsModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                icon={modalConfig.icon}
            />

            {/* Header Overlay */}
            <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 md:p-3 rounded-xl shadow-lg flex items-center gap-3">
                        <div className="size-8 md:size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-2xl md:text-3xl">child_care</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-white leading-none">NutriKid</h1>
                            <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest">Adventures</span>
                        </div>
                    </div>
                </div>

                {/* XP Bar Section */}
                <div className="flex-1 max-w-sm md:max-w-2xl px-4 md:px-12">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-2 md:p-4 shadow-xl border border-white/20">
                        <div className="flex justify-between items-end mb-1 md:mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl md:text-2xl">🏆</span>
                                <span className="text-sm md:text-lg font-extrabold text-slate-800 dark:text-white">Level {level} Hero</span>
                            </div>
                            <span className="text-xs md:text-sm font-bold text-primary bg-primary/10 px-2 md:px-3 py-1 rounded-full">{currentXP} XP</span>
                        </div>
                        <div className="relative w-full h-3 md:h-5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="absolute top-0 left-0 h-full bg-primary rounded-full shadow-[0_0_15px_rgba(43,157,238,0.5)]"
                            >
                                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Exit Button - Safe Exit */}
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/parent/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-sm md:text-base"
                    >
                        <span className="material-symbols-outlined text-lg md:text-2xl">logout</span>
                        <span className="hidden sm:inline">Exit</span>
                    </button>
                </div>
            </header>

            {/* Main Play Area - Responsive Layout */}
            <main className="flex-1 relative flex flex-col xl:flex-row items-center justify-center p-4 md:p-8 overflow-y-auto custom-scrollbar gap-8">

                {/* Left Side: Badges (Hidden on mobile, visible on desktop, or scrollable?) */}
                {/* On mobile, maybe hide or show small? Keeping hidden on small per original design intent, but verifying rule 5 */}
                <aside className="hidden xl:flex flex-col gap-4 absolute left-8 top-1/2 -translate-y-1/2">
                    <div className="flex flex-col items-center gap-2 p-4 bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-white/20">
                        <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2">My Badges</p>
                        {stats.badges.length > 0 ? stats.badges.map((badge, i) => (
                            <div key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/80 shadow-lg flex items-center justify-center border-4 border-white cursor-pointer hover:rotate-12 transition-transform relative group" title={badge.name}>
                                <span className="text-3xl md:text-4xl">{badge.icon}</span>
                                {/* Tooltip */}
                                <div className="absolute left-full ml-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                                    {badge.name}
                                </div>
                            </div>
                        )) : (
                            // Placeholder if no badges yet
                            <div className="w-20 h-20 rounded-full bg-slate-300 shadow-inner flex items-center justify-center border-4 border-white opacity-50 grayscale group relative">
                                <span className="material-symbols-outlined text-white text-4xl">lock</span>
                                <div className="absolute left-full ml-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                                    Eat healthy to unlock!
                                </div>
                            </div>
                        )}
                        {/* Locked slots */}
                        {[...Array(Math.max(0, 3 - stats.badges.length))].map((_, i) => (
                            <div key={`locked-${i}`} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-300 shadow-inner flex items-center justify-center border-4 border-white opacity-50 grayscale group relative cursor-help">
                                <span className="material-symbols-outlined text-white text-3xl md:text-4xl">lock</span>
                                <div className="absolute left-full ml-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                                    Complete more meals to unlock!
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Center Mascot & Chat Area */}
                <div className="flex flex-col items-center justify-center w-full max-w-3xl relative">

                    {/* Chat Interface - Extracted & Z-Indexed */}
                    <div className="w-full max-w-xl mb-10 md:mb-14 relative z-50">
                        <FoodBuddyChat profileId={id} />
                    </div>

                    {/* Mascot Image - Lower Z-Index to prevent overlap issues */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="relative shrink-0 z-0"
                    >
                        <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full"></div>
                        <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-white/10 rounded-full flex items-center justify-center text-[6rem] md:text-[8rem] lg:text-[10rem] shadow-2xl border-4 border-white/30 backdrop-blur-sm select-none">
                            {profile.avatar === 'lion' && '🦁'}
                            {profile.avatar === 'bear' && '🐻'}
                            {profile.avatar === 'rabbit' && '🐰'}
                            {profile.avatar === 'fox' && '🦊'}
                            {profile.avatar === 'cat' && '🐱'}
                            {profile.avatar === 'dog' && '🐶'}
                        </div>
                    </motion.div>
                </div>

                {/* Right Side Daily Quests - Stack below on mobile if needed, or sidebar on desktop */}
                {/* On mobile/tablet, show as a panel below mascot? */}
                <aside className="w-full max-w-sm xl:w-72 xl:absolute xl:right-8 xl:top-1/2 xl:-translate-y-1/2 mt-8 xl:mt-0">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/50">
                        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-4">Daily Quests</h3>
                        <div className="space-y-4">
                            {/* Quest 1: Breakfast */}
                            <div className={`flex items-center gap-4 p-3 rounded-2xl border transition-colors ${hasBreakfast ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700'}`}>
                                <div className={`size-10 rounded-lg flex items-center justify-center text-white shrink-0 ${hasBreakfast ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span className="material-symbols-outlined">{hasBreakfast ? 'check_circle' : 'egg_alt'}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">Eat Breakfast</p>
                                    <p className={`text-[10px] font-bold uppercase ${hasBreakfast ? 'text-green-600' : 'text-slate-400'}`}>
                                        {hasBreakfast ? 'Done! +50 XP' : 'Not yet!'}
                                    </p>
                                </div>
                            </div>

                            {/* Quest 2: Water */}
                            <div className="flex items-center gap-4 p-3 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                                <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                                    <span className="material-symbols-outlined">water_full</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">Drink Water</p>
                                    <p className="text-[10px] text-primary font-bold uppercase">{waterIntake} Glasses</p>
                                </div>
                            </div>
                        </div>

                        {/* ASK PARENT BUTTON (Fixed Safety Rule) */}
                        <button
                            onClick={() => openModal("Ask a Parent!", "Ask your mom or dad to help you log your yummy meal! 🍎", "family_star")}
                            className="w-full mt-6 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            ASK PARENT TO LOG MEAL
                        </button>
                    </div>
                </aside>
            </main>

            {/* Bottom Navigation */}
            <footer className="relative z-20 pb-4 md:pb-8 flex justify-center shrink-0 px-4">
                <div className="flex items-center gap-2 md:gap-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-2 md:p-4 rounded-[2.5rem] shadow-2xl border border-white/40">
                    <button
                        onClick={() => openModal("Coming Soon! 🗺️", "The Adventure Map is being drawn! Check back later.", "map")}
                        className="flex flex-col items-center gap-1 group px-3 md:px-6 py-2 md:py-3 rounded-3xl hover:bg-white dark:hover:bg-slate-700 transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-4xl text-primary group-hover:scale-110 transition-transform">map</span>
                        <span className="text-[9px] md:text-xs font-bold text-slate-700 dark:text-slate-300">Adventure Map</span>
                    </button>
                    <div className="w-px h-8 md:h-12 bg-slate-300 dark:bg-slate-600"></div>
                    <button
                        onClick={() => openModal("Coming Soon! 📒", "We are printing your Sticker Book! Stay tuned.", "collections_bookmark")}
                        className="flex flex-col items-center gap-1 group px-3 md:px-6 py-2 md:py-3 rounded-3xl hover:bg-white dark:hover:bg-slate-700 transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-4xl text-primary group-hover:scale-110 transition-transform">collections_bookmark</span>
                        <span className="text-[9px] md:text-xs font-bold text-slate-700 dark:text-slate-300">Sticker Book</span>
                    </button>
                    <div className="w-px h-8 md:h-12 bg-slate-300 dark:bg-slate-600"></div>
                    <button
                        onClick={() => openModal("Coming Soon! 🎮", "More Mini Games are loading... Be ready!", "sports_esports")}
                        className="flex flex-col items-center gap-1 group px-3 md:px-6 py-2 md:py-3 rounded-3xl hover:bg-white dark:hover:bg-slate-700 transition-all w-24 md:w-auto"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-4xl text-primary group-hover:scale-110 transition-transform">sports_esports</span>
                        <span className="text-[9px] md:text-xs font-bold text-slate-700 dark:text-slate-300">Mini Games</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default KidsDashboard;
