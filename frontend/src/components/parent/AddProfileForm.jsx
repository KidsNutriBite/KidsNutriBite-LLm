"use client";
import { useState } from 'react';
import api from '../../api/axios';

const STATE_CITIES = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "South Extension"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Agra", "Varanasi"],
    "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri"]
};

const AddProfileForm = ({ onSuccess, onCancel }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showWaistInfo, setShowWaistInfo] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        height: '',
        weight: '',
        waistCircumference: '',
        avatar: 'lion',
        city: '',
        state: '',
        healthConditions: [], // Multi-select
        otherCondition: '',
    });

    const [profileImage, setProfileImage] = useState(null);
    const [medicalDocs, setMedicalDocs] = useState([]);

    const healthOptions = [
        { id: 'iron_deficiency', label: 'Iron Deficiency' },
        { id: 'diabetes', label: 'Diabetes' },
        { id: 'obesity', label: 'Obesity' },
        { id: 'lactose_intolerance', label: 'Lactose Intolerance' },
        { id: 'peanut_allergy', label: 'Peanut Allergy' },
        { id: 'asthma', label: 'Asthma' },
        { id: 'other', label: 'Other/Custom' },
    ];

    const avatars = ['lion', 'bear', 'rabbit', 'fox', 'cat', 'dog'];

    const handleConditionToggle = (id) => {
        setFormData(prev => {
            const exists = prev.healthConditions.includes(id);
            if (exists) {
                return { ...prev, healthConditions: prev.healthConditions.filter(c => c !== id) };
            } else {
                return { ...prev, healthConditions: [...prev.healthConditions, id] };
            }
        });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        if (type === 'image') {
            setProfileImage(file);
        } else if (type === 'docs') {
            setMedicalDocs(prev => [...prev, file]);
        }
    };

    const removeFile = (type, index = null) => {
        if (type === 'image') {
            setProfileImage(null);
        } else if (type === 'docs') {
            setMedicalDocs(prev => prev.filter((_, i) => i !== index));
        }
    };

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!formData.name.trim()) return "Child's name is required";
            if (!formData.age || formData.age < 0 || formData.age > 18) return "Valid age (0-18) is required";
            if (!formData.height || formData.height <= 0) return "Valid height (no negative values) is required";
            if (!formData.weight || formData.weight <= 0) return "Valid weight (no negative values) is required";
            if (!formData.waistCircumference || formData.waistCircumference <= 0) return "Valid waist circumference (no negative values) is required";
        }
        if (currentStep === 2) {
            if (formData.healthConditions.includes('other') && !formData.otherCondition.trim()) {
                return "Please specify the 'Other' condition";
            }
        }
        if (currentStep === 3) {
            if (!formData.state.trim()) return "State is required";
            if (!formData.city.trim()) return "City is required";
        }
        return null;
    };

    const nextStep = () => {
        const validationError = validateStep(step);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setStep(s => s + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(s => s - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateStep(3); // Validate last step before submit
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = new FormData();

            // Auto-generate a dummy DOB since backend requires it, based on age
            const dob = new Date();
            dob.setFullYear(dob.getFullYear() - parseInt(formData.age || 0));

            data.append('name', formData.name);
            data.append('dob', dob.toISOString());
            data.append('age', formData.age);
            data.append('gender', formData.gender);
            data.append('height', formData.height);
            data.append('weight', formData.weight);
            data.append('waistCircumference', formData.waistCircumference);
            data.append('avatar', formData.avatar);
            data.append('city', formData.city);
            data.append('state', formData.state);

            formData.healthConditions.forEach(cond => {
                if (cond === 'other') {
                    if (formData.otherCondition.trim()) {
                        data.append('healthConditions[]', formData.otherCondition.trim());
                    }
                } else {
                    data.append('healthConditions[]', cond);
                }
            });

            if (profileImage) data.append('profileImage', profileImage);
            medicalDocs.forEach(doc => data.append('medicalReports', doc));

            await api.post('/profiles', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-white border-2 transition-colors ${step >= i ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-400'}`}>
                        {i}
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">error</span>
                    {error}
                </div>
            )}

            {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
                    <h3 className="text-lg font-bold text-gray-800">Basic Information</h3>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                                {profileImage ? (
                                    <img src={URL.createObjectURL(profileImage)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-gray-400 text-3xl">add_a_photo</span>
                                )}
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                            </div>
                            {profileImage && (
                                <button
                                    type="button"
                                    onClick={() => removeFile('image')}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                                    title="Remove image"
                                >
                                    <span className="material-symbols-outlined text-sm block">close</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Child's Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter name"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Age (Years) <span className="text-red-500">*</span></label>
                            <input
                                type="number" min="0" max="18"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                placeholder="e.g. 5"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Height (cm) <span className="text-red-500">*</span></label>
                            <input
                                type="number" min="0" step="0.1"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                placeholder="e.g. 120"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (kg) <span className="text-red-500">*</span></label>
                            <input
                                type="number" min="0" step="0.1"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                placeholder="e.g. 25"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Waist Circ. (cm) <span className="text-red-500">*</span>
                                <button type="button" onClick={() => setShowWaistInfo(!showWaistInfo)} className="ml-2 text-xs text-blue-500 underline hover:text-blue-700">Learn more</button>
                            </label>
                            <input
                                type="number" min="0" step="0.1"
                                value={formData.waistCircumference}
                                onChange={(e) => setFormData({ ...formData, waistCircumference: e.target.value })}
                                placeholder="e.g. 50"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                            />
                            {showWaistInfo && (
                                <div className="absolute z-10 w-64 p-4 mt-2 text-sm bg-white border border-gray-200 rounded-lg shadow-2xl right-0 top-full transform translate-y-1">
                                    <h4 className="font-bold text-gray-800 mb-2">What is Waist Circumference?</h4>
                                    <p className="mb-3 text-gray-600">Doctors measure this to screen for possible health risks that come with overweight and obesity.</p>
                                    <h5 className="font-semibold text-gray-700 mb-1">How to measure:</h5>
                                    <ul className="pl-5 list-disc text-gray-600 space-y-1">
                                        <li>Find top of hip bone & bottom of ribs.</li>
                                        <li>Place tape measure midway (just above belly button).</li>
                                        <li>Measure after breathing out gently.</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Avatar</label>
                        <div className="flex gap-3 overflow-x-auto p-1 pb-2">
                            {avatars.map((av) => (
                                <button
                                    key={av}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, avatar: av })}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${formData.avatar === av ? 'border-blue-500 bg-blue-50 scale-110 shadow-md' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    {av === 'lion' && '🦁'}
                                    {av === 'bear' && '🐻'}
                                    {av === 'rabbit' && '🐰'}
                                    {av === 'fox' && '🦊'}
                                    {av === 'cat' && '🐱'}
                                    {av === 'dog' && '🐶'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
                    <h3 className="text-lg font-bold text-gray-800">Health & Conditions</h3>
                    <p className="text-sm text-gray-500">Select any known conditions to get personalized tips.</p>

                    <div className="grid grid-cols-2 gap-3">
                        {healthOptions.map(opt => (
                            <div
                                key={opt.id}
                                onClick={() => handleConditionToggle(opt.id)}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-2 ${formData.healthConditions.includes(opt.id) ? 'border-blue-500 bg-blue-50 text-blue-600 font-bold shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.healthConditions.includes(opt.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                                    {formData.healthConditions.includes(opt.id) && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                                </div>
                                <span className="text-sm">{opt.label}</span>
                            </div>
                        ))}
                    </div>

                    {formData.healthConditions.includes('other') && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Please specify condition <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.otherCondition}
                                onChange={(e) => setFormData({ ...formData, otherCondition: e.target.value })}
                                placeholder="E.g. Eczema, Migraine..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Medical Reports</label>
                        {medicalDocs.length > 0 && (
                            <div className="mb-3 space-y-2">
                                {medicalDocs.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="material-symbols-outlined text-gray-500">description</span>
                                            <span className="text-sm text-gray-700 truncate max-w-[150px]">{file.name}</span>
                                            <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile('docs', idx)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative cursor-pointer group">
                            <input type="file" multiple accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'docs')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                            <div className="group-hover:scale-105 transition-transform duration-200">
                                <span className="material-symbols-outlined text-gray-400 text-4xl mb-2 group-hover:text-blue-500">upload_file</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Click to upload reports</p>
                            <p className="text-xs text-gray-400 mt-1">PDF or Images (Max 5MB)</p>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
                    <h3 className="text-lg font-bold text-gray-800">Location</h3>
                    <p className="text-sm text-gray-500">Used to find nearby pediatricians.</p>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                        <select
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '' })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="">Select State</option>
                            {Object.keys(STATE_CITIES).sort().map(st => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                        <select
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
                            disabled={!formData.state}
                        >
                            <option value="">Select City</option>
                            {formData.state && STATE_CITIES[formData.state]?.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-100 mt-4">
                {step > 1 ? (
                    <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Back
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                )}

                {step < 3 ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="px-8 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Creating Profile...' : 'Complete Setup'}
                    </button>
                )}
            </div>
        </form>
    );
};

export default AddProfileForm;
