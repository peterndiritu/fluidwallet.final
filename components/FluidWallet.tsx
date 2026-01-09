import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, Send, Search, ChevronRight, RefreshCw, Zap, Copy,
  Activity, ExternalLink, ArrowUpRight, ArrowDownLeft, Landmark, 
  ChevronLeft, CheckCircle2, QrCode, ChevronDown, Settings, 
  Eye, EyeOff, TrendingUp, PieChart, Info, BarChart3, 
  LayoutDashboard, Coins, ArrowLeftRight, History, CreditCard,
  Target, Rocket, ShieldCheck, Globe, Trophy, Compass, Plus,
  MoreVertical, Filter, ArrowUp, ArrowDown, Timer, AlertCircle
} from 'lucide-react';
import { Asset, Transaction, StakingPool, PredictionMarket, PerpMarket, RewardLevel } from '../types';
import { sendNativeToken } from '../services/chainService';
import { Account } from '../App';
import { authenticatePasskey } from '../services/passkeyService';
import { sendEmailOTP } from '../services/authService';

// --- Mock Data ---

const MOCK_PREDICTIONS: PredictionMarket[] = [
  {
    id: '1',
    question: "Will the Fed cut rates next month?",
    category: 'Trending',
    volume: '$1.5m',
    frequency: 'Monthly',
    probability: 50,
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: '2',
    question: "Which company will have the best AI model by next year?",
    category: 'Trending',
    volume: '$497K',
    frequency: 'Monthly',
    probability: 50,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=100',
    outcomes: [
      { name: 'Google', probability: 50 },
      { name: 'Open AI', probability: 42 },
      { name: 'xAI', probability: 2 }
    ]
  },
  {
    id: '3',
    question: "Will the Eagles be repeat champions?",
    category: 'Sports',
    volume: '$220k',
    frequency: 'Weekly',
    probability: 25,
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=100'
  }
];

const MOCK_REWARDS: RewardLevel = {
  points: 44578,
  level: 2,
  name: 'Frontier',
  nextLevelPoints: 4223,
  seasonEnds: '62d 14h'
};

const ASSET_STYLES: Record<string, any> = {
  'ETH': { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  'USDC': { color: 'text-blue-500', bg: 'bg-blue-500/10' },
  'USDT': { color: 'text-green-500', bg: 'bg-green-500/10' },
  'SOL': { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const NavButton: React.FC<{ id: string; icon: any; label: string; view: string; setView: (v: any) => void }> = ({ id, icon: Icon, label, view, setView }) => (
  <button 
    onClick={() => setView(id)}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${
      view === id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    <Icon size={22} strokeWidth={view === id ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

interface FluidWalletProps {
  realAssets: Asset[];
  accounts: Account[];
  currentAccountIndex: number;
  onSwitchAccount: (index: number) => void;
  onCreateAccount: () => void;
  onLogout: () => void;
}

export const FluidWallet: React.FC<FluidWalletProps> = ({ 
  realAssets, 
  accounts,
  currentAccountIndex,
  onSwitchAccount,
  onCreateAccount,
  onLogout 
}) => {
  const currentAccount = accounts[currentAccountIndex];
  const [view, setView] = useState('assets');
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showSensitive, setShowSensitive] = useState(true);
  const [activeTab, setActiveTab] = useState('Tokens');

  // Simplified logic for this adoption
  const assets = useMemo(() => realAssets.map(a => ({
    ...a,
    price: a.valueUsd,
    color: ASSET_STYLES[a.symbol]?.color || 'text-slate-400',
    bg: ASSET_STYLES[a.symbol]?.bg || 'bg-slate-500/10',
    change24h: (Math.random() * 10 - 4).toFixed(2)
  })), [realAssets]);

  const totalBalance = assets.reduce((acc, asset) => acc + (asset.balance * (asset.price || 0)), 0);

  return (
    <div className="min-h-screen bg-[#000000] text-slate-200 selection:bg-purple-500/40 relative font-sans overflow-x-hidden">
      
      {/* HEADER: Dynamic based on view */}
      <header className="px-5 py-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-50">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowAccountSwitcher(true)}>
              <span className="text-sm font-bold text-white">{currentAccount.name}</span>
              <ChevronDown size={14} className="text-slate-500" />
          </div>
          <div className="flex items-center gap-4">
              <button className="text-white hover:opacity-80 transition-opacity"><Copy size={18} /></button>
              <button className="text-white hover:opacity-80 transition-opacity"><RefreshCw size={18} /></button>
          </div>
      </header>

      <main className="px-5 pb-32">
        {/* VIEW: ASSETS (HOME) */}
        {view === 'assets' && (
          <div className="space-y-6 animate-fade-in">
              <div className="mt-4">
                  <h1 className="text-4xl font-bold text-white mb-1">
                      {showSensitive ? `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••••'}
                  </h1>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                      <Plus size={14} /> $367.00 (+0.66%)
                  </div>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Buy', icon: CreditCard },
                    { label: 'Swap', icon: ArrowLeftRight },
                    { label: 'Send', icon: Send },
                    { label: 'Receive', icon: ArrowDownLeft }
                  ].map((act, i) => (
                    <button key={i} className="flex flex-col items-center gap-2 py-3 bg-[#1A1A1A] rounded-2xl hover:bg-[#252525] transition-colors border border-white/5">
                        <act.icon size={22} className="text-slate-200" />
                        <span className="text-[11px] font-bold text-slate-400">{act.label}</span>
                    </button>
                  ))}
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-6 border-b border-white/5 pb-2">
                  {['Tokens', 'Perps', 'DeFi', 'NFTs'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-bold pb-1 transition-all ${activeTab === tab ? 'text-white border-b-2 border-white' : 'text-slate-500'}`}
                    >
                      {tab}
                    </button>
                  ))}
              </div>

              {/* Content Based on Tab */}
              {activeTab === 'Tokens' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 tracking-wider">
                        <button className="flex items-center gap-1">POPULAR NETWORKS <ChevronDown size={12}/></button>
                        <div className="flex items-center gap-4">
                            <Filter size={14} />
                            <Plus size={16} />
                        </div>
                    </div>

                    <div className="space-y-5">
                        {assets.map(asset => (
                            <div key={asset.symbol} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                                        <div className={`text-xs font-black ${asset.color}`}>{asset.symbol[0]}</div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{asset.name}</h4>
                                        <p className="text-[11px] text-slate-500">{asset.balance} {asset.symbol}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white text-sm">${(asset.balance * asset.price).toLocaleString()}</div>
                                    <div className={`text-[11px] font-bold ${parseFloat(asset.change24h) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {parseFloat(asset.change24h) >= 0 ? '+' : ''}{asset.change24h}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {activeTab === 'Perps' && (
                <div className="animate-fade-in space-y-4">
                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">ETH</div>
                                <div className="font-bold">ETH-USD <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400">25x</span></div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-white">$4,775</div>
                                <div className="text-emerald-400 text-[10px] font-bold">+16.4%</div>
                            </div>
                        </div>
                        {/* Fake Candlestick Chart */}
                        <div className="h-24 flex items-end gap-1 mb-4 opacity-80">
                            {[40, 70, 45, 90, 65, 30, 85, 55, 100, 75, 45, 60, 35, 95].map((h, i) => (
                                <div key={i} className={`flex-1 rounded-sm ${i % 3 === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-emerald-900/30 text-emerald-400 py-3 rounded-xl font-bold hover:bg-emerald-900/50 transition-colors">Long</button>
                            <button className="bg-rose-900/30 text-rose-400 py-3 rounded-xl font-bold hover:bg-rose-900/50 transition-colors">Short</button>
                        </div>
                    </div>
                </div>
              )}
          </div>
        )}

        {/* VIEW: BROWSER / PREDICTIONS */}
        {view === 'predictions' && (
            <div className="animate-fade-in space-y-6">
                <header className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Predictions</h2>
                    <Search size={20} className="text-slate-500" />
                </header>

                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Available Balance</p>
                    <h3 className="text-2xl font-bold text-white mb-6">$1,000.00</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-[#1A1A1A] text-white py-3 rounded-xl font-bold border border-white/5">Add funds</button>
                        <button className="bg-[#1A1A1A] text-white py-3 rounded-xl font-bold border border-white/5">Withdraw</button>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-sm font-bold text-slate-500 border-b border-white/5 pb-2">
                    {['Trending', 'Crypto', 'Sports', 'Politics'].map(c => (
                        <button key={c} className={c === 'Trending' ? 'text-white border-b-2 border-white pb-1' : ''}>{c}</button>
                    ))}
                </div>

                <div className="space-y-4">
                    {MOCK_PREDICTIONS.map(pred => (
                        <div key={pred.id} className="bg-[#111111] border border-white/5 rounded-3xl p-5 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <img src={pred.image} className="w-12 h-12 rounded-xl object-cover" />
                                    <p className="text-white font-bold text-sm leading-snug">{pred.question}</p>
                                </div>
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="24" cy="24" r="20" className="text-slate-800" strokeWidth="4" fill="none" stroke="currentColor"/>
                                        <circle cx="24" cy="24" r="20" className="text-emerald-500" strokeWidth="4" fill="none" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - pred.probability / 100)}/>
                                    </svg>
                                    <span className="absolute text-[10px] font-bold text-white">{pred.probability}%</span>
                                </div>
                            </div>
                            
                            {pred.outcomes ? (
                                <div className="space-y-2">
                                    {pred.outcomes.map(o => (
                                        <div key={o.name} className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">{o.name}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-slate-500 text-xs">{o.probability}%</span>
                                                <div className="flex gap-1.5">
                                                    <button className="bg-emerald-900/30 text-emerald-400 px-3 py-1 rounded text-xs font-bold">Yes</button>
                                                    <button className="bg-rose-900/30 text-rose-400 px-3 py-1 rounded text-xs font-bold">No</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-emerald-900/30 text-emerald-400 py-3 rounded-xl font-bold">Yes</button>
                                    <button className="bg-rose-900/30 text-rose-400 py-3 rounded-xl font-bold">No</button>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase">
                                <span>{pred.volume} Vol.</span>
                                <span className="flex items-center gap-1"><RefreshCw size={10} /> {pred.frequency}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* VIEW: REWARDS */}
        {view === 'rewards' && (
            <div className="animate-fade-in space-y-8">
                <header className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Rewards</h2>
                    <div className="flex gap-4">
                        <Plus size={20} className="text-white" />
                        <Settings size={20} className="text-white" />
                    </div>
                </header>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Trophy size={32} className="text-white" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Level {MOCK_REWARDS.level}</p>
                        <h3 className="text-xl font-black text-white">{MOCK_REWARDS.name}</h3>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-slate-500 text-[10px] font-bold uppercase">S1 Ends</p>
                        <p className="text-white text-xs font-bold">{MOCK_REWARDS.seasonEnds}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <h4 className="text-2xl font-black text-white">{MOCK_REWARDS.points.toLocaleString()} points</h4>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{MOCK_REWARDS.nextLevelPoints.toLocaleString()} to level up</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">Active boosts <span className="bg-slate-800 text-[10px] px-1.5 rounded text-slate-300">3</span></h4>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar">
                        {[
                          { title: '2x points for Swaps on Linea', color: 'bg-indigo-900/30' },
                          { title: '50% points boost for perps', color: 'bg-purple-900/30' }
                        ].map((b, i) => (
                            <div key={i} className={`min-w-[200px] p-5 rounded-3xl ${b.color} border border-white/5 space-y-4`}>
                                <p className="text-white font-bold text-sm leading-relaxed">{b.title}</p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                                    <Timer size={12} /> Season 1
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Ways to earn</h4>
                    <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                        {[
                            { label: 'Swaps', rate: '80 points per $100', icon: ArrowLeftRight },
                            { label: 'Perps', rate: '10 points per $100 order value', icon: Activity },
                            { label: 'Referrals', rate: 'Get 20% from friends you refer', icon: Globe }
                        ].map((way, i) => (
                            <div key={i} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                                        <way.icon size={20} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold text-sm">{way.label}</h5>
                                        <p className="text-[11px] text-slate-500">{way.rate}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-600" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* FIXED ACTION BUTTON */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50">
          <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-90 transition-all">
              <Plus size={28} strokeWidth={3} />
          </button>
      </div>

      {/* TAB BAR (IMAGE ADOPTION) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 z-40 pb-safe">
          <NavButton id="assets" icon={LayoutDashboard} label="Home" view={view} setView={setView} />
          <NavButton id="predictions" icon={Compass} label="Browser" view={view} setView={setView} />
          
          <div className="w-12"></div> {/* Spacer for central + button */}
          
          <NavButton id="activity" icon={Activity} label="Activity" view={view} setView={setView} />
          <NavButton id="rewards" icon={Trophy} label="Rewards" view={view} setView={setView} />
      </nav>

      {/* ACCOUNT SWITCHER OVERLAY */}
      {showAccountSwitcher && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end justify-center" onClick={() => setShowAccountSwitcher(false)}>
              <div className="w-full max-w-md bg-[#111111] rounded-t-[40px] p-8 border-t border-white/10 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8"></div>
                  <h3 className="text-white font-bold text-center uppercase tracking-widest mb-8 text-xs">Switch Account</h3>
                  <div className="space-y-3 mb-8">
                      {accounts.map((acc, i) => (
                          <div key={acc.address} onClick={() => { onSwitchAccount(i); setShowAccountSwitcher(false); }} className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${i === currentAccountIndex ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600" />
                                  <div>
                                      <h4 className="text-white font-bold text-sm">{acc.name}</h4>
                                      <p className="text-[10px] font-mono text-slate-500 tracking-tighter">{acc.address}</p>
                                  </div>
                              </div>
                              {i === currentAccountIndex && <CheckCircle2 className="text-white" size={20} />}
                          </div>
                      ))}
                  </div>
                  <button onClick={onCreateAccount} className="w-full py-4 bg-white text-black font-bold rounded-2xl uppercase tracking-widest text-xs">
                      New Wallet
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};