import React from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, Zap } from 'lucide-react';

interface ActivityFeedProps {
  transactions: Transaction[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ transactions }) => {
  return (
    <div className="p-6 pb-24 animate-fade-in">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Activity</h2>
        <p className="text-gray-400 text-sm">Recent transactions and smart contract interactions.</p>
      </header>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-600">No recent activity</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'send' ? 'bg-gray-800 text-white' : 
                  tx.type === 'receive' ? 'bg-green-500/20 text-green-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {tx.type === 'send' && <ArrowUpRight size={20} />}
                  {tx.type === 'receive' && <ArrowDownLeft size={20} />}
                  {tx.type === 'approve' && <CheckCircle size={20} />}
                  {tx.type === 'contract' && <Zap size={20} />}
                </div>
                <div>
                  <h4 className="font-semibold text-white capitalize">{tx.type} {tx.symbol}</h4>
                  <div className="text-xs text-gray-500">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">
                  {tx.type === 'send' ? '-' : tx.type === 'receive' ? '+' : ''}
                  {tx.amount} {tx.symbol}
                </div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {tx.isGasless ? (
                    <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20 font-medium">
                      Sponsored
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500">
                      Gas: {tx.gasUsed}
                    </span>
                  )}
                  {tx.status === 'pending' && <Clock size={10} className="text-yellow-500" />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};