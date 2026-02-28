import React, { useState, useEffect, useRef } from 'react'
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
    dayNumber: number
    date: string
    totalCalories: string
    meals: Meal[]
    raw: string
}

type WeekPlan = {
    days: DayPlan[]
    weeklySummary: string
    raw: string
}

type ChatMessage = {
    role: 'user' | 'ai'
    text: string
    time: string
}

export interface ShoppingItem {
    name: string;
    quantity: string;
}

export interface ShoppingCategory {
    name: string;
    emoji: string;
    color?: string;
    items: ShoppingItem[];
}

export interface ShoppingList {
    totalItems: number;
    estimatedCost: string;
    note?: string;
    categories: ShoppingCategory[];
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

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getDayDate(dayOffset: number): string {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
    const target = new Date(monday)
    target.setDate(monday.getDate() + dayOffset)
    return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTodayDayIndex(): number {
    const day = new Date().getDay()
    return day === 0 ? 6 : day - 1
}

/**
 * Parse a 7-day LLM markdown response into structured WeekPlan.
 * Splits by "# Day X" headings, then parses meals within each day.
 */
function parseWeekPlan(raw: string): WeekPlan {
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Snack 1', 'Snack 2', 'Morning Snack', 'Evening Snack', 'Afternoon Snack']

    // Extract weekly summary
    let weeklySummary = ''
    const summaryMatch = raw.match(/^#\s+Weekly\s+Summary[\s\S]*/im)
    if (summaryMatch) {
        weeklySummary = summaryMatch[0].trim()
    }

    // Split by day headings: # Day 1: Monday, etc.
    const dayRegex = /^#\s+Day\s+(\d+)\s*[:\-–]?\s*(.*)/im
    const daySections = raw.split(/(?=^#\s+Day\s+\d)/im).filter(s => s.trim())

    const days: DayPlan[] = []

    for (const section of daySections) {
        const headerMatch = section.match(dayRegex)
        if (!headerMatch) continue

        const dayNum = parseInt(headerMatch[1], 10)
        let dayLabel = headerMatch[2]?.trim().replace(/[*#]/g, '').trim() || ''
        if (!dayLabel || dayLabel.length < 2) {
            dayLabel = WEEKDAYS[(dayNum - 1) % 7] || `Day ${dayNum}`
        }

        const meals: Meal[] = []
        const mealSections = section.split(/(?=^##\s)/m)

        for (const mealSection of mealSections) {
            if (!mealSection.trim()) continue
            const firstLine = mealSection.trim().split('\n')[0]

            for (const mealType of mealTypes) {
                const regex = new RegExp(`^(?:##\\s*)?(?:\\*\\*)?${mealType}(?:\\s*:)?(?:\\*\\*)?\\s*[:\\-–]?\\s*(.*)`, 'i')
                const match = firstLine.match(regex)
                if (match) {
                    let name = match[1]?.trim() || 'Meal'
                    name = name.replace(/[*#|]/g, '').trim()
                    if (name.length > 60) name = name.substring(0, 57) + '...'
                    if (!name) name = mealType

                    const calMatch = mealSection.match(/(\d{2,4})\s*(?:kcal|calories|cal)/i)
                    const calories = calMatch ? `${calMatch[1]} kcal` : ''

                    meals.push({
                        type: mealType.replace(/\d+/, '').trim(),
                        name,
                        calories,
                        details: mealSection.trim(),
                    })
                    break
                }
            }
        }

        const totalCalMatch = section.match(/(?:total|daily|sum)[^:]*:\s*~?(\d{3,5})\s*(?:kcal|calories|cal)/i)
        const totalCalories = totalCalMatch ? `${totalCalMatch[1]} kcal` : ''

        if (meals.length > 0) {
            days.push({
                dayName: dayLabel,
                dayNumber: dayNum,
                date: getDayDate(dayNum - 1),
                totalCalories,
                meals,
                raw: section.trim(),
            })
        }
    }

    // FALLBACK: If we couldn't parse any days, treat entire raw as Day 1
    if (days.length === 0 && raw.trim()) {
        const fallbackMeals: Meal[] = []
        const sections = raw.split(/(?=^##\s)/m)
        for (const section of sections) {
            if (!section.trim()) continue
            const firstLine = section.trim().split('\n')[0]
            for (const mealType of mealTypes) {
                const regex = new RegExp(`^(?:##\\s*)?(?:\\*\\*)?${mealType}(?:\\s*:)?(?:\\*\\*)?\\s*[:\\-–]?\\s*(.*)`, 'i')
                const match = firstLine.match(regex)
                if (match) {
                    let name = match[1]?.trim() || 'Meal'
                    name = name.replace(/[*#|]/g, '').trim()
                    if (name.length > 60) name = name.substring(0, 57) + '...'
                    if (!name) name = mealType
                    const calMatch = section.match(/(\d{2,4})\s*(?:kcal|calories|cal)/i)
                    const calories = calMatch ? `${calMatch[1]} kcal` : ''
                    fallbackMeals.push({ type: mealType.replace(/\d+/, '').trim(), name, calories, details: section.trim() })
                    break
                }
            }
        }
        const now = new Date()
        days.push({
            dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
            dayNumber: 1,
            date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            totalCalories: '',
            meals: fallbackMeals.length > 0 ? fallbackMeals : [{ type: 'Meal Plan', name: 'Generated Plan', calories: '', details: raw.trim() }],
            raw: raw.trim(),
        })
    }

    return { days, weeklySummary, raw }
}

const mealIcons: Record<string, { bg: string; color: string; icon: string }> = {
    'Breakfast': { bg: 'bg-yellow-50', color: 'text-yellow-600', icon: 'wb_twilight' },
    'Morning Snack': { bg: 'bg-lime-50', color: 'text-lime-600', icon: 'local_cafe' },
    'Lunch': { bg: 'bg-orange-50', color: 'text-orange-600', icon: 'light_mode' },
    'Afternoon Snack': { bg: 'bg-yellow-50', color: 'text-yellow-600', icon: 'bakery_dining' },
    'Dinner': { bg: 'bg-indigo-50', color: 'text-indigo-600', icon: 'dark_mode' },
    'Evening Snack': { bg: 'bg-amber-50', color: 'text-amber-600', icon: 'nightlife' },
    'Snack': { bg: 'bg-green-50', color: 'text-green-600', icon: 'local_pizza' },
    'Main Meal': { bg: 'bg-orange-50', color: 'text-orange-600', icon: 'restaurant_menu' },
    'Meal Plan': { bg: 'bg-emerald-50', color: 'text-emerald-600', icon: 'restaurant' },
}

// ─── Markdown → Styled JSX renderer for meal details ─────────────────────────
function renderMealDetails(details: string, mealType: string) {
    if (!details || typeof details !== 'string') {
        return <p className="text-sm text-slate-500 italic">No details available for this meal.</p>
    }
    // CRITICAL: Normalize Windows \r\n to \n
    const normalized = details.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    // Remove the heading line (## Breakfast: Dish Name)
    const lines = normalized.split('\n')
    const cleaned = lines.filter(l => !l.trim().match(/^##\s/)).join('\n')

    // More flexible section regex that handles various markdown styles
    // Matches: ### Ingredients:, **Ingredients:**, Ingredients:, ### Ingredients
    const sectionRegex = (names: string[]) => {
        const namePattern = names.join('|')
        return new RegExp(
            `(?:^|\\n)(?:#{1,4}\\s*|\\*\\*)?(?:${namePattern})(?:\\*\\*)?\\s*:?\\s*\\n([\\s\\S]*?)(?=(?:\\n(?:#{1,4}\\s|\\*\\*|(?:(?:Ingredients?|Cooking\\s*Steps?|Instructions?|Directions?|Method|Preparation|Nutrition(?:al)?|Macros?)\\s*:?\\s*\\n)))|$)`,
            'i'
        )
    }

    const ingredientMatch = cleaned.match(sectionRegex(['Ingredients?']))
    const cookingMatch = cleaned.match(sectionRegex([
        'Cooking\\s*Steps?', 'Instructions?', 'Directions?', 'Method',
        'Preparation', 'Steps?', 'How\\s*to\\s*(?:Make|Cook|Prepare)'
    ]))
    const nutritionMatch = cleaned.match(sectionRegex([
        'Nutrition(?:al)?(?:\\s*(?:Info(?:rmation)?|Value|Facts|Breakdown))?',
        'Macros?(?:\\s*Summary)?', 'Calorie(?:s)?\\s*(?:&|and)?\\s*Macros?'
    ]))

    const parseList = (text: string) =>
        text.split('\n')
            .map(l => l.replace(/^[\s]*[-*•\d.]+[\s.)]*/, '').replace(/\*+/g, '').trim())
            .filter(l => l.length > 0 && !l.match(/^#{1,4}\s/))

    const ingredients = ingredientMatch ? parseList(ingredientMatch[1]) : []
    const steps = cookingMatch ? parseList(cookingMatch[1]) : []

    // Parse nutrition key-value pairs
    const nutritionItems: { label: string; value: string }[] = []
    if (nutritionMatch) {
        const nutLines = parseList(nutritionMatch[1])
        for (const line of nutLines) {
            // Try "Calories: 340" or "Calories - 340" format
            const colonSplit = line.match(/^([A-Za-z\s]+?)\s*[:–-]\s*(.+)$/)
            if (colonSplit) {
                nutritionItems.push({ label: colonSplit[1].trim(), value: colonSplit[2].trim() })
            } else {
                // Try "Calories 340" or "340 kcal" formats
                const numMatch = line.match(/^([A-Za-z\s]+?)\s+(\d+\S*)$/)
                if (numMatch) {
                    nutritionItems.push({ label: numMatch[1].trim(), value: numMatch[2].trim() })
                }
            }
        }
    }

    const nutritionColors: Record<string, { bg: string; text: string; icon: string }> = {
        'calories': { bg: 'bg-red-50', text: 'text-red-600', icon: '🔥' },
        'protein': { bg: 'bg-blue-50', text: 'text-blue-600', icon: '💪' },
        'carbs': { bg: 'bg-amber-50', text: 'text-amber-600', icon: '🌾' },
        'carbohydrates': { bg: 'bg-amber-50', text: 'text-amber-600', icon: '🌾' },
        'fat': { bg: 'bg-purple-50', text: 'text-purple-600', icon: '🥑' },
        'fats': { bg: 'bg-purple-50', text: 'text-purple-600', icon: '🥑' },
        'fiber': { bg: 'bg-green-50', text: 'text-green-600', icon: '🥬' },
    }

    const getNutritionStyle = (label: string) => {
        const key = label.toLowerCase()
        for (const [k, v] of Object.entries(nutritionColors)) {
            if (key.includes(k)) return v
        }
        return { bg: 'bg-slate-50', text: 'text-slate-600', icon: '📊' }
    }

    // If we couldn't parse any sections, show as neatly formatted text (not raw markdown)
    if (ingredients.length === 0 && steps.length === 0 && nutritionItems.length === 0) {
        return (
            <div className="space-y-1.5">
                {cleaned.split('\n').filter(l => l.trim()).map((line, i) => {
                    const trimmed = line.replace(/^[\s]*[-*•]+\s*/, '').replace(/\*+/g, '').replace(/^#+\s*/, '').trim()
                    if (!trimmed) return null
                    // Sub-heading
                    if (line.trim().match(/^#{1,4}\s/) || line.trim().match(/^\*\*[^*]+\*\*:?\s*$/)) {
                        return (
                            <div key={i} className="flex items-center gap-2 mt-4 mb-2">
                                <div className="w-1 h-4 bg-emerald-400 rounded-full"></div>
                                <h4 className="font-bold text-slate-800 text-sm">{trimmed.replace(/\*+/g, '').replace(/:$/, '')}</h4>
                            </div>
                        )
                    }
                    // Bullet-like lines
                    if (line.trim().match(/^[-*•\d.]/)) {
                        return (
                            <div key={i} className="flex items-start gap-2 ml-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0 mt-1.5"></span>
                                <p className="text-[13px] text-slate-600 leading-relaxed">{trimmed}</p>
                            </div>
                        )
                    }
                    return <p key={i} className="text-[13px] text-slate-600 leading-relaxed">{trimmed}</p>
                })}
            </div>
        )
    }

    const iconInfo = mealIcons[mealType] || mealIcons['Meal Plan']

    return (
        <div className="space-y-5">
            {/* Ingredients */}
            {ingredients.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: '18px' }}>grocery</span>
                        <h4 className="font-bold text-slate-800 text-sm">Ingredients</h4>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{ingredients.length} items</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {ingredients.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                                <span className="text-[13px] text-slate-700">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cooking Steps */}
            {steps.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`material-symbols-outlined ${iconInfo.color}`} style={{ fontSize: '18px' }}>skillet</span>
                        <h4 className="font-bold text-slate-800 text-sm">Cooking Steps</h4>
                    </div>
                    <div className="space-y-2">
                        {steps.map((step, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {i + 1}
                                </div>
                                <p className="text-[13px] text-slate-700 leading-relaxed pt-0.5">
                                    {step.replace(/^\d+\.\s*/, '')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Nutrition */}
            {nutritionItems.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-orange-500" style={{ fontSize: '18px' }}>monitoring</span>
                        <h4 className="font-bold text-slate-800 text-sm">Nutrition</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {nutritionItems.map((item, i) => {
                            const style = getNutritionStyle(item.label)
                            return (
                                <div key={i} className={`${style.bg} border border-slate-100 rounded-xl px-3 py-2 flex items-center gap-2`}>
                                    <span className="text-sm">{style.icon}</span>
                                    <div>
                                        <div className={`text-[11px] font-medium ${style.text} uppercase tracking-wider`}>{item.label}</div>
                                        <div className="text-sm font-bold text-slate-800">{item.value}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Full Plan Details renderer ──────────────────────────────────────────────
function renderFullPlanDetails(raw: string) {
    if (!raw || typeof raw !== 'string') {
        return <p className="text-sm text-slate-500 italic">No plan details available.</p>
    }
    // Normalize line endings
    const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = normalized.split('\n')

    type Block = { type: 'heading' | 'subheading' | 'bullet' | 'numbered' | 'text' | 'table-row' | 'divider'; content: string }
    const blocks: Block[] = []

    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        if (trimmed.match(/^#{1,2}\s/)) {
            blocks.push({ type: 'heading', content: trimmed.replace(/^#+\s*/, '').replace(/\*+/g, '') })
        } else if (trimmed.match(/^#{3,4}\s/) || trimmed.match(/^\*\*[^*]+\*\*:?\s*$/)) {
            blocks.push({ type: 'subheading', content: trimmed.replace(/^#+\s*/, '').replace(/\*+/g, '').replace(/:$/, '') })
        } else if (trimmed.match(/^[-*•]\s/)) {
            blocks.push({ type: 'bullet', content: trimmed.replace(/^[-*•]\s*/, '').replace(/\*+/g, '') })
        } else if (trimmed.match(/^\d+[.)]\s/)) {
            blocks.push({ type: 'numbered', content: trimmed })
        } else if (trimmed.match(/^\|.*\|$/)) {
            blocks.push({ type: 'table-row', content: trimmed })
        } else if (trimmed.match(/^[-=]{3,}$/)) {
            blocks.push({ type: 'divider', content: '' })
        } else {
            blocks.push({ type: 'text', content: trimmed.replace(/\*+/g, '') })
        }
    }

    // Parse table rows into a structured table
    const renderTable = (rows: string[]) => {
        const parsed = rows.map(r =>
            r.split('|').filter(c => c.trim()).map(c => c.trim())
        )
        if (parsed.length < 2) return null
        const headers = parsed[0]
        // Skip separator row (---) if present
        const dataStart = parsed[1]?.every(c => c.match(/^[-:]+$/)) ? 2 : 1
        const data = parsed.slice(dataStart)

        return (
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm mt-4 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-emerald-600 text-white">
                            {headers.map((h, i) => (
                                <th key={i} className="px-5 py-3 text-left font-bold text-xs uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, ri) => (
                            <tr key={ri} className="hover:bg-slate-50 transition-colors">
                                {row.map((cell, ci) => (
                                    <td key={ci} className="px-5 py-3.5 text-slate-700 font-medium">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // Group consecutive table rows
    const elements: React.JSX.Element[] = []
    let tableBuffer: string[] = []
    let key = 0

    const flushTable = () => {
        if (tableBuffer.length > 0) {
            const tableEl = renderTable(tableBuffer)
            if (tableEl) {
                elements.push(<div key={key++} className="my-3">{tableEl}</div>)
            }
            tableBuffer = []
        }
    }

    for (const block of blocks) {
        if (block.type === 'table-row') {
            tableBuffer.push(block.content)
            continue
        }
        flushTable()

        switch (block.type) {
            case 'heading': {
                let headIcon = 'restaurant'
                if (/breakfast/i.test(block.content)) headIcon = 'wb_twilight'
                else if (/lunch/i.test(block.content)) headIcon = 'light_mode'
                else if (/dinner/i.test(block.content)) headIcon = 'dark_mode'
                else if (/snack/i.test(block.content)) headIcon = 'cookie'
                else if (/summary|macro/i.test(block.content)) headIcon = 'monitoring'

                elements.push(
                    <div key={key++} className="flex items-center gap-3 mt-8 mb-4 border-b border-slate-100 pb-3">
                        <div className="w-10 h-10 rounded-full bg-[#f0fdf4] flex items-center justify-center text-[#16a34a] shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">{headIcon}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-[17px] tracking-tight">{block.content}</h3>
                    </div>
                )
                break
            }
            case 'subheading': {
                let subIcon = 'check_circle'
                if (/ingredient/i.test(block.content)) subIcon = 'grocery'
                else if (/cook|step|instruction/i.test(block.content)) subIcon = 'skillet'
                else if (/nutrition|macro/i.test(block.content)) subIcon = 'monitoring'

                elements.push(
                    <div key={key++} className="flex items-center gap-2 mt-5 mb-3 px-1">
                        <span className="material-symbols-outlined text-emerald-500 text-[18px]">{subIcon}</span>
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{block.content}</h4>
                    </div>
                )
                break
            }
            case 'bullet':
                elements.push(
                    <div key={key++} className="flex items-center gap-3 my-1.5 p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-emerald-500 text-[16px] shrink-0">check_circle</span>
                        <span className="text-[14px] text-slate-700 font-medium">{block.content}</span>
                    </div>
                )
                break
            case 'numbered':
                elements.push(
                    <div key={key++} className="flex items-start gap-4 my-2 p-3.5 bg-white border border-slate-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)] rounded-xl relative overflow-hidden group hover:border-emerald-200 transition-colors">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            {block.content.match(/^\d+/)?.[0]}
                        </div>
                        <span className="text-[14px] text-slate-600 leading-relaxed font-medium">{block.content.replace(/^\d+[.)]\s*/, '')}</span>
                    </div>
                )
                break
            case 'divider':
                elements.push(<hr key={key++} className="my-6 border-slate-200 border-dashed" />)
                break
            default:
                elements.push(
                    <p key={key++} className="text-[14px] text-slate-600 leading-relaxed my-1.5">{block.content}</p>
                )
        }
    }
    flushTable()

    return <div className="space-y-0.5">{elements}</div>
}

// ─── Component ───────────────────────────────────────────────────────────────
export function MealPlan() {
    const navigate = useNavigate()
    const chatEndRef = useRef<HTMLDivElement>(null)

    // State
    const [plan, setPlan] = useState<WeekPlan | null>(() => {
        try {
            const saved = localStorage.getItem('nutriai_meal_plan')
            if (!saved) return null
            const parsed = JSON.parse(saved)
            // New WeekPlan format — has .days array
            if (parsed.days && Array.isArray(parsed.days)) return parsed
            // Old DayPlan format — has .meals array, wrap into a single-day WeekPlan
            if (parsed.meals && Array.isArray(parsed.meals)) {
                return {
                    days: [{ ...parsed, dayNumber: 1 }],
                    weeklySummary: '',
                    raw: parsed.raw || '',
                } as WeekPlan
            }
            // Unknown shape — discard
            return null
        } catch { return null }
    })
    const [selectedDay, setSelectedDay] = useState<number>(() => getTodayDayIndex())
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(() => {
        try {
            const saved = localStorage.getItem('nutriai_shopping_list')
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })
    const [isGeneratingList, setIsGeneratingList] = useState(false)
    const [shoppingListError, setShoppingListError] = useState('')
    const [generating, setGenerating] = useState(false)
    const [streamText, setStreamText] = useState('')
    const [error, setError] = useState('')
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
        try {
            const saved = localStorage.getItem('nutriai_chat_messages')
            return saved ? JSON.parse(saved) : [{
                role: 'ai',
                text: 'Hi! 👋 I\'m your NutriAI Assistant. Generate a meal plan and then tell me what you\'d like to change — swap a meal, adjust nutrition, ask questions, or give feedback. I\'ll refine your plan based on your preferences!',
                time: getFormattedTime(),
            }]
        } catch { return [] }
    })
    const [chatInput, setChatInput] = useState('')
    const [chatLoading, setChatLoading] = useState(false)
    const [showDetails, setShowDetails] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'meals' | 'shopping'>('meals')

    // Speech UI
    const [isListening, setIsListening] = useState(false)
    const [interimText, setInterimText] = useState('')
    const recognitionRef = useRef<any>(null)
    const [highlightSection, setHighlightSection] = useState<'meals' | 'shopping' | null>(null)
    const [checkedItems, setCheckedItems] = useState<string[]>([])
    const [activeCategory, setActiveCategory] = useState('all')

    // "Why this meal?" explanation feature
    const [mealExplanations, setMealExplanations] = useState<Record<string, string>>({})
    const [loadingExplanation, setLoadingExplanation] = useState<string | null>(null)
    const [activeExplanation, setActiveExplanation] = useState<string | null>(null)

    const fetchMealExplanation = async (mealName: string, mealType: string, dayName: string) => {
        const key = `${dayName}-${mealType}`

        // Toggle if already loaded
        if (mealExplanations[key]) {
            setActiveExplanation(activeExplanation === key ? null : key)
            return
        }

        setLoadingExplanation(key)
        setActiveExplanation(key)

        // Read user profile from localStorage
        let profileData: Record<string, string | string[]> = {}
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const profileRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                const data = await profileRes.json()
                if (data.success) profileData = data.user
            }
        } catch { /* ignore */ }

        const prompt = `You are NutriAI explaining a meal choice.
Be friendly, specific, and under 60 words.

MEAL: ${mealName} (${mealType} on ${dayName})

USER PROFILE:
- Age: ${profileData.age || 'unknown'}, Gender: ${profileData.gender || 'unknown'}
- Conditions: ${Array.isArray(profileData.conditions) ? profileData.conditions.join(', ') : 'None'}
- Allergies: ${Array.isArray(profileData.allergies) ? profileData.allergies.join(', ') : 'None'}
- Goal: ${profileData.primaryGoal || 'general health'}
- Activity: ${profileData.activityLevel || 'moderate'}
- Diet: ${profileData.dietaryType || 'balanced'}

Explain in 2-3 sentences WHY this specific meal was chosen for this person. Mention their specific health condition or goal.
Be direct. Start with the meal name.
No JSON. Plain text only.`

        try {
            const res = await fetch('/ollama_api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.1:latest',
                    prompt,
                    stream: false,
                    options: { num_predict: 256, temperature: 0.7 }
                })
            })
            const data = await res.json()
            const explanation = data.response?.trim() || 'Unable to generate explanation.'

            setMealExplanations(prev => ({ ...prev, [key]: explanation }))
        } catch {
            setMealExplanations(prev => ({ ...prev, [key]: 'Unable to load explanation right now.' }))
        } finally {
            setLoadingExplanation(null)
        }
    }

    const toggleItem = (key: string) => {
        setCheckedItems(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        )
    }

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    // Save chat messages whenever they change
    useEffect(() => {
        if (chatMessages.length > 0) {
            localStorage.setItem('nutriai_chat_messages', JSON.stringify(chatMessages))
        }
    }, [chatMessages])

    // Save meal plan whenever it changes
    useEffect(() => {
        if (plan) {
            localStorage.setItem('nutriai_meal_plan', JSON.stringify(plan))
        }
    }, [plan])

    // Save shopping list whenever it changes
    useEffect(() => {
        if (shoppingList) {
            localStorage.setItem('nutriai_shopping_list', JSON.stringify(shoppingList))
        }
    }, [shoppingList])

    // ─── Generate meal plan from backend ─────────────────────────────────────
    const generateMealPlan = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signin')
            return
        }

        localStorage.removeItem('nutriai_chat_messages')
        localStorage.removeItem('nutriai_meal_plan')
        localStorage.removeItem('nutriai_shopping_list')

        setGenerating(true)
        setStreamText('')
        setError('')
        setPlan(null)
        setShoppingList(null)
        setChatMessages([{
            role: 'ai',
            text: "Generating your new meal plan...",
            time: getFormattedTime()
        }])

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
                                // Removed raw string assignment to state to prevent UI crash
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
                                const parsedSL = extractJSON(fullShoppingList)
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                if (parsedSL && (parsedSL as any).categories) {
                                    setShoppingList(cleanShoppingList(parsedSL))
                                } else {
                                    setShoppingList(cleanShoppingList(parsePlainTextToList(fullShoppingList)))
                                }
                            }
                        }

                    } catch {
                        // skip malformed JSON
                    }
                }
            }

            // 5. Parse the full response into structured data
            if (fullMealPlan) {
                const parsed = parseWeekPlan(fullMealPlan)
                setPlan(parsed)
                setSelectedDay(getTodayDayIndex())

                const saveToHistory = (newPlan: any) => {
                    try {
                        const existing = localStorage.getItem('nutriai_meal_history')
                        const history = existing ? JSON.parse(existing) : []

                        const newEntry = {
                            id: Date.now(),
                            date: new Date().toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            }),
                            weekLabel: `Week of ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
                            plan: newPlan,
                            totalDays: newPlan?.days?.length || 7
                        }

                        const updated = [newEntry, ...history].slice(0, 5)
                        localStorage.setItem('nutriai_meal_history', JSON.stringify(updated))
                    } catch (e) { console.error(e) }
                }
                saveToHistory(parsed)

                setChatMessages(prev => [...prev, {
                    role: 'ai',
                    text: `\u2705 Your meal plan is ready! I've created a ${parsed.days.length}-day plan with ${parsed.days[0]?.meals.length || 0} meals per day based on your health profile.`,
                    time: getFormattedTime(),
                }])
                // Auto-generate shopping list after meal plan is ready
                // Actually, let's let the user trigger it, or trigger it here if they prefer. The instruction said to fix generateShoppingList. We'll leave this as is.
            }

        } catch (err: unknown) {
            console.error('Meal plan generation error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate meal plan. Make sure Ollama is running.'
            setError(errorMessage)
            setChatMessages(prev => [...prev, {
                role: 'ai',
                text: `❌ Error: ${errorMessage}. Please make sure Ollama is running and try again.`,
                time: getFormattedTime(),
            }])
        } finally {
            setGenerating(false)
        }
    }

    // ─── Generate Shopping List ──────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mealPlanToText = (planData: any): string => {
        if (!planData) return ''

        try {
            // If mealPlan is already a string, use directly
            if (typeof planData === 'string') return planData

            // If it's our DayPlan type
            if (planData.meals && Array.isArray(planData.meals)) {
                return planData.meals.map((m: Meal) => `${m.type}: ${m.name}`).join(', ')
            }

            // If it's our WeekPlan type with days array of DayPlan
            if (planData.days && Array.isArray(planData.days)) {
                return planData.days.map((day: DayPlan) => {
                    const meals = day.meals.map((m: Meal) => `${m.type}: ${m.name}`).join(', ')
                    return `${day.dayName}: ${meals}`
                }).join('\n')
            }

            // Fallback — stringify whatever structure exists
            return JSON.stringify(planData)

        } catch {
            return JSON.stringify(planData)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractJSON = (text: string): any => {
        try {
            // Try direct parse first
            return JSON.parse(text.trim())
        } catch {
            try {
                // Find JSON object in the text
                // (handles AI adding explanation before/after)
                const jsonMatch = text.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0])
                }
            } catch {
                // Try removing markdown code fences
                // ```json ... ``` or ``` ... ```
                try {
                    const cleaned = text
                        .replace(/```json\n?/g, '')
                        .replace(/```\n?/g, '')
                        .trim()
                    return JSON.parse(cleaned)
                } catch {
                    return null
                }
            }
        }
        return null
    }

    const parsePlainTextToList = (text: string) => {
        const lines = text
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0)
            // Remove markdown bullets/numbers
            .map(l => l.replace(/^[-•*\d.]+\s*/, ''))
            .filter(l => l.length > 0)

        return {
            categories: [
                {
                    name: 'All Ingredients',
                    emoji: '🛒',
                    items: lines.map(line => {
                        // Try to split "Ingredient - quantity" 
                        // or "Ingredient: quantity"
                        const parts = line.split(/[-:]/)
                        return {
                            name: parts[0]?.trim() || line,
                            quantity: parts[1]?.trim() || 'as needed'
                        }
                    })
                }
            ],
            totalItems: lines.length,
            estimatedCost: 'Varies'
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanShoppingList = (data: any): ShoppingList => {
        if (!data?.categories) return data

        const CATEGORY_WORDS = [
            'proteins', 'vegetables', 'fruits',
            'grains', 'legumes', 'dairy', 'eggs',
            'condiments', 'spices', 'oils', 'nuts',
            'beverages', 'ingredients', 'items', 'pantry',
            'meat', 'seafood', 'poultry'
        ]

        const cleaned: ShoppingList = {
            ...data,
            note: (data.note || '').replace(/\*+/g, '').trim(),
            categories: data.categories
                .map((cat: ShoppingCategory) => ({
                    ...cat,
                    name: cat.name?.replace(/\*+/g, '').trim(),
                    items: (cat.items || [])
                        .filter((item: ShoppingItem) => {
                            if (!item?.name) return false
                            const name = item.name.toLowerCase().replace(/\*+/g, '').trim()

                            // Filter out category headers appearing as items
                            const isCategoryWord = CATEGORY_WORDS.some(w =>
                                name === w || name === w + 's' ||
                                name.startsWith(w + ' &') || name.startsWith(w + 's &')
                            )

                            // Filter out note/prose sentences
                            const isNote =
                                name.startsWith('note') ||
                                name.startsWith('since') ||
                                name.startsWith('please') ||
                                name.startsWith('you ') ||
                                name.startsWith('this ') ||
                                name.startsWith('here is') ||
                                name.includes('shopping list') ||
                                name.includes('lactose') ||
                                name.includes('intolerant') ||
                                name.includes('assuming') ||
                                name.includes('you may') ||
                                name.split(' ').length > 6

                            return !isCategoryWord && !isNote && name.length > 1
                        })
                        .map((item: ShoppingItem) => ({
                            name: item.name
                                .replace(/\*+/g, '')
                                .replace(/^\d+\.\s*/, '')
                                .replace(/^[-•]\s*/, '')
                                .trim(),
                            quantity: (item.quantity || '')
                                .replace(/\*+/g, '')
                                .replace(/^\(|\)$/g, '')
                                .trim() || 'as needed'
                        }))
                        .filter((item: ShoppingItem) => item.name.length > 1)
                }))
                .filter((cat: ShoppingCategory) => cat.items.length > 0),
            totalItems: 0,
        }

        // Recalculate total items
        cleaned.totalItems = cleaned.categories
            .reduce((sum: number, cat: ShoppingCategory) =>
                sum + cat.items.length, 0)

        return cleaned
    }

    const generateShoppingList = async () => {
        if (!plan) {
            setShoppingListError('Generate a meal plan first!')
            return
        }

        setIsGeneratingList(true)
        setShoppingListError('')

        // Convert meal plan to readable text
        const planText = mealPlanToText(plan)

        // Load user profile for dietary context
        let userProfile = {}
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const profileRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                const profileData = await profileRes.json()
                if (profileData.success) userProfile = profileData.user
            }
        } catch { /* ignore */ }

        const prompt = `
You are a grocery list generator for Indian cooking.
Extract ingredients from this meal plan.

MEAL PLAN:
${planText}

USER HEALTH PROFILE:
${JSON.stringify(userProfile)}

STRICT OUTPUT RULES:
1. Return ONLY raw JSON — zero other text
2. No markdown, no backticks, no notes
3. No "Note:" or explanatory sentences
4. No category names as items
5. Every item must have a real quantity
6. Use Indian grocery quantities (grams, pieces, bunches, cups)

RETURN EXACTLY THIS STRUCTURE:
{
  "categories": [
    {
      "name": "Vegetables",
      "emoji": "🥦",
      "color": "#22c55e",
      "items": [
        { "name": "Spinach", "quantity": "200g" },
        { "name": "Tomato", "quantity": "4 pcs" },
        { "name": "Onion", "quantity": "3 pcs" }
      ]
    },
    {
      "name": "Fruits",
      "emoji": "🍎",
      "color": "#f97316",
      "items": [
        { "name": "Banana", "quantity": "6 pcs" }
      ]
    },
    {
      "name": "Proteins",
      "emoji": "🥩",
      "color": "#8b5cf6",
      "items": [
        { "name": "Chicken breast", "quantity": "500g" }
      ]
    },
    {
      "name": "Grains & Legumes",
      "emoji": "🌾",
      "color": "#f59e0b",
      "items": [
        { "name": "Basmati rice", "quantity": "1 kg" },
        { "name": "Dal", "quantity": "500g" }
      ]
    },
    {
      "name": "Dairy & Eggs",
      "emoji": "🥛",
      "color": "#3b82f6",
      "items": [
        { "name": "Greek yogurt", "quantity": "400g" }
      ]
    },
    {
      "name": "Condiments & Spices",
      "emoji": "🧂",
      "color": "#64748b",
      "items": [
        { "name": "Cumin seeds", "quantity": "50g" },
        { "name": "Ghee", "quantity": "200g" }
      ]
    }
  ],
  "totalItems": 18,
  "estimatedCost": "₹450-600",
  "note": ""
}

IMPORTANT:
- note field: put any special dietary note HERE only, not as a list item. Empty string if nothing.
- Fill ONLY categories that have items
- Skip empty categories entirely
- Every single item needs a real quantity
`

        try {
            const response = await fetch(
                'http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.1:latest',
                    prompt: prompt,
                    stream: false,
                })
            })

            const data = await response.json()

            // Ollama returns response in data.response
            const rawText = data.response || ''

            // ── ROBUST JSON EXTRACTION ──
            const parsed = extractJSON(rawText)

            if (parsed && parsed.categories) {
                setShoppingList(cleanShoppingList(parsed))
            } else {
                // Fallback: parse as plain text list
                setShoppingList(cleanShoppingList(parsePlainTextToList(rawText)))
            }

        } catch (error) {
            console.error('Shopping list error:', error)
            setShoppingListError('Failed to generate list. Try again.')
        } finally {
            setIsGeneratingList(false)
        }
    }

    // ─── Chat with AI about the plan (feedback loop) ─────────────────────────
    const handleChat = async () => {
        if (!chatInput.trim() || chatLoading) return

        const userMsg = chatInput.trim()
        setChatInput('')
        const newUserMessage: ChatMessage = { role: 'user', text: userMsg, time: getFormattedTime() }
        setChatMessages(prev => [...prev, newUserMessage])
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

            const profileObj = {
                age: user.age,
                gender: user.gender,
                weight: `${user.weight}kg`,
                height: `${user.height}cm`,
                activity: user.activityLevel || 'moderate',
                goal: user.primaryGoal || 'maintain',
                dietType: user.dietaryType || 'omnivore',
                allergies: user.allergies?.join(', ') || 'none',
                conditions: user.medicalConditions?.join(', ') || 'none',
                cuisine: user.cuisinePreferences?.join(', ') || 'any',
                mealsPerDay: user.mealsPerDay || 3,
                cookTime: 30,
                budget: user.budget || 'medium',
                servings: 1,
            }

            // Send to the feedback chat endpoint with conversation context
            const res = await fetch('/api/meal-plan/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    profile: profileObj,
                    currentPlan: plan?.raw || '',
                    userMessage: userMsg,
                    history: chatMessages.slice(-8).map(m => ({ role: m.role, text: m.text })),
                }),
            })

            if (!res.ok) {
                const errText = await res.text().catch(() => '')
                let errMsg = `Server error (${res.status})`
                if (res.status === 404) {
                    errMsg = 'Chat endpoint not found. Please restart the server to load the new /api/meal-plan/chat route.'
                } else if (errText) {
                    try {
                        const errData = JSON.parse(errText)
                        errMsg = errData.error || errMsg
                    } catch {
                        errMsg = errText.slice(0, 200)
                    }
                }
                throw new Error(errMsg)
            }

            const responseText = await res.text()
            if (!responseText) {
                throw new Error('Empty response from server. The AI might be taking too long — try a simpler request.')
            }

            let data
            try {
                data = JSON.parse(responseText)
            } catch {
                throw new Error('Invalid response from server. Please try again.')
            }

            if (data.success && data.response) {
                const aiResponse = data.response.trim()

                // ── Detect if the AI response contains a meal replacement ──
                // Matches many LLM output formats:
                //   ## Breakfast: Dish     ###Breakfast - Dish
                //   **Breakfast:** Dish    **Breakfast** - Dish
                //   Breakfast: Dish Name   (plain text heading)
                const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Morning Snack', 'Afternoon Snack', 'Evening Snack', 'Main Meal']
                const mealDetectPattern = new RegExp(
                    `(?:^|\\n)\\s*(?:#{1,4}\\s*|\\*\\*\\s*)?(?:(?:Updated|New|Revised|Alternative|Replacement)\\s+)?` +
                    `(${mealTypes.join('|')})` +
                    `(?:\\s*\\*\\*)?\\s*[:\\-–]\\s*(.+)`,
                    'im'
                )
                const mealDetectMatch = aiResponse.match(mealDetectPattern)

                if (mealDetectMatch && plan) {
                    const detectedType = mealDetectMatch[1] // e.g. "Breakfast"
                    let dishName = mealDetectMatch[2]?.trim().replace(/[*#]/g, '').trim() || detectedType
                    if (dishName.length > 60) dishName = dishName.substring(0, 57) + '...'
                    if (!dishName) dishName = detectedType

                    // Extract calories from anywhere in the AI response
                    const calMatch = aiResponse.match(/(\d{2,4})\s*(?:kcal|calories|cal)/i)

                    // Extract just the meal content (strip conversational preamble)
                    // Find where the meal section starts (the heading line)
                    const mealSectionRegex = new RegExp(
                        `((?:^|\\n)\\s*(?:#{1,4}\\s*|\\*\\*\\s*)?(?:(?:Updated|New|Revised|Alternative|Replacement)\\s+)?` +
                        `${detectedType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` +
                        `[\\s\\S]*)`,
                        'im'
                    )
                    const sectionMatch = aiResponse.match(mealSectionRegex)
                    const mealDetails = sectionMatch ? sectionMatch[1].trim() : aiResponse.trim()

                    // Deep-clone the current day's meals so React detects the change
                    const currentDay = plan.days[selectedDay] || plan.days[0]
                    if (!currentDay) return
                    const updatedMeals = currentDay.meals.map((m: Meal) => ({ ...m }))
                    const normalizedDetected = detectedType.toLowerCase().replace(/\d+/, '').trim()

                    const mealIdx = updatedMeals.findIndex((m: Meal) =>
                        m.type.toLowerCase() === normalizedDetected
                    )

                    if (mealIdx >= 0) {
                        updatedMeals[mealIdx] = {
                            type: updatedMeals[mealIdx].type,
                            name: dishName,
                            calories: calMatch ? `${calMatch[1]} kcal` : updatedMeals[mealIdx].calories,
                            details: mealDetails,
                        }
                    } else {
                        updatedMeals.push({
                            type: detectedType.replace(/\d+/, '').trim(),
                            name: dishName,
                            calories: calMatch ? `${calMatch[1]} kcal` : '',
                            details: mealDetails,
                        })
                    }

                    // Recalculate total calories
                    let totalCal = 0
                    for (const m of updatedMeals) {
                        const num = parseInt(m.calories)
                        if (!isNaN(num)) totalCal += num
                    }

                    const updatedDays = plan.days.map((d, idx) => {
                        if (idx === selectedDay) {
                            return {
                                ...d,
                                meals: updatedMeals,
                                totalCalories: totalCal > 0 ? `${totalCal} kcal` : d.totalCalories,
                                raw: d.raw + '\n\n--- Updated ---\n' + aiResponse,
                            }
                        }
                        return d
                    })

                    const updatedPlan: WeekPlan = {
                        ...plan,
                        days: updatedDays,
                        raw: plan.raw + '\n\n--- Updated ---\n' + aiResponse,
                    }
                    setPlan(updatedPlan)

                    setHighlightSection('meals')
                    setTimeout(() => setHighlightSection(null), 2000)

                    setChatMessages(prev => [...prev, {
                        role: 'ai',
                        text: `✅ I've updated your **${detectedType}** to **${dishName}**!${calMatch ? ` (${calMatch[1]} kcal)` : ''}\n\nCheck the meal cards on the left for full details.`,
                        time: getFormattedTime(),
                    }])
                } else {
                    // Conversational response (nutrition advice, feedback acknowledgment, etc.)
                    setChatMessages(prev => [...prev, {
                        role: 'ai',
                        text: aiResponse,
                        time: getFormattedTime(),
                    }])
                }
            } else {
                setChatMessages(prev => [...prev, {
                    role: 'ai',
                    text: '❌ Sorry, I could not process your request. Please try again.',
                    time: getFormattedTime(),
                }])
            }
        } catch (err: unknown) {
            let errorMessage = 'An error occurred';
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            setChatMessages(prev => [...prev, {
                role: 'ai',
                text: `❌ Error: ${errorMessage}`,
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
    }, [navigate])

    // ─── Speech Recognition Logic ─────────────────────────────────────────────
    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Voice input not supported in this browser. Please use Chrome.')
            return
        }

        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.lang = 'en-US'
        recognition.continuous = true
        recognition.interimResults = true

        recognition.onstart = () => {
            setIsListening(true)
            recognitionRef.current.originalText = chatInput ? chatInput + ' ' : ''
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                setChatInput(recognitionRef.current.originalText)
            }
            setInterimText(currentInterim)
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error('Speech error:', event.error)
            setIsListening(false)
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
    }

    const toggleListening = () => isListening ? stopListening() : startListening()

    // ─── Save & Persistence ──────────────────────────────────────────────────────────────
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
                                        {/* Day Selector Tabs */}
                                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                            {plan.days.map((day, idx) => {
                                                const isToday = idx === getTodayDayIndex()
                                                const isSelected = idx === selectedDay
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => { setSelectedDay(idx); setShowDetails(null) }}
                                                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${isSelected
                                                            ? 'bg-[#22c55e] text-white border-[#22c55e] shadow-lg shadow-[#22c55e]/20 scale-105'
                                                            : isToday
                                                                ? 'bg-[#f0fdf4] text-[#22c55e] border-[#22c55e]/30 hover:bg-[#dcfce7]'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#22c55e]/30 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span>{day.dayName.slice(0, 3)}</span>
                                                            <span className="text-[10px] font-medium opacity-70">{day.date}</span>
                                                        </div>
                                                        {isToday && !isSelected && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mx-auto mt-1" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Selected Day Card */}
                                        {(() => {
                                            const day = plan.days[selectedDay]
                                            if (!day) return null
                                            const isToday = selectedDay === getTodayDayIndex()
                                            return (
                                                <div className={`bg-white rounded-2xl p-0 shadow-[0_8px_30px_rgba(33,197,93,0.15)] ring-2 ${highlightSection === 'meals' ? 'ring-4 ring-[#22c55e] scale-[1.01] transition-all duration-500' : 'ring-[#22c55e] transition-all duration-500'} relative z-10`}>
                                                    <div className="flex justify-between items-center mb-4 border-b border-[#22c55e]/10 pb-3 bg-[#f0fdf4] rounded-t-2xl p-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                                                                <span className="text-[#22c55e] font-black text-lg">{day.dayNumber}</span>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                                                                    {day.dayName}
                                                                    {isToday && (
                                                                        <span className="bg-[#22c55e] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Today</span>
                                                                    )}
                                                                </h3>
                                                                <p className="text-xs text-[#16a34a] font-medium">{day.date}</p>
                                                            </div>
                                                        </div>
                                                        {day.totalCalories && (
                                                            <span className="px-3 py-1 bg-white text-[#22c55e] font-bold rounded-full text-xs shadow-sm border border-[#22c55e]/10">
                                                                {day.totalCalories}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="space-y-3 px-5 pb-5">
                                                        {day.meals.map((meal: Meal, i: number) => {
                                                            const iconInfo = mealIcons[meal.type] || mealIcons['Meal Plan']
                                                            const isExpanded = showDetails === `meal-${selectedDay}-${i}`
                                                            const explKey = `${day.dayName}-${meal.type}`
                                                            return (
                                                                <div key={i}>
                                                                    <div
                                                                        className="flex items-center gap-4 p-3 bg-[#f0fdf4]/50 border border-[#22c55e]/10 rounded-xl transition-colors group cursor-pointer hover:bg-[#f0fdf4]"
                                                                        onClick={() => setShowDetails(isExpanded ? null : `meal-${selectedDay}-${i}`)}
                                                                    >
                                                                        <div className={`${iconInfo.bg} p-2 rounded-lg ${iconInfo.color}`}>
                                                                            <span className="material-symbols-outlined">{iconInfo.icon}</span>
                                                                        </div>
                                                                        <div className="w-24 text-sm font-bold text-[#22c55e]">{meal.type}</div>
                                                                        <div className="flex-1 text-sm font-semibold text-slate-900">{meal.name}</div>
                                                                        <div className="flex items-center gap-2">
                                                                            {meal.calories && (
                                                                                <div className="text-xs font-bold text-slate-500">{meal.calories}</div>
                                                                            )}
                                                                            {/* Why? button */}
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    fetchMealExplanation(meal.name, meal.type, day.dayName)
                                                                                }}
                                                                                className={`opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border transition-all duration-200 ${activeExplanation === explKey
                                                                                        ? 'opacity-100 bg-[#f0fdf4] text-[#16a34a] border-[#22c55e]'
                                                                                        : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] hover:border-[#22c55e] hover:text-[#22c55e]'
                                                                                    }`}>
                                                                                {loadingExplanation === explKey ? (
                                                                                    <div className="w-2.5 h-2.5 border border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                                                                                ) : (
                                                                                    '🤔'
                                                                                )}
                                                                                Why?
                                                                            </button>
                                                                        </div>
                                                                        <span className={`material-symbols-outlined text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>
                                                                            expand_more
                                                                        </span>
                                                                    </div>

                                                                    {/* AI Explanation Panel */}
                                                                    {activeExplanation === explKey && mealExplanations[explKey] && (
                                                                        <div className="mx-3 mt-2 mb-1 flex items-start gap-3 bg-gradient-to-r from-[#f0fdf4] to-[#f8fafc] border border-[#bbf7d0] rounded-xl px-4 py-3">
                                                                            <div className="w-7 h-7 rounded-full bg-[#22c55e] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                                <span className="text-white text-xs">🤖</span>
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <p className="text-[12px] text-[#374151] leading-relaxed">
                                                                                    {mealExplanations[explKey]}
                                                                                </p>
                                                                                <div className="flex items-center justify-between mt-2">
                                                                                    <span className="text-[10px] text-[#94a3b8]">⚡ NutriAI · Powered by local Ollama</span>
                                                                                    <button
                                                                                        onClick={() => setActiveExplanation(null)}
                                                                                        className="text-[10px] text-[#94a3b8] hover:text-[#64748b] transition-colors">
                                                                                        Close ×
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Loading state for explanation */}
                                                                    {loadingExplanation === explKey && !mealExplanations[explKey] && (
                                                                        <div className="mx-3 mt-2 mb-1 flex items-center gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3">
                                                                            <div className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                                                                            <span className="text-[12px] text-[#64748b]">Thinking why this meal was chosen...</span>
                                                                        </div>
                                                                    )}

                                                                    {isExpanded && (
                                                                        <div className="mt-2 ml-14 bg-white rounded-xl border border-slate-100 p-5 text-sm text-slate-700 animate-in">
                                                                            {renderMealDetails(meal.details, meal.type)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })()}

                                        {/* Weekly Summary */}
                                        {plan.weeklySummary && (
                                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                                <button
                                                    onClick={() => setShowDetails(showDetails === 'summary' ? null : 'summary')}
                                                    className="flex items-center justify-between w-full"
                                                >
                                                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[#22c55e]" style={{ fontSize: '18px' }}>analytics</span>
                                                        Weekly Summary
                                                    </h3>
                                                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${showDetails === 'summary' ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>
                                                        expand_more
                                                    </span>
                                                </button>
                                                {showDetails === 'summary' && (
                                                    <div className="mt-2 bg-gradient-to-b from-transparent to-slate-50/30 rounded-xl px-2 py-4 max-h-[600px] overflow-y-auto">
                                                        {renderFullPlanDetails(plan.weeklySummary)}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Full Plan Details (collapsed by default) */}
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
                                                <div className="mt-2 bg-gradient-to-b from-transparent to-slate-50/30 rounded-xl px-2 py-4 max-h-[600px] overflow-y-auto">
                                                    {renderFullPlanDetails(plan.raw)}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Shopping List Tab */}
                                {activeTab === 'shopping' && (
                                    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full ${highlightSection === 'shopping' ? 'ring-4 ring-[#22c55e] scale-[1.01] transition-all duration-500' : 'transition-all duration-500'}`}>

                                        {/* STATE A — Not generated yet */}
                                        {!shoppingList && !isGeneratingList && !shoppingListError && (
                                            <div className="p-5">
                                                <div className="bg-[#f0fdf4] border border-[#22c55e] border-dashed rounded-xl p-6 text-center">
                                                    <span className="text-2xl mb-2 block">🛒</span>
                                                    <p className="text-[#16a34a] font-semibold text-sm">
                                                        Shopping List
                                                    </p>
                                                    <p className="text-[#64748b] text-xs mt-1 mb-4">
                                                        Auto-extract ingredients from your meal plan
                                                    </p>
                                                    <button
                                                        onClick={generateShoppingList}
                                                        className="bg-[#22c55e] text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-[#16a34a] transition-colors">
                                                        Generate Shopping List
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* STATE B — Loading */}
                                        {isGeneratingList && (
                                            <div className="p-5">
                                                <div className="flex items-center gap-3 text-[#64748b] text-sm p-4">
                                                    <div className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                                                    Extracting ingredients from your plan...
                                                </div>
                                            </div>
                                        )}

                                        {/* STATE C — Error */}
                                        {shoppingListError && (
                                            <div className="p-5">
                                                <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 text-sm text-[#ef4444]">
                                                    ⚠️ {shoppingListError}
                                                    <button
                                                        onClick={generateShoppingList}
                                                        className="ml-3 underline">
                                                        Try again
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* STATE D — Generated ✅ */}
                                        {shoppingList?.categories && !isGeneratingList && !shoppingListError && (
                                            <div className="h-full flex flex-col bg-[#f8fafc]">

                                                {/* ── TOP SUMMARY BAR ── */}
                                                <div className="bg-white px-5 py-4 border-b border-[#e2e8f0]">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">🛒</span>
                                                            <h3 className="font-bold text-[#0f172a] text-[15px]">Shopping List</h3>
                                                            <span className="bg-[#f0fdf4] text-[#16a34a] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
                                                                {shoppingList.totalItems} items
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={generateShoppingList}
                                                            className="flex items-center gap-1.5 text-[12px] text-[#22c55e] font-semibold border border-[#22c55e] rounded-lg px-3 py-1.5 hover:bg-[#f0fdf4] transition-colors">
                                                            🔄 Refresh
                                                        </button>
                                                    </div>

                                                    {/* Stats row */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[12px] text-[#64748b]">💰 Est. {shoppingList.estimatedCost}</span>
                                                            <span className="text-[12px] text-[#64748b]">✅ {checkedItems.length}/{shoppingList.totalItems} done</span>
                                                        </div>
                                                        {checkedItems.length > 0 && (
                                                            <button
                                                                onClick={() => setCheckedItems([])}
                                                                className="text-[11px] text-[#94a3b8] hover:text-[#ef4444] transition-colors">
                                                                Clear all ×
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div className="mt-3 w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${shoppingList.totalItems > 0
                                                                    ? (checkedItems.length / shoppingList.totalItems) * 100
                                                                    : 0}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* ── SPECIAL DIETARY NOTE ── */}
                                                {shoppingList.note && (
                                                    <div className="mx-4 mt-4 flex items-start gap-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3">
                                                        <span className="text-base mt-0.5">💡</span>
                                                        <p className="text-[12px] text-[#92400e] leading-relaxed">{shoppingList.note}</p>
                                                    </div>
                                                )}

                                                {/* ── CATEGORY TABS ── */}
                                                <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
                                                    <button
                                                        onClick={() => setActiveCategory('all')}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${activeCategory === 'all'
                                                            ? 'bg-[#0f172a] text-white border-[#0f172a]'
                                                            : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#22c55e]'
                                                            }`}>
                                                        All ({shoppingList.totalItems})
                                                    </button>
                                                    {shoppingList.categories.map((cat: ShoppingCategory) => (
                                                        <button
                                                            key={cat.name}
                                                            onClick={() => setActiveCategory(cat.name)}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${activeCategory === cat.name
                                                                ? 'text-white border-transparent'
                                                                : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#22c55e]'
                                                                }`}
                                                            style={activeCategory === cat.name
                                                                ? { backgroundColor: cat.color || '#22c55e' }
                                                                : {}}>
                                                            {cat.emoji} {cat.name} ({cat.items.length})
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* ── ITEMS LIST (scrollable) ── */}
                                                <div className="flex-1 overflow-y-auto px-4 pb-6">
                                                    {shoppingList.categories
                                                        .filter((cat: ShoppingCategory) =>
                                                            activeCategory === 'all' || cat.name === activeCategory)
                                                        .map((category: ShoppingCategory, catIdx: number) => (
                                                            <div key={catIdx} className="mb-5">

                                                                {/* Category header (only in "All" view) */}
                                                                {activeCategory === 'all' && (
                                                                    <div className="flex items-center gap-2 mb-2 mt-2">
                                                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                                                                            style={{ backgroundColor: (category.color || '#22c55e') + '20' }}>
                                                                            {category.emoji}
                                                                        </div>
                                                                        <span className="text-[11px] font-bold uppercase tracking-wider"
                                                                            style={{ color: category.color || '#22c55e' }}>
                                                                            {category.name}
                                                                        </span>
                                                                        <span className="text-[10px] text-[#94a3b8] bg-[#f1f5f9] px-1.5 py-0.5 rounded-full">
                                                                            {category.items.length}
                                                                        </span>
                                                                        <div className="flex-1 h-px bg-[#f1f5f9]" />
                                                                    </div>
                                                                )}

                                                                {/* Items */}
                                                                <div className="space-y-2">
                                                                    {category.items.map((item: ShoppingItem, itemIdx: number) => {
                                                                        const key = `${catIdx}-${itemIdx}`
                                                                        const checked = checkedItems.includes(key)
                                                                        return (
                                                                            <div
                                                                                key={itemIdx}
                                                                                onClick={() => toggleItem(key)}
                                                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 group ${checked
                                                                                    ? 'bg-[#f0fdf4] border-[#bbf7d0]'
                                                                                    : 'bg-white border-[#e2e8f0] hover:border-[#22c55e]/50 hover:shadow-sm'
                                                                                    }`}>
                                                                                <div className="flex items-center gap-3">
                                                                                    {/* Circle checkbox */}
                                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${checked
                                                                                        ? 'bg-[#22c55e] border-[#22c55e]'
                                                                                        : 'border-[#d1d5db] group-hover:border-[#22c55e]/50'
                                                                                        }`}>
                                                                                        {checked && (
                                                                                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10">
                                                                                                <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                                                                                            </svg>
                                                                                        )}
                                                                                    </div>
                                                                                    {/* Item name */}
                                                                                    <span className={`text-[13px] font-medium transition-all ${checked ? 'line-through text-[#94a3b8]' : 'text-[#0f172a]'
                                                                                        }`}>
                                                                                        {item.name}
                                                                                    </span>
                                                                                </div>
                                                                                {/* Quantity badge */}
                                                                                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 transition-all duration-200 ${checked
                                                                                    ? 'bg-[#dcfce7] text-[#16a34a]'
                                                                                    : 'bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]'
                                                                                    }`}>
                                                                                    {item.quantity}
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
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
                                            {msg.role === 'ai' ? (
                                                <div className="space-y-1">
                                                    {msg.text.replace(/\r\n/g, '\n').split('\n').filter((l: string) => l.trim()).map((line: string, li: number) => {
                                                        const t = line.trim()
                                                        if (t.match(/^#{1,4}\s/)) {
                                                            return <p key={li} className="font-bold text-slate-800 text-sm mt-1">{t.replace(/^#+\s*/, '').replace(/\*+/g, '')}</p>
                                                        }
                                                        if (t.match(/^[-*•]\s/)) {
                                                            return (
                                                                <div key={li} className="flex items-start gap-1.5 ml-1">
                                                                    <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0 mt-2"></span>
                                                                    <span className="text-sm" dangerouslySetInnerHTML={{ __html: t.replace(/^[-*•]\s*/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                                                                </div>
                                                            )
                                                        }
                                                        return <p key={li} className="text-sm" dangerouslySetInnerHTML={{ __html: t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
                                                    })}
                                                </div>
                                            ) : msg.text}
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
                                {(plan
                                    ? [
                                        `Swap ${plan.days[selectedDay]?.meals[0]?.type || 'breakfast'} for something lighter`,
                                        'More protein options',
                                        'Make it low-carb',
                                        'Any substitutes for dairy?',
                                        'How many calories total?',
                                        'Make it vegetarian',
                                    ]
                                    : [
                                        'What foods help with weight loss?',
                                        'High protein breakfast ideas',
                                        'Best foods for energy',
                                        'Indian cuisine',
                                    ]
                                ).map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => { setChatInput(suggestion); }}
                                        className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                            <div className="relative flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        value={chatInput + interimText}
                                        onChange={e => {
                                            setChatInput(e.target.value)
                                            if (recognitionRef.current) {
                                                recognitionRef.current.originalText = e.target.value
                                            }
                                        }}
                                        onKeyDown={e => { if (e.key === 'Enter') handleChat() }}
                                        disabled={chatLoading || generating}
                                        className={`w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e] placeholder-slate-400 disabled:opacity-50 ${isListening ? 'border-[#22c55e] ring-2 ring-[#22c55e]/10' : 'border-slate-200'}`}
                                        placeholder="e.g. Swap lunch for something lighter..."
                                        type="text"
                                    />
                                    {/* Voice Toggle Button inside input */}
                                    <button
                                        onClick={toggleListening}
                                        disabled={chatLoading || generating}
                                        className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${isListening ? 'text-[#ef4444] bg-red-50 animate-pulse' : 'text-slate-400 hover:text-[#22c55e] hover:bg-slate-100'}`}
                                        title={isListening ? 'Stop listening' : 'Start voice typing'}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                            {isListening ? 'mic' : 'mic_none'}
                                        </span>
                                    </button>

                                    {/* Send button */}
                                    <button
                                        onClick={handleChat}
                                        disabled={!chatInput.trim() || chatLoading || generating}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_upward</span>
                                    </button>
                                </div>
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
