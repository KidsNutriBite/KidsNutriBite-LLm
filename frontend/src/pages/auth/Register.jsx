
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import SimpleNavbar from '../../components/common/SimpleNavbar';

const Register = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'parent',
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam && (roleParam === 'parent' || roleParam === 'doctor')) {
            setFormData(prev => ({ ...prev, role: roleParam }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (role) => {
        setFormData(prev => ({ ...prev, role }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await register(formData);
            if (user.role === 'parent') navigate('/parent/dashboard');
            else if (user.role === 'doctor') navigate('/doctor/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col lg:flex-row overflow-x-hidden bg-background-light dark:bg-background-dark text-[#0d161b] dark:text-slate-100 pt-24 lg:pt-0">
            <SimpleNavbar />
            {/* Left Side: Mascot & Brand (Reuse from Login or slightly modified) */}
            <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-primary/10 dark:bg-primary/5 p-12 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-green-200/30 dark:bg-green-900/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-center max-w-md">
                    <div className="mb-8 flex justify-center">
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
                            <h2 className="text-3xl font-extrabold text-[#0d161b] dark:text-white mb-4">Join the fun!</h2>
                            <p className="text-[#4c799a] dark:text-slate-400 text-lg leading-relaxed">
                                Create an account to start tracking, learning, and growing healthy habits.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20">
                <div className="w-full max-w-[480px]">
                    <header className="mb-8">
                        <h1 className="text-4xl font-black text-[#0d161b] dark:text-white leading-tight mb-2">Create Account</h1>
                        <p className="text-[#4c799a] dark:text-slate-400">Choose your account type to get started</p>
                    </header>

                    {error && (
                        <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                            {error}
                        </div>
                    )}

                    {/* Role Selector */}
                    <div className="flex p-1.5 mb-8 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <label className="flex-1 cursor-pointer group">
                            <input
                                type="radio"
                                name="role"
                                value="parent"
                                checked={formData.role === 'parent'}
                                onChange={() => handleRoleChange('parent')}
                                className="hidden peer"
                            />
                            <div className="flex items-center justify-center gap-3 py-4 rounded-lg text-[#4c799a] dark:text-slate-400 font-semibold transition-all peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-primary peer-checked:shadow-sm">
                                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">family_history</span>
                                <span>Parent / Guardian</span>
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer group">
                            <input
                                type="radio"
                                name="role"
                                value="doctor"
                                checked={formData.role === 'doctor'}
                                onChange={() => handleRoleChange('doctor')}
                                className="hidden peer"
                            />
                            <div className="flex items-center justify-center gap-3 py-4 rounded-lg text-[#4c799a] dark:text-slate-400 font-semibold transition-all peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-primary peer-checked:shadow-sm">
                                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">medical_services</span>
                                <span>Healthcare Hero</span>
                            </div>
                        </label>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            {/* Common Fields */}
                            <div className="space-y-1">
                                <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">Full Name</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">person</span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">alternate_email</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder={formData.role === 'doctor' ? "e.g. doctor@hospital.com" : "e.g. parent@email.com"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">lock</span>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="Create a strong password"
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>

                            {/* Dynamic Fields based on Role */}
                            {formData.role === 'parent' ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber || ''}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                                                placeholder="+91XXXXXXXXXX"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city || ''}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                                                placeholder="Coimbatore "
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">Relationship to Child</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">
                                                {formData.relationToChild === 'Mother' ? 'female' :
                                                    formData.relationToChild === 'Father' ? 'male' :
                                                        formData.relationToChild === 'Guardian' ? 'shield_person' : 'person'}
                                            </span>
                                            <select
                                                name="relationToChild"
                                                value={formData.relationToChild || ''}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary outline-none transition-all font-medium appearance-none"
                                            >
                                                <option value="" disabled>Select Relationship</option>
                                                <option value="Mother">Mother</option>
                                                <option value="Father">Father</option>
                                                <option value="Guardian">Guardian</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">Specialization</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">stethoscope</span>
                                            <input
                                                type="text"
                                                name="specialization"
                                                value={formData.specialization || ''}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                                                placeholder="e.g. Pediatrician"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">Hospital / Clinic</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">local_hospital</span>
                                            <input
                                                type="text"
                                                name="hospitalName"
                                                value={formData.hospitalName || ''}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                                                placeholder="e.g. City Children's Hospital"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">Experience (Yrs)</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">history_edu</span>
                                                <input
                                                    type="number"
                                                    name="experienceYears"
                                                    value={formData.experienceYears || ''}
                                                    onChange={handleChange}
                                                    required
                                                    min="0"
                                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                                                    placeholder="e.g. 5"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[#0d161b] dark:text-slate-200 text-sm font-bold ml-1">Medical ID</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c799a] text-xl">badge</span>
                                                <input
                                                    type="text"
                                                    name="registrationId"
                                                    value={formData.registrationId || ''}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-[#0d161b] dark:text-white focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                                                    placeholder="License ID"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <button type="submit" className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                            <span>Create Account</span>
                            <span className="material-symbols-outlined">person_add</span>
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-[#4c799a] dark:text-slate-400 font-medium">
                            Already have an account?
                            <Link to="/login" className="text-primary font-bold hover:underline ml-1">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
