# Loan Lightning Topup Visualizer (loan-ltv)

This project is a React application demonstrating a loan interface with Bitcoin collateral and Lightning Network top-up functionality. The app visualizes loan-to-value (LTV) ratios and allows users to manage their Bitcoin-backed loans through Lightning payments.

## Prerequisites

- Node.js (v18 or later recommended)
- npm

## Setup

1. Clone the repository (if you haven't already).
2. Navigate to the project directory:
   ```bash
   cd loan-ltv
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Development Server

To start the development server, run:

```bash
npm run dev
```

This will typically start the application on `http://localhost:5173` (Vite's default) or another port if 5173 is busy.

## Project Structure

- `public/`: Static assets.
- `src/`: Application source code.
  - `components/LoanLTVDemo.jsx`: The main loan visualization component.
  - `App.jsx`: Main application component that renders `LoanLTVDemo`.
  - `main.jsx`: Entry point of the React application.
  - `index.css`: Tailwind CSS imports and global styles.
- `vite.config.js`: Vite configuration with Tailwind CSS v4.

## Features

- Real-time Bitcoin price simulation
- LTV calculation and visualization
- Lightning Network invoice generation (mock)
- Transaction history tracking
- Responsive design with dark theme
- Demo controls for testing scenarios
