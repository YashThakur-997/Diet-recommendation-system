import { useEffect, useState } from 'react';

// This file handles Strava integration.
// Can be safely deleted if you wish to remove Strava functionality without affecting core application.

interface StravaStats {
    connected: boolean;
    recentActivities: { id: number; name: string; distance: string; date: string; calories: number; type: string }[];
    totalDistance: string;
}

export function StravaConnect() {
    const [stats, setStats] = useState<StravaStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Parse URL query in case we just redirected back from Strava App
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const connected = urlParams.get('strava_connected');

        if (connected === 'true') {
            // Clear URL params without reloading, avoiding messy URLs
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchStats();
        } else {
            fetchStats();
        }
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch('/api/wearables/strava/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && data.data) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch Strava stats', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/wearables/strava/auth-url', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Failed to get auth URL', err);
        }
    };

    const handleDisconnect = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/wearables/strava/disconnect', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStats(null);
        } catch (err) {
            console.error('Failed to disconnect', err);
        }
    };

    if (loading) return <div className="p-4 rounded-2xl bg-white border border-slate-200 animate-pulse h-32 w-full"></div>;

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-[#fc4c02]/30 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fc4c02] to-[#ff7b42] flex items-center justify-center shadow-md shadow-[#fc4c02]/20">
                        {/* Minimalist Strava Icon */}
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#fc4c02] transition-colors">Strava</h3>
                        <p className="text-sm text-slate-500">Sync activities & workouts</p>
                    </div>
                </div>

                {stats?.connected ? (
                    <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                        Disconnect
                    </button>
                ) : (
                    <button
                        onClick={handleConnect}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#fc4c02] text-white hover:bg-[#e34402] transition-colors shadow-sm cursor-pointer shadow-[#fc4c02]/20"
                    >
                        Connect
                    </button>
                )}
            </div>

            {stats?.connected && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Distance Sync</p>
                        <p className="text-lg font-black text-slate-900">{stats.totalDistance}</p>
                    </div>

                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Recent Activities</p>
                        {stats.recentActivities.length > 0 ? (
                            <div className="flex flex-col gap-2.5">
                                {stats.recentActivities.map((act, index) => (
                                    <div key={act.id || index} className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden group/item cursor-default">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fc4c02] rounded-l-lg opacity-80"></div>
                                        <div className="flex items-center gap-3 pl-2">
                                            <span className="material-symbols-outlined text-[#fc4c02] text-sm bg-[#fc4c02]/10 p-1.5 rounded-md">
                                                {act.type === 'Ride' ? 'directions_bike' : 'directions_run'}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 leading-tight">{act.name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">{act.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-slate-800">{act.distance}</span>
                                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">{act.calories} kcal</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No recent activities synced.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
