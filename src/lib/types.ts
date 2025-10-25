export interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
}

export interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash: string | null;
  error: string | null;
}

export interface FormData {
  recipient: string;
  amount: string;
}

export interface FormErrors {
  recipient?: string;
  amount?: string;
}
