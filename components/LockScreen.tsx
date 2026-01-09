
import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { decryptVault } from '../services/cryptoService';
import { verifyEmailOTP, verifyTOTP, sendEmailOTP } from '../services/authService';

interface LockScreenProps {
  onUnlock: (password: string) => Promise<void>;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [step, setStep] = useState<'password' | '2fa'>('password');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2FA State
  const [email2FA, setEmail2FA] = useState<any>(null);
  const [google2FA, setGoogle2FA] = useState<any>(null);
  const [otpCode, setOtpCode] = useState('');
  const [authType, setAuthType] = useState<'none' | 'email' | 'totp'>('none');

  useEffect(() => {
      const eConf = localStorage.getItem('sw_email_2fa');
      const gConf = localStorage.getItem('sw_google_2fa');
      if (eConf) setEmail2FA(JSON.parse(eConf));
      if (gConf) setGoogle2FA(JSON.parse(gConf));
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // 1. Verify Password locally first
    try {
        const vaultStr = localStorage.getItem('sw_vault');
        if (!vaultStr) throw new Error("No vault");
        const vault = JSON.parse(vaultStr);
        // Attempt decrypt. If throws, password is wrong.
        await decryptVault(vault, password);
        
        // Password correct. Check 2FA.
        if (google2FA?.enabled) {
            setAuthType('totp');
            setStep('2fa');
            setIsLoading(false);
        } else if (email2FA?.enabled) {
            setAuthType('email');
            setStep('2fa');
            await sendEmailOTP(email2FA.email);
            setIsLoading(false);
        } else {
            // No 2FA -> Complete Unlock
            await onUnlock(password);
        }
    } catch (err: any) {
      console.error(err);
      setError('Incorrect password');
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      let valid = false;
      if (authType === 'totp') {
          valid = await verifyTOTP(otpCode);
      } else if (authType === 'email') {
          valid = await verifyEmailOTP(email2FA.email, otpCode);
      }

      if (valid) {
          await onUnlock(password);
      } else {
          setError("Invalid Code");
          setIsLoading(false);
      }
  };

  if (step === '2fa') {
      return (
        <div className="fixed inset-0 bg-slate-950 z-[60] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm animate-fade-in-up">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-2xl shadow-blue-500/20 border border-slate-800">
                        <ShieldCheck size={32} className="text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Security Check</h1>
                    <p className="text-slate-400 text-sm text-center">
                        {authType === 'email' ? `Enter code sent to ${email2FA.email}` : 'Enter code from Authenticator'}
                    </p>
                </div>
                
                <form onSubmit={handle2FASubmit} className="space-y-4">
                    <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="000000"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-center tracking-widest text-xl focus:border-blue-500 outline-none transition-all"
                        autoFocus
                    />
                     {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                     
                     <button
                        type="submit"
                        disabled={!otpCode || isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Unlock"}
                    </button>
                    
                    <button type="button" onClick={() => { setStep('password'); setPassword(''); }} className="w-full text-xs text-slate-500 hover:text-white pt-2">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-[60] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-2xl shadow-purple-500/20 border border-slate-800">
            <Lock size={32} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Enter your password to unlock your vault.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={!password || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center gap-2">Unlock <ArrowRight size={18} /></span>}
          </button>
        </form>
      </div>
    </div>
  );
};
