
import React, { useState, useEffect, useRef } from 'react';
import { Onboarding } from './components/Onboarding';
import { FluidWallet } from './components/FluidWallet';
import { LockScreen } from './components/LockScreen';
import { ViewState, Asset } from './types';
import { SUPPORTED_ASSETS } from './constants';
import { fetchAllPrices } from './services/priceService';
import { fetchBalances, createWallet } from './services/chainService';
import { encryptVault, decryptVault } from './services/cryptoService';

// Storage Keys
const STORAGE_KEYS = {
  VAULT: 'sw_vault',
  SELECTED_INDEX: 'sw_selected_index',
  // Legacy keys to be migrated/removed
  ACCOUNTS: 'sw_accounts',
  LEGACY_ADDRESS: 'sw_address',
  LEGACY_KEY: 'sw_priv', 
};

export interface Account {
  name: string;
  address: string;
  privateKey: string;
  mnemonic: string | null;
}

export default function App() {
  // State
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [hasVault, setHasVault] = useState<boolean>(false);
  const [password, setPassword] = useState<string | null>(null); // Keep in memory while unlocked

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number>(0);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.ONBOARDING);
  const [assets, setAssets] = useState<Asset[]>(SUPPORTED_ASSETS);

  // Initialization Check
  useEffect(() => {
    const checkStorage = async () => {
        const vault = localStorage.getItem(STORAGE_KEYS.VAULT);
        const legacyAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        const legacyAddress = localStorage.getItem(STORAGE_KEYS.LEGACY_ADDRESS);

        if (vault) {
            setHasVault(true);
            setIsLocked(true);
        } else if (legacyAccounts || legacyAddress) {
            // Legacy Migration needed: Treated as "No Vault", so Onboarding will trigger.
            // But we can be smarter: We'll just let Onboarding run, and user creates a new password/wallet.
            // For a seamless migration, we'd need a "Migrate" screen. 
            // Given the prompt "enable secure storage when creating/importing", 
            // we will treat the absence of a vault as a fresh start or re-import for now to keep logic clean,
            // or simply clear legacy data to force secure setup.
            localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
            localStorage.removeItem(STORAGE_KEYS.LEGACY_ADDRESS);
            localStorage.removeItem(STORAGE_KEYS.LEGACY_KEY);
            setHasVault(false);
            setIsLocked(false);
        } else {
            setHasVault(false);
            setIsLocked(false);
        }
    };
    checkStorage();
  }, []);

  // Save State on Change (Encrypted)
  useEffect(() => {
    const save = async () => {
        if (accounts.length > 0 && password) {
            try {
                const encrypted = await encryptVault(accounts, password);
                localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(encrypted));
                localStorage.setItem(STORAGE_KEYS.SELECTED_INDEX, selectedAccountIndex.toString());
            } catch (e) {
                console.error("Failed to save encrypted vault", e);
            }
        }
    };
    save();
  }, [accounts, selectedAccountIndex, password]);

  // Poll for Prices and Balances
  const currentAccount = accounts[selectedAccountIndex];
  useEffect(() => {
    if (!currentAccount || isLocked) return;

    const loadData = async () => {
      const symbols = assets.map(a => a.symbol);
      const prices = await fetchAllPrices(symbols);
      const assetsWithBalances = await fetchBalances(currentAccount.address, assets);
      setAssets(assetsWithBalances.map(a => ({
        ...a,
        valueUsd: prices[a.symbol] || a.valueUsd
      })));
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [currentAccount, accounts, isLocked]);

  // Handlers

  const handleUnlock = async (pwd: string) => {
      const vaultStr = localStorage.getItem(STORAGE_KEYS.VAULT);
      if (!vaultStr) throw new Error("No Vault Found");
      
      const vault = JSON.parse(vaultStr);
      const decryptedAccounts = await decryptVault(vault, pwd);
      
      setAccounts(decryptedAccounts);
      setPassword(pwd);
      setIsLocked(false);
      
      const savedIndex = localStorage.getItem(STORAGE_KEYS.SELECTED_INDEX);
      if (savedIndex) setSelectedAccountIndex(parseInt(savedIndex));
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleOnboardingComplete = async (addr: string, mnemonic: string | null, priv: string, pwd: string) => {
    const newAccount: Account = {
      name: 'Account 1',
      address: addr,
      privateKey: priv,
      mnemonic: mnemonic
    };
    
    // Set state immediately
    setAccounts([newAccount]);
    setPassword(pwd);
    setSelectedAccountIndex(0);
    setHasVault(true);
    setIsLocked(false);
    setCurrentView(ViewState.DASHBOARD);
    
    // Trigger save effect is handled by useEffect dependency on accounts/password
  };

  const handleCreateAccount = () => {
    const wallet = createWallet();
    const newAccount: Account = {
      name: `Account ${accounts.length + 1}`,
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic || null
    };
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    setSelectedAccountIndex(updatedAccounts.length - 1);
    setAssets(SUPPORTED_ASSETS);
  };

  const handleSwitchAccount = (index: number) => {
    if (index >= 0 && index < accounts.length) {
        setAssets(SUPPORTED_ASSETS);
        setSelectedAccountIndex(index);
    }
  };

  const handleLogout = () => {
      if (window.confirm("Are you sure you want to lock the wallet?")) {
         setIsLocked(true);
         setAccounts([]); // Clear from memory
         setPassword(null); // Clear key from memory
      }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to wipe the wallet? This cannot be undone.")) {
        localStorage.removeItem(STORAGE_KEYS.VAULT);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_INDEX);
        setAccounts([]);
        setPassword(null);
        setHasVault(false);
        setIsLocked(false); // Shows Onboarding
    }
  };

  // Render Logic
  
  // 1. If Vault exists and Locked -> Show Lock Screen
  if (hasVault && isLocked) {
      return <LockScreen onUnlock={handleUnlock} />;
  }

  // 2. If No Vault (and not locked, implying first run) -> Show Onboarding
  //    (Or if accounts is empty and not locked)
  if (!hasVault && accounts.length === 0) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // 3. Unlocked App
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-brand-500 selection:text-white">
      <main className="w-full min-h-screen relative bg-gray-950">
         <FluidWallet 
            key={currentAccount?.address} // Remount on account switch
            realAssets={assets} 
            accounts={accounts}
            currentAccountIndex={selectedAccountIndex}
            onSwitchAccount={handleSwitchAccount}
            onCreateAccount={handleCreateAccount}
            onLogout={handleLogout} // Now acts as Lock
         />
      </main>
    </div>
  );
}
