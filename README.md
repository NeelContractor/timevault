# Time Vault

A decentralized time management and scheduling application built on Solana blockchain.

## Project Structure

The project consists of two main components:

### Backend (`timevault/`)
- Solana smart contracts built using the Anchor framework
- Written in Rust
- Handles the core blockchain functionality

### Frontend (`timevault_fe/`)
- Next.js application with TypeScript
- Styled with Tailwind CSS
- Provides the user interface for interacting with the smart contracts

## Prerequisites

- Node.js (v16 or higher)
- Rust and Cargo
- Solana CLI tools
- Anchor framework
- Yarn or npm package manager

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd timevault
```

2. Install dependencies:
```bash
yarn install
```

3. Build the program:
```bash
anchor build
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd timevault_fe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Development

- Backend development requires a local Solana validator running
- Frontend development server runs on `http://localhost:3000`
- Smart contract tests can be run using `anchor test`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.