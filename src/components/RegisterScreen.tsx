import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Building,
  Shield,
  Home,
  CheckCircle2,
  KeyRound,
  Building2,
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface RegisterScreenProps {
  onRegisterSuccess: (user: UserType) => void;
  onNavigateToLogin: () => void;
  onBack: () => void;
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = [
  { en: 'Personal Info', ta: 'தனிப்பட்ட தகவல்' },
  { en: 'Flat Details', ta: 'பிளாட் விவரம்' },
  { en: 'Account Type', ta: 'கணக்கு வகை' },
  { en: 'Verify OTP', ta: 'OTP சரிபார்' },
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  onBack,
}) => {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [block, setBlock] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('resident');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 4 && otpRefs.current[0]) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const goToStep = (target: Step) => {
    setErrorMsg('');
    setStep(target);
  };

  const handleStep1Next = () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    goToStep(2);
  };

  const handleStep2Next = () => {
    if (!flatNumber.trim()) {
      setErrorMsg('Please enter your flat number.');
      return;
    }
    if (!block.trim()) {
      setErrorMsg('Please enter your block name.');
      return;
    }
    goToStep(3);
  };

  const handleStep3Next = () => {
    goToStep(4);
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

  const handleVerifyAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpCode.join('');
    if (enteredOtp.length < 4) {
      setErrorMsg('Please enter the 4-digit verification code.');
      return;
    }
    if (enteredOtp !== '1234') {
      setErrorMsg('Invalid OTP. Demo code is 1234.');
      return;
    }

    const newUser: UserType = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      phone: phone,
      flatNumber: flatNumber.trim(),
      block: block.trim(),
      role: selectedRole,
    };

    onRegisterSuccess(newUser);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-1.5 mb-5">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-400 ease-out ${
              s <= step ? 'bg-[#08424D]' : 'bg-transparent'
            }`}
            style={{ width: s <= step ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>
  );

  const renderStepLabel = () => {
    const label = STEP_LABELS[step - 1];
    return (
      <div className="mb-4">
        <p className="text-[11px] font-bold text-[#08424D] uppercase tracking-widest">
          Step {step} of 4
        </p>
        <h2 className="text-xl font-extrabold text-slate-900 mt-1 tracking-tight">
          {label.en}
        </h2>
        <p className="text-xs text-slate-500 font-medium">{label.ta}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4">
      <main className="w-full max-w-md bg-[#F4F7F6] min-h-screen sm:min-h-[850px] sm:max-h-[920px] sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 relative overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Top Header — matches TopHeader style */}
        <header className="sticky top-0 z-30 bg-[#F4F7F6]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-200/50">
          <button
            id="register-back-button"
            onClick={() => (step > 1 ? goToStep((step - 1) as Step) : onBack())}
            className="flex items-center gap-1.5 text-sm font-bold text-[#08424D] active:scale-[0.96] transition-transform"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            {step > 1 ? 'Back' : 'Home'}
          </button>

          <div className="w-10 h-10 rounded-full bg-[#08424D] text-white flex items-center justify-center shadow">
            <Building2 className="w-5 h-5" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-5 pt-4 pb-8">
          {/* Progress Indicator */}
          {renderStepIndicator()}

          {/* Form Card — matches app's white card style */}
          <div className="w-full bg-white/90 backdrop-blur-sm border border-slate-100 rounded-3xl p-6 shadow-sm">
            {renderStepLabel()}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleStep1Next(); }} className="space-y-4">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name / <span className="text-slate-500">முழு பெயர்</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="reg-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rajendran N."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#08424D] focus:ring-2 focus:ring-[#08424D]/20 transition"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number / <span className="text-slate-500">தொலைபேசி எண்</span>
                  </label>
                  <div className="flex items-center border-2 border-[#08424D] rounded-xl px-3.5 py-3 bg-white gap-3 focus-within:ring-2 focus-within:ring-teal-500/30">
                    <span className="text-sm font-bold text-slate-800 tracking-tight">+91</span>
                    <div className="h-5 w-px bg-slate-300" />
                    <input
                      id="reg-phone"
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {errorMsg && <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>}

                <button
                  id="reg-step1-next"
                  type="submit"
                  className="w-full bg-[#08424D] hover:bg-[#06333c] text-white py-3.5 rounded-2xl shadow font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2: Flat Details */}
            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); handleStep2Next(); }} className="space-y-4">
                <div>
                  <label htmlFor="reg-flat" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Flat Number / <span className="text-slate-500">பிளாட் எண்</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="reg-flat"
                      type="text"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder="e.g. B-402"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#08424D] focus:ring-2 focus:ring-[#08424D]/20 transition"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-block" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Block / <span className="text-slate-500">பிரிவு</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="reg-block"
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="e.g. Block B"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#08424D] focus:ring-2 focus:ring-[#08424D]/20 transition"
                    />
                  </div>
                </div>

                {errorMsg && <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>}

                <button
                  id="reg-step2-next"
                  type="submit"
                  className="w-full bg-[#08424D] hover:bg-[#06333c] text-white py-3.5 rounded-2xl shadow font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 3: Role Selection */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Choose how you'll use Colony Connect. This determines your dashboard and permissions.
                </p>

                <div className="space-y-3">
                  {/* Resident Card */}
                  <button
                    id="reg-role-resident"
                    type="button"
                    onClick={() => setSelectedRole('resident')}
                    className={`w-full text-left rounded-2xl p-4 border-2 transition-all active:scale-[0.99] ${
                      selectedRole === 'resident'
                        ? 'border-[#08424D] bg-teal-50/80 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                          selectedRole === 'resident'
                            ? 'bg-[#08424D] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Home className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">Resident</h3>
                          {selectedRole === 'resident' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">குடியிருப்பாளர்</p>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          File complaints, track resolution status, view community notices.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Committee Card */}
                  <button
                    id="reg-role-committee"
                    type="button"
                    onClick={() => setSelectedRole('committee')}
                    className={`w-full text-left rounded-2xl p-4 border-2 transition-all active:scale-[0.99] ${
                      selectedRole === 'committee'
                        ? 'border-[#08424D] bg-teal-50/80 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                          selectedRole === 'committee'
                            ? 'bg-[#08424D] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">Committee</h3>
                          {selectedRole === 'committee' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">நிர்வாகக் குழு</p>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          Manage all complaints, assign technicians, broadcast notices.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  id="reg-step3-next"
                  onClick={handleStep3Next}
                  className="w-full bg-[#08424D] hover:bg-[#06333c] text-white py-3.5 rounded-2xl shadow font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-1"
                >
                  Continue as {selectedRole === 'committee' ? 'Committee' : 'Resident'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 4: OTP Verification */}
            {step === 4 && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                <div className="flex items-center gap-2 text-[#08424D] font-bold text-sm mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>Verify your phone number</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  We've sent a 4-digit code to <strong className="text-slate-800">+91 {phone}</strong>
                  <br />
                  <span className="text-slate-400">(Demo code: 1234)</span>
                </p>

                <div className="flex justify-between gap-2.5 my-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`reg-otp-${index}`}
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

                {errorMsg && <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>}

                <button
                  id="reg-verify-button"
                  type="submit"
                  className="w-full bg-[#08424D] hover:bg-[#06333c] text-white py-3.5 rounded-2xl shadow font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Create Account & Continue
                </button>

                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="w-full text-xs text-[#08424D] font-bold py-2 hover:underline"
                >
                  Change phone number
                </button>
              </form>
            )}
          </div>

          {/* Footer: Already have an account? */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <button
                id="register-to-login-link"
                onClick={onNavigateToLogin}
                className="text-[#08424D] font-bold underline underline-offset-2 hover:text-[#06333c] transition"
              >
                Sign In / உள்நுழைக
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterScreen;
