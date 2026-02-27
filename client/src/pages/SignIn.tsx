import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Leaf } from 'lucide-react'

export function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

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

    const handleGoogleLogin = () => {
        localStorage.setItem('nutriai_user', JSON.stringify({
            email: 'demo@gmail.com',
            name: 'Rahul',
            loggedIn: true
        }))
        navigate('/dashboard')
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
                    <div className="flex items-center gap-2 mb-1">
                        <Leaf className="w-8 h-8 text-[#22c55e]" />
                        <h1 className="text-white text-[28px] font-bold tracking-tight">NutriAI</h1>
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

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full h-[48px] bg-[#1c1c1c] border border-[#2d2d2d] rounded-full flex items-center justify-center gap-2.5 cursor-pointer mb-6 hover:bg-[#252525] hover:border-[#3d3d3d] transition-all"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-[#e4e4e7] text-[14px] font-medium">Google</span>
                    </button>

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
