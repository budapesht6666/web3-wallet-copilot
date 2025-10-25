import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, ExternalLink, Wallet } from 'lucide-react';
import {
  isMetaMaskInstalled,
  connectWallet,
  getCurrentAccount,
  isCorrectNetwork,
  switchToArbitrumGoerli,
  getARBBalance,
  sendARBTokens,
  validateAddress,
  validateAmount,
} from '@/lib/web3';
import { ARBISCAN_BASE_URL } from '@/lib/constants';
import type { WalletState, TransactionState, FormData, FormErrors } from '@/lib/types';

function App() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: null,
    isConnected: false,
    isCorrectNetwork: false,
  });

  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  });

  const [formData, setFormData] = useState<FormData>({
    recipient: '',
    amount: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const initWallet = async () => {
      await initializeWallet();
    };
    
    initWallet();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccounts = (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          setWalletState({
            address: null,
            balance: null,
            isConnected: false,
            isCorrectNetwork: false,
          });
        } else {
          initWallet();
        }
      };

      const handleChain = () => {
        initWallet();
      };

      window.ethereum.on('accountsChanged', handleAccounts);
      window.ethereum.on('chainChanged', handleChain);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccounts);
          window.ethereum.removeListener('chainChanged', handleChain);
        }
      };
    }
  }, []);

  const initializeWallet = async () => {
    if (!isMetaMaskInstalled()) {
      return;
    }

    const address = await getCurrentAccount();
    if (address) {
      const correctNetwork = await isCorrectNetwork();
      if (correctNetwork) {
        const balance = await getARBBalance(address);
        setWalletState({
          address,
          balance,
          isConnected: true,
          isCorrectNetwork: true,
        });
      } else {
        setWalletState({
          address,
          balance: null,
          isConnected: true,
          isCorrectNetwork: false,
        });
      }
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      const correctNetwork = await isCorrectNetwork();
      
      if (correctNetwork) {
        const balance = await getARBBalance(address);
        setWalletState({
          address,
          balance,
          isConnected: true,
          isCorrectNetwork: true,
        });
      } else {
        setWalletState({
          address,
          balance: null,
          isConnected: true,
          isCorrectNetwork: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка подключения';
      setTxState({
        status: 'error',
        hash: null,
        error: errorMessage,
      });
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToArbitrumGoerli();
      await initializeWallet();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка переключения сети';
      setTxState({
        status: 'error',
        hash: null,
        error: errorMessage,
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.recipient) {
      errors.recipient = 'Адрес получателя обязателен';
    } else if (!validateAddress(formData.recipient)) {
      errors.recipient = 'Неверный формат адреса';
    }

    if (walletState.balance) {
      const amountError = validateAmount(formData.amount, walletState.balance);
      if (amountError) {
        errors.amount = amountError;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setTxState({ status: 'pending', hash: null, error: null });

    try {
      const hash = await sendARBTokens(formData.recipient, formData.amount);
      setTxState({ status: 'success', hash, error: null });
      
      // Refresh balance after transaction
      if (walletState.address) {
        const balance = await getARBBalance(walletState.address);
        setWalletState({ ...walletState, balance });
      }
      
      // Reset form
      setFormData({ recipient: '', amount: '' });
      setFormErrors({});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка транзакции';
      setTxState({ status: 'error', hash: null, error: errorMessage });
    }
  };

  if (!isMetaMaskInstalled()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>MetaMask не установлен</AlertTitle>
            <AlertDescription>
              Для использования этого приложения установите{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                MetaMask
              </a>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">ARB Transfer</h1>
          <p className="text-muted-foreground">
            Отправка ARB токенов в сети Arbitrum Goerli
          </p>
        </div>

        {!walletState.isConnected ? (
          <Button onClick={handleConnectWallet} className="w-full" size="lg">
            <Wallet className="mr-2 h-5 w-5" />
            Подключить кошелёк
          </Button>
        ) : !walletState.isCorrectNetwork ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Неверная сеть</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Переключитесь на Arbitrum Goerli</p>
              <Button onClick={handleSwitchNetwork} variant="outline" size="sm">
                Переключить сеть
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="p-4 border rounded-lg space-y-2 bg-card">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Адрес:</span>
                <span className="font-mono text-xs">
                  {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
                </span>
              </div>
              {walletState.balance && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Баланс ARB:</span>
                  <span className="font-semibold">
                    {parseFloat(walletState.balance).toFixed(4)} ARB
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">
                  Адрес получателя
                </label>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="0x..."
                  value={formData.recipient}
                  onChange={(e) => {
                    setFormData({ ...formData, recipient: e.target.value });
                    setFormErrors({ ...formErrors, recipient: undefined });
                  }}
                  className={formErrors.recipient ? 'border-destructive' : ''}
                />
                {formErrors.recipient && (
                  <p className="text-sm text-destructive">{formErrors.recipient}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Сумма (ARB)
                </label>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.0"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    setFormErrors({ ...formErrors, amount: undefined });
                  }}
                  className={formErrors.amount ? 'border-destructive' : ''}
                />
                {formErrors.amount && (
                  <p className="text-sm text-destructive">{formErrors.amount}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={txState.status === 'pending'}
              >
                {txState.status === 'pending' ? 'Отправка...' : 'Отправить'}
              </Button>
            </form>

            {txState.status === 'success' && txState.hash && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Транзакция успешна!</AlertTitle>
                <AlertDescription>
                  <a
                    href={`${ARBISCAN_BASE_URL}/tx/${txState.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline font-medium"
                  >
                    Посмотреть в Arbiscan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            {txState.status === 'error' && txState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>{txState.error}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
