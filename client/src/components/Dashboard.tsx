import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from './PageWrapper'
import { Sidebar } from './Sidebar'

type UserProfile = {
    id: string
    username: string
    email: string
    age?: number
    gender?: string
    height?: number
    weight?: number
    bmi?: number
    calories?: number
    medicalConditions?: string[]
    dietaryPreferences?: string[]
    activityLevel?: string
    cuisinePreferences?: string[]
    primaryGoal?: string
    sleepHours?: number
    allergies?: string[]
    budget?: string
    createdAt?: string
}




// ─── Helper: time-based greeting ─────────────────────────────────────────────
function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
}

// ─── Helper: formatted date ──────────────────────────────────────────────────
function getFormattedDate(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })
}

// ─── Helper: calculate BMI if height & weight exist ──────────────────────────
function calculateBMI(weight?: number, height?: number): string {
    if (!weight || !height) return '--'
    // height in cm → convert to m
    const heightM = height / 100
    return (weight / (heightM * heightM)).toFixed(1)
}

// ─── Helper: estimate daily calorie target based on profile ──────────────────
function estimateCalorieTarget(profile: UserProfile): number {
    if (profile.calories) return profile.calories
    // Basic Mifflin-St Jeor estimate if we have the data
    if (profile.weight && profile.height && profile.age) {
        const base = profile.gender?.toLowerCase() === 'female'
            ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
            : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
        // Activity multiplier
        const multipliers: Record<string, number> = {
            sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extreme: 1.9
        }
        const mult = multipliers[profile.activityLevel?.toLowerCase() || ''] || 1.55
        return Math.round(base * mult)
    }
    return 2200 // sensible default
}

// ─── Helper: get the current week's days ─────────────────────────────────────
function getWeekDays() {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=Sunday
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)) // go back to Monday

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((name, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return {
            name,
            date: d.getDate(),
            isPast: d < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            isToday: d.toDateString() === today.toDateString(),
            isFuture: d > today,
        }
    })
}

const extractTodayMeals = (plan: any, today: string) => {
    try {
        // Case 1: plan.days is an array of day objects
        // { days: [{ day: 'Monday', breakfast: '...', ... }] }
        if (plan?.days && Array.isArray(plan.days)) {
            const todayData = plan.days.find((d: any) =>
                d.day?.toLowerCase()
                    .includes(today.toLowerCase()) ||
                d.date?.toLowerCase()
                    .includes(today.toLowerCase())
            )
            if (todayData) return todayData
            // Fallback: return first day if today not found
            return plan.days[0]
        }

        // Case 2: plan is keyed by day name
        // { Monday: { breakfast: '...', ... }, ... }
        if (plan[today]) return plan[today]

        // Case 3: plan has a 'week' or 'meals' key
        if (plan?.week && Array.isArray(plan.week)) {
            return plan.week[0]
        }

        // Case 4: plan itself is today's meals
        if (plan?.breakfast || plan?.lunch || plan?.dinner) {
            return plan
        }

        // Additional check for our specific DayPlan struct from MealPlan
        if (plan?.meals && Array.isArray(plan.meals)) {
            const mealObj: any = {}
            plan.meals.forEach((m: any) => {
                const t = m.type?.toLowerCase() || ''
                if (t.includes('breakfast')) mealObj.breakfast = m.name || m
                else if (t.includes('lunch')) mealObj.lunch = m.name || m
                else if (t.includes('dinner')) mealObj.dinner = m.name || m
                else if (t.includes('snack')) mealObj.snack = m.name || m
            })
            if (Object.keys(mealObj).length > 0) return mealObj
        }

        return null
    } catch { return null }
}

export function Dashboard() {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Load meal plan saved by MealPlan page
    const [todayMeals, setTodayMeals] = useState<any>(null)
    const [tomorrowMeals, setTomorrowMeals] = useState<any>(null)
    const [mealHistory, setMealHistory] = useState<any[]>([])
    const [userProfile, setUserProfile] = useState<any>(null)

    useEffect(() => {
        // Read generated meal plan
        try {
            const savedPlan = localStorage.getItem('nutriai_meal_plan')
            if (savedPlan) {
                const planData = JSON.parse(savedPlan)

                // Get today's day name
                const today = new Date().toLocaleDateString(
                    'en-US', { weekday: 'long' }) // e.g. "Saturday"

                // Find today's meals from the 7-day plan
                // Handle different plan structures from Ollama
                const todayData = extractTodayMeals(planData, today)
                setTodayMeals(todayData)

                // Get tomorrow's day name
                const tomorrowDate = new Date()
                tomorrowDate.setDate(tomorrowDate.getDate() + 1)
                const tomorrow = tomorrowDate.toLocaleDateString('en-US', { weekday: 'long' })
                const tomorrowData = extractTodayMeals(planData, tomorrow)
                setTomorrowMeals(tomorrowData)
            }
        } catch (e) { console.error(e) }

        // Read meal history
        try {
            const history = localStorage.getItem('nutriai_meal_history')
            if (history) setMealHistory(JSON.parse(history))
        } catch (e) { }

        // Read user profile for stats
        try {
            const profile = localStorage.getItem('nutriai_profile')
            if (profile) setUserProfile(JSON.parse(profile))
        } catch (e) { }
    }, [])

    // Fetch user profile on mount
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signin')
            return
        }

        const fetchProfile = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })
                if (res.status === 401 || res.status === 403) {
                    // Token expired or invalid
                    localStorage.removeItem('token')
                    navigate('/signin')
                    return
                }
                if (!res.ok) throw new Error('Failed to fetch profile')
                const data = await res.json()
                if (data.success) {
                    setUser(data.user)
                } else {
                    setError(data.message || 'Could not load profile')
                }
            } catch (err) {
                console.error('Profile fetch error:', err)
                setError('Could not connect to server')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [navigate])

    // ─── Derived values from user profile ────────────────────────────────────
    const greeting = getGreeting()
    const todayDate = getFormattedDate()
    const weekDays = useMemo(() => getWeekDays(), [])
    const displayName = user?.username || 'User'
    const bmi = user ? (user.bmi?.toString() || calculateBMI(user.weight, user.height)) : '--'
    const calorieTarget = user ? estimateCalorieTarget(user) : 2200
    const weight = user?.weight ? `${user.weight} kg` : '--'
    const height = user?.height ? `${user.height} cm` : '--'
    const goal = user?.primaryGoal || 'Stay Healthy'
    const activityLevel = user?.activityLevel || 'Moderate'

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

                    {/* Loading / Error states */}
                    {loading && (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[#64748b] text-sm font-medium">Loading your dashboard...</p>
                            </div>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex items-center justify-center h-64">
                            <div className="bg-red-50 rounded-2xl border border-red-200 p-6 max-w-md text-center">
                                <span className="material-symbols-outlined text-red-400 text-3xl mb-2">error</span>
                                <p className="text-red-600 font-medium">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
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
                                        <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
                                            {greeting}, {displayName}
                                        </h2>
                                        <p className="text-[#64748b] mt-1 text-sm">{todayDate}</p>
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
                                        <h3 className="text-xl sm:text-[28px] font-bold text-[#0f172a]">
                                            {calorieTarget.toLocaleString()} <span className="text-[11px] sm:text-[13px] font-medium text-[#64748b]">kcal</span>
                                        </h3>
                                        <p className="text-[11px] sm:text-[13px] text-[#64748b] mt-1">
                                            Daily target
                                        </p>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2">
                                        <div className="bg-orange-500 h-1.5 sm:h-2 rounded-full" style={{ width: '83%' }}></div>
                                    </div>
                                </div>

                                {/* Weight */}
                                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col gap-3 sm:gap-4 group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-full bg-[#faf5ff] text-purple-500 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">monitor_weight</span>
                                        </div>
                                        <span className="text-[10px] sm:text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">Weight</span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h3 className="text-xl sm:text-[28px] font-bold text-[#0f172a]">
                                                {weight}
                                            </h3>
                                            <p className="text-[11px] sm:text-[13px] text-[#64748b] mt-1">
                                                Height: {height}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Goal */}
                                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col gap-3 sm:gap-4 group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-full bg-[#f0fdf4] text-green-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">flag</span>
                                        </div>
                                        <span className="text-[10px] sm:text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">Goal</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-[22px] font-bold text-[#0f172a]">{goal}</h3>
                                        <p className="text-[11px] sm:text-[13px] text-[#64748b] mt-1">
                                            Activity: {activityLevel}
                                        </p>
                                    </div>
                                </div>

                                {/* BMI */}
                                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col gap-3 sm:gap-4 group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-full bg-[#eff6ff] text-blue-500 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">speed</span>
                                        </div>
                                        <span className="text-[10px] sm:text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">BMI</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-[28px] font-bold text-[#0f172a]">
                                            {bmi}
                                        </h3>
                                        <p className="text-[11px] sm:text-[13px] text-[#64748b] mt-1">
                                            {bmi !== '--' ? (
                                                parseFloat(bmi) < 18.5 ? 'Underweight' :
                                                    parseFloat(bmi) < 25 ? 'Normal weight' :
                                                        parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'
                                            ) : 'Update profile'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Zone 3: Three Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 min-h-0 lg:min-h-[400px]">
                                {/* Col A: Today's Meals (Span 5) */}
                                <div className="md:col-span-2 lg:col-span-5 flex flex-col bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden min-h-[400px]">
                                    <div className="flex items-center justify-between p-4 sm:p-5 px-4 sm:px-6 border-b border-[#e2e8f0]">
                                        <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                                            Today's Meals
                                        </h3>
                                        <button
                                            onClick={() => navigate('/meal-plan')}
                                            className="text-[12px] sm:text-[13px] text-[#22c55e] font-semibold hover:text-[#16a34a]"
                                        >
                                            Edit Plan →
                                        </button>
                                    </div>

                                    <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto">
                                        {todayMeals ? (
                                            // ── HAS MEAL PLAN ──
                                            <div className="space-y-2">
                                                {(() => {
                                                    const currentHour = new Date().getHours()
                                                    return [
                                                        {
                                                            type: 'BREAKFAST',
                                                            icon: '🌅',
                                                            meal: todayMeals.breakfast,
                                                            time: '8:00 AM',
                                                            status: currentHour >= 8 ? 'done' : 'upcoming'
                                                        },
                                                        {
                                                            type: 'LUNCH',
                                                            icon: '☀️',
                                                            meal: todayMeals.lunch,
                                                            time: '1:00 PM',
                                                            status: currentHour >= 13 ? 'done' : 'upcoming'
                                                        },
                                                        todayMeals.snack && {
                                                            type: 'SNACK',
                                                            icon: '🍎',
                                                            meal: todayMeals.snack,
                                                            time: '4:00 PM',
                                                            status: currentHour >= 16 ? 'done' : 'upcoming'
                                                        },
                                                        {
                                                            type: 'DINNER',
                                                            icon: '🌙',
                                                            meal: todayMeals.dinner,
                                                            time: '7:00 PM',
                                                            status: currentHour >= 19 ? 'done' : 'upcoming'
                                                        },
                                                    ]
                                                        .filter(item => item && item.meal)

                                                        .map((item: any, idx: number) => (
                                                            <div key={idx}
                                                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${item.status === 'upcoming' ? 'bg-[#fffbeb] border-[#fde68a]' : 'bg-[#f8fafc] border-[#e2e8f0]'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-base w-6 text-center">{item.icon}</span>
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide">
                                                                            {item.type}
                                                                            {item.status === 'upcoming' && (
                                                                                <span className="ml-2 text-[#f97316]">•   UPCOMING</span>
                                                                            )}
                                                                        </p>
                                                                        <p className="text-[12px] sm:text-[13px] font-semibold text-[#0f172a] leading-tight mt-0.5">
                                                                            {/* Clean meal name — remove extra text */}
                                                                            {typeof item.meal === 'string'
                                                                                ? item.meal.split('(')[0].trim()
                                                                                : item.meal?.name || 'See meal plan'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className={`text-[10px] sm:text-[11px] px-2 py-1 rounded-lg font-semibold ${item.status === 'done' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fff7ed] text-[#f97316]'
                                                                        }`}>
                                                                        {item.status === 'done' ? '✓ Done' : item.time}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                })()}

                                                {/* Tomorrow's First Meal */}
                                                {tomorrowMeals && (tomorrowMeals.breakfast || tomorrowMeals.lunch) && (
                                                    <div className="pt-3 mt-2 border-t border-dashed border-[#e2e8f0]">
                                                        <p className="text-[10px] sm:text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide mb-2 pl-1">
                                                            Tomorrow's Plan
                                                        </p>
                                                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border bg-[#f8fafc] border-[#e2e8f0] opacity-80 hover:opacity-100 transition-opacity cursor-default">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-base w-6 text-center">
                                                                    {tomorrowMeals.breakfast ? '🌅' : '☀️'}
                                                                </span>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide">
                                                                        {tomorrowMeals.breakfast ? 'BREAKFAST' : 'LUNCH'}
                                                                    </p>
                                                                    <p className="text-[12px] sm:text-[13px] font-semibold text-[#0f172a] leading-tight mt-0.5">
                                                                        {typeof (tomorrowMeals.breakfast || tomorrowMeals.lunch) === 'string'
                                                                            ? (tomorrowMeals.breakfast || tomorrowMeals.lunch).split('(')[0].trim()
                                                                            : (tomorrowMeals.breakfast || tomorrowMeals.lunch)?.name || 'See meal plan'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[10px] sm:text-[11px] px-2 py-1 rounded-lg font-semibold bg-[#f1f5f9] text-[#64748b]">
                                                                    Upcoming
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Total calories from profile */}
                                                {userProfile?.calories && (
                                                    <div className="pt-3 mt-2 border-t border-[#f1f5f9] flex items-center justify-between">
                                                        <span className="text-[12px] text-[#64748b]">Daily target</span>
                                                        <span className="text-[12px] font-bold text-[#f97316]">
                                                            🔥 {userProfile.calories} kcal
                                                        </span>
                                                    </div>
                                                )}
                                                {userProfile?.bmi && !userProfile?.calories && (
                                                    <div className="pt-3 mt-2 border-t border-[#f1f5f9] flex items-center justify-between">
                                                        <span className="text-[12px] text-[#64748b]">Daily target</span>
                                                        <span className="text-[12px] font-bold text-[#f97316]">
                                                            🔥 ~2000 kcal
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // ── NO MEAL PLAN YET ──
                                            <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                                                <span className="text-[32px] sm:text-4xl mb-3">🍽️</span>
                                                <p className="text-[13px] sm:text-[14px] font-semibold text-[#374151] mb-1">
                                                    No meals planned today
                                                </p>
                                                <p className="text-[11px] sm:text-[12px] text-[#94a3b8] mb-4">
                                                    Generate your personalized meal plan
                                                </p>
                                                <button
                                                    onClick={() => navigate('/meal-plan')}
                                                    className="bg-[#22c55e] text-white text-[12px] sm:text-[13px] font-semibold px-4 sm:px-5 py-2 rounded-xl hover:bg-[#16a34a] transition-colors"
                                                >
                                                    Generate Plan →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Col B: Stacked Cards (Span 4) */}
                                <div className="md:col-span-1 lg:col-span-4 flex flex-col gap-4 sm:gap-6 min-h-[400px]">
                                    {/* User Profile Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-4 sm:p-5 px-4 sm:px-6 flex-1 flex flex-col justify-between">
                                        <h3 className="text-sm sm:text-base font-bold text-[#0f172a] mb-4">Your Profile</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">Age</span>
                                                <span className="text-sm font-bold text-slate-900">{user?.age ? `${user.age} years` : '--'}</span>
                                            </div>
                                            <div className="h-px bg-slate-100"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">Gender</span>
                                                <span className="text-sm font-bold text-slate-900 capitalize">{user?.gender || '--'}</span>
                                            </div>
                                            <div className="h-px bg-slate-100"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">Weight</span>
                                                <span className="text-sm font-bold text-slate-900">{weight}</span>
                                            </div>
                                            <div className="h-px bg-slate-100"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">Height</span>
                                                <span className="text-sm font-bold text-slate-900">{height}</span>
                                            </div>
                                            <div className="h-px bg-slate-100"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">Activity</span>
                                                <span className="text-sm font-bold text-slate-900 capitalize">{activityLevel}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/health-profile')}
                                            className="mt-4 w-full py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-sm font-medium text-[#64748b] hover:bg-[#f0fdf4] hover:text-[#22c55e] hover:border-[#22c55e] transition-all"
                                        >
                                            Update Profile
                                        </button>
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
                                            <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100">Current: {weight}</span>
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
                                                    <span className="material-symbols-outlined text-purple-500 text-lg">speed</span>
                                                    <span className="text-xs sm:text-sm font-medium text-slate-600">BMI</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-bold text-[#22c55e]">{bmi}</span>
                                            </div>
                                            {user?.medicalConditions && user.medicalConditions.length > 0 && (
                                                <>
                                                    <div className="h-px bg-slate-100"></div>
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-500">Conditions:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {user.medicalConditions.map((c, i) => (
                                                                <span key={i} className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">{c}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {user?.allergies && user.allergies.length > 0 && (
                                                <>
                                                    <div className="h-px bg-slate-100"></div>
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-500">Allergies:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {user.allergies.map((a, i) => (
                                                                <span key={i} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">{a}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
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
                                                {user?.primaryGoal?.toLowerCase().includes('lose')
                                                    ? `Focus on high-protein meals today to support your weight loss goal. Your target is ${calorieTarget.toLocaleString()} kcal/day.`
                                                    : user?.primaryGoal?.toLowerCase().includes('muscle') || user?.primaryGoal?.toLowerCase().includes('gain')
                                                        ? `Prioritize protein-rich foods and post-workout nutrition to support muscle building. Target: ${calorieTarget.toLocaleString()} kcal/day.`
                                                        : `Maintain a balanced diet with variety across all food groups. Your daily target is ${calorieTarget.toLocaleString()} kcal.`
                                                }
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
                                        {weekDays.map((day) => (
                                            <div
                                                key={day.name}
                                                onClick={() => navigate('/meal-plan')}
                                                className="cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl flex-1 min-w-[40px]"
                                            >
                                                <span className={`text-[10px] sm:text-xs font-medium ${day.isToday ? 'font-bold text-[#22c55e]' : 'text-slate-400'}`}>
                                                    {day.name}
                                                </span>
                                                {day.isToday ? (
                                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[3px] border-[#22c55e] flex items-center justify-center bg-transparent p-[2px]">
                                                        <div className="w-full h-full rounded-full bg-[#22c55e] text-white flex items-center justify-center">
                                                            <span className="text-[10px] sm:text-xs font-bold">{day.date}</span>
                                                        </div>
                                                    </div>
                                                ) : day.isPast ? (
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white">
                                                        <span className="material-symbols-outlined text-base sm:text-lg">check</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-200 bg-transparent flex items-center justify-center">
                                                    </div>
                                                )}
                                            </div>
                                        ))}
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

                            {/* Plan History */}
                            {mealHistory.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-4 sm:p-5 px-4 sm:px-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-[#0f172a] text-[15px]">📋 Plan History</h3>
                                        <span className="text-[12px] text-[#94a3b8]">Last {mealHistory.length} plans</span>
                                    </div>
                                    <div className="space-y-2">
                                        {mealHistory.map((entry: any, idx: number) => (
                                            <div key={entry.id}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer hover:border-[#22c55e] hover:bg-[#f0fdf4] transition-all ${idx === 0 ? 'border-[#22c55e] bg-[#f0fdf4]' : 'border-[#e2e8f0] bg-[#f8fafc]'
                                                    }`}
                                                onClick={() => navigate('/meal-plan')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${idx === 0 ? 'bg-[#22c55e] text-white' : 'bg-[#e2e8f0] text-[#64748b]'
                                                        }`}>
                                                        <span className="text-sm">📅</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-[#0f172a]">
                                                            {entry.weekLabel}
                                                            {idx === 0 && (
                                                                <span className="ml-2 text-[10px] bg-[#22c55e] text-white px-2 py-0.5 rounded-full">Current</span>
                                                            )}
                                                        </p>
                                                        <p className="text-[11px] text-[#94a3b8]">Generated on {entry.date} · {entry.totalDays || 7}-day plan</p>
                                                    </div>
                                                </div>
                                                <span className="text-[12px] text-[#22c55e] font-medium">View →</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </>
                    )}
                </main>
            </div>
        </PageWrapper>
    )
}
