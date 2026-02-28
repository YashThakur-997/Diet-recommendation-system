import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HeroSection } from './components/HeroSection'
import { Dashboard } from './components/Dashboard'
import { MealPlan } from './components/MealPlan'
import { HealthProfile } from './components/HealthProfile'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { Wearables } from './pages/Wearables'
import './App.css'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HeroSection />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/health-profile" element={<HealthProfile />} />
        <Route path="/wearables" element={<Wearables />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app bg-background-light dark:bg-background-dark min-h-screen">
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  )
}

export default App
