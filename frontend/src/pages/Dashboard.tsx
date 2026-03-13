import React, { useEffect } from 'react';
import MapComponent from '../components/Map';
import { useStore } from '../store/useStore';
import { Clock, MapPin, Navigation } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { busLocation, etas, error, fetchBusLocation, fetchStops, fetchETA } = useStore();

    useEffect(() => {
        fetchStops();
        fetchBusLocation();
        fetchETA();
        const interval = setInterval(() => {
            fetchBusLocation();
            fetchETA();
        }, 5000);

        return () => clearInterval(interval);
    }, [fetchBusLocation, fetchStops, fetchETA]);

    return (
        <div className="min-h-[calc(100vh-64px)] px-6 py-6">
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                    <div className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-xl shadow-blue-100/40">
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                <Navigation className="text-blue-600" /> Smart Bus Tracker
                            </h1>
                            <p className="text-sm text-gray-500 mt-2">Live operations overview and ETA insights</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700">Current Status</h2>
                            {busLocation ? (
                                <div className="mt-4 space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Speed</span>
                                        <span className="text-gray-900 font-semibold">{busLocation.speed.toFixed(1)} km/h</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Last Update</span>
                                        <span className="text-gray-900 font-medium">
                                            {new Date(busLocation.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-gray-500">Waiting for bus signal...</p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 flex items-center gap-2">
                                <Clock size={18} className="text-blue-600" /> Upcoming Stops
                            </h2>
                            <div className="mt-4 space-y-3">
                                {etas.length > 0 ? (
                                    etas.map((eta) => (
                                        <div
                                            key={eta.stop_id}
                                            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition hover:border-blue-100 hover:bg-blue-50/30"
                                        >
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-rose-500" />
                                                <span className="text-sm font-medium text-gray-900">{eta.stop_name}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-blue-600">{eta.eta_minutes} min</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No ETA data available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                    <div className="h-[calc(100vh-136px)] rounded-2xl border border-gray-100 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
                        <MapComponent />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
