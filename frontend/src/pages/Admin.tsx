import React, { useState } from 'react';
import { createStop } from '../services/api';
import { MapPin, Plus } from 'lucide-react';

const Admin: React.FC = () => {
    const [stopName, setStopName] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedLatitude = Number(latitude);
        const parsedLongitude = Number(longitude);
        if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
            setMessage('Error adding bus stop.');
            return;
        }
        try {
            await createStop({
                stop_name: stopName,
                latitude: parsedLatitude,
                longitude: parsedLongitude,
            });
            setMessage('Bus stop added successfully!');
            setStopName('');
            setLatitude('');
            setLongitude('');
        } catch {
            setMessage('Error adding bus stop.');
        }
    };

    return (
        <div className="px-6 py-10">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-xl shadow-blue-100/40">
                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="text-blue-600" /> Admin Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">Create and manage bus stops with accurate geo-coordinates.</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                            <Plus size={18} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Add Bus Stop</h2>
                    </div>

                    {message && (
                        <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stop Name</label>
                            <input
                                type="text"
                                value={stopName}
                                onChange={(e) => setStopName(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200/60 transition hover:bg-blue-700"
                        >
                            Add Stop
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Admin;
