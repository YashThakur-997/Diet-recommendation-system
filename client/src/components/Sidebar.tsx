import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const menuRef = useRef<HTMLDivElement>(null)

    const [user, setUser] = useState<{ username: string; email: string } | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)

    // Fetch user info on mount
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    setUser({ username: data.user.username, email: data.user.email })
                }
            })
            .catch(() => { /* silent fail — sidebar still works */ })
    }, [])

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        const token = localStorage.getItem('token')
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
        } catch {
            // logout even if server call fails
        }
        localStorage.removeItem('token')
        navigate('/signin')
    }

    // Get initials for avatar fallback
    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : '?'

    const navItems = [
        { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
        { label: 'My Meal Plan', icon: 'restaurant_menu', path: '/meal-plan' },
        { label: 'Health Profile', icon: 'person', path: '/health-profile' },
    ]

    return (
        <aside className="w-64 h-full bg-[#ffffff] border-r border-slate-200 flex flex-col shrink-0 transition-colors duration-300">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="bg-[#f0fdf4] rounded-xl p-2">
                    <span className="material-symbols-outlined text-[#22c55e]" style={{ fontSize: '28px' }}>eco</span>
                </div>
                <div>
                    <h1 className="text-[#0f172a] text-lg font-bold leading-none">NutriAI</h1>
                    <p className="text-[#64748b] text-xs font-medium">Premium Health</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors group ${isActive
                                ? 'bg-[#dcfce7] text-[#16a34a] font-[600] rounded-[10px]'
                                : 'bg-transparent text-[#374151] font-[400] hover:bg-[#f8fafc] rounded-[10px]'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${!isActive && 'group-hover:text-[#16a34a] transition-colors'}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile Bottom */}
            <div className="p-4 border-t border-slate-200 relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#f8fafc] cursor-pointer transition-colors text-[#374151]"
                >
                    {/* Avatar with initials */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-[#0f172a] truncate">
                            {user?.username || 'Loading...'}
                        </p>
                        <p className="text-xs text-[#64748b] truncate">
                            {user?.email || ''}
                        </p>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} style={{ fontSize: '20px' }}>
                        expand_more
                    </span>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 animate-in slide-in-from-bottom-2">
                        <div className="p-3 border-b border-slate-100">
                            <p className="text-xs font-bold text-[#0f172a] truncate">{user?.username}</p>
                            <p className="text-[11px] text-[#64748b] truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                            <button
                                onClick={() => { setMenuOpen(false); navigate('/health-profile') }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[#64748b]" style={{ fontSize: '18px' }}>settings</span>
                                Edit Profile
                            </button>
                            <button
                                onClick={() => { setMenuOpen(false); navigate('/dashboard') }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[#64748b]" style={{ fontSize: '18px' }}>dashboard</span>
                                Dashboard
                            </button>
                        </div>
                        <div className="border-t border-slate-100 py-1">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}
