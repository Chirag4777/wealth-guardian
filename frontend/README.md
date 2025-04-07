# Wealth Guardian - Frontend

This is the frontend application for the Wealth Guardian financial management system. It's built with React and Vite for a fast and modern user experience.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and set the appropriate API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Backend Integration

This application connects to the Wealth Guardian backend API. The integration is managed through service modules located in the `src/services` directory:

- `api.js` - Core API client configuration
- `authService.js` - Authentication and user profile services
- `walletService.js` - Wallet and transaction services

Make sure the backend server is running and accessible via the URL specified in your `.env` file.

## Features

- User authentication and profile management
- Wallet management
- Fund transfers
- Transaction history
- Personal finance analytics

## Technologies

- React
- Vite
- Tailwind CSS
- Axios for API requests
- Heroicons for UI icons

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
