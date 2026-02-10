import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ParentLayout from './layouts/ParentLayout';
import DoctorLayout from './layouts/DoctorLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildDetails from './pages/parent/ChildDetails';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDetails from './pages/doctor/PatientDetails';
import KidsLayout from './layouts/KidsLayout';
import KidsDashboard from './pages/kids/KidsDashboard';
import ComingSoon from './pages/common/ComingSoon';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/" element={<LandingPage />} />

                    {/* Parent Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
                        import ComingSoon from './pages/common/ComingSoon';

                        // ... (keep existing imports)

                        // Inside Parent Routes:
                        <Route path="/parent" element={<ParentLayout />}>
                            <Route path="dashboard" element={<ParentDashboard />} />
                            <Route path="child/:id" element={<ChildDetails />} />
                            <Route path="resources" element={<ComingSoon title="Resources Library" description="Access nutrition guides, recipes, and parenting tips coming soon!" />} />
                            <Route path="messages" element={<ComingSoon title="Messages" description="Chat with nutritionists and doctors directly from here." />} />
                            <Route path="directory" element={<ComingSoon title="Pediatrician Directory" description="Find and connect with top child specialists near you." />} />
                        </Route>
                    </Route>

                    {/* Doctor Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                        <Route path="/doctor" element={<DoctorLayout />}>
                            <Route path="dashboard" element={<DoctorDashboard />} />
                            <Route path="patients/:id" element={<PatientDetails />} />
                        </Route>
                    </Route>

                    {/* Kids Routes (Protected by Parent Role implicitly via entry point, but we enforce accessible by Parent) */}
                    <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
                        <Route path="/kids" element={<KidsLayout />}>
                            <Route path=":id/dashboard" element={<KidsDashboard />} />
                        </Route>
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
