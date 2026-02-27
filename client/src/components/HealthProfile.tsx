import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, FileText, CheckCircle2 } from 'lucide-react'
import { Sidebar } from './Sidebar'

const getBMIStatus = (bmi: string | null) => {
    if (!bmi) return null
    const bmiNum = parseFloat(bmi)
    if (bmiNum < 18.5) return { label: 'Underweight', color: 'text-amber-500' }
    if (bmiNum < 25) return { label: 'Normal Weight', color: 'text-emerald-600' }
    if (bmiNum < 30) return { label: 'Overweight', color: 'text-orange-500' }
    return { label: 'Obese', color: 'text-red-500' }
}

const SectionCard = ({ icon, title, description, borderColor, isFilled, badge, children }: any) => (
    <div className={`bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col`}
        style={{ borderTop: `4px solid ${borderColor}` }}
    >
        <div className="px-6 py-5 flex items-start justify-between border-b border-[#f1f5f9] bg-[#fdfdfd]">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px]"
                    style={{ background: borderColor + '15' }}>
                    {icon}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0f172a] text-[16px]">
                            {title}
                        </span>
                        {badge && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-[#fff7ed] text-[#ea580c] rounded-md px-2 py-0.5">
                                {badge}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-[#64748b] text-[13px] mt-0.5">{description}</p>
                    )}
                </div>
            </div>
            {isFilled ? (
                <span className="text-[12px] bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0] rounded-lg px-2.5 py-1 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </span>
            ) : (
                <span className="text-[12px] bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] rounded-lg px-2.5 py-1 font-bold">
                    Pending
                </span>
            )}
        </div>
        <div className="px-6 py-6 bg-white flex-1">
            {children}
        </div>
    </div>
)

const Label = ({ children }: any) => (
    <label className="block text-[13px] font-bold text-[#475569] mb-1.5 flex items-center gap-1">
        {children}
    </label>
)

const Input = ({ rightElement, ...props }: any) => (
    <div className="relative">
        <input
            className="w-full h-[46px] border-[1.5px] border-[#e2e8f0] rounded-xl px-4 text-[14px] text-[#0f172a] bg-[#f8fafc] focus:bg-white focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 placeholder:text-[#94a3b8] transition-all"
            {...props}
        />
        {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#64748b] font-medium pointer-events-none">
                {rightElement}
            </div>
        )}
    </div>
)

const UnitToggle = ({ options, value, onChange }: any) => (
    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex bg-[#e2e8f0] rounded-lg p-1 gap-1">
        {options.map((opt: string) => (
            <button
                key={opt}
                onClick={() => onChange(opt)}
                type="button"
                className={`text-[12px] min-w-[34px] px-2 h-[26px] flex items-center justify-center rounded-md font-bold transition-all ${value === opt
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
            >
                {opt}
            </button>
        ))}
    </div>
)

const Select = ({ options, ...props }: any) => (
    <select
        className="w-full h-[46px] border-[1.5px] border-[#e2e8f0] rounded-xl px-4 text-[14px] text-[#0f172a] bg-[#f8fafc] focus:bg-white focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 appearance-none cursor-pointer transition-all disabled:opacity-50"
        {...props}
    >
        <option value="" disabled>Select...</option>
        {options.map((o: any) => (
            <option key={o.value} value={o.value}>
                {o.label}
            </option>
        ))}
    </select>
)

const TagInput = ({ tags, onAdd, onRemove, placeholder }: any) => {
    const [input, setInput] = useState('')
    return (
        <div className="min-h-[96px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-xl p-3 focus-within:bg-white focus-within:border-[#22c55e] focus-within:ring-4 focus-within:ring-[#22c55e]/10 transition-all">
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1.5 bg-white text-[#0f172a] text-[13px] font-medium pl-3 pr-2 h-[32px] rounded-lg border border-[#cbd5e1] shadow-sm">
                        {tag}
                        <button
                            onClick={() => onRemove(tag)}
                            className="text-[#94a3b8] hover:text-red-500 hover:bg-red-50 w-5 h-5 rounded flex items-center justify-center transition-colors font-bold text-lg leading-none pb-0.5"
                            type="button"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter' && input.trim()) {
                        e.preventDefault()
                        onAdd(input.trim())
                        setInput('')
                    }
                }}
                placeholder={tags.length === 0 ? placeholder : "Type and press enter..."}
                className="text-[14px] text-[#0f172a] outline-none w-full placeholder:text-[#94a3b8] bg-transparent pb-1"
            />
        </div>
    )
}

export function HealthProfile() {
    const navigate = useNavigate()

    const [profile, setProfile] = useState<{ [key: string]: any }>({
        age: '',
        gender: '',
        bloodGroup: '',
        weight: '',
        weightUnit: 'kg',
        height: '',
        heightUnit: 'cm',
        bmi: null,

        conditions: [],
        allergies: [],
        medicalNotes: '',

        primaryGoal: '',
        activityLevel: '',
        sleepHours: '',

        dietaryType: '',
        cuisines: [],
        budget: '',
        mealsPerDay: 3,
    })

    const [saving, setSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)

    const update = (field: string, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }))
        // Clear any save message when user makes changes
        if (saveMessage) setSaveMessage(null)
    }

    // ─── Load profile from DB on mount ───────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signin')
            return
        }

        const loadProfile = async () => {
            setLoadingProfile(true)
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token')
                    navigate('/signin')
                    return
                }
                if (!res.ok) throw new Error('Failed to load profile')
                const data = await res.json()
                if (data.success && data.user) {
                    const u = data.user
                    setProfile(prev => ({
                        ...prev,
                        age: u.age || '',
                        gender: u.gender || '',
                        bloodGroup: u.bloodGroup || '',
                        weight: u.weight || '',
                        height: u.height || '',
                        bmi: u.bmi ? u.bmi.toString() : null,
                        conditions: u.medicalConditions || [],
                        allergies: u.allergies || [],
                        medicalNotes: u.medicalNotes || '',
                        primaryGoal: u.primaryGoal || '',
                        activityLevel: u.activityLevel || '',
                        sleepHours: u.sleepHours || '',
                        dietaryType: u.dietaryType || '',
                        cuisines: u.cuisinePreferences || [],
                        budget: u.budget || '',
                        mealsPerDay: u.mealsPerDay || 3,
                    }))
                }
            } catch (err) {
                console.error('Error loading profile:', err)
            } finally {
                setLoadingProfile(false)
            }
        }
        loadProfile()
    }, [navigate])

    // ─── Auto-calculate BMI ──────────────────────────────────────────────────
    useEffect(() => {
        if (profile.weight && profile.height) {
            let weightKg = profile.weightUnit === 'lbs'
                ? parseFloat(profile.weight) * 0.453592
                : parseFloat(profile.weight)
            let heightM = profile.heightUnit === 'ft'
                ? parseFloat(profile.height) * 0.3048
                : parseFloat(profile.height) / 100

            if (weightKg > 0 && heightM > 0) {
                const bmi = (weightKg / (heightM * heightM)).toFixed(1)
                setProfile(prev => ({ ...prev, bmi }))
            }
        }
    }, [profile.weight, profile.height, profile.weightUnit, profile.heightUnit])

    const getCompletion = () => {
        let filled = 0
        if (profile.age && profile.gender) filled++
        if (profile.conditions.length > 0 || profile.allergies.length > 0 || profile.medicalNotes) filled++
        if (profile.primaryGoal && profile.activityLevel) filled++
        if (profile.dietaryType) filled++
        return Math.round((filled / 4) * 100)
    }

    const completion = getCompletion()

    // ─── Save profile to database ────────────────────────────────────────────
    const saveProfileToDB = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signin')
            return
        }

        setSaving(true)
        setSaveMessage(null)

        // Convert units to metric (kg/cm) for storage
        let weightKg = profile.weight
            ? (profile.weightUnit === 'lbs'
                ? parseFloat(profile.weight) * 0.453592
                : parseFloat(profile.weight))
            : undefined

        let heightCm = profile.height
            ? (profile.heightUnit === 'ft'
                ? parseFloat(profile.height) * 30.48
                : parseFloat(profile.height))
            : undefined

        const payload: Record<string, any> = {
            age: profile.age ? parseInt(profile.age) : undefined,
            gender: profile.gender || undefined,
            bloodGroup: profile.bloodGroup || undefined,
            weight: weightKg ? parseFloat(weightKg.toFixed(1)) : undefined,
            height: heightCm ? parseFloat(heightCm.toFixed(1)) : undefined,
            medicalConditions: profile.conditions,
            allergies: profile.allergies,
            medicalNotes: profile.medicalNotes || '',
            primaryGoal: profile.primaryGoal || undefined,
            activityLevel: profile.activityLevel || undefined,
            sleepHours: profile.sleepHours ? parseFloat(profile.sleepHours) : undefined,
            dietaryType: profile.dietaryType || undefined,
            cuisinePreferences: profile.cuisines,
            budget: profile.budget || undefined,
            mealsPerDay: profile.mealsPerDay,
        }

        // Remove undefined fields
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined) delete payload[key]
        })

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (data.success) {
                setSaveMessage({ type: 'success', text: 'Profile saved successfully!' })
            } else {
                setSaveMessage({ type: 'error', text: data.message || 'Failed to save profile' })
            }
        } catch (err) {
            console.error('Error saving profile:', err)
            setSaveMessage({ type: 'error', text: 'Could not connect to server. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    const handleSaveAndGenerate = async () => {
        await saveProfileToDB()
        // Only navigate if save was successful (check after state update)
        setTimeout(() => {
            navigate('/meal-plan')
        }, 500)
    }

    const handleSaveDraft = async () => {
        await saveProfileToDB()
    }

    if (loadingProfile) {
        return (
            <div className="flex h-screen bg-[#f8fafc]">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[#64748b] text-sm font-medium">Loading your profile...</p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1100px] mx-auto px-8 pt-8 pb-[100px]">

                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <h1 className="text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                                    Health Profile
                                </h1>
                                <p className="text-[15px] text-[#64748b] mt-1 pr-4">
                                    Tell us about your body, goals, and lifestyle to receive highly personalized AI meal plans.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 bg-white border border-[#22c55e]/30 rounded-2xl px-5 py-3 shadow-[0_2px_10px_rgba(34,197,94,0.08)] shrink-0">
                                <div className="hidden sm:block">
                                    <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Setup Progress</div>
                                    <div className="text-[18px] font-black text-[#16a34a] leading-none">{completion}%</div>
                                </div>
                                <div className="w-12 h-12 rounded-full border-[4px] border-[#f1f5f9] relative flex items-center justify-center">
                                    <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                                        <circle cx="24" cy="24" r="20" fill="none" stroke="#22c55e" strokeWidth="4"
                                            strokeDasharray="125" strokeDashoffset={125 - (125 * completion) / 100}
                                            strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                    </svg>
                                    <span className="text-xl">✨</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-[6px] bg-[#e2e8f0] rounded-full overflow-hidden">
                            <div className="h-[6px] rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-1000 ease-out"
                                style={{ width: `${completion}%` }} />
                        </div>
                    </div>

                    {/* Save Message Toast */}
                    {saveMessage && (
                        <div className={`mb-6 px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top ${saveMessage.type === 'success'
                                ? 'bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0]'
                                : 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]'
                            }`}>
                            <span className="material-symbols-outlined text-lg">
                                {saveMessage.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            {saveMessage.text}
                        </div>
                    )}

                    {/* Content Grid: 2 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* LEFT COLUMN */}
                        <div className="flex flex-col gap-6">

                            {/* Section 1: Basic Body Metrics */}
                            <SectionCard
                                icon="🧍"
                                title="Basic Body Metrics"
                                description="Your foundational biometrics"
                                borderColor="#3b82f6"
                                isFilled={!!profile.age && !!profile.gender}
                            >
                                <div className="flex flex-col gap-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Age</Label>
                                            <Input type="number" placeholder="e.g. 28" value={profile.age} onChange={(e: any) => update('age', e.target.value)} rightElement="years" />
                                        </div>
                                        <div>
                                            <Label>Gender</Label>
                                            <Select value={profile.gender} onChange={(e: any) => update('gender', e.target.value)}
                                                options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Weight</Label>
                                            <div className="relative">
                                                <Input type="number" placeholder="68" value={profile.weight} onChange={(e: any) => update('weight', e.target.value)} />
                                                <UnitToggle options={['kg', 'lbs']} value={profile.weightUnit} onChange={(v: any) => update('weightUnit', v)} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Height</Label>
                                            <div className="relative">
                                                <Input type="number" placeholder="172" value={profile.height} onChange={(e: any) => update('height', e.target.value)} />
                                                <UnitToggle options={['cm', 'ft']} value={profile.heightUnit} onChange={(v: any) => update('heightUnit', v)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Blood Group</Label>
                                            <Select value={profile.bloodGroup} onChange={(e: any) => update('bloodGroup', e.target.value)} options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(v => ({ value: v, label: v }))} />
                                        </div>
                                        <div>
                                            <Label>Calculated BMI</Label>
                                            <div className="h-[46px] border-[1.5px] border-[#22c55e]/30 bg-[#22c55e]/5 rounded-xl px-4 flex items-center justify-between">
                                                <span className="text-[16px] font-bold text-[#16a34a]">
                                                    {profile.bmi || '—'}
                                                </span>
                                                {profile.bmi && (
                                                    <span className={`text-[12px] font-bold px-2 py-1 rounded bg-[#ffffff] shadow-sm ${getBMIStatus(profile.bmi)?.color}`}>
                                                        {getBMIStatus(profile.bmi)?.label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Section 3: Lifestyle */}
                            <SectionCard
                                icon="🏃" title="Lifestyle & Goals"
                                description="Your daily activity patterns"
                                borderColor="#8b5cf6"
                                isFilled={!!profile.primaryGoal && !!profile.activityLevel}
                            >
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <Label>Primary Health Goal</Label>
                                        <Select value={profile.primaryGoal} onChange={(e: any) => update('primaryGoal', e.target.value)}
                                            options={[
                                                { value: 'lose_weight', label: '🎯 Lose Weight' },
                                                { value: 'build_muscle', label: '💪 Build Muscle' },
                                                { value: 'maintain', label: '⚖️ Maintain Weight' },
                                                { value: 'heart_health', label: '❤️ Heart Health' }
                                            ]}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Activity Level</Label>
                                            <Select value={profile.activityLevel} onChange={(e: any) => update('activityLevel', e.target.value)}
                                                options={[
                                                    { value: 'sedentary', label: '🛋️ Sedentary' },
                                                    { value: 'light', label: '🚶 Light' },
                                                    { value: 'moderate', label: '🏃 Moderate' },
                                                    { value: 'very_active', label: '💪 Active' }
                                                ]}
                                            />
                                        </div>
                                        <div>
                                            <Label>Average Sleep</Label>
                                            <Input type="number" placeholder="7" value={profile.sleepHours} onChange={(e: any) => update('sleepHours', e.target.value)} rightElement="hrs/night" />
                                            {profile.sleepHours && (
                                                <p className={`text-[12px] mt-1.5 font-semibold ${parseFloat(profile.sleepHours) >= 7 && parseFloat(profile.sleepHours) <= 9 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {parseFloat(profile.sleepHours) >= 7 && parseFloat(profile.sleepHours) <= 9 ? '😊 Optimal range' : '😐 Needs improvement'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-6">

                            {/* Section 2: Medical & Restrictions */}
                            <SectionCard
                                icon="🏥" title="Medical Restrictions"
                                description="Important for dietary constraints"
                                borderColor="#ef4444"
                                badge="⚕ Medical"
                                isFilled={profile.conditions.length > 0 || profile.allergies.length > 0 || profile.medicalNotes}
                            >
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <Label>Diagnosed Conditions</Label>
                                        <TagInput tags={profile.conditions} onAdd={(t: string) => update('conditions', [...profile.conditions, t])} onRemove={(t: string) => update('conditions', profile.conditions.filter((c: string) => c !== t))} placeholder="e.g. PCOS, Hypertension..." />
                                    </div>
                                    <div>
                                        <Label>Food Allergies / Intolerances</Label>
                                        <TagInput tags={profile.allergies} onAdd={(t: string) => update('allergies', [...profile.allergies, t])} onRemove={(t: string) => update('allergies', profile.allergies.filter((a: string) => a !== t))} placeholder="e.g. Peanuts, Dairy..." />
                                    </div>
                                    <div>
                                        <Label>Special Medical Notes</Label>
                                        <textarea
                                            className="w-full min-h-[96px] border-[1.5px] border-[#e2e8f0] bg-[#f8fafc] rounded-xl p-3 text-[14px] text-[#0f172a] focus:bg-white focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 placeholder:text-[#94a3b8] resize-none transition-all"
                                            placeholder="Any specific medications or doctor's dietary recommendations..."
                                            value={profile.medicalNotes} onChange={e => update('medicalNotes', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Section 4: Food Preferences */}
                            <SectionCard
                                icon="🍽️" title="Food Preferences"
                                description="Customize your meal plan"
                                borderColor="#f97316"
                                isFilled={!!profile.dietaryType}
                            >
                                <div className="flex flex-col gap-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Dietary Type</Label>
                                            <Select value={profile.dietaryType} onChange={(e: any) => update('dietaryType', e.target.value)}
                                                options={[
                                                    { value: 'vegetarian', label: '🌿 Vegetarian' },
                                                    { value: 'vegan', label: '🥦 Vegan' },
                                                    { value: 'non_veg', label: '🥩 Non-Vegetarian' },
                                                    { value: 'keto', label: '🥗 Keto' }
                                                ]} />
                                        </div>
                                        <div>
                                            <Label>Daily Meal Budget</Label>
                                            <Select value={profile.budget} onChange={(e: any) => update('budget', e.target.value)}
                                                options={[
                                                    { value: 'economy', label: '💚 Under ₹200/day' },
                                                    { value: 'moderate', label: '💛 ₹200–₹500/day' },
                                                    { value: 'premium', label: '💜 ₹1000+/day' }
                                                ]} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Preferred Cuisines</Label>
                                        <TagInput tags={profile.cuisines} onAdd={(t: string) => update('cuisines', [...profile.cuisines, t])} onRemove={(t: string) => update('cuisines', profile.cuisines.filter((c: string) => c !== t))} placeholder="e.g. Mediterranean, Indian, Mexican..." />
                                    </div>
                                    <div>
                                        <Label>Meals Per Day</Label>
                                        <div className="flex gap-3 w-full mt-1">
                                            {[2, 3, 4, 5].map(n => (
                                                <button
                                                    key={n} type="button" onClick={() => update('mealsPerDay', n)}
                                                    className={`flex-1 py-3 rounded-xl border-[1.5px] transition-all flex flex-col items-center justify-center ${profile.mealsPerDay === n ? 'bg-[#22c55e]/10 text-[#16a34a] border-[#22c55e]' : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]'}`}
                                                >
                                                    <span className="text-[18px] font-bold leading-none mb-1">{n}</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Meals</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-[256px] right-0 bg-white border-t border-[#e2e8f0] px-10 h-[72px] flex items-center justify-between z-50">
                <div className="flex items-center gap-2.5 text-[#64748b]">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium text-[14px]">Your data is securely saved to the database.</span>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="h-[44px] px-6 rounded-xl border-2 border-[#e2e8f0] text-[#475569] font-bold text-[14px] hover:border-[#cbd5e1] hover:bg-[#f8fafc] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-[#475569] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FileText className="w-4 h-4" />
                        )}
                        Save Profile
                    </button>
                    <button
                        onClick={handleSaveAndGenerate}
                        disabled={saving}
                        className="h-[44px] px-8 rounded-xl bg-[#22c55e] text-white font-bold text-[14px] hover:bg-[#16a34a] hover:-translate-y-[1px] shadow-[0_4px_12px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_16px_rgba(34,197,94,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : null}
                        Save & Generate Plan <span className="text-[18px] leading-none mb-[2px]">&rarr;</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HealthProfile
