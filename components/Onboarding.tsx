
import React, { useState } from 'react';
import { createWallet, importWallet, createWalletFromSocial } from '../services/chainService';
import { Copy, ArrowRight, Download, AlertTriangle, Lock, Eye, EyeOff, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';

const FluidLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 22H80C83.3137 22 86 24.6863 86 28V32C86 35.3137 83.3137 38 80 38H40L45 22Z" fill="currentColor" />
    <path d="M30 44H70C73.3137 44 76 46.6863 76 50V54C76 57.3137 73.3137 60 70 60H25L30 44Z" fill="currentColor" />
    <path d="M15 66H60C63.3137 66 66 68.6863 66 72V76C66 79.3137 83.3137 82 60 82H10L15 66Z" fill="currentColor" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43-1.78.43-3.72c0-1.93-.43-3.71-1.18-5.26L2.18 5.76C1.43 7.24 1 8.91 1 10.72s.43 3.49 1.18 4.97l3.66-1.6z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface OnboardingProps {
  onComplete: (address: string, mnemonic: string | null, privateKey: string, password: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'create' | 'import' | 'password' | 'social_password'>('welcome');
  const [walletData, setWalletData] = useState<{address: string, mnemonic: string|null, privateKey: string} | null>(null);
  const [importInput, setImportInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Social Login State
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const handleCreate = () => {
    const wallet = createWallet();
    setWalletData(wallet);
    setStep('create');
  };

  const handleSocialLogin = () => {
    setIsSocialLoading(true);
    // Simulate API call to OAuth provider
    setTimeout(() => {
        // Deterministic wallet generation based on a mock user ID
        const mockUserId = "user_" + Math.random().toString(36).substring(7);
        const wallet = createWalletFromSocial(mockUserId);
        setWalletData(wallet);
        setIsSocialLoading(false);
        setStep('social_password'); // New step to set encryption password
    }, 1500);
  };

  const handleImport = () => {
    try {
      const wallet = importWallet(importInput.trim());
      setWalletData(wallet);
      setStep('password');
    } catch (e) {
      alert("Invalid Mnemonic or Private Key");
    }
  };

  const handleComplete = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 4) {
      alert("Password too short");
      return;
    }
    if (walletData) {
      onComplete(walletData.address, walletData.mnemonic, walletData.privateKey, password);
    }
  };

  const copyMnemonic = () => {
    if (walletData?.mnemonic) {
      navigator.clipboard.writeText(walletData.mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        
        {/* LOGO HEADER */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-4 shadow-2xl shadow-purple-500/30 mb-6 flex items-center justify-center border border-white/10">
            <FluidLogo className="w-full h-full text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">SuperWallet</h1>
          <p className="text-slate-400 font-medium">Next-Gen Web3 Experience</p>
        </div>

        {/* STEP: WELCOME */}
        {step === 'welcome' && (
          <div className="space-y-4">
             <button 
                onClick={handleCreate}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all shadow-lg flex items-center justify-center gap-2 group"
             >
                Create New Wallet <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
             </button>
             
             <div className="relative py-2 flex items-center justify-center">
                 <div className="h-px bg-slate-800 w-full absolute"></div>
                 <span className="bg-slate-950 px-4 text-xs text-slate-500 relative font-bold uppercase tracking-widest">Or Continue With</span>
             </div>

             {/* Social Login Button */}
             <button 
                onClick={handleSocialLogin}
                disabled={isSocialLoading}
                className="w-full bg-slate-900 border border-slate-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
             >
                {isSocialLoading ? (
                    <Loader2 className="animate-spin text-purple-400" />
                ) : (
                    <>
                        <GoogleIcon />
                        <span>Google</span>
                    </>
                )}
             </button>

             <button 
                onClick={() => setStep('import')}
                className="w-full bg-transparent border border-slate-800 text-slate-400 py-4 rounded-2xl font-bold hover:text-white hover:border-slate-600 transition-all"
             >
                I have a wallet
             </button>
          </div>
        )}

        {/* STEP: CREATE (Seed Phrase) */}
        {step === 'create' && (
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4 text-yellow-400">
               <ShieldAlert size={24} />
               <h3 className="font-bold text-lg">Secure Your Recovery Phrase</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
               Write down these 12 words. If you lose them, you lose your crypto forever. We cannot recover them for you.
            </p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
               {walletData?.mnemonic?.split(' ').map((word, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-center relative group hover:border-purple-500/30 transition-colors">
                     <span className="absolute top-1 left-2 text-[10px] text-slate-600 select-none">{i+1}</span>
                     <span className="text-white font-mono text-sm font-bold">{word}</span>
                  </div>
               ))}
            </div>

            <button 
               onClick={copyMnemonic}
               className="w-full flex items-center justify-center gap-2 text-purple-400 text-sm font-bold mb-6 hover:text-purple-300"
            >
               {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} 
               {copied ? 'Copied to clipboard' : 'Copy to clipboard'}
            </button>

            <button 
               onClick={() => setStep('password')}
               className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20"
            >
               I Saved It
            </button>
          </div>
        )}

        {/* STEP: IMPORT */}
        {step === 'import' && (
           <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl">
              <h3 className="font-bold text-xl text-white mb-4">Import Wallet</h3>
              <textarea
                 value={importInput}
                 onChange={(e) => setImportInput(e.target.value)}
                 placeholder="Enter your 12-word phrase or private key..."
                 className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:border-purple-500 outline-none mb-6 resize-none"
              />
              <div className="flex gap-3">
                  <button onClick={() => setStep('welcome')} className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold">Back</button>
                  <button onClick={handleImport} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold">Import</button>
              </div>
           </div>
        )}

        {/* STEP: PASSWORD (CREATE or IMPORT) */}
        {(step === 'password' || step === 'social_password') && (
           <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl">
              <div className="flex flex-col items-center mb-6">
                 <div className="w-14 h-14 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800 mb-3">
                    <Lock size={24} className="text-purple-400" />
                 </div>
                 <h3 className="font-bold text-xl text-white">Protect Your Wallet</h3>
                 <p className="text-slate-400 text-sm text-center mt-2">
                    {step === 'social_password' 
                        ? "Social login successful! Now set a local password to encrypt your vault."
                        : "Set a password to encrypt your vault on this device."}
                 </p>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="relative">
                    <input 
                       type={showPassword ? "text" : "password"} 
                       placeholder="New Password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
                 <input 
                       type="password" 
                       placeholder="Confirm Password" 
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                 />
              </div>

              <button 
                 onClick={handleComplete}
                 className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20"
              >
                 Open Wallet
              </button>
           </div>
        )}

      </div>
    </div>
  );
};
