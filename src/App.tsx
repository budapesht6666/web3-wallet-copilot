import { useState } from 'react';
import { useWeb3Wallet } from './hooks/useWeb3Wallet';
import { TransferForm } from './components/TransferForm';
import { Button } from './components/ui/button';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Wallet, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';

function App() {
  const {
    account,
    isMetaMaskInstalled,
    isConnecting,
    isCorrectNetwork,
    error: walletError,
    balance,
    connectWallet,
    switchToArbitrum,
    sendTransaction,
  } = useWeb3Wallet();

  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const handleSendTransaction = async (to: string, amount: string) => {
    setTxError(null);
    setTxHash(null);
    try {
      const tx = await sendTransaction(to, amount);
      setTxHash(tx.hash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setTxError(errorMessage);
      throw err;
    }
  };

  // MetaMask not installed
  if (!isMetaMaskInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              MetaMask Required
            </CardTitle>
            <CardDescription>
              Please install MetaMask to use this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Download MetaMask
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wallet not connected
  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </CardTitle>
            <CardDescription>
              Connect your MetaMask wallet to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{walletError}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Wrong Network
            </CardTitle>
            <CardDescription>
              Please switch to Arbitrum One network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Connected Account: {account.slice(0, 6)}...{account.slice(-4)}
              </AlertDescription>
            </Alert>
            <Button onClick={switchToArbitrum} className="w-full">
              Switch to Arbitrum
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connected and on correct network
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Account: </span>
              <span className="font-mono">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
            {balance && (
              <div className="text-sm">
                <span className="text-muted-foreground">Balance: </span>
                <span className="font-semibold">
                  {parseFloat(balance).toFixed(4)} ETH
                </span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">Network: </span>
              <span className="font-semibold">Arbitrum One</span>
            </div>
          </CardContent>
        </Card>

        <TransferForm onSubmit={handleSendTransaction} balance={balance} />

        {txHash && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Transaction Successful</AlertTitle>
            <AlertDescription className="mt-2">
              <a
                href={`https://arbiscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                View on Arbiscan
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        {txError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{txError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default App;

