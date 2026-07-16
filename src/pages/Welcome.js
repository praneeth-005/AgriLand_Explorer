import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simple scroll effect for navbar glassmorphism intensity
    const handleScroll = () => {
        const nav = document.querySelector('nav');
        if (nav) {
            if (window.scrollY > 20) {
                nav.classList.add('shadow-md');
                nav.classList.remove('border-transparent');
            } else {
                nav.classList.remove('shadow-md');
            }
        }
    };
    
    window.addEventListener('scroll', handleScroll);

    // Entrance animations for features
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.glass-card').forEach(el => {
        el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
        observer.observe(el);
    });

    return () => {
        window.removeEventListener('scroll', handleScroll);
        observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm flex justify-between items-center px-10 h-20 transition-all">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary">AgriLand Explorer</h1>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <a className="font-label-md text-label-md text-primary transition-colors hover:opacity-70" href="#">Explorer</a>
          <a className="font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary" href="#">Features</a>
          <a className="font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary" href="#">About</a>
          <a className="font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary" href="#">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="font-label-md text-label-md text-primary px-6 py-2 rounded-lg border border-primary hover:bg-primary/5 transition-all active:scale-95"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="font-label-md text-label-md bg-primary-container text-on-primary-container px-6 py-2.5 rounded-lg font-semibold shadow-md hover:brightness-105 transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex flex-col items-center justify-center overflow-hidden">
          {/* Hero Image Background */}
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover" 
              alt="High-resolution cinematic wide shot of lush green agricultural fields during a crisp, clear morning. The view shows expansive, perfectly aligned crop rows with advanced precision farming equipment or drones visible in the distance." 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBsuUIH9STVW03xbts_T5ZrBzaKmiCdj_CtLUbUNajHIU_-GI4MhInfWqmGp6I5MTAFeEwOD9_bhQnyLprnobDMsQZt-69WYKeVVzQ0pxaghYOaa7l-Mdq-xH0Qq3IuMOQcVz8JzNYSll5F_E61JZv__6hDB_QiPuyyc7kTrIpYKWUCl9_miqJAsv4ERmwwLpXWQQlPTOiS6uCsVOCGyzOEJ8ylcUTz-wxJI0r7TsmumVRI6L1RGM4"
            />
            <div className="absolute inset-0 hero-gradient-overlay"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-margin-mobile text-center pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-md mb-8 animate-fade-in">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Next-Gen Satellite Precision</span>
            </div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-6 tracking-tight">
              Map, Manage, and Navigate your <span className="text-primary">Farmlands</span> with Precision
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto mb-10 leading-relaxed">
              Empowering farmers and land managers with high-resolution satellite mapping, boundary identification, and real-time navigation. Transform your operational efficiency with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto min-w-[200px] h-14 bg-primary text-white font-title-md text-title-md rounded-xl shadow-lg hover:shadow-primary/25 hover:brightness-110 transition-all active:scale-[0.98]"
              >
                Get Started
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto min-w-[200px] h-14 bg-white/50 backdrop-blur-md border border-outline/30 text-on-surface font-title-md text-title-md rounded-xl hover:bg-white/80 transition-all active:scale-[0.98]"
              >
                Log In
              </button>
            </div>
          </div>

          {/* Floating Element: Data Visualization */}
          <div className="absolute bottom-10 right-10 hidden xl:block animate-bounce-slow">
            <div className="glass-card p-6 rounded-2xl shadow-2xl w-64 border-white/40">
              <div className="flex justify-between items-center mb-4">
                <span className="font-label-md text-on-surface-variant uppercase tracking-wider">Plot Yield</span>
                <span className="material-symbols-outlined text-primary">trending_up</span>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-3/4"></div>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container w-1/2"></div>
                </div>
                <div className="flex justify-between mt-2 font-label-sm text-on-surface-variant">
                  <span>Efficiency</span>
                  <span className="font-bold text-primary">+12.4%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-surface-container-low relative">
          <div className="max-w-7xl mx-auto px-margin-mobile">
            <div className="text-center mb-16">
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-4">Unified Field Intelligence</h3>
              <div className="h-1.5 w-20 bg-primary-container mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="glass-card p-8 rounded-3xl group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface mb-3">Precision Mapping</h4>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Access high-resolution satellite data with sub-meter accuracy. Mark boundaries with absolute precision and define clear operational zones for your entire property.
                </p>
                <div className="mt-8 flex items-center text-primary font-label-md gap-2 cursor-pointer hover:underline">
                  Explore maps <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="glass-card p-8 rounded-3xl group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-secondary-container/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface mb-3">Smart Management</h4>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Monitor critical metrics including soil health, moisture levels, and historical yield patterns. Make informed decisions powered by real-time sensor integration.
                </p>
                <div className="mt-8 flex items-center text-secondary font-label-md gap-2 cursor-pointer hover:underline">
                  View analytics <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="glass-card p-8 rounded-3xl group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-tertiary-container/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>near_me</span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface mb-3">Field Navigation</h4>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Seamless turn-by-turn directions directly to specific land plots. Save time and fuel by navigating optimized routes across complex terrain and large acreages.
                </p>
                <div className="mt-8 flex items-center text-tertiary font-label-md gap-2 cursor-pointer hover:underline">
                  Start navigating <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / Proof Section */}
        <section className="py-20 bg-inverse-surface text-inverse-on-surface overflow-hidden">
          <div className="max-w-7xl mx-auto px-margin-mobile grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary-fixed">500k+</p>
              <p className="font-label-md text-surface-variant opacity-70">Acres Managed</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary-fixed">15%</p>
              <p className="font-label-md text-surface-variant opacity-70">Resource Savings</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary-fixed">0.5m</p>
              <p className="font-label-md text-surface-variant opacity-70">Map Precision</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary-fixed">24/7</p>
              <p className="font-label-md text-surface-variant opacity-70">Support Available</p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-margin-mobile relative">
          <div className="max-w-5xl mx-auto glass-card rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Background decorative shape */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl"></div>
            
            <h2 className="font-headline-lg text-headline-lg md:text-5xl text-on-surface mb-8">Ready to modernize your operations?</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-2xl mx-auto">
              Join thousands of land managers who are already optimizing their growth with AgriLand Explorer. Get your personalized demo today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/login')}
                className="px-10 py-5 bg-primary text-white rounded-2xl font-title-md text-title-md shadow-xl hover:shadow-primary/30 transition-all"
              >
                Request a Demo
              </button>
              <button 
                className="px-10 py-5 border-2 border-outline/20 hover:bg-surface-container transition-all rounded-2xl font-title-md text-title-md"
              >
                View Pricing
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest py-16 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-margin-mobile grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <h2 className="font-title-md text-title-md font-bold text-primary">AgriLand Explorer</h2>
            </div>
            <p className="text-on-surface-variant font-body-md mb-6 leading-relaxed">
              The leading platform for modern precision agriculture and intelligent land mapping.
            </p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform" href="#">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform" href="#">
                <span className="material-symbols-outlined">share</span>
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-label-md text-on-surface font-bold uppercase tracking-wider mb-6">Product</h5>
            <ul className="space-y-4 font-body-md text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Satellite Maps</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Precision Soil</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Fleet Tracking</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Marketplace</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-md text-on-surface font-bold uppercase tracking-wider mb-6">Company</h5>
            <ul className="space-y-4 font-body-md text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-md text-on-surface font-bold uppercase tracking-wider mb-6">Newsletter</h5>
            <p className="text-on-surface-variant font-body-md mb-4">Stay updated with the latest in agritech.</p>
            <div className="flex gap-2">
              <input className="bg-white border-outline-variant rounded-lg px-4 py-2 w-full focus:ring-primary focus:border-primary" placeholder="Your email" type="email" />
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:brightness-110">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-margin-mobile mt-16 pt-8 border-t border-white/10 text-center text-on-surface-variant font-label-sm">
          © 2024 AgriLand Explorer. All rights reserved. Precision technology for a sustainable future.
        </div>
      </footer>
    </div>
  );
}
