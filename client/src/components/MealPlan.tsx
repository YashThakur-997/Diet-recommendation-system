import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from './PageWrapper'
import { Sidebar } from './Sidebar'

// ─── Types ───────────────────────────────────────────────────────────────────
type Meal = {
    type: string       // Breakfast, Lunch, Dinner, Snack
    name: string
    calories: string
    details: string    // full markdown for this meal
}

type DayPlan = {
    dayName: string
    date: string
    totalCalories: string
    meals: Meal[]
    raw: string        // raw markdown from LLM
}

type ChatMessage = {
    role: 'user' | 'ai'
    text: string
    time: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getFormattedTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function getWeekRange(): string {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `Week of ${fmt(monday)} – ${fmt(sunday)}, ${now.getFullYear()}`
}

function getTodayName(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

function getTodayDate(): string {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Parse the raw LLM markdown response into structured meals.
 * Handles formats like: ## Breakfast: Dish Name or **Breakfast:** Dish Name
 */
function parseMealPlan(raw: string): DayPlan {
    const meals: Meal[] = []
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Snack 1', 'Snack 2', 'Morning Snack', 'Evening Snack']

    // Try to split by ## headings first
    const sections = raw.split(/(?=^##\s)/m)

    for (const section of sections) {
        if (!section.trim()) continue

        for (const mealType of mealTypes) {
            const regex = new RegExp(`(?:^##\\s*)?(?:\\*\\*)?${mealType}(?:\\s*:)?(?:\\*\\*)?\\s*[:\\-–]?\\s*(.*)`, 'im')
            const match = section.match(regex)
            if (match) {
                let name = match[1]?.trim() || 'Meal'
                // Clean up markdown from name
                name = name.replace(/[*#]/g, '').trim()
                if (name.length > 60) name = name.substring(0, 57) + '...'
                if (!name) name = mealType

                // Extract calories from the section
                const calMatch = section.match(/(\d{2,4})\s*(?:kcal|calories|cal)/i)
                const calories = calMatch ? `${calMatch[1]} kcal` : ''

                meals.push({
                    type: mealType.replace(/\d+/, '').trim(),
                    name,
                    calories,
                    details: section.trim(),
                })
                break
            }
        }
    }

    // If no structured meals found, create a single entry
    if (meals.length === 0 && raw.trim()) {
        meals.push({
            type: 'Meal Plan',
            name: 'Generated Plan',
            calories: '',
            details: raw.trim(),
        })
    }

    // Try to extract total calories
    const totalCalMatch = raw.match(/(?:total|daily|sum)[^:]*:\s*~?(\d{3,5})\s*(?:kcal|calories|cal)/i)
    const totalCalories = totalCalMatch ? `${totalCalMatch[1]} kcal` : ''

    return {
        dayName: getTodayName(),
        date: getTodayDate(),
        totalCalories,
        meals,
        raw,
    }
}

const mealIcons: Record<string, { bg: string; color: string; icon: string }> = {
    'Breakfast': { bg: 'bg-yellow-50', color: 'text-yellow-600', icon: 'wb_twilight' },
    'Lunch': { bg: 'bg-orange-50', color: 'text-orange-600', icon: 'light_mode' },
    'Dinner': { bg: 'bg-indigo-50', color: 'text-indigo-600', icon: 'dark_mode' },
    'Snack': { bg: 'bg-green-50', color: 'text-green-600', icon: 'cookie' },
    'Morning Snack': { bg: 'bg-lime-50', color: 'text-lime-600', icon: 'cookie' },
    'Evening Snack': { bg: 'bg-amber-50', color: 'text-amber-600', icon: 'cookie' },
    'Meal Plan': { bg: 'bg-emerald-50', color: 'text-emerald-600', icon: 'restaurant' },
}

// ─── Component ───────────────────────────────────────────────────────────────
export function MealPlan() {
    const navigate = useNavigate()
    const chatEndRef = useRef<HTMLDivElement>(null)

    // State
    const [plan, setPlan] = useState<DayPlan | null>(null)
    const [shoppingList, setShoppingList] = useState<string>('')
    const [generating, setGenerating] = useState(false)
    const [streamText, setStreamText] = useState('')
    const [error, setError] = useState('')
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [chatInput, setChatInput] = useState('')
    const [chatLoading, setChatLoading] = useState(false)
    const [showDetails, setShowDetails] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'meals' | 'shopping'>('meals')

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    // ─── Generate meal plan from backend ─────────────────────────────────────
    const generateMealPlan = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signin')
            return
        }

        setGenerating(true)
        setStreamText('')
        setError('')
        setPlan(null)
        setShoppingList('')

        try {
            // 1. Fetch user profile from DB
            const profileRes = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            if (profileRes.status === 401 || profileRes.status === 403) {
                localStorage.removeItem('token')
                navigate('/signin')
                return
            }
            const profileData = await profileRes.json()
            if (!profileData.success) {
                setError('Could not load your profile. Please update your health profile first.')
                setGenerating(false)
                return
            }

            const user = profileData.user

            // Check if profile has minimum required fields
            if (!user.age || !user.weight || !user.height || !user.gender) {
                setError('Please complete your health profile (age, weight, height, gender) before generating a meal plan.')
                setGenerating(false)
                return
            }

            // 2. Build profile object for the meal plan API
            const profile = {
                age: user.age,
                gender: user.gender,
                weight: `${user.weight}kg`,
                height: `${user.height}cm`,
                activity: user.activityLevel || 'moderate',
                goal: user.primaryGoal || 'maintain',
                dietType: user.dietaryType || 'omnivore',
                allergies: user.allergies?.join(', ') || 'none',
                conditions: user.medicalConditions?.join(', ') || 'none',
                disliked: '',
                cuisine: user.cuisinePreferences?.join(', ') || 'any',
                mealsPerDay: user.mealsPerDay || 3,
                cookTime: 30,
                budget: user.budget || 'medium',
                servings: 1,
            }

            // 3. Call the streaming endpoint
            const res = await fetch('/api/meal-plan/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ profile }),
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || `Server error: ${res.status}`)
            }

            // 4. Read SSE stream
            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            let fullMealPlan = ''
            let fullShoppingList = ''
            let currentStep = ''

            if (!reader) throw new Error('No response stream')

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    try {
                        const data = JSON.parse(line.slice(6))

                        if (data.step && data.status === 'start') {
                            currentStep = data.step
                            if (data.step === 'meal_plan') {
                                setChatMessages(prev => [...prev, {
                                    role: 'ai',
                                    text: '🍳 Generating your personalized meal plan...',
                                    time: getFormattedTime(),
                                }])
                            } else if (data.step === 'shopping_list') {
                                setChatMessages(prev => [...prev, {
                                    role: 'ai',
                                    text: '🛒 Creating your shopping list...',
                                    time: getFormattedTime(),
                                }])
                            }
                        }

                        if (data.token) {
                            if (currentStep === 'meal_plan') {
                                fullMealPlan += data.token
                                setStreamText(fullMealPlan)
                            } else if (currentStep === 'shopping_list') {
                                fullShoppingList += data.token
                                setShoppingList(fullShoppingList)
                            }
                        }

                        if (data.step === 'complete') {
                            // Final result
                            if (data.plan?.meal_plan) {
                                fullMealPlan = data.plan.meal_plan
                                setStreamText(fullMealPlan)
                            }
                            if (data.plan?.shopping_list) {
                                fullShoppingList = data.plan.shopping_list
                                setShoppingList(fullShoppingList)
                            }
                        }

                    } catch {
                        // skip malformed JSON
                    }
                }
            }

            // 5. Parse the full response into structured data
            if (fullMealPlan) {
                const parsed = parseMealPlan(fullMealPlan)
                setPlan(parsed)
                setChatMessages(prev => [...prev, {
                    role: 'ai',
                    text: `✅ Your meal plan is ready! I've created a ${parsed.meals.length}-meal plan${parsed.totalCalories ? ` totalling ~${parsed.totalCalories}` : ''} based on your health profile.`,
                    time: getFormattedTime(),
                }])
            }

        } catch (err: any) {
            console.error('Meal plan generation error:', err)
            setError(err.message || 'Failed to generate meal plan. Make sure Ollama is running.')
            setChatMessages(prev => [...prev, {
                role: 'ai',
                text: `❌ Error: ${err.message || 'Failed to generate meal plan'}. Please make sure Ollama is running and try again.`,
                time: getFormattedTime(),
            }])
        } finally {
            setGenerating(false)
        }
    }

    // ─── Chat with AI about the plan ─────────────────────────────────────────
    const handleChat = async () => {
        if (!chatInput.trim() || chatLoading) return

        const userMsg = chatInput.trim()
        setChatInput('')
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg, time: getFormattedTime() }])
        setChatLoading(true)

        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signin')
            return
        }

        try {
            // Fetch user profile
            const profileRes = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const profileData = await profileRes.json()
            const user = profileData.user

            const profile = {
                age: user.age,
                gender: user.gender,
                weight: `${user.weight}kg`,
                height: `${user.height}cm`,
                activity: user.activityLevel || 'moderate',
                goal: user.primaryGoal || 'maintain',
                dietType: user.dietaryType || 'omnivore',
                allergies: user.allergies?.join(', ') || 'none',
                conditions: user.medicalConditions?.join(', ') || 'none',
                disliked: userMsg,
                cuisine: user.cuisinePreferences?.join(', ') || 'any',
                mealsPerDay: user.mealsPerDay || 3,
                cookTime: 30,
                budget: user.budget || 'medium',
                servings: 1,
            }

            // Regenerate with the user's modification
            const res = await fetch('/api/meal-plan/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ profile }),
            })

            const data = await res.json()

            if (data.success && data.plan?.meal_plan) {
                const parsed = parseMealPlan(data.plan.meal_plan)
                setPlan(parsed)
                if (data.plan.shopping_list) setShoppingList(data.plan.shopping_list)

                setChatMessages(prev => [...prev, {
                    role: 'ai',
                    text: `Done! I've updated your meal plan based on your request: "${userMsg}". Your new plan has ${parsed.meals.length} meals${parsed.totalCalories ? ` totalling ~${parsed.totalCalories}` : ''}.`,
                    time: getFormattedTime(),
                }])
            } else {
                setChatMessages(prev => [...prev, {
                    role: 'ai',
                    text: '❌ Sorry, I could not update the plan. Please try again.',
                    time: getFormattedTime(),
                }])
            }
        } catch (err: any) {
            setChatMessages(prev => [...prev, {
                role: 'ai',
                text: `❌ Error: ${err.message}`,
                time: getFormattedTime(),
            }])
        } finally {
            setChatLoading(false)
        }
    }

    // ─── Auto-generate on mount if no plan exists ────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signin')
            return
        }
        // Add welcome message
        setChatMessages([{
            role: 'ai',
            text: 'Hi! 👋 Click "Generate Meal Plan" to create a personalized meal plan based on your health profile, powered by Llama 3.1 AI.',
            time: getFormattedTime(),
        }])
    }, [navigate])

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <PageWrapper>
            <div className="bg-[#f8fafc] text-slate-900 overflow-hidden h-screen flex relative">
                <Sidebar />

                <main className="flex flex-1 h-full overflow-hidden">
                    {/* Left Panel: Meal Plan Display */}
                    <section className="flex-1 bg-[#f8fafc] h-full flex flex-col relative overflow-hidden">
                        {/* Top Bar */}
                        <div className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-100/50 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/dashboard')} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-xl font-bold text-slate-900">{getWeekRange()}</h2>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {/* Tab toggle */}
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setActiveTab('meals')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'meals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Meals
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('shopping')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'shopping' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Shopping List
                                    </button>
                                </div>
                                <button
                                    onClick={generateMealPlan}
                                    disabled={generating}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {generating ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>autorenew</span>
                                    )}
                                    {generating ? 'Generating...' : 'Generate Meal Plan'}
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32">
                            <div className="flex flex-col gap-6 max-w-5xl mx-auto">

                                {/* Error State */}
                                {error && (
                                    <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
                                        <span className="material-symbols-outlined text-red-400 text-3xl mb-2">error</span>
                                        <p className="text-red-600 font-medium text-sm">{error}</p>
                                        <button
                                            onClick={() => navigate('/health-profile')}
                                            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                                        >
                                            Update Health Profile
                                        </button>
                                    </div>
                                )}

                                {/* Generating State */}
                                {generating && (
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 border-3 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
                                            <div>
                                                <p className="font-bold text-slate-800">AI is generating your meal plan...</p>
                                                <p className="text-xs text-slate-500">Powered by Llama 3.1 via Ollama</p>
                                            </div>
                                        </div>
                                        {streamText && (
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-[400px] overflow-y-auto">
                                                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{streamText}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* No Plan Yet */}
                                {!plan && !generating && !error && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-20 h-20 rounded-full bg-[#f0fdf4] flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-[#22c55e] text-4xl">restaurant</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Meal Plan Yet</h3>
                                        <p className="text-sm text-slate-500 max-w-md mb-6">
                                            Click "Generate Meal Plan" to create a personalized plan based on your health profile.
                                            The AI will consider your dietary preferences, allergies, and health goals.
                                        </p>
                                        <button
                                            onClick={generateMealPlan}
                                            className="px-6 py-3 bg-[#22c55e] text-white rounded-xl font-bold text-sm hover:bg-[#16a34a] transition-all shadow-md flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_awesome</span>
                                            Generate My Meal Plan
                                        </button>
                                    </div>
                                )}

                                {/* Meals Tab */}
                                {plan && !generating && activeTab === 'meals' && (
                                    <>
                                        {/* Today's Day Card (highlighted) */}
                                        <div className="bg-white rounded-2xl p-0 shadow-[0_8px_30px_rgba(33,197,93,0.15)] ring-2 ring-[#22c55e] relative z-10">
                                            <div className="flex justify-between items-center mb-4 border-b border-[#22c55e]/10 pb-3 bg-[#f0fdf4] rounded-t-2xl p-5">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                                                            {plan.dayName}
                                                            <span className="bg-[#22c55e] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Today</span>
                                                        </h3>
                                                        <p className="text-xs text-[#16a34a] font-medium">{plan.date}</p>
                                                    </div>
                                                </div>
                                                {plan.totalCalories && (
                                                    <span className="px-3 py-1 bg-white text-[#22c55e] font-bold rounded-full text-xs shadow-sm border border-[#22c55e]/10">
                                                        {plan.totalCalories}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-3 px-5 pb-5">
                                                {plan.meals.map((meal, i) => {
                                                    const iconInfo = mealIcons[meal.type] || mealIcons['Meal Plan']
                                                    const isExpanded = showDetails === `meal-${i}`
                                                    return (
                                                        <div key={i}>
                                                            <div
                                                                className="flex items-center gap-4 p-3 bg-[#f0fdf4]/50 border border-[#22c55e]/10 rounded-xl transition-colors group cursor-pointer hover:bg-[#f0fdf4]"
                                                                onClick={() => setShowDetails(isExpanded ? null : `meal-${i}`)}
                                                            >
                                                                <div className={`${iconInfo.bg} p-2 rounded-lg ${iconInfo.color}`}>
                                                                    <span className="material-symbols-outlined">{iconInfo.icon}</span>
                                                                </div>
                                                                <div className="w-24 text-sm font-bold text-[#22c55e]">{meal.type}</div>
                                                                <div className="flex-1 text-sm font-semibold text-slate-900">{meal.name}</div>
                                                                {meal.calories && (
                                                                    <div className="text-xs font-bold text-slate-500">{meal.calories}</div>
                                                                )}
                                                                <span className={`material-symbols-outlined text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>
                                                                    expand_more
                                                                </span>
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="mt-2 ml-14 bg-white rounded-xl border border-slate-100 p-4 text-sm text-slate-700">
                                                                    <pre className="whitespace-pre-wrap font-sans leading-relaxed">{meal.details}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Raw Plan View (collapsed by default) */}
                                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                            <button
                                                onClick={() => setShowDetails(showDetails === 'raw' ? null : 'raw')}
                                                className="flex items-center justify-between w-full"
                                            >
                                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>description</span>
                                                    Full Plan Details
                                                </h3>
                                                <span className={`material-symbols-outlined text-slate-400 transition-transform ${showDetails === 'raw' ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>
                                                    expand_more
                                                </span>
                                            </button>
                                            {showDetails === 'raw' && (
                                                <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-[500px] overflow-y-auto">
                                                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{plan.raw}</pre>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Shopping List Tab */}
                                {activeTab === 'shopping' && (
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="material-symbols-outlined text-[#22c55e]">shopping_cart</span>
                                            <h3 className="font-bold text-slate-800 text-lg">Shopping List</h3>
                                        </div>
                                        {shoppingList ? (
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{shoppingList}</pre>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 text-center py-8">
                                                Generate a meal plan first to see your shopping list.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Right Panel: Chat Assistant */}
                    <section className="w-[35%] min-w-[320px] max-w-[450px] bg-white border-l border-slate-100 flex flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
                        {/* Chat Header */}
                        <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex flex-col">
                                <h2 className="text-slate-900 font-bold text-base flex items-center gap-2">
                                    NutriAI Assistant
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
                                    </span>
                                </h2>
                                <span className="text-xs text-slate-500">Powered by Llama 3.1</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-slate-50/50">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-[#22c55e]/10' : 'bg-slate-200'}`}>
                                        <span className={`material-symbols-outlined text-sm ${msg.role === 'ai' ? 'text-[#22c55e]' : 'text-slate-500'}`}>
                                            {msg.role === 'ai' ? 'smart_toy' : 'person'}
                                        </span>
                                    </div>
                                    <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                        <span className="text-xs text-slate-500 mx-1">
                                            {msg.role === 'ai' ? 'NutriAI' : 'You'} • {msg.time}
                                        </span>
                                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai'
                                                ? 'bg-white border border-slate-100 shadow-sm rounded-tl-none text-slate-700'
                                                : 'bg-[#22c55e] text-white rounded-tr-none shadow-md'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex gap-3">
                                    <div className="size-8 rounded-full bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[#22c55e] text-sm">smart_toy</span>
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-tl-none border border-slate-100 shadow-sm p-3 flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                        <span className="text-xs text-slate-500">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef}></div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-1">
                                {['Make it vegetarian', 'More protein', 'Less carbs', 'Indian cuisine'].map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => { setChatInput(suggestion); }}
                                        className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleChat() }}
                                    disabled={chatLoading || generating}
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e] placeholder-slate-400 disabled:opacity-50"
                                    placeholder="e.g. Replace lunch with something vegan..."
                                    type="text"
                                />
                                <button
                                    onClick={handleChat}
                                    disabled={!chatInput.trim() || chatLoading || generating}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_upward</span>
                                </button>
                            </div>
                            <div className="flex justify-center mt-2">
                                <span className="text-[10px] text-slate-400 font-medium">Powered by Llama 3.1 via Ollama</span>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </PageWrapper>
    )
}
