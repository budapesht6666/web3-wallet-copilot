// Arbitrum Goerli Testnet configuration
export const ARBITRUM_GOERLI_CHAIN_ID = 421613;
export const ARBITRUM_GOERLI_CHAIN_ID_HEX = '0x66eed';

// ARB Token address on Arbitrum Goerli
export const ARB_TOKEN_ADDRESS = '0xE591bf0A0CF924A0674d7792db046B23CEbF5f34';

// Arbiscan Goerli base URL
export const ARBISCAN_BASE_URL = 'https://goerli.arbiscan.io';

// Network configuration
export const ARBITRUM_GOERLI_NETWORK = {
  chainId: ARBITRUM_GOERLI_CHAIN_ID_HEX,
  chainName: 'Arbitrum Goerli',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
  blockExplorerUrls: [ARBISCAN_BASE_URL],
};

// ERC20 ABI (minimal for transfer function)
export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];
