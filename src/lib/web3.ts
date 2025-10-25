import { ethers } from 'ethers';
import {
  ARBITRUM_GOERLI_CHAIN_ID,
  ARBITRUM_GOERLI_NETWORK,
  ARB_TOKEN_ADDRESS,
  ERC20_ABI,
} from './constants';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export const connectWallet = async (): Promise<string> => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask не установлен');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return (accounts as string[])[0];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка при подключении кошелька';
    throw new Error(errorMessage);
  }
};

export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return ((accounts as string[])[0]) || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

export const getCurrentChainId = async (): Promise<number | null> => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });
    return parseInt(chainId as string, 16);
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

export const isCorrectNetwork = async (): Promise<boolean> => {
  const chainId = await getCurrentChainId();
  return chainId === ARBITRUM_GOERLI_CHAIN_ID;
};

export const switchToArbitrumGoerli = async (): Promise<void> => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask не установлен');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARBITRUM_GOERLI_NETWORK.chainId }],
    });
  } catch (error) {
    const err = error as { code?: number; message?: string };
    // This error code indicates that the chain has not been added to MetaMask
    if (err.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [ARBITRUM_GOERLI_NETWORK],
        });
      } catch (addError) {
        const addErr = addError as { message?: string };
        throw new Error(addErr.message || 'Ошибка при добавлении сети');
      }
    } else {
      throw new Error(err.message || 'Ошибка при переключении сети');
    }
  }
};

export const getARBBalance = async (address: string): Promise<string> => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask не установлен');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
    const contract = new ethers.Contract(ARB_TOKEN_ADDRESS, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error getting ARB balance:', error);
    throw new Error('Ошибка при получении баланса');
  }
};

export const sendARBTokens = async (
  recipient: string,
  amount: string
): Promise<string> => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask не установлен');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(ARB_TOKEN_ADDRESS, ERC20_ABI, signer);
    
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    const tx = await contract.transfer(recipient, amountInWei);
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error('Error sending ARB tokens:', error);
    
    const err = error as { code?: string | number };
    if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
      throw new Error('Транзакция отменена');
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Ошибка транзакции';
    throw new Error(errorMessage);
  }
};

export const validateAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const validateAmount = (amount: string, balance: string): string | null => {
  if (!amount || amount === '') {
    return 'Сумма обязательна';
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return 'Сумма должна быть положительным числом';
  }

  const numBalance = parseFloat(balance);
  if (numAmount > numBalance) {
    return 'Сумма превышает доступный баланс';
  }

  return null;
};
