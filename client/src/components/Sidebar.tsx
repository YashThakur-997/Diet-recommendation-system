import { Link, useLocation } from 'react-router-dom'

export function Sidebar() {
    const location = useLocation()

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
            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f8fafc] cursor-pointer transition-colors text-[#374151]">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative border border-slate-200">
                        <img
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2Foj2ALR7y132-1P1wzMkY2FYcGsO58kHJc2l9S-pO01IfH8TH6WjRMydBVWaBeaErGfMC7VkfSMQ0qOoFaZZeDp91fIDI4ZaSxx2dV89vIxlpYdV49LzEwI4-anVQfoV5VJIcneNdFk5W9vnN1CzqYDfJuJ8tG56y6bTwoAQUT0bnBsAosOgkpK7EV1LEqj6AlvabsFYKFawvhOgQsp86wFzXdSLYdC7CedLX6fMXWAnTU6-StfDs4aqXi2_y9TZpaBf-TyuPJ9I"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0f172a] truncate">Rahul S.</p>
                        <p className="text-xs text-[#64748b] truncate">Pro Member</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '20px' }}>more_vert</span>
                </div>
            </div>
        </aside>
    )
}
