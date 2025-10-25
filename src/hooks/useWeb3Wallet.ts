import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatEther, parseEther, TransactionResponse } from 'ethers';

// Extend Window interface for ethereum
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Arbitrum One network configuration
const ARBITRUM_CHAIN_ID = '0xa4b1'; // 42161 in hex
const ARBITRUM_CHAIN_CONFIG = {
  chainId: ARBITRUM_CHAIN_ID,
  chainName: 'Arbitrum One',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://arbiscan.io'],
};

interface UseWeb3WalletReturn {
  account: string | null;
  chainId: string | null;
  isMetaMaskInstalled: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
  balance: string | null;
  connectWallet: () => Promise<void>;
  switchToArbitrum: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<TransactionResponse>;
}

export function useWeb3Wallet(): UseWeb3WalletReturn {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Check if MetaMask is installed
  useEffect(() => {
    const { ethereum } = window;
    setIsMetaMaskInstalled(!!ethereum && !!ethereum.isMetaMask);
  }, []);

  // Check if connected to Arbitrum
  const isCorrectNetwork = chainId === ARBITRUM_CHAIN_ID;

  // Update balance when account or chainId changes
  useEffect(() => {
    const updateBalance = async () => {
      if (account && isCorrectNetwork) {
        try {
          const { ethereum } = window;
          if (!ethereum) return;
          const provider = new BrowserProvider(ethereum);
          const balanceWei = await provider.getBalance(account);
          setBalance(formatEther(balanceWei));
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      }
    };
    updateBalance();
  }, [account, isCorrectNetwork]);

  // Listen for account and chain changes
  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        setAccount(null);
        setBalance(null);
      } else {
        setAccount(accountsArray[0]);
      }
    };

    const handleChainChanged = (newChainId: unknown) => {
      setChainId(newChainId as string);
      // Reload the page as recommended by MetaMask
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    const { ethereum } = window;
    if (!ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      
      setAccount((accounts as string[])[0]);
      setChainId('0x' + network.chainId.toString(16));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Error connecting wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const switchToArbitrum = useCallback(async () => {
    const { ethereum } = window;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_CHAIN_ID }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ARBITRUM_CHAIN_CONFIG],
          });
        } catch (addError) {
          const errorMessage = addError instanceof Error ? addError.message : 'Failed to add Arbitrum network';
          setError(errorMessage);
          console.error('Error adding network:', addError);
        }
      } else {
        const errorMessage = switchError instanceof Error ? switchError.message : 'Failed to switch network';
        setError(errorMessage);
        console.error('Error switching network:', switchError);
      }
    }
  }, []);

  const sendTransaction = useCallback(
    async (to: string, amount: string): Promise<TransactionResponse> => {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('MetaMask is not installed');
      }

      if (!account) {
        throw new Error('No account connected');
      }

      if (!isCorrectNetwork) {
        throw new Error('Please switch to Arbitrum network');
      }

      try {
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        
        const tx = await signer.sendTransaction({
          to,
          value: parseEther(amount),
        });

        return tx;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
        throw new Error(errorMessage);
      }
    },
    [account, isCorrectNetwork]
  );

  return {
    account,
    chainId,
    isMetaMaskInstalled,
    isConnecting,
    isCorrectNetwork,
    error,
    balance,
    connectWallet,
    switchToArbitrum,
    sendTransaction,
  };
}
