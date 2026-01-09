import React, { useState } from 'react';
import { Asset, WalletMode } from '../types';
import { ArrowUpRight, ArrowDownLeft, ShieldCheck, DollarSign, Coins, Copy, Check } from 'lucide-react';

interface DashboardProps {
  mode: WalletMode;
  toggleMode: () => void;
  assets: Asset[];
  onSend: () => void;
  address: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ mode, toggleMode, assets, onSend, address }) => {
  const [copied, setCopied] = useState(false);
  const totalBalance = assets.reduce((acc, curr) => acc + (curr.balance * curr.valueUsd), 0);
  const isSmart = mode === WalletMode.SMART;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = (symbol: string) => {
    switch (symbol) {
      case 'ETH': return <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">ETH</div>;
      case 'USDC': return <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center"><DollarSign size={20} /></div>;
      case 'USDT': return <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center"><Coins size={20} /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center"><Coins size={20} /></div>;
    }
  };

  return (
    <div className="p-6 pb-24 animate-fade-in">
      {/* Header / Address */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 bg-gray-900 py-1.5 px-3 rounded-full border border-gray-800 hover:border-gray-600 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-mono text-gray-300">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </span>
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-gray-500" />}
        </button>

        <div className="flex items-center gap-2">
           <button 
                onClick={toggleMode}
                className={`relative px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                    isSmart 
                    ? 'bg-gray-800 border-neon-green/50 text-neon-green shadow-[0_0_15px_rgba(0,255,157,0.2)]' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                }`}
            >
                {isSmart ? 'AA ENABLED' : 'EOA'}
            </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className={`relative p-6 rounded-2xl mb-8 overflow-hidden transition-all duration-500 ${
          isSmart 
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 border border-indigo-500/30' 
          : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
      }`}>
        <p className="text-gray-400 text-sm mb-1">Total Balance</p>
        <h1 className="text-4xl font-bold text-white mb-6">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>

        <div className="flex gap-3">
            <button 
                onClick={onSend}
                className="flex-1 bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
                <ArrowUpRight size={18} /> Send
            </button>
            <button onClick={handleCopy} className="flex-1 bg-gray-700/50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors backdrop-blur-md">
                <ArrowDownLeft size={18} /> Receive
            </button>
        </div>
      </div>

      {/* Assets List */}
      <h3 className="text-gray-400 font-semibold mb-4 text-sm uppercase tracking-wider">Your Assets</h3>
      <div className="space-y-3">
        {assets.map((asset) => (
          <div key={asset.symbol} className="bg-gray-850 p-4 rounded-xl flex items-center justify-between border border-gray-800 hover:border-gray-700 transition-colors">
             <div className="flex items-center gap-4">
               {getIcon(asset.symbol)}
               <div>
                 <h4 className="font-bold text-white">{asset.name}</h4>
                 <div className="text-xs text-gray-500">{asset.balance.toFixed(4)} {asset.symbol}</div>
               </div>
             </div>
             <div className="text-right">
                <div className="font-medium text-white">
                  ${(asset.balance * asset.valueUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
