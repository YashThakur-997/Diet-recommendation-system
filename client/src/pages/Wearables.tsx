import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { StravaConnect } from '../components/wearables/StravaConnect';

export function Wearables() {
    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto space-y-8"
                >
                    {/* Header Section */}
                    <div className="flex flex-col gap-3">
                        <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] tracking-tight">
                            Wearables & Integrations
                        </h1>
                        <p className="text-[#64748b] text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                            Connect your favorite activity trackers to provide NutriAI with detailed workout data for a highly personalized and accurate dietary plan.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#0f172a]">Available Integrations</h2>
                            <p className="text-sm text-slate-500 mt-1">Manage all your connected fitness accounts here.</p>
                        </div>

                        {/* Integrations Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strava component (independent module) */}
                            <StravaConnect />

                            {/* Placeholder for future wearables */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50 flex flex-col gap-4 opacity-70 justify-center items-center text-center">
                                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center mb-2">
                                    <span className="material-symbols-outlined text-slate-400">add</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">More integrations</h3>
                                    <p className="text-sm text-slate-500 mt-1">Apple Health, Google Fit and Garmin coming soon.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
}
