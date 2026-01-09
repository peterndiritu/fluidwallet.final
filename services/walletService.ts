import { Transaction } from '../types';

// Helper for minimal UX delays
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendTransaction = async (amount: string, symbol: string, to: string, isSmart: boolean): Promise<Transaction> => {
  // Minimal delay to simulate network request processing
  await wait(800); 
  
  // Real Apps would sign and broadcast here. 
  // Since we don't have a private key, we return the constructed transaction object.
  
  const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  return {
    id: txHash,
    type: 'send',
    amount,
    symbol,
    to: to,
    date: new Date().toLocaleString(),
    status: 'completed',
    hash: txHash,
    gasUsed: isSmart ? '0.00 (Sponsored)' : '0.00042 ETH',
    isGasless: isSmart
  };
};

export const createSession = async (uri: string) => {
  await wait(500);
  if (!uri.startsWith('wc:')) throw new Error('Invalid WalletConnect URI');
  
  // In a real app, this parses the URI and connects to the bridge
  return {
    id: `wc_${Date.now()}`,
    name: 'WalletConnect App',
    url: 'https://walletconnect.com',
    icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.png',
    connectedAt: new Date().toLocaleDateString(),
    status: 'active' as const
  };
};