import React, { useState, useRef, useEffect } from 'react';
import { Building2, ArrowLeft, ArrowRight, KeyRound, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onBack,
}) => {
  const { lookupUser, sendOtp, login } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otpSent && otpRefs.current[0]) {
      otpRefs.current[0]?.focus();
    }
  }, [otpSent]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Lookup user first
      const user = await lookupUser(phoneNumber);
      if (!user) {
        setErrorMsg('No account found with this number. Please register first.');
        setIsLoading(false);
        return;
      }

      setFoundUser(user);

      // Request server-generated OTP
      const result = await sendOtp(phoneNumber, 'login');
      setDemoCode(result.demoCode || null);
      setOtpSent(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    if (value && index < 3 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpCode.join('');
    if (enteredOtp.length < 4) {
      setErrorMsg('Please enter the 4-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Server validates the OTP and returns session token
      const user = await login(phoneNumber, enteredOtp);
      onLoginSuccess(user);
    } catch (error: any) {
      setErrorMsg(error.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4">
      <main className="w-full max-w-md bg-[#F4F7F6] min-h-screen sm:min-h-[850px] sm:max-h-[920px] sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 relative overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Top Header — matches TopHeader style */}
        <header className="sticky top-0 z-30 bg-[#F4F7F6]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-200/50">
          <button
            id="login-back-button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-bold text-[#08424D] active:scale-[0.96] transition-transform"
            aria-label="Go back to welcome"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>

          <div className="w-10 h-10 rounded-full bg-[#08424D] text-white flex items-center justify-center shadow">
            <LogIn className="w-5 h-5" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-5 pt-6 pb-8 flex flex-col">
          {/* Brand */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-[#08424D] rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/10 mb-4">
              <Building2 className="w-7 h-7 text-white stroke-[1.75]" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-600 mt-1 text-center font-medium">
              Sign in to your account / <span className="text-slate-500">உள்நுழைக</span>
            </p>
          </div>

          {/* Card */}
          <div className="w-full bg-white/90 backdrop-blur-sm border border-slate-100 rounded-3xl p-6 shadow-sm">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-phone-input"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Phone Number / <span className="text-slate-500">தொலைபேசி எண்</span>
                  </label>
                  <div className="flex items-center border-2 border-[#08424D] rounded-xl px-3.5 py-3 bg-white gap-3 focus-within:ring-2 focus-within:ring-teal-500/30">
                    <span className="text-sm font-bold text-slate-800 tracking-tight">+91</span>
                    <div className="h-5 w-px bg-slate-300" />
                    <input
                      id="login-phone-input"
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                        setErrorMsg('');
                      }}
                      placeholder="10-digit mobile number"
                      className="w-full text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none bg-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{errorMsg}</p>
                      {errorMsg.includes('register') && (
                        <button
                          type="button"
                          onClick={onNavigateToRegister}
                          className="text-[#08424D] font-bold underline underline-offset-2 mt-1 hover:text-[#06333c]"
                        >
                          Create Account →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <button
                  id="login-send-otp-button"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#08424D] hover:bg-[#06333c] text-white py-3.5 rounded-2xl shadow font-bold text-sm flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? 'Sending...' : 'Send OTP'}</span>
                  <span className="text-[10px] text-teal-100 font-medium">ஓடிபி அனுப்புக</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* User found info */}
                {foundUser && (
                  <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl px-3.5 py-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-[#08424D] text-white flex items-center justify-center font-bold text-base">
                      {foundUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{foundUser.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {foundUser.flatNumber}, {foundUser.block} •{' '}
                        <span className="font-semibold text-[#08424D] capitalize">{foundUser.role}</span>
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Enter OTP / <span className="text-slate-500">ஓடிபி எண்</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode(['', '', '', '']);
                        setFoundUser(null);
                        setDemoCode(null);
                        setErrorMsg('');
                      }}
                      className="text-xs text-[#08424D] font-bold underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Code sent to +91 {phoneNumber}{' '}
                    {demoCode && <span className="text-slate-400">(Demo: {demoCode})</span>}
                  </p>

                  <div className="flex justify-between gap-2.5 my-2">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`login-otp-${index}`}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpCode[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-14 text-center text-xl font-extrabold border-2 border-slate-300 focus:border-[#08424D] rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08424D]/20 transition"
                      />
                    ))}
                  </div>
                </div>

                {errorMsg && <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>}

                <button
                  id="login-verify-button"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#08424D] hover:bg-[#06333c] text-white py-3.5 rounded-2xl shadow font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Sign In / உள்நுழைக'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <button
                id="login-to-register-link"
                onClick={onNavigateToRegister}
                className="text-[#08424D] font-bold underline underline-offset-2 hover:text-[#06333c] transition"
              >
                Create Account / கணக்கை உருவாக்கு
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginScreen;
