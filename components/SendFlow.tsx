import React, { useState } from 'react';
import { Asset, WalletMode } from '../types';
import { sendNativeToken } from '../services/chainService';
import { ArrowLeft, Zap, Loader2, Check, ExternalLink } from 'lucide-react';

interface SendFlowProps {
  onBack: () => void;
  assets: Asset[];
  mode: WalletMode;
  onTransactionComplete: (tx: any) => void;
  privateKey: string;
}

export const SendFlow: React.FC<SendFlowProps> = ({ onBack, assets, mode, onTransactionComplete, privateKey }) => {
  const [selectedAsset, setSelectedAsset] = useState<string>(assets[0].symbol);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSmart = mode === WalletMode.SMART;
  const asset = assets.find(a => a.symbol === selectedAsset);

  const handleSend = async () => {
    if (!amount || !recipient) return;
    setIsSending(true);
    setError(null);
    try {
      if (selectedAsset !== 'ETH') {
        throw new Error("Only ETH sending is supported in this demo version.");
      }
      
      const tx = await sendNativeToken(privateKey, recipient, amount);
      setTxHash(tx.hash);
      setTimeout(() => {
        onTransactionComplete(tx);
      }, 2000);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Transaction failed");
      setIsSending(false);
    }
  };

  if (txHash) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
          <Check size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Transaction Sent!</h2>
        <p className="text-gray-400 mb-6">
          Broadcasted to Ethereum Mainnet.
        </p>
        <a 
          href={`https://etherscan.io/tx/${txHash}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-2 text-brand-400 hover:text-white"
        >
          View on Etherscan <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 animate-fade-in">
      <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Back
      </button>

      <h2 className="text-2xl font-bold text-white mb-8">Send Assets</h2>

      <div className="space-y-6">
        {/* Asset Selection */}
        <div>
          <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Asset</label>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {assets.map(a => (
              <button
                key={a.symbol}
                onClick={() => setSelectedAsset(a.symbol)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap ${
                  selectedAsset === a.symbol 
                  ? 'bg-brand-600 border-brand-500 text-white' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {a.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
           <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Amount</label>
           <div className="relative">
             <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-950 text-white p-4 rounded-xl border border-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-2xl font-mono"
             />
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{selectedAsset}</span>
           </div>
           {asset && (
             <div className="text-right text-xs text-gray-500 mt-2">
               Balance: {asset.balance} {asset.symbol}
             </div>
           )}
        </div>

        {/* Recipient Input */}
        <div>
           <label className="block text-gray-500 text-xs font-bold uppercase mb-2">To</label>
           <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-950 text-white p-4 rounded-xl border border-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none font-mono text-sm"
           />
        </div>
        
        {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
            </div>
        )}

        {/* Fee Simulation */}
        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Estimated Gas Fee</span>
            {isSmart ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                    <Zap size={14} fill="currentColor" />
                    <span>$0.00 (Sponsored)</span>
                </div>
            ) : (
                <span className="text-gray-300 font-mono text-sm">~$1.50</span>
            )}
        </div>

        <button
          onClick={handleSend}
          disabled={isSending || !amount || !recipient}
          className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg ${
            isSending || !amount || !recipient
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
            : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/50'
          }`}
        >
          {isSending ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Send'}
        </button>
      </div>
    </div>
  );
};
