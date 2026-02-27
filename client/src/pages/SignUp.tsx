import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Leaf } from 'lucide-react'

export function SignUp() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSignUp = () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        localStorage.setItem('nutriai_user', JSON.stringify({
            email,
            name,
            loggedIn: true
        }))
        navigate('/health-profile')
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
            <div className="flex-1 w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
                <div className="w-full max-w-[380px] mx-auto py-8">

                    <div className="text-center mb-8">
                        <h2 className="text-[32px] font-bold text-white mb-2 tracking-tight">Create Account</h2>
                        <p className="text-[14px] text-[#71717a]">Start your personalized nutrition journey</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full h-[52px] bg-[#1c1c1c] border border-[#2d2d2d] rounded-full pl-11 pr-4 text-[14px] text-[#e4e4e7] placeholder:text-[#52525b] focus:outline-none focus:border-[#22c55e] focus:border-[1.5px] transition-all"
                            />
                        </div>

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

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full h-[52px] bg-[#1c1c1c] border border-[#2d2d2d] rounded-full pl-11 pr-12 text-[14px] text-[#e4e4e7] placeholder:text-[#52525b] focus:outline-none focus:border-[#22c55e] focus:border-[1.5px] transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-[#ef4444] text-[13px] text-center mt-3 font-medium">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleSignUp}
                        className="w-full h-[52px] rounded-full bg-[#7c6ff7] hover:bg-[#6c5ff0] text-white font-bold text-[15px] transition-all duration-200 shadow-[0_4px_14px_rgba(124,111,247,0.3)] hover:shadow-[0_6px_20px_rgba(124,111,247,0.4)] hover:-translate-y-[1px] mt-8 mb-8"
                    >
                        Create Account
                    </button>

                    <p className="text-center text-[14px] text-[#71717a] font-medium">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/signin')}
                            className="text-[#7c6ff7] hover:text-[#9d8ff9] font-bold transition-colors ml-1"
                        >
                            Sign in
                        </button>
                    </p>

                </div>
            </div>
        </div>
    )
}

export default SignUp
