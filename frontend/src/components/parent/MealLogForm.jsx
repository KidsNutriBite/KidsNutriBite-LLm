import { useState } from 'react';
import { logMeal } from '../../api/meal.api';

const MealLogForm = ({ profileId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        mealType: 'breakfast',
        date: new Date().toISOString().split('T')[0],
        foodItems: [{ name: '', quantity: '' }],
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.foodItems];
        newItems[index][field] = value;
        setFormData({ ...formData, foodItems: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            foodItems: [...formData.foodItems, { name: '', quantity: '' }]
        });
    };

    const removeItem = (index) => {
        if (formData.foodItems.length === 1) return;
        const newItems = formData.foodItems.filter((_, i) => i !== index);
        setFormData({ ...formData, foodItems: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Filter out empty items
            const validItems = formData.foodItems.filter(item => item.name.trim() !== '');

            if (validItems.length === 0) {
                throw new Error('Please add at least one food item');
            }

            await logMeal({
                profileId,
                ...formData,
                foodItems: validItems
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to log meal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full mt-1 border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Meal Type</label>
                    <select
                        value={formData.mealType}
                        onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                        className="w-full mt-1 border rounded px-3 py-2"
                    >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="snack">Snack</option>
                        <option value="dinner">Dinner</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Items</label>
                {formData.foodItems.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Food name (e.g. Oatmeal)"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="flex-1 border rounded px-3 py-2"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Qty (e.g. 1 cup)"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-1/3 border rounded px-3 py-2"
                            required
                        />
                        {formData.foodItems.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="px-2 text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-primary hover:underline mt-1"
                >
                    + Add another item
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full mt-1 border rounded px-3 py-2"
                    rows="2"
                />
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
                    {loading ? 'Saving...' : 'Log Meal'}
                </button>
            </div>
        </form>
    );
};

export default MealLogForm;
