import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ScrollGallery } from './components/ScrollGallery.tsx';
import { DashboardContainer } from './components/DashboardContainer.tsx';
import { Footer } from './components/Footer.tsx';
import { UploadModal } from './components/UploadModal.tsx';
import { Sparkles, ArrowUp } from 'lucide-react';

const VALID_DASHBOARD_TABS = [
  'overview',
  'transactions',
  'categories',
  'budgets',
  'insights',
  'reports',
  'settings',
];

export function App() {
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('overview');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const isManualNavRef = useRef<boolean>(false);
  const manualNavTimerRef = useRef<number | null>(null);

  // Suppress IntersectionObserver during smooth programmatic scrolling
  const setManualNavActive = useCallback(() => {
    isManualNavRef.current = true;
    if (manualNavTimerRef.current) {
      window.clearTimeout(manualNavTimerRef.current);
    }
    manualNavTimerRef.current = window.setTimeout(() => {
      isManualNavRef.current = false;
    }, 850);
  }, []);

  // 1. Overview / Home Navigation
  const handleNavigateHome = useCallback(() => {
    setManualNavActive();
    setActiveSection('overview');
    window.history.replaceState(null, '', '#home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setManualNavActive]);

  // 2. Your Money Navigation (Open/Scroll to transactions & spending ledger)
  const handleNavigateYourMoney = useCallback(() => {
    setManualNavActive();
    setActiveSection('your-money');
    setDashboardOpen(true);
    setCurrentTab('transactions');
    window.history.replaceState(null, '', '#transactions');
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, [setManualNavActive]);

  // 3. Insights Navigation (Open/Scroll to spending anomaly radar & narratives)
  const handleNavigateInsights = useCallback(() => {
    setManualNavActive();
    setActiveSection('insights');
    setDashboardOpen(true);
    setCurrentTab('insights');
    window.history.replaceState(null, '', '#insights');
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, [setManualNavActive]);

  // 4. How It Works Navigation (Scroll smoothly to 5-stage motion story gallery)
  const handleNavigateHowItWorks = useCallback(() => {
    setManualNavActive();
    setActiveSection('how-it-works');
    window.history.replaceState(null, '', '#gallery');
    const el = document.getElementById('gallery') || document.getElementById('process');
    el?.scrollIntoView({ behavior: 'smooth' });
  }, [setManualNavActive]);

  // 5. Live Dashboard Navigation (Open console and scroll to dashboard)
  const handleNavigateDashboard = useCallback(() => {
    setManualNavActive();
    setActiveSection('dashboard');
    setDashboardOpen(true);
    window.history.replaceState(null, '', '#dashboard');
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, [setManualNavActive]);

  // Arbitrary Tab Change in Dashboard
  const handleTabChange = useCallback((tab: string) => {
    setManualNavActive();
    setDashboardOpen(true);
    setCurrentTab(tab);
    if (tab === 'insights') {
      setActiveSection('insights');
    } else if (tab === 'transactions') {
      setActiveSection('your-money');
    } else {
      setActiveSection('dashboard');
    }
    window.history.replaceState(null, '', `#${tab}`);
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, [setManualNavActive]);

  // Bottom dock toggle: shows / hides dashboard panel
  const toggleDashboard = useCallback(() => {
    setDashboardOpen((prev) => {
      const next = !prev;
      if (next) {
        setManualNavActive();
        setTimeout(() => {
          dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
      return next;
    });
  }, [setManualNavActive]);

  // CSV Upload Actions
  const handleOpenUpload = useCallback(() => {
    setIsUploadOpen(true);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    setIsUploadOpen(false);
    setRefreshTrigger((prev) => prev + 1);
    setDashboardOpen(true);
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }, []);

  const scrollToTop = useCallback(() => {
    handleNavigateHome();
  }, [handleNavigateHome]);

  // Direct Hash and Page Refresh Routing
  useEffect(() => {
    const handleHash = () => {
      const raw = window.location.hash.replace('#', '').toLowerCase();
      if (!raw || raw === 'home' || raw === 'overview') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('overview');
        return;
      }

      if (raw === 'gallery' || raw === 'how-it-works' || raw === 'process') {
        const el = document.getElementById('gallery');
        el?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection('how-it-works');
      } else if (raw === 'your-money' || raw === 'transactions') {
        setDashboardOpen(true);
        setCurrentTab('transactions');
        setActiveSection('your-money');
        setTimeout(() => {
          dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else if (raw === 'insights') {
        setDashboardOpen(true);
        setCurrentTab('insights');
        setActiveSection('insights');
        setTimeout(() => {
          dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else if (raw === 'dashboard') {
        setDashboardOpen(true);
        setActiveSection('dashboard');
        setTimeout(() => {
          dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else if (VALID_DASHBOARD_TABS.includes(raw)) {
        setDashboardOpen(true);
        setCurrentTab(raw);
        setActiveSection(raw === 'insights' ? 'insights' : raw === 'transactions' ? 'your-money' : 'dashboard');
        setTimeout(() => {
          dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        const el = document.getElementById(raw);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Route on initial mount if hash is present
    if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '#home') {
      handleHash();
    }

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // IntersectionObserver: Track visible section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualNavRef.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === 'home') {
              setActiveSection('overview');
            } else if (id === 'gallery' || id === 'process') {
              setActiveSection('how-it-works');
            } else if (id === 'dashboard') {
              if (currentTab === 'insights') {
                setActiveSection('insights');
              } else if (currentTab === 'transactions') {
                setActiveSection('your-money');
              } else {
                setActiveSection('dashboard');
              }
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1,
      }
    );

    const homeEl = document.getElementById('home');
    const galleryEl = document.getElementById('gallery');
    const dashboardEl = document.getElementById('dashboard');

    if (homeEl) observer.observe(homeEl);
    if (galleryEl) observer.observe(galleryEl);
    if (dashboardEl) observer.observe(dashboardEl);

    return () => observer.disconnect();
  }, [dashboardOpen, currentTab]);

  return (
    <div className="prism relative min-h-svh bg-black text-white antialiased overflow-x-hidden selection:bg-white/25 selection:text-white">
      {/* Top Floating Glass Pill Navbar */}
      <Navbar
        onNavigateHome={handleNavigateHome}
        onNavigateYourMoney={handleNavigateYourMoney}
        onNavigateInsights={handleNavigateInsights}
        onNavigateHowItWorks={handleNavigateHowItWorks}
        onNavigateDashboard={handleNavigateDashboard}
        onOpenUpload={handleOpenUpload}
        activeSection={activeSection}
      />

      <main className="relative z-10 flex flex-col">
        {/* Full-Screen Video Hero with Rising Headline */}
        <Hero
          onOpenDashboard={handleNavigateDashboard}
          onOpenUpload={handleOpenUpload}
          onNavigateGallery={handleNavigateHowItWorks}
          onNavigateTab={handleTabChange}
        />

        {/* User Parallax Motion Scroll Gallery (#001 - #005 with progress bar) */}
        <ScrollGallery
          onOpenUpload={handleOpenUpload}
          onOpenDashboard={handleNavigateDashboard}
        />

        {/* Live Spend Command Center (Interactive Dashboard) */}
        {dashboardOpen && (
          <div ref={dashboardRef} id="dashboard" className="animate-in fade-in zoom-in-95 duration-500 scroll-mt-24">
            <DashboardContainer
              currentTab={currentTab}
              onTabChange={handleTabChange}
              onOpenUpload={handleOpenUpload}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {/* Minimal Clean Footer */}
        <Footer
          onNavigateHome={handleNavigateHome}
          onNavigateYourMoney={handleNavigateYourMoney}
          onNavigateInsights={handleNavigateInsights}
          onNavigateHowItWorks={handleNavigateHowItWorks}
          onNavigateDashboard={handleNavigateDashboard}
          onOpenUpload={handleOpenUpload}
        />
      </main>

      {/* Floating Bottom Quick Action Dock */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={toggleDashboard}
          className="liquid-glass-strong px-4 py-2 rounded-full text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 border border-white/20 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer backdrop-blur-xl"
        >
          <Sparkles className="size-3.5 text-white/80" />
          <span>{dashboardOpen ? 'Hide Dashboard' : 'Open Live Analyzer'}</span>
        </button>

        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="liquid-glass size-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
        >
          <ArrowUp className="size-3.5" />
        </button>
      </div>

      {/* Centralized Upload CSV Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default App;
