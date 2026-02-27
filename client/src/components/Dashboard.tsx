import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from './PageWrapper'
import { Sidebar } from './Sidebar'

export function Dashboard() {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <PageWrapper>
            <div className="bg-[#f8fafc] font-display text-[#0f172a] antialiased min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar — hidden on mobile, slide-in via state */}
                <div
                    className={`
                        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        w-64 lg:w-64
                    `}
                >
                    <Sidebar />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-10 flex flex-col gap-6 lg:gap-8 min-w-0">
                    {/* Zone 1: Top Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#64748b] hover:text-[#22c55e] transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">Good Morning, Rahul</h2>
                                <p className="text-[#64748b] mt-1 text-sm">Thursday, Feb 27</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#64748b] hover:text-[#22c55e] transition-colors shadow-sm relative">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white rounded-full border border-slate-200 shadow-sm cursor-pointer">
                                <span className="material-symbols-outlined text-[#22c55e]">calendar_today</span>
                                <span className="text-sm font-medium text-[#0f172a]">This Week</span>
                                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>keyboard_arrow_down</span>
                            </div>
                        </div>
                    </div>

                    {/* Zone 2: Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {/* Daily Calories */}
                        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col gap-3 sm:gap-4 group hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex justify-between items-start">
                                <div className="p-2 rounded-full bg-[#fff7ed] text-orange-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">local_fire_department</span>
                                </div>
                                <span className="text-[10px] sm:text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">Calories</span>
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-[28px] font-bold text-[#0f172a]">1,840 <span className="text-[11px] sm:text-[13px] font-medium text-[#64748b]">kcal</span></h3>
                                <p className="text-[11px] sm:text-[13px] text-[#64748b] mt-1">Target: 2,200 kcal</p>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2">
                                <div className="bg-orange-500 h-1.5 sm:h-2 rounded-full" style={{ width: '83%' }}></div>
                            </div>
                        </div>

                        {/* Nutrition Score */}
                        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col gap-3 sm:gap-4 group hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex justify-between items-start">
                                <div className="p-2 rounded-full bg-[#faf5ff] text-purple-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">grade</span>
                                </div>
                                <span className="text-[10px] sm:text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">Score</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-xl sm:text-[28px] font-bold text-[#0f172a]">87<span className="text-[11px] sm:text-[13px] font-medium text-[#64748b]">/100</span></h3>
                                    <p className="text-[11px] sm:text-[13px] text-green-500 font-medium flex items-center mt-1">
                                        <span className="material-symbols-outlined text-[13px] mr-1">trending_up</span> +2.4%
                                    </p>
                                </div>
                                <svg fill="none" height="30" viewBox="0 0 60 30" width="60" xmlns="http://www.w3.org/2000/svg" className="hidden sm:block">
                                    <path d="M1 25L10 20L20 22L30 15L40 18L50 10L59 5" stroke="#a855f7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                            </div>
                        </div>

                        {/* Plan Streak */}
                        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col gap-3 sm:gap-4 group hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex justify-between items-start">
                                <div className="p-2 rounded-full bg-[#f0fdf4] text-green-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">bolt</span>
                                </div>
                                <span className="text-[10px] sm:text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">Streak</span>
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-[28px] font-bold text-[#0f172a]">5 Days</h3>
                                <p className="text-[11px] sm:text-[13px] text-[#64748b] mt-1">Keep it up!</p>
                            </div>
                            <div className="flex gap-1 mt-1">
                                <div className="h-1.5 sm:h-2 w-full rounded-full bg-[#22c55e]"></div>
                                <div className="h-1.5 sm:h-2 w-full rounded-full bg-[#22c55e]"></div>
                                <div className="h-1.5 sm:h-2 w-full rounded-full bg-[#22c55e]"></div>
                                <div className="h-1.5 sm:h-2 w-full rounded-full bg-[#22c55e]"></div>
                                <div className="h-1.5 sm:h-2 w-full rounded-full bg-[#22c55e]"></div>
                                <div className="h-1.5 sm:h-2 w-full rounded-full bg-slate-100"></div>
                                <div className="h-1.5 sm:h-2 w-full rounded-full bg-slate-100"></div>
                            </div>
                        </div>

                        {/* Water Intake */}
                        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col gap-3 sm:gap-4 group hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex justify-between items-start">
                                <div className="p-2 rounded-full bg-[#eff6ff] text-blue-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">water_drop</span>
                                </div>
                                <span className="text-[10px] sm:text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">Hydration</span>
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-[28px] font-bold text-[#0f172a]">2.1L <span className="text-[11px] sm:text-[13px] font-medium text-[#64748b]">/ 2.5L</span></h3>
                                <p className="text-[11px] sm:text-[13px] text-[#64748b] mt-1">400ml to go</p>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2">
                                <div className="bg-blue-500 h-1.5 sm:h-2 rounded-full" style={{ width: '84%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Zone 3: Three Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 min-h-0 lg:min-h-[400px]">
                        {/* Col A: Today's Meals (Span 5) */}
                        <div className="md:col-span-2 lg:col-span-5 flex flex-col bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden min-h-[400px]">
                            <div className="p-4 sm:p-5 px-4 sm:px-6 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">Today's Meals</h3>
                                <button onClick={() => navigate('/meal-plan')} className="text-xs sm:text-sm text-[#22c55e] font-medium hover:underline">Edit Plan</button>
                            </div>
                            <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto">
                                {/* Breakfast */}
                                <div className="flex items-center p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f0fdf4] flex items-center justify-center text-[#16a34a] mr-3 sm:mr-4 shrink-0">
                                        <span className="material-symbols-outlined text-[20px]">egg_alt</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] sm:text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide">Breakfast</p>
                                        <p className="text-[13px] sm:text-[14px] font-semibold text-[#0f172a] truncate">Oatmeal &amp; Berries</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-[#dcfce7] text-[#16a34a]">
                                            Done
                                        </span>
                                        <p className="text-[12px] sm:text-[13px] text-[#64748b] mt-1">350 kcal</p>
                                    </div>
                                </div>

                                {/* Lunch */}
                                <div className="flex items-center p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f0fdf4] flex items-center justify-center text-[#16a34a] mr-3 sm:mr-4 shrink-0">
                                        <span className="material-symbols-outlined text-[20px]">lunch_dining</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] sm:text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide">Lunch</p>
                                        <p className="text-[13px] sm:text-[14px] font-semibold text-[#0f172a] truncate">Grilled Chicken Salad</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-[#dcfce7] text-[#16a34a]">
                                            Done
                                        </span>
                                        <p className="text-[12px] sm:text-[13px] text-[#64748b] mt-1">520 kcal</p>
                                    </div>
                                </div>

                                {/* Dinner (Highlighted) */}
                                <div className="flex items-center p-2.5 sm:p-3 rounded-[10px] bg-[#fffbeb] border border-amber-100">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-[#f97316] mr-3 sm:mr-4 shadow-sm shrink-0">
                                        <span className="material-symbols-outlined text-[20px]">restaurant</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] sm:text-[11px] font-bold text-[#f97316] uppercase tracking-wide">Dinner • Upcoming</p>
                                        <p className="text-[13px] sm:text-[14px] font-semibold text-[#0f172a] truncate">Salmon &amp; Quinoa Bowl</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-[#fff7ed] text-[#f97316]">
                                            7:00 PM
                                        </span>
                                        <p className="text-[12px] sm:text-[13px] text-[#0f172a] mt-1 font-medium">650 kcal</p>
                                    </div>
                                </div>

                                {/* Snack */}
                                <div className="flex items-center p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 transition-colors group opacity-70">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-3 sm:mr-4 shrink-0">
                                        <span className="material-symbols-outlined text-[20px]">cookie</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] sm:text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide">Snack</p>
                                        <p className="text-[13px] sm:text-[14px] font-semibold text-[#0f172a] truncate">Greek Yogurt</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-[#f1f5f9] text-[#64748b]">
                                            Pending
                                        </span>
                                        <p className="text-[12px] sm:text-[13px] text-[#64748b] mt-1">120 kcal</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Col B: Stacked Cards (Span 4) */}
                        <div className="md:col-span-1 lg:col-span-4 flex flex-col gap-4 sm:gap-6 min-h-[400px]">
                            {/* Today's Macros */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-4 sm:p-5 px-4 sm:px-6 flex-1 flex flex-col justify-between">
                                <h3 className="text-sm sm:text-base font-bold text-[#0f172a] mb-4">Today's Macros</h3>
                                <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6">
                                    {/* Donut Chart */}
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="stroke-current text-slate-100" cx="18" cy="18" fill="none" r="16" strokeWidth="4"></circle>
                                            <circle className="stroke-current text-[#22c55e]" cx="18" cy="18" fill="none" r="16" strokeDasharray="40 100" strokeLinecap="round" strokeWidth="4"></circle>
                                            <circle className="stroke-current text-blue-500" cx="18" cy="18" fill="none" r="16" strokeDasharray="30 100" strokeDashoffset="-40" strokeLinecap="round" strokeWidth="4"></circle>
                                            <circle className="stroke-current text-orange-400" cx="18" cy="18" fill="none" r="16" strokeDasharray="20 100" strokeDashoffset="-70" strokeLinecap="round" strokeWidth="4"></circle>
                                        </svg>
                                        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-center">
                                            <span className="text-xs font-bold text-slate-400">Bal.</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2.5 sm:space-y-3 min-w-0">
                                        <div>
                                            <div className="flex justify-between text-[11px] sm:text-xs mb-1">
                                                <span className="text-slate-500">Protein (140g)</span>
                                                <span className="font-bold text-slate-900">80%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full"><div className="h-1.5 bg-[#22c55e] rounded-full" style={{ width: '80%' }}></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[11px] sm:text-xs mb-1">
                                                <span className="text-slate-500">Carbs (220g)</span>
                                                <span className="font-bold text-slate-900">45%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full"><div className="h-1.5 bg-blue-500 rounded-full" style={{ width: '45%' }}></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[11px] sm:text-xs mb-1">
                                                <span className="text-slate-500">Fats (65g)</span>
                                                <span className="font-bold text-slate-900">30%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full"><div className="h-1.5 bg-orange-400 rounded-full" style={{ width: '30%' }}></div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Weight Trend */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-4 sm:p-5 px-4 sm:px-6 flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">Weight Trend</h3>
                                    <span className="text-[10px] sm:text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Weekly</span>
                                </div>
                                <div className="h-16 sm:h-20 w-full flex items-end justify-between gap-1 mb-3">
                                    <div className="w-full bg-[#22c55e]/20 hover:bg-[#22c55e]/40 rounded-t h-[40%] transition-all"></div>
                                    <div className="w-full bg-[#22c55e]/20 hover:bg-[#22c55e]/40 rounded-t h-[55%] transition-all"></div>
                                    <div className="w-full bg-[#22c55e]/20 hover:bg-[#22c55e]/40 rounded-t h-[45%] transition-all"></div>
                                    <div className="w-full bg-[#22c55e]/20 hover:bg-[#22c55e]/40 rounded-t h-[70%] transition-all"></div>
                                    <div className="w-full bg-[#22c55e]/20 hover:bg-[#22c55e]/40 rounded-t h-[60%] transition-all"></div>
                                    <div className="w-full bg-[#22c55e] hover:bg-[#22c55e]/80 rounded-t h-[80%] transition-all"></div>
                                    <div className="w-full bg-slate-100 rounded-t h-[10%]"></div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="text-[10px] px-2 py-1 bg-[#f0fdf4] text-[#16a34a] rounded-full border border-green-100">On Track</span>
                                    <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100">-0.5kg this week</span>
                                </div>
                            </div>
                        </div>

                        {/* Col C: Stacked Cards (Span 3) */}
                        <div className="md:col-span-1 lg:col-span-3 flex flex-col gap-4 sm:gap-6 min-h-[400px]">
                            {/* Health Indicators */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-4 sm:p-5 px-4 sm:px-6">
                                <h3 className="text-sm sm:text-base font-bold text-[#0f172a] mb-3 sm:mb-4">Health Vitals</h3>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-red-500 text-lg">favorite</span>
                                            <span className="text-xs sm:text-sm font-medium text-slate-600">Blood Sugar</span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-bold text-[#16a34a] bg-[#dcfce7] px-2 py-1 rounded">Safe</span>
                                    </div>
                                    <div className="h-px bg-slate-100"></div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-500 text-lg">compress</span>
                                            <span className="text-xs sm:text-sm font-medium text-slate-600">Pressure</span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-bold text-[#d97706] bg-[#fef9c3] px-2 py-1 rounded">Monitor</span>
                                    </div>
                                    <div className="h-px bg-slate-100"></div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-purple-500 text-lg">monitor_weight</span>
                                            <span className="text-xs sm:text-sm font-medium text-slate-600">BMI</span>
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold text-[#22c55e]">22.4</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Tip Card */}
                            <div className="bg-[#f0fdf4] rounded-2xl shadow-sm border-y border-r border-[#e2e8f0] border-l-[3px] border-l-[#22c55e] p-4 sm:p-5 px-4 sm:px-6 flex flex-col justify-between flex-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></div>
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase text-[#16a34a] tracking-[1px]">AI Insight</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                                        Based on yesterday's high sodium intake, try increasing potassium-rich foods like bananas or spinach today to balance your electrolytes.
                                    </p>
                                </div>
                                <button onClick={() => navigate('/meal-plan')} className="w-full py-2 sm:py-2.5 rounded-xl bg-white text-[#22c55e] font-semibold text-xs sm:text-sm shadow-sm border border-green-100 hover:bg-[#22c55e] hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                                    <span>Chat with NutriAI</span>
                                    <span className="material-symbols-outlined text-sm">send</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Zone 4: Bottom Row — This Week + Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 pb-6">
                        {/* This Week at a Glance */}
                        <div className="md:col-span-7 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-4 sm:p-5 px-4 sm:px-6 min-h-[220px] flex flex-col justify-between">
                            <h3 className="text-sm sm:text-base font-bold text-[#0f172a] mb-4">This Week at a Glance</h3>
                            <div className="flex justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
                                {/* Day 1 (Done) */}
                                <div onClick={() => navigate('/meal-plan')} className="cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl flex-1 min-w-[40px]">
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400">Mon</span>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-base sm:text-lg">check</span>
                                    </div>
                                </div>
                                {/* Day 2 (Done) */}
                                <div onClick={() => navigate('/meal-plan')} className="cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl flex-1 min-w-[40px]">
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400">Tue</span>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-base sm:text-lg">check</span>
                                    </div>
                                </div>
                                {/* Day 3 (Done) */}
                                <div onClick={() => navigate('/meal-plan')} className="cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl flex-1 min-w-[40px]">
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400">Wed</span>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-base sm:text-lg">check</span>
                                    </div>
                                </div>
                                {/* Day 4 (Current) */}
                                <div onClick={() => navigate('/meal-plan')} className="cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl flex-1 min-w-[40px]">
                                    <span className="text-[10px] sm:text-xs font-bold text-[#22c55e]">Thu</span>
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[3px] border-[#22c55e] flex items-center justify-center bg-transparent p-[2px]">
                                        <div className="w-full h-full rounded-full bg-[#22c55e] text-white flex items-center justify-center">
                                            <span className="text-[10px] sm:text-xs font-bold">27</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Day 5 (Future) */}
                                <div onClick={() => navigate('/meal-plan')} className="cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl flex-1 min-w-[40px]">
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400">Fri</span>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-200 bg-transparent flex items-center justify-center">
                                    </div>
                                </div>
                                {/* Day 6 (Future) */}
                                <div onClick={() => navigate('/meal-plan')} className="cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl flex-1 min-w-[40px]">
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400">Sat</span>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-200 bg-transparent flex items-center justify-center">
                                    </div>
                                </div>
                                {/* Day 7 (Future) */}
                                <div onClick={() => navigate('/meal-plan')} className="cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl flex-1 min-w-[40px]">
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400">Sun</span>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-200 bg-transparent flex items-center justify-center">
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="md:col-span-5 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-4 sm:p-5 px-4 sm:px-6 flex flex-col justify-center min-h-[220px]">
                            <h3 className="text-sm sm:text-base font-bold text-[#0f172a] mb-3 sm:mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 sm:gap-3">
                                <button onClick={() => navigate('/meal-plan')} className="p-3 sm:p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#22c55e] transition-all duration-300 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group text-[#374151]">
                                    <span className="material-symbols-outlined text-[#22c55e] group-hover:scale-110 transition-transform text-[20px] sm:text-[24px]">autorenew</span>
                                    <span className="text-[10px] sm:text-[12px] font-semibold">Regenerate</span>
                                </button>
                                <button onClick={() => navigate('/meal-plan')} className="p-3 sm:p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#22c55e] transition-all duration-300 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group text-[#374151]">
                                    <span className="material-symbols-outlined text-[#22c55e] group-hover:scale-110 transition-transform text-[20px] sm:text-[24px]">forum</span>
                                    <span className="text-[10px] sm:text-[12px] font-semibold">Ask AI</span>
                                </button>
                                <button onClick={() => navigate('/meal-plan')} className="p-3 sm:p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#22c55e] transition-all duration-300 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group text-[#374151]">
                                    <span className="material-symbols-outlined text-[#22c55e] group-hover:scale-110 transition-transform text-[20px] sm:text-[24px]">visibility</span>
                                    <span className="text-[10px] sm:text-[12px] font-semibold">Full Plan</span>
                                </button>
                                <button className="p-3 sm:p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0fdf4] hover:border-[#22c55e] transition-all duration-300 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group text-[#374151]">
                                    <span className="material-symbols-outlined text-[#22c55e] group-hover:scale-110 transition-transform text-[20px] sm:text-[24px]">download</span>
                                    <span className="text-[10px] sm:text-[12px] font-semibold">Export</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageWrapper>
    )
}
