export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  SEND = 'SEND',
  SMART_SETTINGS = 'SMART_SETTINGS',
  WALLET_CONNECT = 'WALLET_CONNECT',
  ACTIVITY = 'ACTIVITY',
  EARN = 'EARN',
  ASSET_DETAIL = 'ASSET_DETAIL',
  PREDICTIONS = 'PREDICTIONS',
  PERPS = 'PERPS',
  REWARDS = 'REWARDS',
  TRADE_SELECTOR = 'TRADE_SELECTOR'
}

export enum WalletMode {
  EOA = 'EOA',
  SMART = 'SMART'
}

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  valueUsd: number;
  change24h: number;
  icon: string;
  contractAddress?: string;
  decimals?: number;
}

export interface PredictionMarket {
  id: string;
  question: string;
  category: 'Trending' | 'Crypto' | 'Sports' | 'Politics';
  volume: string;
  frequency: string;
  probability: number;
  image: string;
  outcomes?: { name: string; probability: number }[];
}

export interface PerpMarket {
  symbol: string;
  leverage: number;
  price: number;
  change24h: number;
  openInterest: string;
  volume24h: string;
  fundingRate: string;
}

export interface RewardLevel {
  points: number;
  level: number;
  name: string;
  nextLevelPoints: number;
  seasonEnds: string;
}

export interface StakingPool {
  id: string;
  name: string;
  platform: string;
  apy: number;
  asset: string;
  tvl: string;
  isStaked?: boolean;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'approve' | 'contract' | 'stake' | 'swap';
  amount?: string;
  symbol?: string;
  to?: string;
  from?: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  hash: string;
  gasUsed?: string;
  gasPriceGwei?: number;
  isGasless?: boolean;
}

export interface WCSession {
  id: string;
  name: string;
  url: string;
  icon: string;
  connectedAt: string;
  status: 'active' | 'expired';
}

export interface Guardian {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'pending';
}

export interface SessionKey {
  id: string;
  dappName: string;
  limit: string;
  expiry: string;
  status: 'active' | 'revoked';
}