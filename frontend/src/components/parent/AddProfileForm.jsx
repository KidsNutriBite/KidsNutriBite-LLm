import { useState } from 'react';
import { createProfile } from '../../api/profile.api';

const AddProfileForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        height: '',
        weight: '',
        avatar: 'lion', // Default
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const avatars = ['lion', 'bear', 'rabbit', 'fox', 'cat', 'dog'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createProfile({
                ...formData,
                age: Number(formData.age),
                height: Number(formData.height),
                weight: Number(formData.weight),
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div>
                <label className="block text-sm font-medium text-gray-700">Child's Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full mt-1 border rounded px-3 py-2"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                        className="w-full mt-1 border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full mt-1 border rounded px-3 py-2"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                    <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        required
                        className="w-full mt-1 border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        required
                        className="w-full mt-1 border rounded px-3 py-2"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Avatar</label>
                <div className="flex gap-2 overflow-x-auto p-1">
                    {avatars.map((av) => (
                        <button
                            key={av}
                            type="button"
                            onClick={() => setFormData({ ...formData, avatar: av })}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all ${formData.avatar === av ? 'border-primary bg-blue-50 scale-110' : 'border-transparent bg-gray-100'
                                }`}
                        >
                            {/* Simple emoji mapping for now */}
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

            <div className="flex gap-3 justify-end mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Create Profile'}
                </button>
            </div>
        </form>
    );
};

export default AddProfileForm;
