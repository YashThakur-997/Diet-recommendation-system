import { PageWrapper } from './PageWrapper'
import { Sidebar } from './Sidebar'

export function MealPlan() {
    return (
        <PageWrapper>
            <div className="bg-background-light text-slate-900 overflow-hidden h-screen flex relative">
                <Sidebar />

                {/* Main Content */}
                <main className="flex flex-1 h-full overflow-hidden">
                    <section className="flex-1 bg-background-light h-full flex flex-col relative overflow-hidden">
                        <div className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-100/50 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <button className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-xl font-bold text-slate-900">Week of Feb 24 – Mar 2, 2026</h2>
                                </div>
                                <button className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                                    <span className="material-symbols-outlined text-slate-500" style={{ fontSize: '18px' }}>download</span>
                                    Export Plan
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>autorenew</span>
                                    Regenerate Full Plan
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32">
                            <div className="flex flex-col gap-6 max-w-5xl mx-auto">
                                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">Monday</h3>
                                            <p className="text-xs text-slate-500 font-medium">Feb 24</p>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">1,850 kcal</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600"><span className="material-symbols-outlined">wb_twilight</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Breakfast</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Oatmeal with Berries &amp; Almonds</div>
                                            <div className="text-xs font-medium text-slate-400">350 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><span className="material-symbols-outlined">light_mode</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Lunch</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Grilled Chicken Caesar Salad</div>
                                            <div className="text-xs font-medium text-slate-400">450 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><span className="material-symbols-outlined">dark_mode</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Dinner</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Baked Cod with Asparagus</div>
                                            <div className="text-xs font-medium text-slate-400">420 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">Tuesday</h3>
                                            <p className="text-xs text-slate-500 font-medium">Feb 25</p>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">1,920 kcal</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600"><span className="material-symbols-outlined">wb_twilight</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Breakfast</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Greek Yogurt Parfait</div>
                                            <div className="text-xs font-medium text-slate-400">320 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><span className="material-symbols-outlined">light_mode</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Lunch</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Turkey &amp; Avocado Wrap</div>
                                            <div className="text-xs font-medium text-slate-400">480 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><span className="material-symbols-outlined">dark_mode</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Dinner</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Quinoa Stir Fry with Tofu</div>
                                            <div className="text-xs font-medium text-slate-400">450 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary"></div>
                                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">Wednesday</h3>
                                            <p className="text-xs text-slate-500 font-medium">Feb 26</p>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">1,790 kcal</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600"><span className="material-symbols-outlined">wb_twilight</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Breakfast</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Scrambled Eggs on Toast</div>
                                            <div className="text-xs font-medium text-slate-400">380 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><span className="material-symbols-outlined">light_mode</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Lunch</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Lentil Soup with Whole Wheat Roll</div>
                                            <div className="text-xs font-medium text-slate-400">410 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 bg-background-light border border-primary/20 rounded-lg transition-colors group relative">
                                            <div className="absolute -top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">AI Updated</div>
                                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><span className="material-symbols-outlined">dark_mode</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Dinner</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Chicken Stir-Fry</div>
                                            <div className="text-xs font-medium text-slate-400">390 kcal</div>
                                            <button className="text-primary hover:text-primary-dark transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-0 shadow-[0_8px_30px_rgba(33,197,93,0.15)] ring-2 ring-primary relative z-10">
                                    <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-3 bg-background-light rounded-t-2xl p-5">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                                                    Thursday
                                                    <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Today</span>
                                                </h3>
                                                <p className="text-xs text-primary-dark font-medium">Feb 27</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-white text-primary font-bold rounded-full text-xs shadow-sm border border-primary/10">1,650 kcal</span>
                                    </div>
                                    <div className="space-y-3 px-5 pb-5">
                                        <div className="flex items-center gap-4 p-2 bg-background-light/50 border border-primary/10 rounded-lg transition-colors group">
                                            <div className="bg-white p-2 rounded-lg text-primary shadow-sm"><span className="material-symbols-outlined">eco</span></div>
                                            <div className="w-24 text-sm font-bold text-primary">Breakfast</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-900">Chia Pudding with Mango</div>
                                            <div className="text-xs font-bold text-slate-500">310 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 bg-background-light/50 border border-primary/10 rounded-lg transition-colors group">
                                            <div className="bg-white p-2 rounded-lg text-primary shadow-sm"><span className="material-symbols-outlined">eco</span></div>
                                            <div className="w-24 text-sm font-bold text-primary">Lunch</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-900">Lentil Buddha Bowl</div>
                                            <div className="text-xs font-bold text-slate-500">450 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 bg-background-light/50 border border-primary/10 rounded-lg transition-colors group">
                                            <div className="bg-white p-2 rounded-lg text-primary shadow-sm"><span className="material-symbols-outlined">eco</span></div>
                                            <div className="w-24 text-sm font-bold text-primary">Dinner</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-900">Stuffed Peppers (Quinoa &amp; Beans)</div>
                                            <div className="text-xs font-bold text-slate-500">380 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 opacity-80">
                                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">Friday</h3>
                                            <p className="text-xs text-slate-500 font-medium">Feb 28</p>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">2,100 kcal</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600"><span className="material-symbols-outlined">wb_twilight</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Breakfast</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Banana Pancakes</div>
                                            <div className="text-xs font-medium text-slate-400">450 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><span className="material-symbols-outlined">light_mode</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Lunch</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Tuna Salad Sandwich</div>
                                            <div className="text-xs font-medium text-slate-400">420 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                        <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><span className="material-symbols-outlined">dark_mode</span></div>
                                            <div className="w-24 text-sm font-medium text-slate-500">Dinner</div>
                                            <div className="flex-1 text-sm font-semibold text-slate-800">Beef Tacos with Salsa</div>
                                            <div className="text-xs font-medium text-slate-400">650 kcal</div>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between z-20 backdrop-blur-md bg-opacity-90">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col border-r border-slate-700 pr-8">
                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Weekly Average</span>
                                    <span className="text-2xl font-bold">1,862 <span className="text-sm font-normal text-slate-400">kcal/day</span></span>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">Protein</span>
                                        <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[80%]"></div>
                                        </div>
                                        <span className="text-xs font-semibold">145g</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">Carbs</span>
                                        <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-accent w-[60%]"></div>
                                        </div>
                                        <span className="text-xs font-semibold">180g</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">Fats</span>
                                        <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-400 w-[40%]"></div>
                                        </div>
                                        <span className="text-xs font-semibold">65g</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pl-8 border-l border-slate-700">
                                <div className="text-right">
                                    <div className="text-xs text-slate-400">Health Score</div>
                                    <div className="font-bold text-primary text-lg">9.2/10</div>
                                </div>
                                <div className="size-10 rounded-full border-2 border-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">verified</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Chat Assistant Pane */}
                    <section className="w-[35%] min-w-[320px] max-w-[450px] bg-white border-l border-slate-100 flex flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
                        <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex flex-col">
                                <h2 className="text-slate-900 font-bold text-base flex items-center gap-2">
                                    NutriAI Assistant
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                </h2>
                                <span className="text-xs text-slate-500">Online</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar bg-slate-50/50">
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                                </div>
                                <div className="flex flex-col gap-1 max-w-[85%]">
                                    <span className="text-xs text-slate-500 ml-1">NutriAI • 10:23 AM</span>
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm text-sm text-slate-700 leading-relaxed">
                                        Hi Rahul! I've generated your 7-day meal plan based on your preferences. Let me know if you'd like to adjust anything!
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="size-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                    <img alt="User" className="w-full h-full object-cover" data-alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_roNe4snrSIx41sf5kEzwVq3rn40cdI_qFuX7tD7fas-zJLlvW_ZzdUIzKBvxJLDO6_hE_fteKmvRg6e0RlCTl6uanga8Hxzrz1KpPUsY5t8CWZcb1L-X_wWfVei4jypM5s-SGz-tN_IGGEwsUxetLBeACORERBSynaoDH--vn-zJAD40KMqCHQ_-qbM-AqMS7FW8Rv6TuPobyfcVycYfRlK88_biSzn3nKNt1jJomFEBebTsLVhgPG69sbCD94tg_8k9Bvmbtm72" />
                                </div>
                                <div className="flex flex-col gap-1 items-end max-w-[85%]">
                                    <span className="text-xs text-slate-500 mr-1">You • 10:24 AM</span>
                                    <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-md text-sm leading-relaxed">
                                        I don't like salmon, replace Wednesday dinner.
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                                </div>
                                <div className="flex flex-col gap-1 max-w-[90%]">
                                    <span className="text-xs text-slate-500 ml-1">NutriAI • 10:24 AM</span>
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                        <p className="text-sm text-slate-700 mb-3">Done! I've updated your Wednesday dinner plan.</p>
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col gap-2">
                                            <div className="flex items-center justify-between opacity-50">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-red-500 text-sm">remove_circle</span>
                                                    <span className="text-xs font-medium line-through text-slate-500">Grilled Salmon (450kcal)</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-px bg-slate-200"></div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                                    <span className="text-xs font-bold text-slate-800">Chicken Stir-Fry (390kcal)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="size-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                    <img alt="User" className="w-full h-full object-cover" data-alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUqCQGmxwBEAetaLFiwAlHzbrs3lEAbaXm4mmFYG4LHSVArPPpZJ2Etv_tImqwmWea2E7_DrJwNt5UN6xTXZAl8njB-D3aKJ3lXsvinfsrCXRC_XPyWITxP0UecO616SfXbf218gOutAsOAI2utm_rGKcsmKlgtcXvglhsn0XtWFtcYi_x9pwWq5ghZEXwag1DianRllv50H4Vtn99p10op7r381Qbf1Sf3TM2--Xz2hieGCg84W0zAyDQhvLX-OFpBHXNi4t7G8MS" />
                                </div>
                                <div className="flex flex-col gap-1 items-end max-w-[85%]">
                                    <span className="text-xs text-slate-500 mr-1">You • 10:26 AM</span>
                                    <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-md text-sm leading-relaxed">
                                        Make Thursday fully vegan.
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                                </div>
                                <div className="flex flex-col gap-1 max-w-[90%]">
                                    <span className="text-xs text-slate-500 ml-1">NutriAI • 10:26 AM</span>
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                        <p className="text-sm text-slate-700 mb-3">Great choice! Here is your vegan Thursday:</p>
                                        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-primary w-16 uppercase">Breakfast</span>
                                                <span className="text-xs text-slate-700">Chia Pudding</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-primary w-16 uppercase">Lunch</span>
                                                <span className="text-xs text-slate-700">Lentil Buddha Bowl</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-primary w-16 uppercase">Dinner</span>
                                                <span className="text-xs text-slate-700">Stuffed Peppers</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-4"></div>
                        </div>
                        <div className="p-4 bg-white border-t border-slate-100">
                            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-1">
                                <button className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">Remove meat</button>
                                <button className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">More protein</button>
                                <button className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">Less carbs</button>
                            </div>
                            <div className="relative">
                                <input className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400" placeholder="e.g. Replace Monday lunch..." type="text" />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center shadow-md">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_upward</span>
                                </button>
                            </div>
                            <div className="flex justify-center mt-2">
                                <span className="text-[10px] text-slate-400 font-medium">Powered by local Ollama AI</span>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </PageWrapper>
    )
}
