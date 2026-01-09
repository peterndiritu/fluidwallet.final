import { Asset } from './types';

// Use environment variable if available, otherwise fallback to more robust public RPCs
const env = (import.meta as any).env || {};
// Llamarpc and DRPC are often more stable for balance queries than Cloudflare in some regions
export const RPC_URL = env.VITE_RPC_URL || "https://eth.llamarpc.com";

// Tokens we want to track on Mainnet
export const SUPPORTED_ASSETS: Asset[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 0,
    valueUsd: 0,
    change24h: 0,
    icon: 'eth',
    decimals: 18
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 0,
    valueUsd: 1.00,
    change24h: 0,
    icon: 'dollar',
    contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Mainnet USDC
    decimals: 6
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    balance: 0,
    valueUsd: 1.00,
    change24h: 0,
    icon: 'coins',
    contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', // Mainnet USDT
    decimals: 6
  }
];

export const MOCK_SESSIONS = [];
export const MOCK_GUARDIANS = [];
export const MOCK_SESSION_KEYS = [];