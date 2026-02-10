import { Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const DoctorLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-secondary">NutriKid Doctor</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Dr. {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default DoctorLayout;
