import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPendingRequests, approveRequest, rejectRequest, inviteDoctor, getAccessList, revokeAccess } from '../../api/access.api';
import { getMyProfiles } from '../../api/profile.api';
import toast from 'react-hot-toast';

const DoctorAccess = () => {
    // State
    const [pendingRequests, setPendingRequests] = useState([]);
    const [activeAccess, setActiveAccess] = useState([]);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    // Invite Form State
    const [inviteEmail, setInviteEmail] = useState('');
    const [selectedChild, setSelectedChild] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);

    // Initial Fetch
    const fetchData = async () => {
        try {
            setLoading(true);
            const [pendingRes, activeRes, childrenRes] = await Promise.all([
                getPendingRequests(),
                getAccessList(),
                getMyProfiles()
            ]);
            setPendingRequests(pendingRes.data || pendingRes || []);
            setActiveAccess(activeRes.data || activeRes || []);
            setChildren(childrenRes.data || childrenRes || []);

            // Set default selected child if available
            if ((childrenRes.data || childrenRes || []).length > 0) {
                setSelectedChild((childrenRes.data || childrenRes)[0]._id);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load access settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail || !selectedChild) return;

        try {
            setInviteLoading(true);
            await inviteDoctor(inviteEmail, selectedChild);
            toast.success('Invitation sent successfully!');
            setInviteEmail('');
            fetchData(); // Refresh lists
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleApprove = async (requestId, profileId) => {
        if (!profileId) return toast.error('Please select a child profile');
        try {
            const loadingToast = toast.loading('Approving...');
            await approveRequest(requestId, profileId);
            toast.dismiss(loadingToast);
            toast.success('Access granted');
            fetchData();
        } catch (error) {
            toast.error('Failed to approve request');
        }
    };

    const handleReject = async (requestId) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;
        try {
            await rejectRequest(requestId);
            toast.success('Request rejected');
            fetchData();
        } catch (error) {
            toast.error('Failed to reject request');
        }
    };

    const handleRevoke = async (requestId) => {
        if (!window.confirm('Are you sure you want to revoke access? The doctor will no longer see this child\'s data.')) return;
        try {
            await revokeAccess(requestId);
            toast.success('Access revoked');
            fetchData();
        } catch (error) {
            toast.error('Failed to revoke access');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Doctor Access & Permissions</h1>
                <p className="text-gray-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500">verified</span>
                    Securely manage who can view your child's nutritional data and growth progress.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Requests & Access List */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Pending Requests */}
                    {pendingRequests.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold text-gray-800">Pending Requests</h2>
                                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">{pendingRequests.length} New</span>
                            </div>

                            {pendingRequests.map(req => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={req._id}
                                    className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex flex-col md:flex-row items-center gap-6"
                                >
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-sm shrink-0">
                                        👨‍⚕️
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="font-bold text-lg text-gray-900">{req.doctorId?.name || 'Unknown Doctor'}</h3>
                                        <p className="text-gray-500 text-sm">{req.doctorId?.email}</p>
                                        <p className="text-blue-600 text-xs font-bold mt-1">Requested access to your children</p>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <select
                                            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            onChange={(e) => {
                                                if (e.target.value) handleApprove(req._id, e.target.value);
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Child & Approve</option>
                                            {children.map(child => (
                                                <option key={child._id} value={child._id}>{child.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleReject(req._id)}
                                            className="px-4 py-2 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Current Access */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="material-symbols-outlined">group</span>
                            Current Access
                        </h2>

                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                            {activeAccess.length === 0 ? (
                                <div className="p-10 text-center text-gray-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">lock_person</span>
                                    <p>No doctors currently have access.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 px-6 py-4 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <div className="col-span-4">Doctor</div>
                                        <div className="col-span-3">Status</div>
                                        <div className="col-span-3">Access To</div>
                                        <div className="col-span-2 text-right">Action</div>
                                    </div>

                                    {activeAccess.map(access => (
                                        <div key={access._id} className="grid grid-cols-12 px-6 py-5 items-center hover:bg-gray-50/50 transition duration-150">
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                                                    {access.doctorId?.name?.charAt(0) || 'D'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{access.doctorId?.name}</p>
                                                    <p className="text-gray-400 text-xs">{access.doctorId?.doctorProfile?.specialization || 'Pediatrician'}</p>
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                    Active
                                                </span>
                                            </div>
                                            <div className="col-span-3 text-sm text-gray-600 font-medium">
                                                {access.profileId?.name}
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <button
                                                    onClick={() => handleRevoke(access._id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-bold hover:underline"
                                                >
                                                    Revoke
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shared History Prompt (Static for now as per design) */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400">history</span>
                            Shared Data History
                        </h3>
                        {activeAccess.length > 0 ? (
                            <div className="space-y-6 pl-4 border-l-2 border-gray-100 relative">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white"></div>
                                    <p className="text-sm font-bold text-gray-900">Permission Granted: Nutrition Log</p>
                                    <p className="text-xs text-gray-500 mt-0.5">You approved access for {activeAccess[0]?.doctorId?.name}. <span className="text-gray-400 ml-2">Today</span></p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm italic">No recent history.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Invite Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-50 border border-gray-100 sticky top-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Invite your Pediatrician</h2>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Send an invitation to your healthcare provider to connect with your family profile.
                        </p>

                        <form onSubmit={handleInvite} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Child Profile</label>
                                <div className="relative">
                                    <select
                                        value={selectedChild}
                                        onChange={(e) => setSelectedChild(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-4 outline-none appearance-none font-bold"
                                        required
                                    >
                                        <option value="" disabled>Select child...</option>
                                        {children.map(child => (
                                            <option key={child._id} value={child._id}>{child.name}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-gray-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Doctor's Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-4 pl-12 outline-none font-medium placeholder-gray-400"
                                        placeholder="doctor@clinic.com"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400">mail</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={inviteLoading || children.length === 0}
                                className="w-full text-white bg-primary hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {inviteLoading ? (
                                    <>
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">send</span>
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-600 shrink-0">verified_user</span>
                            <div>
                                <p className="text-xs font-bold text-blue-800 mb-1">SECURE & ENCRYPTED</p>
                                <p className="text-[10px] text-blue-600 leading-relaxed">
                                    NutriKid uses enterprise-grade encryption. Data sharing is fully compliant with medical privacy standards.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 bg-primary rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12">
                                <span className="material-symbols-outlined">support_agent</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2 relative z-10">Need help?</h3>
                            <p className="text-sm text-blue-100 mb-4 relative z-10">Learn how to control what information each provider can see.</p>
                            <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm flex items-center gap-2 relative z-10">
                                Read Guide <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorAccess;
