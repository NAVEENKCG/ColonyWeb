import React, { useState, useEffect } from 'react';
import { Building2, ArrowRight, UserPlus, LogIn, Shield, Home, Sparkles, ClipboardList, Megaphone } from 'lucide-react';

interface WelcomeScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateToRegister,
  onNavigateToLogin,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4">
      <main className="w-full max-w-md bg-[#F4F7F6] min-h-screen sm:min-h-[850px] sm:max-h-[920px] sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 relative overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Top Hero Section */}
        <section
          id="welcome-hero"
          className="relative bg-[#08424D] px-6 pt-14 pb-10 overflow-hidden"
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(14,165,233,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(5,150,105,0.15) 0%, transparent 50%)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Brand Icon */}
            <div
              className={`w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center shadow-lg mb-5 transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.2)' }}
            >
              <Building2 className="w-8 h-8 text-white stroke-[1.75]" />
            </div>

            {/* Title */}
            <h1
              className={`text-3xl font-extrabold text-white tracking-tight leading-tight transition-all duration-500 ease-out delay-75 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Colony Connect
            </h1>
            <p
              className={`text-sm text-teal-100/80 font-medium mt-1.5 leading-relaxed transition-all duration-500 ease-out delay-100 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Community Grievance & Notice Portal
              <br />
              <span className="text-teal-100/60 text-xs">சமூக புகார் & அறிவிப்பு தளம்</span>
            </p>
          </div>
        </section>

        {/* Content Body */}
        <div className="flex-1 px-5 -mt-4 space-y-5 pb-8">
          {/* Feature Cards */}
          <div
            className={`space-y-2.5 transition-all duration-500 ease-out delay-150 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Resident Feature */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-[#08424D]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">For Residents</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  File complaints, track status & get updates
                </p>
                <p className="text-[10px] text-slate-400 font-medium">புகார் செய்க, நிலையை கண்காணிக்கவும்</p>
              </div>
            </div>

            {/* Committee Feature */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">For Committee</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage complaints, assign & broadcast notices
                </p>
                <p className="text-[10px] text-slate-400 font-medium">புகார்களை நிர்வகிக்கவும், அறிவிப்புகள்</p>
              </div>
            </div>

            {/* Bilingual Feature */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">Bilingual Support</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  English & Tamil — இருமொழி ஆதரவு
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div
            className={`grid grid-cols-3 gap-2 transition-all duration-500 ease-out delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <ClipboardList className="w-5 h-5 text-[#08424D] mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">Complaints</p>
              <p className="text-[10px] text-slate-400 font-medium">புகார்கள்</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <Megaphone className="w-5 h-5 text-[#08424D] mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">Notices</p>
              <p className="text-[10px] text-slate-400 font-medium">அறிவிப்புகள்</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <Shield className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">Secure</p>
              <p className="text-[10px] text-slate-400 font-medium">பாதுகாப்பானது</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div
            className={`space-y-3 pt-2 transition-all duration-500 ease-out delay-250 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Primary: Create Account */}
            <button
              id="welcome-register-button"
              onClick={onNavigateToRegister}
              className="w-full bg-[#08424D] hover:bg-[#06333c] active:scale-[0.99] text-white py-4 px-5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-white stroke-[2]" />
              <div className="text-center">
                <div className="text-sm font-bold leading-tight">Create Account</div>
                <div className="text-[10px] text-teal-100/80 font-medium leading-tight">கணக்கை உருவாக்கு</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-teal-200" />
            </button>

            {/* Secondary: Sign In */}
            <button
              id="welcome-login-button"
              onClick={onNavigateToLogin}
              className="w-full bg-white hover:bg-slate-50 active:scale-[0.99] text-[#08424D] py-4 px-5 rounded-2xl shadow-sm border border-slate-200 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-[#08424D] stroke-[2]" />
              <div className="text-center">
                <div className="text-sm font-bold leading-tight">Sign In</div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">உள்நுழைக</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
            </button>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed font-medium pt-2">
            Secure community portal for residents & management.
            <br />
            பாதுகாப்பான சமூக தளம்.
          </p>
        </div>
      </main>
    </div>
  );
};

export default WelcomeScreen;
