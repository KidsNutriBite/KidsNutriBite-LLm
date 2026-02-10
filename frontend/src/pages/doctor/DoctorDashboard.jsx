
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyPatients, requestAccess } from '../../api/doctor.api';
import Modal from '../../components/common/Modal';

const DoctorDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [parentEmail, setParentEmail] = useState('');
    const [requestStatus, setRequestStatus] = useState({ type: '', msg: '' });

    const navigate = useNavigate();

    const fetchPatients = async () => {
        try {
            const res = await getMyPatients();
            setPatients(res.data || res || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        setRequestStatus({ type: '', msg: '' });

        try {
            await requestAccess(parentEmail);
            setRequestStatus({ type: 'success', msg: 'Request sent successfully!' });
            setParentEmail('');
            setTimeout(() => setIsRequestModalOpen(false), 2000);
        } catch (error) {
            setRequestStatus({ type: 'error', msg: error.response?.data?.message || 'Failed to send request' });
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Patient Overview</h1>
                    <p className="text-gray-500 font-medium">Manage your patient list and requests</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="flex-1 md:flex-none px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 transition flex items-center justify-center gap-2"
                    >
                        <span>+</span> Request Access
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
            ) : patients.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-200"
                >
                    <div className="text-6xl mb-6 grayscale opacity-50">🩺</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No active patients</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Request access to a parent's email to start monitoring their child's health.</p>
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="px-8 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-blue-50 transition"
                    >
                        Send Access Request
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Name</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Demographics</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {patients.map((profile) => (
                                    <tr
                                        key={profile._id}
                                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/doctor/patients/${profile._id}`)}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                                                    {profile.avatar === 'lion' && '🦁'}
                                                    {profile.avatar === 'bear' && '🐻'}
                                                    {profile.avatar === 'rabbit' && '🐰'}
                                                    {profile.avatar === 'fox' && '🦊'}
                                                    {profile.avatar === 'cat' && '🐱'}
                                                    {profile.avatar === 'dog' && '🐶'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">{profile.name}</p>
                                                    <p className="text-xs text-gray-400">ID: {profile._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-medium text-gray-700">
                                                {profile.age} Years • {profile.gender}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {profile.height}cm • {profile.weight}kg
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                Healthy
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-primary font-bold hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors text-sm">
                                                Open Checkup →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Request Access Modal */}
            <Modal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                title="Request Patient Access"
            >
                <form onSubmit={handleRequestAccess} className="space-y-4">
                    {requestStatus.msg && (
                        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${requestStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            <span>{requestStatus.type === 'success' ? '✅' : '⚠️'}</span>
                            {requestStatus.msg}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Parent's Email Address</label>
                        <input
                            type="email"
                            required
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                            placeholder="parent@example.com"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors font-medium"
                        />
                        <p className="text-xs text-gray-400 mt-2">The parent will receive a notification to approve your access.</p>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all transform active:scale-95">Send Request</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DoctorDashboard;
