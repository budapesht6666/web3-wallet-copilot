# Web3 Wallet - Arbitrum ARB Transfer

Single-page Web3 application built with React/TypeScript for transferring ARB tokens on the Arbitrum network.

## Features

- 🦊 MetaMask Integration
- 🔗 Automatic wallet connection
- 🌐 Arbitrum One network support
- 📝 Form validation for recipient address and amount
- ✅ Transaction confirmation with Arbiscan link
- 📱 Mobile-first responsive design
- 🎨 Modern UI with shadcn/ui components

## Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **ethers.js** - Web3 Library
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Lucide React** - Icons

## Prerequisites

- Node.js 20+ and npm
- MetaMask browser extension
- Arbitrum One testnet/mainnet account with some ETH for gas fees

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Usage

1. **Install MetaMask**: If not already installed, download MetaMask from [metamask.io](https://metamask.io/)

2. **Open the Application**: Navigate to the app in your browser

3. **Connect Wallet**: Click "Connect MetaMask" to connect your wallet

4. **Switch to Arbitrum**: If you're not on the Arbitrum network, the app will prompt you to switch

5. **Send ARB**: 
   - Enter the recipient's Ethereum address
   - Enter the amount of ETH to send
   - Click "Send"
   - Confirm the transaction in MetaMask

6. **View Transaction**: After confirmation, a link to Arbiscan will be displayed to track your transaction

## Features Details

### Wallet Connection
- Detects MetaMask installation
- Requests account access
- Monitors account and network changes

### Network Validation
- Checks for Arbitrum One network (Chain ID: 42161)
- Automatically prompts to switch networks
- Adds Arbitrum network if not present

### Form Validation
- **Recipient Address**: Validates Ethereum address format
- **Amount**: Validates positive numbers and checks balance

### Transaction Flow
- Form validation before submission
- MetaMask confirmation popup
- Transaction hash display
- Direct link to Arbiscan explorer

## Security

- No private keys are stored or transmitted
- All transactions are confirmed through MetaMask
- Address validation prevents sending to invalid addresses
- Balance checks prevent overdraft

## License

MIT
