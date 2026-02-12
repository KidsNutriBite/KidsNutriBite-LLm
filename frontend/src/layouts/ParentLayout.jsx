
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const ParentLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.data.notifications);
            setUnreadCount(data.data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Poll for notifications
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-slate-800 dark:text-slate-200">
            {/* Top Navbar */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined">{showMobileMenu ? 'close' : 'menu'}</span>
                    </button>

                    <div className="bg-primary p-2 rounded-lg text-white">
                        <span className="material-symbols-outlined text-3xl">child_care</span>
                    </div>
                    <Link to="/parent/dashboard" className="text-slate-900 dark:text-white text-2xl font-extrabold tracking-tight hidden sm:block">NutriKid</Link>
                    <Link to="/parent/dashboard" className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight sm:hidden">NutriKid</Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        to="/parent/dashboard"
                        className={isActive('/parent/dashboard') ? "text-primary text-sm font-bold leading-normal border-b-2 border-primary pb-1" : "text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"}
                    >
                        Home
                    </Link>
                    <Link
                        to="/parent/resources"
                        className={isActive('/parent/resources') ? "text-primary text-sm font-bold leading-normal border-b-2 border-primary pb-1" : "text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"}
                    >
                        Resources
                    </Link>
                    <Link
                        to="/parent/access"
                        className={isActive('/parent/access') ? "text-primary text-sm font-bold leading-normal border-b-2 border-primary pb-1" : "text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"}
                    >
                        Doctor Access
                    </Link>
                    <Link
                        to="/parent/directory"
                        className={isActive('/parent/directory') ? "text-primary text-sm font-bold leading-normal border-b-2 border-primary pb-1" : "text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"}
                    >
                        Directory
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                            className="flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 transition-colors relative"
                        >
                            <span className="material-symbols-outlined text-xl">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-slate-900">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifDropdown && (
                            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                                    <span className="text-xs text-gray-500">{unreadCount} unread</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div
                                                key={notif._id}
                                                onClick={() => !notif.isRead && markAsRead(notif._id)}
                                                className={`p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                    <div>
                                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{notif.message}</p>
                                                        <span className="text-xs text-gray-400 mt-1 block">
                                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <div
                            className="flex items-center gap-3 border-l pl-4 border-slate-200 dark:border-slate-800 cursor-pointer"
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none">{user?.name || 'Parent'}</p>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{user?.role}</span>
                            </div>
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20"
                                style={{ backgroundImage: `url('${user?.profileImage || 'https://avatar.iran.liara.run/public'}')` }}
                            ></div>
                        </div>

                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                                <Link
                                    to="/parent/profile"
                                    onClick={() => setShowProfileDropdown(false)}
                                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    My Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-100 dark:border-slate-700"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-[73px] z-40 shadow-lg">
                    <nav className="flex flex-col gap-2">
                        <Link
                            to="/parent/dashboard"
                            onClick={() => setShowMobileMenu(false)}
                            className={isActive('/parent/dashboard') ? "bg-primary/10 text-primary font-bold px-4 py-3 rounded-xl" : "text-slate-600 dark:text-slate-400 font-medium px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">home</span>
                                Home
                            </div>
                        </Link>
                        <Link
                            to="/parent/resources"
                            onClick={() => setShowMobileMenu(false)}
                            className={isActive('/parent/resources') ? "bg-primary/10 text-primary font-bold px-4 py-3 rounded-xl" : "text-slate-600 dark:text-slate-400 font-medium px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">library_books</span>
                                Resources
                            </div>
                        </Link>
                        <Link
                            to="/parent/access"
                            onClick={() => setShowMobileMenu(false)}
                            className={isActive('/parent/access') ? "bg-primary/10 text-primary font-bold px-4 py-3 rounded-xl" : "text-slate-600 dark:text-slate-400 font-medium px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">verified_user</span>
                                Doctor Access
                            </div>
                        </Link>
                        <Link
                            to="/parent/directory"
                            onClick={() => setShowMobileMenu(false)}
                            className={isActive('/parent/directory') ? "bg-primary/10 text-primary font-bold px-4 py-3 rounded-xl" : "text-slate-600 dark:text-slate-400 font-medium px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">local_hospital</span>
                                Directory
                            </div>
                        </Link>
                    </nav>
                </div>
            )}

            <main className="max-w-[1200px] mx-auto w-full px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default ParentLayout;
