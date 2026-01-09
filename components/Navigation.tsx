import React from 'react';
import { Home, Send, Shield, Smartphone, Activity } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: ViewState.DASHBOARD, label: 'Assets', icon: Home },
    { view: ViewState.SEND, label: 'Send', icon: Send },
    { view: ViewState.WALLET_CONNECT, label: 'Connect', icon: Smartphone },
    { view: ViewState.SMART_SETTINGS, label: 'Smart', icon: Shield },
    { view: ViewState.ACTIVITY, label: 'Activity', icon: Activity },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 pb-safe pt-2 px-6 h-20 flex justify-between items-start z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              isActive ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
