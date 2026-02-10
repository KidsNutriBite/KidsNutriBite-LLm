
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import SimpleNavbar from '../../components/common/SimpleNavbar';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(email, password);
            if (user.role === 'parent') navigate('/parent/dashboard');
            else if (user.role === 'doctor') navigate('/doctor/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col lg:flex-row overflow-x-hidden bg-background-light dark:bg-background-dark text-[#0d161b] dark:text-slate-100 pt-24 lg:pt-0">
            <SimpleNavbar />
            {/* Left Side: Mascot & Brand (Playful) */}
            <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-primary/10 dark:bg-primary/5 p-12 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-green-200/30 dark:bg-green-900/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-center max-w-md">
                    <div className="mb-8 flex justify-center">
                        {/* Logo Component */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 text-primary">
                                <span className="material-symbols-outlined text-4xl">nutrition</span>
                            </div>
                            <h1 className="text-2xl font-black text-primary tracking-tight">NutriKid</h1>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-xl relative mt-12 mb-10">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-contain bg-no-repeat" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5iFQF5PvsrBF5KoKLWA0Pab87ovOtRxXtk-paD_POUwT3mSt2bXLFcpL57AVszQ6AAwq4lqrWi7iX_e-TsQw1D66wzy54-s_vRDetO8JqDGJcLFx3tgsxgb6MVwhzxuTbSZhOMgZQ1r7dZX_y8nbWqhoS0Bkvh1JKLwOuxi9qPau02n7KXIIkbI0GNuhl8wPLWsjl4PZ4D6eJZpQhXsKPPqFeXo9mRPa3vgFlLl3sUNzteYIdaVS7tFXnptkfdxAYkLntMvUzYw8')" }}></div>
                        <div className="pt-16">
                            <h2 className="text-3xl font-extrabold text-[#0d161b] dark:text-white mb-4">Welcome back!</h2>
                            <p className="text-[#4c799a] dark:text-slate-400 text-lg leading-relaxed">
                                Ready for another healthy day? Let's make nutrition a fun adventure together.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <div className="w-12 h-1 bg-primary rounded-full"></div>
                        <div className="w-2 h-1 bg-primary/30 rounded-full"></div>
                        <div className="w-2 h-1 bg-primary/30 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form (Clean & Soft) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20">
                <div className="w-full max-w-[480px]">
                    <header className="mb-10 lg:hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 text-primary">
                                <span className="material-symbols-outlined text-3xl">nutrition</span>
                            </div>
                            <h2 className="text-xl font-bold text-primary">NutriKid</h2>
                        </div>
                        <h1 className="text-3xl font-black text-[#0d161b] dark:text-white leading-tight">Nice to see you again!</h1>
                    </header>

                    <div className="hidden lg:block mb-8">
                        <h1 className="text-4xl font-black text-[#0d161b] dark:text-white leading-tight mb-2">Sign In</h1>
                        <p className="text-[#4c799a] dark:text-slate-400">Enter your details to access your account</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[#0d161b] dark:text-slate-200 text-base font-semibold ml-1">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">alternate_email</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g. happy_parent@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[#0d161b] dark:text-slate-200 text-base font-semibold">Password</label>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">lock</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end px-1">
                            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </Link>
                        </div>


                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="remember" className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20" />
                            <label htmlFor="remember" className="text-sm font-medium text-[#4c799a] dark:text-slate-400 select-none cursor-pointer">Stay logged in for healthy reminders</label>
                        </div>

                        <button type="submit" className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                            <span>Let's Go!</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-[#4c799a] dark:text-slate-400 font-medium">
                            New to the NutriKid family?
                            <Link to="/register" className="text-primary font-bold hover:underline ml-1">Create an account</Link>
                        </p>
                    </div>

                    <footer className="mt-12 flex justify-center gap-6 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Login;
