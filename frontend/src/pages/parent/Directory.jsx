import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingState from '../../components/common/LoadingState';

const PediatricianDirectory = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'rating'

    const fetchHospitals = async (lat, lng) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/hospitals/nearby?lat=${lat}&lng=${lng}&radius=20`);
            setHospitals(data.data || []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to fetch nearby hospitals');
        } finally {
            setLoading(false);
        }
    };

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchHospitals(latitude, longitude);
            },
            (err) => {
                setLoading(false);
                setError('Location access is required to find nearby pediatric care.');
            }
        );
    };

    // Sorting Logic
    const sortedHospitals = [...hospitals].sort((a, b) => {
        if (sortBy === 'rating') {
            return (b.rating || 0) - (a.rating || 0);
        }
        return (a.distance || 0) - (b.distance || 0); // Default to distance
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header always visible, but simplified if results exist */}
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">Pediatrician Directory</h1>
                <p className="text-gray-600">Find the best pediatric care for your child nearby.</p>
            </header>

            {/* Initial Search Button - Only show if no results and not loading (and no error yet/reset) */}
            {!loading && hospitals.length === 0 && (
                <div className="flex justify-center mb-10">
                    <button
                        onClick={handleGeolocation}
                        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-bold text-lg"
                    >
                        <span className="material-symbols-outlined">my_location</span>
                        Search Nearby Hospitals
                    </button>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-center max-w-2xl mx-auto border border-red-100">
                    <span className="material-symbols-outlined align-middle mr-2">error</span>
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && <LoadingState />}

            {/* Results Section */}
            {!loading && hospitals.length > 0 && (
                <div>
                    {/* Controls Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-700 font-medium">
                            Found {hospitals.length} hospitals nearby
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Re-search button (Small) */}
                            <button
                                onClick={handleGeolocation}
                                className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-lg">refresh</span> Update Location
                            </button>

                            <div className="flex items-center gap-2">
                                <label htmlFor="sort" className="text-sm font-semibold text-gray-600">Sort by:</label>
                                <select
                                    id="sort"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all cursor-pointer"
                                >
                                    <option value="distance">Distance (Closest)</option>
                                    <option value="rating">Rating (Highest)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedHospitals.map((hospital, index) => (
                            <div key={hospital.id || index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{hospital.name}</h3>
                                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-sm font-bold whitespace-nowrap">
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            {hospital.rating}
                                        </div>
                                    </div>
                                    <p className="text-blue-600 text-sm font-medium mb-4 uppercase tracking-wide">{hospital.type}</p>

                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-lg mt-0.5 shrink-0">location_on</span>
                                            <span className="line-clamp-2">{hospital.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg shrink-0">distance</span>
                                            <span className="font-semibold text-gray-900">{hospital.distance.toFixed(2)} km away</span>
                                        </div>
                                        {hospital.isPediatric && (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <span className="material-symbols-outlined text-lg shrink-0">child_care</span>
                                                <span className="font-medium">Pediatric Specialist</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-white text-gray-700 border border-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                                    >
                                        Get Directions
                                    </a>
                                    <button
                                        onClick={() => navigate(`/parent/book-appointment/${hospital.id}`)}
                                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Book
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && hospitals.length === 0 && (
                <div className="text-center py-20">
                    <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-blue-500">medical_services</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No hospitals found nearby</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Try searching again or ensuring your location permissions are enabled.</p>
                </div>
            )}
        </div>
    );
};

export default PediatricianDirectory;
