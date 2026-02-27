import { useState, useEffect, useRef } from 'react';
import './HeroSection.css';

// ✏️ EDIT FOOD ITEMS HERE
// Each item: { id, name, tag, calories, score, image }
const foodItems = [
  // ── KEY ITEMS (featured center spotlight, indices 0–4) ──────────────────
  {
    id: 1,
    name: 'Avocado Toast',
    tag: 'High Protein Breakfast',
    calories: 320,
    score: 94,
    image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&q=80',
  },
  {
    id: 2,
    name: 'Greek Salad',
    tag: 'Mediterranean Bowl',
    calories: 210,
    score: 91,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  },
  {
    id: 3,
    name: 'Smoothie Bowl',
    tag: 'Antioxidant Boost',
    calories: 280,
    score: 96,
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&q=80',
  },
  {
    id: 4,
    name: 'Grilled Salmon',
    tag: 'Omega-3 Rich Dinner',
    calories: 450,
    score: 93,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
  },
  {
    id: 5,
    name: 'Overnight Oats',
    tag: 'Fiber-Rich Breakfast',
    calories: 380,
    score: 89,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  },
];

// ⚠️ ONLY USE FOOD/MEAL IMAGES HERE — no products, animals, or objects
const bgItems = [
  { id: 'b1', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=120&q=70', alt: 'Fresh fruits' },
  { id: 'b2', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&q=70', alt: 'Veggie bowl' },
  { id: 'b3', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=120&q=70', alt: 'Nuts' },
  { id: 'b4', image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=120&q=70', alt: 'Green juice' },
  { id: 'b5', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=70', alt: 'Salad bowl' },
  { id: 'b6', image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=120&q=70', alt: 'Almonds' },
  { id: 'b7', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=120&q=70', alt: 'Orange slices' },
  { id: 'b8', image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=120&q=70', alt: 'Eggs & toast' },
  { id: 'b9', image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Strawberry smoothie' },
  { id: 'b10', image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=120&q=70', alt: 'Broccoli' },
  { id: 'b11', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=120&q=70', alt: 'Banana' },
  { id: 'b12', image: 'https://plus.unsplash.com/premium_photo-1675964349915-4a915535060c?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Green smoothie' },
  { id: 'b13', image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=120&q=70', alt: 'Walnuts' },
  { id: 'b14', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=120&q=70', alt: 'Lemon' },
  { id: 'b15', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=120&q=70', alt: 'Berry parfait' },
];

// Diet tag color map
const tagColors: Record<string, string> = {
  'High Protein Breakfast': '#f59e0b',
  'Mediterranean Bowl': '#3b82f6',
  'Antioxidant Boost': '#a855f7',
  'Omega-3 Rich Dinner': '#06b6d4',
  'Fiber-Rich Breakfast': '#22c55e',
};

import { useNavigate } from 'react-router-dom';
import { PageWrapper } from './PageWrapper';

export function HeroSection() {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = foodItems[activeIdx];

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % foodItems.length);
        setTransitioning(false);
      }, 350);
    }, 3500);
  };

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Circular progress helper
  const scoreRadius = 22;
  const scoreCirc = 2 * Math.PI * scoreRadius;
  const scoreDash = scoreCirc * (1 - current.score / 100);

  return (
    <PageWrapper>
      {/* Landing Page Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 z-50 flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-green-500" style={{ fontSize: '28px' }}>eco</span>
          <span className="font-bold text-xl text-slate-800 tracking-tight">NutriAI</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Sign In</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-bold bg-green-500 text-white px-5 py-2.5 rounded-full hover:bg-green-600 transition-all shadow-sm">
            Get Started
          </button>
        </div>
      </nav>

      <section className="hero-section" style={{ paddingTop: '64px' }}>
        {/* Background glow blobs */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="hero-inner">
          {/* ════════════════════════════
            LEFT — text content
            ════════════════════════════ */}
          <div className="hero-left">
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              AI-Powered Nutrition
            </div>

            <h1 className="hero-headline">
              <span className="hero-headline-dark">Eat Smarter, Live</span>
              <br />
              <span className="hero-headline-gradient">Healthier Every Day</span>
            </h1>

            <p className="hero-subtext">
              Get personalized meal plans powered by local AI. Tell us your goals,
              allergies, and preferences — we'll handle the rest.
            </p>

            <button
              className="hero-cta"
              onClick={() => navigate('/dashboard')}
            >
              Get My Diet Plan →
            </button>

            <div className="hero-trust">
              🔒 Powered by Local AI · Your data stays private
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">500+</span>
                <span className="hero-stat-label">Meal Recipes</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">100%</span>
                <span className="hero-stat-label">Private & Local</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">7-Day</span>
                <span className="hero-stat-label">Meal Plans</span>
              </div>
            </div>
          </div>

          {/* ════════════════════════════
            RIGHT — animated food field
            ════════════════════════════ */}
          <div className="hero-right">
            <div className="food-field">

              {/* Floating background food items */}
              {bgItems.map((item, i) => (
                <div
                  key={item.id}
                  className="food-bg-item"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <img src={item.image} alt={item.alt} loading="lazy" />
                </div>
              ))}

              {/* ── CENTER SPOTLIGHT ── */}
              <div className="food-spotlight">

                {/* Top bubble — meal name + diet tag */}
                <div className={`food-bubble food-bubble-top${transitioning ? ' bubble-exit' : ''}`}>
                  <span className="food-bubble-name">{current.name}</span>
                  <span
                    className="food-bubble-tag"
                    style={{
                      backgroundColor: tagColors[current.tag] + '22',
                      color: tagColors[current.tag],
                    }}
                  >
                    {current.tag}
                  </span>
                </div>

                {/* Main spotlight image */}
                <div className={`food-spotlight-img-wrap${transitioning ? ' img-exit' : ''}`}>
                  <img
                    key={current.id}
                    src={current.image}
                    alt={current.name}
                    className="food-spotlight-img"
                  />
                  <div className="food-ring food-ring-1" />
                  <div className="food-ring food-ring-2" />
                </div>

                {/* Left bubble — calories */}
                <div className={`food-bubble food-bubble-left${transitioning ? ' bubble-exit' : ''}`}>
                  <span className="bubble-icon">🔥</span>
                  <div>
                    <div className="bubble-label">Calories</div>
                    <div className="bubble-value">{current.calories} kcal</div>
                  </div>
                </div>

                {/* Right bubble — nutrition score */}
                <div className={`food-bubble food-bubble-right${transitioning ? ' bubble-exit' : ''}`}>
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle
                      cx="26" cy="26" r={scoreRadius}
                      fill="none" stroke="#e5e7eb" strokeWidth="4"
                    />
                    <circle
                      cx="26" cy="26" r={scoreRadius}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={scoreCirc}
                      strokeDashoffset={scoreDash}
                      transform="rotate(-90 26 26)"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                    <text
                      x="26" y="30"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill="#16a34a"
                    >
                      {current.score}
                    </text>
                  </svg>
                  <div>
                    <div className="bubble-label">Nutrition</div>
                    <div className="bubble-value" style={{ color: '#16a34a' }}>Score</div>
                  </div>
                </div>

              </div>
              {/* ── THUMBNAIL PICKER — hidden visually, rotation still works via interval ── */}

            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}