import { ethers } from 'ethers';
import { RPC_URL } from '../constants';
import { Asset, Transaction } from '../types';

// Standard ERC20 ABI (Minimal)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint amount) returns (bool)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Helper for retrying RPC calls
const retryCall = async <T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return retryCall(fn, retries - 1, delay * 2);
    }
    throw e;
  }
};

export const createWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    mnemonic: wallet.mnemonic?.phrase,
    privateKey: wallet.privateKey
  };
};

export const createWalletFromSocial = (userId: string) => {
  const hash = ethers.keccak256(ethers.toUtf8Bytes("SUPERWALLET_SALT_" + userId));
  const wallet = new ethers.Wallet(hash);
  return {
    address: wallet.address,
    mnemonic: null,
    privateKey: wallet.privateKey
  };
};

export const importWallet = (mnemonicOrKey: string) => {
  try {
    if (mnemonicOrKey.includes(" ")) {
      const wallet = ethers.Wallet.fromPhrase(mnemonicOrKey);
      return {
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase,
        privateKey: wallet.privateKey
      };
    } else {
      const wallet = new ethers.Wallet(mnemonicOrKey);
      return {
        address: wallet.address,
        mnemonic: null,
        privateKey: wallet.privateKey
      };
    }
  } catch (e) {
    throw new Error("Invalid Mnemonic or Private Key");
  }
};

export const getNativeBalance = async (address: string): Promise<string> => {
  try {
    const balance = await retryCall(() => provider.getBalance(address));
    return ethers.formatEther(balance);
  } catch (e) {
    console.warn("Soft Error: Unable to fetch ETH balance. Defaulting to 0.", e);
    return "0.0";
  }
};

export const getTokenBalance = async (address: string, contractAddress: string, decimals: number = 18): Promise<string> => {
  try {
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const balance = await retryCall(() => contract.balanceOf(address));
    return ethers.formatUnits(balance, decimals);
  } catch (e) {
    console.warn(`Soft Error: Unable to fetch token balance for ${contractAddress}. Defaulting to 0.`, e);
    return "0.0";
  }
};

export const fetchBalances = async (address: string, assets: Asset[]): Promise<Asset[]> => {
  return await Promise.all(assets.map(async (asset) => {
    let balanceStr = "0";
    if (asset.symbol === 'ETH') {
      balanceStr = await getNativeBalance(address);
    } else if (asset.contractAddress) {
      balanceStr = await getTokenBalance(address, asset.contractAddress, asset.decimals);
    }
    return {
      ...asset,
      balance: parseFloat(balanceStr)
    };
  }));
};

export const sendNativeToken = async (privateKey: string, to: string, amount: string): Promise<Transaction> => {
  const wallet = new ethers.Wallet(privateKey, provider);
  const txResponse = await wallet.sendTransaction({
    to: to,
    value: ethers.parseEther(amount)
  });

  return {
    id: txResponse.hash,
    hash: txResponse.hash,
    type: 'send',
    amount: amount,
    symbol: 'ETH',
    to: to,
    from: wallet.address,
    date: new Date().toLocaleString(),
    status: 'pending'
  };
};