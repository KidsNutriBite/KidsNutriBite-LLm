
import { Outlet, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ParentLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-slate-800 dark:text-slate-200">
            {/* Top Navbar */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg text-white">
                        <span className="material-symbols-outlined text-3xl">child_care</span>
                    </div>
                    <Link to="/parent/dashboard" className="text-slate-900 dark:text-white text-2xl font-extrabold tracking-tight">NutriKid</Link>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/parent/dashboard" className="text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-1">Home</Link>
                    <Link to="/parent/resources" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors">Resources</Link>
                    <Link to="/parent/messages" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors">Messages</Link>
                    <Link to="/parent/directory" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors">Directory</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                    </button>
                    <div className="flex items-center gap-3 border-l pl-4 border-slate-200 dark:border-slate-800">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold leading-none">{user?.name || 'Parent'}</p>
                            <button onClick={handleLogout} className="text-[10px] text-red-500 uppercase tracking-widest font-semibold hover:underline">LOGOUT</button>
                        </div>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20 cursor-pointer" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBryf65dSoQ4qPN83cH4G5ueRNLV9amWd16u3TlvEeDctJ_uLYg2Cq3rp4H-_gtR179DzJ1KNJACZxyYg593GpPx71HE4JXhu6OapdHSMexsSk4iu73ualPaRK0kohvOsIVc2lVKkyt-X32Lz7Gbx_ix621ZH6se_Md-0pdNHEM-WXoi-sn90RyUIVQMG_fx8XJ2R3aqt6mDX_8CQ8IXD-ecUGqY1II16YPgxMui01roTDikxHkj88K2KcjA_hhhwP4GK9uI-kFO_U')" }}></div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto w-full px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default ParentLayout;
