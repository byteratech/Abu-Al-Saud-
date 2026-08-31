import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ActiveView } from './types';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SplashScreen } from './components/layout/SplashScreen';
import { Hero } from './components/home/Hero';
import { IntroStatement } from './components/home/IntroStatement';
import { JourneySection } from './components/home/JourneySection';
import { FeaturedSection } from './components/home/FeaturedSection';
import { TestimonialsSection } from './components/home/TestimonialsSection';
import { AboutView } from './components/about/AboutView';
import { SkillsView } from './components/skills/SkillsView';
import { ContentList } from './components/content/ContentList';
import { ArticleView } from './components/content/ArticleView';
import { ProjectsList } from './components/projects/ProjectsList';
import { CaseStudyView } from './components/projects/CaseStudyView';
import { ServicesView } from './components/services/ServicesView';
import { ContactView } from './components/contact/ContactView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FloatingWhatsAppButton } from './components/common/FloatingWhatsAppButton';

function AppContent() {
  const [activeView, setActiveView] = useState<ActiveView>({ type: 'home' });
  const [showSplash, setShowSplash] = useState(true);

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Sync state with browser hash routing for browser history support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === 'home') {
        setActiveView({ type: 'home' });
      } else if (hash === 'services') {
        setActiveView({ type: 'services' });
      } else if (hash === 'about') {
        setActiveView({ type: 'about' });
      } else if (hash === 'skills') {
        setActiveView({ type: 'skills' });
      } else if (hash === 'contact') {
        setActiveView({ type: 'contact' });
      } else if (hash === 'admin') {
        setActiveView({ type: 'admin' });
      } else if (hash.startsWith('content/')) {
        const slug = hash.replace('content/', '');
        setActiveView({ type: 'content', slug });
      } else if (hash === 'content') {
        setActiveView({ type: 'content' });
      } else if (hash.startsWith('projects/')) {
        const slug = hash.replace('projects/', '');
        setActiveView({ type: 'projects', slug });
      } else if (hash === 'projects') {
        setActiveView({ type: 'projects' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    let hash = 'home';
    if (view.type === 'services') hash = 'services';
    else if (view.type === 'about') hash = 'about';
    else if (view.type === 'skills') hash = 'skills';
    else if (view.type === 'contact') hash = 'contact';
    else if (view.type === 'admin') hash = 'admin';
    else if (view.type === 'content') hash = view.slug ? `content/${view.slug}` : 'content';
    else if (view.type === 'projects') hash = view.slug ? `projects/${view.slug}` : 'projects';
    
    window.location.hash = hash;
  };

  if (activeView.type === 'admin') {
    return (
      <div className="min-h-screen bg-[#080B12] text-[#F3F5F7] selection:bg-[#5B7CFA]/30 selection:text-[#FFFFFF]">
        <SplashScreen isVisible={showSplash} />
        <AdminDashboard setActiveView={navigateTo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F3F5F7] flex flex-col justify-between selection:bg-[#5B7CFA]/30 selection:text-[#FFFFFF]">
      
      <SplashScreen isVisible={showSplash} />

      {/* Navigation Bar */}
      <Navbar 
        activeView={activeView} 
        setActiveView={navigateTo} 
      />

      {/* Main View Container */}
      <main className="flex-1">
        
        {activeView.type === 'home' && (
          <>
            <Hero setActiveView={navigateTo} />
            <IntroStatement setActiveView={navigateTo} />
            <JourneySection setActiveView={navigateTo} />
            <FeaturedSection setActiveView={navigateTo} />
            <TestimonialsSection />
          </>
        )}

        {activeView.type === 'about' && (
          <AboutView setActiveView={navigateTo} />
        )}

        {activeView.type === 'skills' && (
          <SkillsView />
        )}

        {activeView.type === 'content' && !activeView.slug && (
          <ContentList 
            onSelectArticle={(slug) => {
              navigateTo({ type: 'content', slug });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        )}

        {activeView.type === 'content' && activeView.slug && (
          <ArticleView 
            slug={activeView.slug} 
            onBack={() => {
              navigateTo({ type: 'content' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectArticle={(slug) => {
              navigateTo({ type: 'content', slug });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView.type === 'projects' && !activeView.slug && (
          <ProjectsList 
            onSelectProject={(slug) => {
              navigateTo({ type: 'projects', slug });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        )}

        {activeView.type === 'projects' && activeView.slug && (
          <CaseStudyView 
            slug={activeView.slug} 
            onBack={() => {
              navigateTo({ type: 'projects' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        )}

        {activeView.type === 'services' && (
          <ServicesView />
        )}

        {activeView.type === 'contact' && (
          <ContactView />
        )}

      </main>

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsAppButton />

      {/* Footer */}
      <Footer setActiveView={navigateTo} />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
