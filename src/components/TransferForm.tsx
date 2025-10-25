import { useState } from 'react';
import { isAddress } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TransferFormProps {
  onSubmit: (to: string, amount: string) => Promise<void>;
  balance: string | null;
}

export function TransferForm({ onSubmit, balance }: TransferFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const validateRecipient = (value: string): boolean => {
    if (!value) {
      setRecipientError('Recipient address is required');
      return false;
    }
    if (!isAddress(value)) {
      setRecipientError('Invalid Ethereum address');
      return false;
    }
    setRecipientError(null);
    return true;
  };

  const validateAmount = (value: string): boolean => {
    if (!value) {
      setAmountError('Amount is required');
      return false;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setAmountError('Amount must be greater than 0');
      return false;
    }
    if (balance && numValue > parseFloat(balance)) {
      setAmountError('Insufficient balance');
      return false;
    }
    setAmountError(null);
    return true;
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipient(value);
    if (value) {
      validateRecipient(value);
    } else {
      setRecipientError(null);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    if (value) {
      validateAmount(value);
    } else {
      setAmountError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const isRecipientValid = validateRecipient(recipient);
    const isAmountValid = validateAmount(amount);

    if (!isRecipientValid || !isAmountValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(recipient, amount);
      // Clear form on success
      setRecipient('');
      setAmount('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Send ARB</CardTitle>
        <CardDescription>
          Transfer ARB tokens on Arbitrum network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {balance && (
            <div className="text-sm text-muted-foreground">
              Balance: {parseFloat(balance).toFixed(4)} ETH
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={handleRecipientChange}
              disabled={isSubmitting}
              className={recipientError ? 'border-destructive' : ''}
            />
            {recipientError && (
              <p className="text-sm text-destructive">{recipientError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              placeholder="0.0"
              value={amount}
              onChange={handleAmountChange}
              disabled={isSubmitting}
              className={amountError ? 'border-destructive' : ''}
            />
            {amountError && (
              <p className="text-sm text-destructive">{amountError}</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !!recipientError || !!amountError}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
