import React, { useState } from 'react';
import { Shield, Key, Users, Zap, AlertTriangle, Plus, Check } from 'lucide-react';
import { Guardian, SessionKey } from '../types';

interface SmartControlsProps {
  isSmartMode: boolean;
  guardians: Guardian[];
  sessionKeys: SessionKey[];
  addGuardian: (g: Guardian) => void;
  toggleSessionKey: (id: string) => void;
}

export const SmartControls: React.FC<SmartControlsProps> = ({ 
  isSmartMode, 
  guardians, 
  sessionKeys,
  addGuardian,
  toggleSessionKey
}) => {
  const [activeTab, setActiveTab] = useState<'security' | 'sessions'>('security');

  if (!isSmartMode) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Shield size={40} className="text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-white">Smart Account Locked</h2>
        <p className="text-gray-400 max-w-xs">
          Switch to Smart Mode in the dashboard to enable Gasless Transactions, Social Recovery, and Session Keys.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 animate-fade-in">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Smart Settings</h2>
          <p className="text-brand-400 text-xs font-mono">ERC-4337 ENABLED</p>
        </div>
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full flex items-center gap-2">
            <Zap size={14} className="text-green-400" fill="currentColor" />
            <span className="text-xs text-green-400 font-bold">Gasless Ready</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-900 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'security' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Security & Recovery
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'sessions' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Session Keys
        </button>
      </div>

      {activeTab === 'security' ? (
        <div className="space-y-6 animate-fade-in">
          {/* Social Recovery Section */}
          <div className="bg-gray-850 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Social Recovery</h3>
                        <p className="text-xs text-gray-500">Recover without seed phrase</p>
                    </div>
                </div>
                <button 
                  onClick={() => addGuardian({ id: `g_${Date.now()}`, name: 'New Guardian', address: '0x...', status: 'pending' })}
                  className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors text-white"
                >
                    <Plus size={16} />
                </button>
            </div>
            
            <div className="space-y-3">
                {guardians.map(g => (
                    <div key={g.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-200">{g.name}</span>
                            <span className="text-xs text-gray-500 font-mono">{g.address}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                            g.status === 'active' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                            {g.status}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-xs text-gray-400">
                <AlertTriangle size={12} className="text-yellow-500" />
                You need 2/3 guardians to recover your account.
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-gray-850 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Key size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Session Keys</h3>
                            <p className="text-xs text-gray-500">Auto-approve dApp limits</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {sessionKeys.map(key => (
                        <div key={key.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-white">{key.dappName}</h4>
                                <button 
                                    onClick={() => toggleSessionKey(key.id)}
                                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                                        key.status === 'active' ? 'bg-brand-600' : 'bg-gray-700'
                                    }`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                        key.status === 'active' ? 'translate-x-4' : 'translate-x-0'
                                    }`} />
                                </button>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-400">
                                <div>
                                    <span className="block text-gray-600 uppercase text-[10px]">Limit</span>
                                    <span className="font-mono text-gray-300">{key.limit}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-600 uppercase text-[10px]">Expires</span>
                                    <span className="font-mono text-gray-300">{key.expiry}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
