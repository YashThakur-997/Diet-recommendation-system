import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void
                    renderButton: (el: HTMLElement, options: Record<string, unknown>) => void
                }
            }
        }
    }
}

export function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [googleReady, setGoogleReady] = useState(false)
    const googleButtonRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        localStorage.removeItem('nutriai_chat_messages')
        localStorage.removeItem('nutriai_meal_plan')
        localStorage.removeItem('nutriai_plan_week')
        localStorage.removeItem('nutriai_user')
        localStorage.removeItem('token')
    }, [])

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (!clientId || !googleButtonRef.current) return

        const initGoogle = () => {
            if (!window.google?.accounts?.id) return false
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (res) => {
                    setError('')
                    fetch('/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ credential: res.credential }),
                    })
                        .then((r) => r.json())
                        .then((data) => {
                            if (data.success && data.token) {
                                localStorage.setItem('token', data.token)
                                navigate('/dashboard')
                            } else {
                                setError(data.message || 'Google sign-in failed.')
                            }
                        })
                        .catch(() => setError('Unable to connect. Please try again.'))
                },
            })
            if (googleButtonRef.current && !googleButtonRef.current.hasChildNodes()) {
                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    type: 'standard',
                    theme: 'filled_black',
                    size: 'large',
                    width: 380,
                    text: 'continue_with',
                })
            }
            return true
        }

        if (window.google?.accounts?.id) {
            setGoogleReady(initGoogle())
            return
        }
        const t = setInterval(() => {
            if (initGoogle()) {
                setGoogleReady(true)
                clearInterval(t)
            }
        }, 100)
        return () => clearInterval(t)
    }, [navigate, googleReady])

    const handleLogin = () => {
        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }
        fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
            .then(res => {
                if (!res.ok && res.headers.get('content-type')?.includes('application/json') === false) {
                    throw new Error(`Server error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    navigate('/dashboard');
                } else {
                    setError(data.message || 'Login failed. Please try again.');
                }
            })
            .catch(err => {
                console.error('Login error:', err);
                setError('Unable to connect to the server. Please try again later.');
            });
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#0f0f0f]">
            {/* LEFT PANEL */}
            <div className="hidden lg:block w-1/2 relative bg-zinc-900 border-r border-[#2d2d2d]">
                <img
                    src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=90&fit=crop"
                    alt="Healthy Food"
                    className="w-full h-full object-cover object-center"
                />

                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)'
                    }}
                />

                {/* Branding */}
                <div className="absolute bottom-10 left-10 z-20">
                    <div className="flex items-center gap-3 mb-1">
                        <img src="/favicon.jpg" alt="NutriAI" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-white/10" />
                        <h1 className="text-white text-[38px] font-black tracking-tighter">NutriAI</h1>
                    </div>
                    <p className="text-white/80 text-[16px] mb-6">Your Personal AI Nutritionist</p>

                    <div className="flex gap-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white text-[13px] font-medium flex items-center gap-1.5">
                            <span>🔒</span> 100% Private
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white text-[13px] font-medium flex items-center gap-1.5">
                            <span>🧠</span> Local AI
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white text-[13px] font-medium flex items-center gap-1.5">
                            <span>🥗</span> Personalized
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - FORM */}
            <div className="flex-1 w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 relative">

                <div className="w-full max-w-[380px] mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-[32px] font-bold text-white mb-2 tracking-tight">Sign in</h2>
                        <p className="text-[14px] text-[#71717a]">Welcome back! Please sign in to continue</p>
                    </div>

                    <div
                        ref={googleButtonRef}
                        className="w-full flex justify-center mb-2 min-h-[48px]"
                    />
                    {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                        <p className="text-[#71717a] text-[13px] text-center mb-4">Google sign-in not configured. Set VITE_GOOGLE_CLIENT_ID in client/.env and restart the dev server.</p>
                    )}
                    {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                        <p className="text-[#52525b] text-[12px] text-center mb-4">
                            If you see &quot;origin not allowed&quot;, add <strong className="text-[#a1a1aa]">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</strong> to Google Cloud Console → Credentials → your OAuth client → Authorized JavaScript origins.
                        </p>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-[#2d2d2d]" />
                        <span className="text-[#52525b] text-[13px] font-medium uppercase tracking-wider">or sign in with email</span>
                        <div className="flex-1 h-px bg-[#2d2d2d]" />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
                            <input
                                type="email"
                                placeholder="Email id"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full h-[52px] bg-[#1c1c1c] border border-[#2d2d2d] rounded-full pl-11 pr-4 text-[14px] text-[#e4e4e7] placeholder:text-[#52525b] focus:outline-none focus:border-[#22c55e] focus:border-[1.5px] transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full h-[52px] bg-[#1c1c1c] border border-[#2d2d2d] rounded-full pl-11 pr-12 text-[14px] text-[#e4e4e7] placeholder:text-[#52525b] focus:outline-none focus:border-[#22c55e] focus:border-[1.5px] transition-all"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors p-1"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-[#ef4444] text-[13px] text-center mt-3 font-medium">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-5 mb-8">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input type="checkbox" className="w-[18px] h-[18px] rounded-[4px] border-[#3d3d3d] bg-[#1c1c1c] checked:bg-[#22c55e] focus:ring-0 cursor-pointer appearance-none checked:border-[#22c55e] border relative
                            after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45" />
                            <span className="text-[13px] text-[#71717a] group-hover:text-[#a1a1aa] transition-colors font-medium">Remember me</span>
                        </label>
                        <button className="text-[13px] text-[#71717a] hover:text-[#a1a1aa] underline underline-offset-[3px] font-medium transition-colors">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full h-[52px] rounded-full bg-[#7c6ff7] hover:bg-[#6c5ff0] text-white font-bold text-[15px] transition-all duration-200 shadow-[0_4px_14px_rgba(124,111,247,0.3)] hover:shadow-[0_6px_20px_rgba(124,111,247,0.4)] hover:-translate-y-[1px]"
                    >
                        Login
                    </button>

                    <p className="text-center text-[14px] text-[#71717a] mt-8 font-medium">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-[#7c6ff7] hover:text-[#9d8ff9] font-bold transition-colors ml-1"
                        >
                            Sign up
                        </button>
                    </p>

                </div>
            </div>
        </div>
    )
}

export default SignIn
