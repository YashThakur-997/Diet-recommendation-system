import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, FileText, CheckCircle2 } from 'lucide-react'
import { Sidebar } from './Sidebar'

const MOCK_ABHA_DATABASE = {
    '12-3456-7890-1234': {
        name: 'Rahul Sharma',
        age: 28,
        gender: 'male',
        bloodGroup: 'B+',
        weight: 72,
        weightUnit: 'kg',
        height: 175,
        heightUnit: 'cm',
        conditions: ['Hypertension'],
        allergies: ['Gluten'],
        medicalNotes: 'On medication for BP since 2022',
        primaryGoal: 'heart_health',
        activityLevel: 'moderate',
        sleepHours: '7',
        dietaryType: 'non_veg',
        cuisines: ['Indian', 'Mediterranean'],
        budget: 'moderate',
        mealsPerDay: 3,
    },
    '98-7654-3210-9876': {
        name: 'Priya Patel',
        age: 34,
        gender: 'female',
        bloodGroup: 'O+',
        weight: 58,
        weightUnit: 'kg',
        height: 162,
        heightUnit: 'cm',
        conditions: ['Diabetes Type 2', 'Thyroid'],
        allergies: ['Dairy', 'Nuts'],
        medicalNotes: 'Diabetic diet required. Low sugar.',
        primaryGoal: 'manage_diabetes',
        activityLevel: 'light',
        sleepHours: '6',
        dietaryType: 'vegetarian',
        cuisines: ['Indian'],
        budget: 'economy',
        mealsPerDay: 4,
    },
    '11-2233-4455-6677': {
        name: 'Arjun Mehta',
        age: 22,
        gender: 'male',
        bloodGroup: 'A+',
        weight: 80,
        weightUnit: 'kg',
        height: 182,
        heightUnit: 'cm',
        conditions: [],
        allergies: [],
        medicalNotes: '',
        primaryGoal: 'build_muscle',
        activityLevel: 'very_active',
        sleepHours: '8',
        dietaryType: 'non_veg',
        cuisines: ['Continental', 'Indian'],
        budget: 'comfortable',
        mealsPerDay: 5,
    },
}

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

const Input = ({ rightElement, isHighlighted, ...props }: any) => (
    <div className="relative">
        <input
            className={`w-full h-[46px] border-[1.5px] rounded-xl px-4 text-[14px] focus:outline-none transition-all ${isHighlighted
                ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#0f172a] focus:bg-[#f0fdf4] focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10'
                : 'bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] focus:bg-white focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 placeholder:text-[#94a3b8]'
                }`}
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

const Select = ({ options, isHighlighted, ...props }: any) => (
    <select
        className={`w-full h-[46px] border-[1.5px] rounded-xl px-4 text-[14px] appearance-none cursor-pointer transition-all disabled:opacity-50 focus:outline-none ${isHighlighted
            ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#0f172a] focus:bg-[#f0fdf4] focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10'
            : 'bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] focus:bg-white focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10'
            }`}
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

const TagInput = ({ tags, onAdd, onRemove, placeholder, isHighlighted }: any) => {
    const [input, setInput] = useState('')
    return (
        <div className={`min-h-[96px] border-[1.5px] rounded-xl p-3 focus-within:focus:ring-4 transition-all ${isHighlighted
            ? 'bg-[#f0fdf4] border-[#bbf7d0] focus-within:bg-[#f0fdf4] focus-within:border-[#22c55e] focus-within:ring-[#22c55e]/10'
            : 'bg-[#f8fafc] border-[#e2e8f0] focus-within:bg-white focus-within:border-[#22c55e] focus-within:ring-[#22c55e]/10'
            }`}>
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

    // ABHA Auto-Fill State
    const [abhaNumber, setAbhaNumber] = useState('')
    const [abhaStatus, setAbhaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [abhaUser, setAbhaUser] = useState<string | null>(null)
    const [showAbhaPanel, setShowAbhaPanel] = useState(true)
    const [abhaFilled, setAbhaFilled] = useState(false)

    // Voice & Text AI Profile Fill State
    const [voiceText, setVoiceText] = useState('')
    const [isListening, setIsListening] = useState(false)
    const [isExtracting, setIsExtracting] = useState(false)
    const [extractStatus, setExtractStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle')
    const [extractedFields, setExtractedFields] = useState<string[]>([])
    const [interimText, setInterimText] = useState('')
    const [showVoicePanel, setShowVoicePanel] = useState(true)
    const recognitionRef = useRef<any>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Placeholder Examples
    const PLACEHOLDER_EXAMPLES = [
        "I'm 25 years old male, weight 70kg, height 175cm, diabetic and allergic to gluten, prefer vegetarian food",
        "Female, 32 years, 58 kg, 5 feet 4 inches tall, I have thyroid and high BP, want to lose weight",
        "I'm 28, male, B+ blood group, gym 5 days a week, want to build muscle, non-vegetarian, budget around 500 rupees daily",
        "Age 45, female, weight 65 kg, height 160 cm, diabetic type 2, no meat, sleep 6 hours, sedentary job",
    ]
    const [placeholderIdx, setPlaceholderIdx] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx(prev => (prev + 1) % PLACEHOLDER_EXAMPLES.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const startListening = () => {
        // Check browser support
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            alert('Voice input not supported in this browser. Please use Chrome.')
            return
        }

        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition

        recognition.lang = 'en-IN' // India English
        recognition.continuous = true    // keep listening
        recognition.interimResults = true // show while speaking

        recognition.onstart = () => {
            setIsListening(true)
            setExtractStatus('listening')
            recognitionRef.current.originalText = voiceText ? voiceText + ' ' : ''
        }

        recognition.onresult = (event: any) => {
            let finalTranscript = ''
            let currentInterim = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' '
                } else {
                    currentInterim += transcript
                }
            }

            if (finalTranscript) {
                recognitionRef.current.originalText += finalTranscript
                setVoiceText(recognitionRef.current.originalText)
            }
            setInterimText(currentInterim)
        }

        recognition.onerror = (event: any) => {
            console.error('Speech error:', event.error)
            setIsListening(false)
            setExtractStatus('error')
        }

        recognition.onend = () => {
            setIsListening(false)
            setInterimText('')
        }

        recognition.start()
    }

    const stopListening = () => {
        recognitionRef.current?.stop()
        setIsListening(false)
        setExtractStatus('idle')
    }

    const toggleListening = () => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }

    const extractJSON = (text: string) => {
        try {
            // Find first { and last }
            const startStr = text.indexOf('{')
            const endStr = text.lastIndexOf('}')
            if (startStr !== -1 && endStr !== -1 && endStr > startStr) {
                const jsonStr = text.substring(startStr, endStr + 1)
                return JSON.parse(jsonStr)
            }
        } catch (error) {
            console.error('Failed to extract JSON from text:', text, error)
        }
        return null
    }

    const extractProfileFromText = async () => {
        if (!voiceText.trim()) return

        setIsExtracting(true)
        setExtractStatus('processing')
        setExtractedFields([])

        const prompt = `
You are a health data extractor.
Extract health information from this text and 
return ONLY a JSON object. No explanation.
No markdown. No backticks. Raw JSON only.

TEXT: "${voiceText}"

Extract whatever is mentioned and return:
{
  "age":           null or number,
  "gender":        null or "male"/"female"/"other",
  "bloodGroup":    null or "A+"/"A-"/"B+"/"B-"/"O+"/"O-"/"AB+"/"AB-",
  "weight":        null or number (in kg),
  "weightUnit":    "kg",
  "height":        null or number (in cm),
  "heightUnit":    "cm",
  "conditions":    [] or ["Diabetes Type 2", "Hypertension" etc],
  "allergies":     [] or ["Gluten", "Dairy" etc],
  "medicalNotes":  null or string,
  "primaryGoal":   null or one of: "lose_weight"/"build_muscle"/"maintain"/"heart_health"/"manage_diabetes"/"boost_energy",
  "activityLevel": null or one of: "sedentary"/"light"/"moderate"/"very_active"/"athlete",
  "sleepHours":    null or number,
  "dietaryType":   null or one of: "vegetarian"/"vegan"/"non_veg"/"pescatarian"/"eggetarian"/"keto"/"gluten_free",
  "cuisines":      [] or ["Indian", "Mediterranean" etc],
  "budget":        null or one of: "economy"/"moderate"/"comfortable"/"premium",
  "mealsPerDay":   null or number
}

EXTRACTION RULES:
- Only extract what is explicitly mentioned
- Leave as null if not mentioned
- For conditions: map "sugar" → "Diabetes Type 2",
  "BP"/"blood pressure" → "Hypertension",
  "thyroid" → "Thyroid"
- For goals: map "lose weight"/"weight loss" → "lose_weight",
  "muscle"/"gym" → "build_muscle",
  "heart" → "heart_health"
- For activity: map "no exercise"/"desk job" → "sedentary",
  "walk"/"light" → "light",
  "gym 3-4 days" → "moderate",
  "daily gym" → "very_active",
  "athlete"/"sportsman" → "athlete"
- For dietary: map "veg" → "vegetarian",
  "non-veg"/"meat eater" → "non_veg"
- Heights: if mentioned in feet like "5 feet 8",
  convert to cm (1 foot = 30.48 cm)
- Weights: if in lbs, convert to kg
`

        try {
            const response = await fetch(
                '/ollama_api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.1:latest', // Ensure we hit the local tag reliably
                    prompt: prompt,
                    stream: false,
                })
            })

            const data = await response.json()
            const rawText = data.response || ''

            // Extract JSON safely
            const parsed = extractJSON(rawText)

            if (parsed) {
                applyExtractedData(parsed)
            } else {
                console.error('Failed to parse AI output into JSON:', rawText)
                setExtractStatus('error')
            }

        } catch (error) {
            console.error('Extraction error:', error)
            setExtractStatus('error')
        } finally {
            setIsExtracting(false)
        }
    }

    const applyExtractedData = (extracted: any) => {
        const filled: string[] = []

        // Build update object — only update non-null fields
        const updates: any = {}

        if (extracted.age !== null && extracted.age) {
            updates.age = String(extracted.age)
            filled.push('Age')
        }
        if (extracted.gender) {
            updates.gender = extracted.gender
            filled.push('Gender')
        }
        if (extracted.bloodGroup) {
            updates.bloodGroup = extracted.bloodGroup
            filled.push('Blood Group')
        }
        if (extracted.weight !== null && extracted.weight) {
            updates.weight = String(extracted.weight)
            updates.weightUnit = extracted.weightUnit || 'kg'
            filled.push('Weight')
        }
        if (extracted.height !== null && extracted.height) {
            updates.height = String(extracted.height)
            updates.heightUnit = extracted.heightUnit || 'cm'
            filled.push('Height')
        }
        if (extracted.conditions?.length > 0) {
            updates.conditions = extracted.conditions
            filled.push('Health Conditions')
        }
        if (extracted.allergies?.length > 0) {
            updates.allergies = extracted.allergies
            filled.push('Allergies')
        }
        if (extracted.medicalNotes) {
            updates.medicalNotes = extracted.medicalNotes
            filled.push('Medical Notes')
        }
        if (extracted.primaryGoal) {
            updates.primaryGoal = extracted.primaryGoal
            filled.push('Primary Goal')
        }
        if (extracted.activityLevel) {
            updates.activityLevel = extracted.activityLevel
            filled.push('Activity Level')
        }
        if (extracted.sleepHours !== null &&
            extracted.sleepHours) {
            updates.sleepHours = String(extracted.sleepHours)
            filled.push('Sleep Hours')
        }
        if (extracted.dietaryType) {
            updates.dietaryType = extracted.dietaryType
            filled.push('Dietary Type')
        }
        if (extracted.cuisines?.length > 0) {
            updates.cuisines = extracted.cuisines
            filled.push('Cuisine Preference')
        }
        if (extracted.budget) {
            updates.budget = extracted.budget
            filled.push('Budget')
        }
        if (extracted.mealsPerDay !== null &&
            extracted.mealsPerDay) {
            updates.mealsPerDay = extracted.mealsPerDay
            filled.push('Meals Per Day')
        }

        if (filled.length > 0) {
            // Merge into existing profile
            setProfile((prev: any) => ({ ...prev, ...updates }))
            setExtractedFields(filled)
            setExtractStatus('success')
        } else {
            setExtractStatus('error')
        }
    }

    const update = (field: string, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }))
        // Clear ABHA highlight when manually edited
        setAbhaFilled(false)
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
            const weightKg = profile.weightUnit === 'lbs'
                ? parseFloat(profile.weight) * 0.453592
                : parseFloat(profile.weight)
            const heightM = profile.heightUnit === 'ft'
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
        const weightKg = profile.weight
            ? (profile.weightUnit === 'lbs'
                ? parseFloat(profile.weight) * 0.453592
                : parseFloat(profile.weight))
            : undefined

        const heightCm = profile.height
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

    const formatAbhaNumber = (value: string) => {
        const digits = value.replace(/\D/g, '')
        if (digits.length <= 2) return digits
        if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`
        if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`
        return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 14)}`
    }

    const handleAbhaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatAbhaNumber(e.target.value)
        setAbhaNumber(formatted)
        setAbhaStatus('idle')
        setAbhaUser(null)
    }

    const fetchAbhaData = async () => {
        if (abhaNumber.replace(/\D/g, '').length < 14) {
            setAbhaStatus('error')
            return
        }
        setAbhaStatus('loading')
        await new Promise(resolve => setTimeout(resolve, 1800))
        const data = (MOCK_ABHA_DATABASE as any)[abhaNumber]

        if (data) {
            setProfile(prev => ({
                ...prev,
                age: String(data.age),
                gender: data.gender,
                bloodGroup: data.bloodGroup,
                weight: String(data.weight),
                weightUnit: data.weightUnit,
                height: String(data.height),
                heightUnit: data.heightUnit,
                conditions: data.conditions,
                allergies: data.allergies,
                medicalNotes: data.medicalNotes,
                primaryGoal: data.primaryGoal,
                activityLevel: data.activityLevel,
                sleepHours: String(data.sleepHours),
                dietaryType: data.dietaryType,
                cuisines: data.cuisines,
                budget: data.budget,
                mealsPerDay: data.mealsPerDay,
            }))
            setAbhaUser(data.name)
            setAbhaStatus('success')
            setAbhaFilled(true)
            setTimeout(() => setShowAbhaPanel(false), 2000)
        } else {
            setAbhaStatus('error')
        }
    }

    const handleSaveAndGenerate = async () => {
        await saveProfileToDB()

        localStorage.setItem('nutriai_profile', JSON.stringify({
            ...profile,
            abhaNumber: abhaNumber || null,
            abhaVerified: abhaStatus === 'success'
        }))

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
                    {showAbhaPanel && (
                        <div className={`rounded-2xl border-2 p-5 mb-6 transition-all duration-300 ${abhaStatus === 'success' ? 'border-[#22c55e] bg-[#f0fdf4]' : abhaStatus === 'error' ? 'border-[#fca5a5] bg-[#fef2f2]' : 'border-dashed border-[#22c55e]/40 bg-[#f0fdf4]/50'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center shadow-sm shadow-[#22c55e]/30">
                                        <span className="text-white font-black text-[11px] leading-tight text-center">AB<br />HA</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-[#0f172a] text-[14px]">ABHA Card Auto-Fill</h3>
                                            <span className="text-[10px] bg-[#dcfce7] text-[#16a34a] px-2 py-0.5 rounded-full font-semibold border border-[#bbf7d0]">Optional</span>
                                        </div>
                                        <p className="text-[12px] text-[#64748b] mt-0.5">Enter your Ayushman Bharat Health Account number to auto-fill your profile</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAbhaPanel(false)} className="text-[#94a3b8] hover:text-[#64748b] text-lg font-light transition-colors">×</button>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input type="text" value={abhaNumber} onChange={handleAbhaInput} maxLength={17} placeholder="XX-XXXX-XXXX-XXXX" className={`w-full h-11 border rounded-xl pl-11 pr-4 text-[14px] font-mono tracking-wider transition-all focus:outline-none ${abhaStatus === 'success' ? 'border-[#22c55e] bg-[#f0fdf4] text-[#16a34a]' : abhaStatus === 'error' ? 'border-[#fca5a5] bg-[#fef2f2] text-[#ef4444]' : 'border-[#d1d5db] bg-white text-[#0f172a] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20'}`} />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        {abhaStatus === 'success' ? <span className="text-[#22c55e] text-base">✅</span> : abhaStatus === 'error' ? <span className="text-[#ef4444] text-base">❌</span> : <span className="text-[#94a3b8] text-base">🪪</span>}
                                    </div>
                                    {abhaStatus === 'loading' && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button onClick={fetchAbhaData} disabled={abhaStatus === 'loading' || abhaNumber.replace(/\D/g, '').length < 14} className={`px-5 h-11 rounded-xl font-semibold text-[13px] transition-all whitespace-nowrap ${abhaNumber.replace(/\D/g, '').length === 14 && abhaStatus !== 'loading' ? 'bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-sm shadow-[#22c55e]/25' : 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed'}`}>
                                    {abhaStatus === 'loading' ? 'Fetching...' : 'Fetch Data →'}
                                </button>
                            </div>
                            {abhaStatus === 'loading' && (
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                                    </div>
                                    <span className="text-[12px] text-[#22c55e] font-medium">Connecting to ABHA servers...</span>
                                </div>
                            )}
                            {abhaStatus === 'success' && abhaUser && (
                                <div className="mt-3 flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#bbf7d0]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white font-bold text-[12px]">{abhaUser.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#0f172a]">{abhaUser}</p>
                                            <p className="text-[11px] text-[#22c55e]">✅ Profile auto-filled successfully!</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#94a3b8]">All sections filled</p>
                                        <p className="text-[12px] font-bold text-[#22c55e]">Ready to generate! 🎉</p>
                                    </div>
                                </div>
                            )}
                            {abhaStatus === 'error' && (
                                <div className="mt-3 flex items-center gap-2 bg-[#fef2f2] rounded-xl px-4 py-2.5 border border-[#fecaca]">
                                    <span className="text-sm">⚠️</span>
                                    <div>
                                        <p className="text-[12px] font-semibold text-[#ef4444]">ABHA number not found</p>
                                        <p className="text-[11px] text-[#94a3b8]">Try: 12-3456-7890-1234 · 98-7654-3210-9876 · 11-2233-4455-6677</p>
                                    </div>
                                </div>
                            )}
                            {abhaStatus === 'idle' && !abhaNumber && (
                                <p className="text-[11px] text-[#94a3b8] mt-3">
                                    💡 Demo: Try <span className="font-mono text-[#22c55e] cursor-pointer hover:underline" onClick={() => { setAbhaNumber('12-3456-7890-1234'); setAbhaStatus('idle'); }}>12-3456-7890-1234</span> to auto-fill
                                </p>
                            )}
                        </div>
                    )}
                    {!showAbhaPanel && abhaStatus !== 'success' && (
                        <button onClick={() => setShowAbhaPanel(true)} className="w-full mb-4 py-2.5 rounded-xl border border-dashed border-[#22c55e]/40 text-[13px] text-[#22c55e] font-medium hover:bg-[#f0fdf4] transition-colors flex items-center justify-center gap-2">
                            🪪 Have an ABHA card? Click to auto-fill
                        </button>
                    )}

                    {/* ── Voice + Text Profile Fill ── */}
                    {showVoicePanel && (
                        <div className="rounded-2xl border-2 border-[#22c55e]/30
  bg-gradient-to-br from-[#f0fdf4] to-[#f8fafc]
  p-5 mb-6">

                            {/* ── HEADER ── */}
                            <div className="flex items-center 
    justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl 
        flex items-center justify-center
        shadow-sm transition-all duration-300
        ${isListening
                                            ? 'bg-[#ef4444] shadow-[#ef4444]/30 animate-pulse'
                                            : 'bg-[#22c55e] shadow-[#22c55e]/30'
                                        }`}>
                                        <span className="text-white text-xl">
                                            {isListening ? '🎙️' : '🤖'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-[#0f172a] 
            text-[14px]">
                                                AI Profile Assistant
                                            </h3>
                                            <span className="text-[10px] bg-[#dcfce7] 
            text-[#16a34a] px-2 py-0.5 rounded-full 
            font-semibold border border-[#bbf7d0]">
                                                Voice + Text
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-[#64748b] mt-0.5">
                                            Speak or type your health details —
                                            AI fills your profile automatically
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowVoicePanel(false)}
                                    className="text-[#94a3b8] hover:text-[#64748b] 
        text-lg transition-colors">
                                    ×
                                </button>
                            </div>

                            {/* ── EXAMPLE CHIPS (clickable) ── */}
                            <div className="mb-3">
                                <p className="text-[11px] text-[#94a3b8] 
      uppercase font-semibold tracking-wide mb-2">
                                    💡 Try saying...
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "I'm 25, diabetic, prefer vegetarian",
                                        "Male, 70kg, want to build muscle",
                                        "Female, thyroid, gluten allergy",
                                        "28 years, gym daily, non-veg",
                                    ].map((example, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setVoiceText(example)
                                                setExtractStatus('idle')
                                            }}
                                            className="text-[11px] bg-white text-[#374151]
            border border-[#e2e8f0] rounded-full 
            px-3 py-1.5 hover:border-[#22c55e] 
            hover:text-[#16a34a] hover:bg-[#f0fdf4]
            transition-all font-medium">
                                            "{example}"
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── MAIN INPUT BOX ── */}
                            <div className={`relative bg-white rounded-2xl 
    border-2 transition-all duration-300 overflow-hidden
    ${isListening
                                    ? 'border-[#ef4444] shadow-lg shadow-[#ef4444]/10'
                                    : extractStatus === 'success'
                                        ? 'border-[#22c55e] shadow-lg shadow-[#22c55e]/10'
                                        : extractStatus === 'error'
                                            ? 'border-[#fca5a5]'
                                            : 'border-[#e2e8f0] focus-within:border-[#22c55e]'
                                }`}>

                                {/* Listening wave animation bar */}
                                {isListening && (
                                    <div className="h-1 bg-gradient-to-r 
        from-[#22c55e] via-[#ef4444] to-[#22c55e]
        animate-pulse" />
                                )}

                                {/* Textarea */}
                                <textarea
                                    ref={textareaRef}
                                    value={voiceText + interimText}
                                    onChange={e => {
                                        setVoiceText(e.target.value)
                                        if (recognitionRef.current) {
                                            recognitionRef.current.originalText = e.target.value
                                        }
                                        setExtractStatus('idle')
                                        setExtractedFields([])
                                    }}
                                    placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
                                    rows={3}
                                    className="w-full px-4 pt-4 pb-16 text-[14px] 
        text-[#0f172a] placeholder:text-[#cbd5e1]
        resize-none focus:outline-none bg-transparent
        leading-relaxed"
                                />

                                {/* Bottom bar inside textarea */}
                                <div className="absolute bottom-0 left-0 right-0
      px-3 py-2.5 flex items-center justify-between
      bg-white border-t border-[#f1f5f9]">

                                    {/* Left — voice button + char count */}
                                    <div className="flex items-center gap-3">

                                        {/* Voice toggle button */}
                                        <button
                                            onClick={toggleListening}
                                            className={`flex items-center gap-2 
            px-3 py-1.5 rounded-xl text-[12px] 
            font-semibold transition-all border
            ${isListening
                                                    ? 'bg-[#fef2f2] text-[#ef4444] border-[#fca5a5] animate-pulse'
                                                    : 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0] hover:bg-[#dcfce7]'
                                                }`}>
                                            <span className="text-base">
                                                {isListening ? '⏹️' : '🎙️'}
                                            </span>
                                            {isListening ? 'Stop' : 'Speak'}
                                            {/* Mic waveform dots when listening */}
                                            {isListening && (
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 2, 1].map((h, i) => (
                                                        <div key={i}
                                                            className="w-0.5 bg-[#ef4444] 
                    rounded-full animate-bounce"
                                                            style={{
                                                                height: `${h * 4}px`,
                                                                animationDelay: `${i * 0.1}s`,
                                                                animationDuration: '0.6s'
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </button>

                                        {/* Character count */}
                                        {voiceText && (
                                            <span className="text-[11px] text-[#94a3b8]">
                                                {voiceText.length} chars
                                            </span>
                                        )}

                                        {/* Clear button */}
                                        {voiceText && (
                                            <button
                                                onClick={() => {
                                                    setVoiceText('')
                                                    setExtractStatus('idle')
                                                    setExtractedFields([])
                                                }}
                                                className="text-[11px] text-[#94a3b8] 
              hover:text-[#ef4444] transition-colors">
                                                Clear ×
                                            </button>
                                        )}
                                    </div>

                                    {/* Right — Extract button */}
                                    <button
                                        onClick={extractProfileFromText}
                                        disabled={!voiceText.trim() || isExtracting}
                                        className={`flex items-center gap-2 
          px-4 py-1.5 rounded-xl text-[12px] 
          font-bold transition-all
          ${voiceText.trim() && !isExtracting
                                                ? 'bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-sm'
                                                : 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed'
                                            }`}>
                                        {isExtracting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 
              border-white border-t-transparent 
              rounded-full animate-spin" />
                                                Extracting...
                                            </>
                                        ) : (
                                            <>✨ Fill Profile</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* PROCESSING */}
                            {extractStatus === 'processing' && (
                                <div className="mt-3 flex items-center gap-3
      bg-white rounded-xl px-4 py-3 
      border border-[#e2e8f0]">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(i => (
                                            <div key={i}
                                                className="w-2 h-2 rounded-full 
              bg-[#22c55e] animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold 
          text-[#0f172a]">
                                            AI is reading your details...
                                        </p>
                                        <p className="text-[11px] text-[#64748b]">
                                            Extracting health information from your text
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* SUCCESS */}
                            {extractStatus === 'success' &&
                                extractedFields.length > 0 && (
                                    <div className="mt-3 bg-white rounded-xl 
      border border-[#bbf7d0] overflow-hidden">

                                        {/* Success header */}
                                        <div className="px-4 py-3 bg-[#f0fdf4] 
        flex items-center justify-between
        border-b border-[#bbf7d0]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">✅</span>
                                                <p className="text-[13px] font-bold 
            text-[#16a34a]">
                                                    {extractedFields.length} fields auto-filled!
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-[#64748b]">
                                                Review below ↓
                                            </p>
                                        </div>

                                        {/* Filled fields list */}
                                        <div className="px-4 py-3 flex flex-wrap gap-2">
                                            {extractedFields.map((field, idx) => (
                                                <span key={idx}
                                                    className="flex items-center gap-1.5
              bg-[#dcfce7] text-[#16a34a] 
              text-[11px] font-semibold
              px-3 py-1 rounded-full
              border border-[#bbf7d0]">
                                                    ✓ {field}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Tip */}
                                        <div className="px-4 pb-3">
                                            <p className="text-[11px] text-[#94a3b8]">
                                                💡 You can edit any field manually below,
                                                or speak again to add more details
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* ERROR */}
                            {extractStatus === 'error' && (
                                <div className="mt-3 bg-[#fef2f2] rounded-xl 
      px-4 py-3 border border-[#fecaca]
      flex items-start gap-3">
                                    <span className="text-base mt-0.5">⚠️</span>
                                    <div>
                                        <p className="text-[13px] font-semibold 
          text-[#ef4444]">
                                            Couldn't extract health details
                                        </p>
                                        <p className="text-[11px] text-[#94a3b8] mt-0.5">
                                            Try being more specific. Example:
                                            "I am 25 years old, male, weigh 70 kg,
                                            diabetic, prefer vegetarian food"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Listening hint */}
                            {isListening && (
                                <div className="mt-3 flex items-center gap-2
      text-[12px] text-[#ef4444] font-medium
      animate-pulse">
                                    <div className="w-2 h-2 rounded-full 
        bg-[#ef4444]" />
                                    Listening... speak clearly and naturally
                                    <div className="w-2 h-2 rounded-full 
        bg-[#ef4444]" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Collapsed re-open button */}
                    {!showVoicePanel && (
                        <button
                            onClick={() => setShowVoicePanel(true)}
                            className="w-full mb-4 py-2.5 rounded-xl
      border border-dashed border-[#22c55e]/40
      text-[13px] text-[#22c55e] font-medium
      hover:bg-[#f0fdf4] transition-colors
      flex items-center justify-center gap-2">
                            🤖 Use AI Assistant to fill profile
                        </button>
                    )}

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
                                            <Input isHighlighted={abhaFilled} type="number" placeholder="e.g. 28" value={profile.age} onChange={(e: any) => update('age', e.target.value)} rightElement="years" />
                                        </div>
                                        <div>
                                            <Label>Gender</Label>
                                            <Select isHighlighted={abhaFilled} value={profile.gender} onChange={(e: any) => update('gender', e.target.value)}
                                                options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Weight</Label>
                                            <div className="relative">
                                                <Input isHighlighted={abhaFilled} type="number" placeholder="68" value={profile.weight} onChange={(e: any) => update('weight', e.target.value)} />
                                                <UnitToggle options={['kg', 'lbs']} value={profile.weightUnit} onChange={(v: any) => update('weightUnit', v)} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Height</Label>
                                            <div className="relative">
                                                <Input isHighlighted={abhaFilled} type="number" placeholder="172" value={profile.height} onChange={(e: any) => update('height', e.target.value)} />
                                                <UnitToggle options={['cm', 'ft']} value={profile.heightUnit} onChange={(v: any) => update('heightUnit', v)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Blood Group</Label>
                                            <Select isHighlighted={abhaFilled} value={profile.bloodGroup} onChange={(e: any) => update('bloodGroup', e.target.value)} options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(v => ({ value: v, label: v }))} />
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
                                        <Select isHighlighted={abhaFilled} value={profile.primaryGoal} onChange={(e: any) => update('primaryGoal', e.target.value)}
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
                                            <Select isHighlighted={abhaFilled} value={profile.activityLevel} onChange={(e: any) => update('activityLevel', e.target.value)}
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
                                            <Input isHighlighted={abhaFilled} type="number" placeholder="7" value={profile.sleepHours} onChange={(e: any) => update('sleepHours', e.target.value)} rightElement="hrs/night" />
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
                                        <TagInput isHighlighted={abhaFilled} tags={profile.conditions} onAdd={(t: string) => update('conditions', [...profile.conditions, t])} onRemove={(t: string) => update('conditions', profile.conditions.filter((c: string) => c !== t))} placeholder="e.g. PCOS, Hypertension..." />
                                    </div>
                                    <div>
                                        <Label>Food Allergies / Intolerances</Label>
                                        <TagInput isHighlighted={abhaFilled} tags={profile.allergies} onAdd={(t: string) => update('allergies', [...profile.allergies, t])} onRemove={(t: string) => update('allergies', profile.allergies.filter((a: string) => a !== t))} placeholder="e.g. Peanuts, Dairy..." />
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
                                            <Select isHighlighted={abhaFilled} value={profile.dietaryType} onChange={(e: any) => update('dietaryType', e.target.value)}
                                                options={[
                                                    { value: 'vegetarian', label: '🌿 Vegetarian' },
                                                    { value: 'vegan', label: '🥦 Vegan' },
                                                    { value: 'non_veg', label: '🥩 Non-Vegetarian' },
                                                    { value: 'keto', label: '🥗 Keto' }
                                                ]} />
                                        </div>
                                        <div>
                                            <Label>Daily Meal Budget</Label>
                                            <Select isHighlighted={abhaFilled} value={profile.budget} onChange={(e: any) => update('budget', e.target.value)}
                                                options={[
                                                    { value: 'economy', label: '💚 Under ₹200/day' },
                                                    { value: 'moderate', label: '💛 ₹200–₹500/day' },
                                                    { value: 'premium', label: '💜 ₹1000+/day' }
                                                ]} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Preferred Cuisines</Label>
                                        <TagInput isHighlighted={abhaFilled} tags={profile.cuisines} onAdd={(t: string) => update('cuisines', [...profile.cuisines, t])} onRemove={(t: string) => update('cuisines', profile.cuisines.filter((c: string) => c !== t))} placeholder="e.g. Mediterranean, Indian, Mexican..." />
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
