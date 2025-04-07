# Wealth Guardian API

Backend API for the Wealth Guardian financial management application. This RESTful API provides endpoints for user authentication, account management, transaction tracking, budget planning, and savings goal management.

## Features

- 👤 User authentication with JWT
- 💳 Financial account management
- 💸 Transaction tracking and categorization
- 📊 Budget planning and progress tracking
- 🎯 Financial goals and savings targets
- 💰 Digital wallet with default balance
- 💱 P2P money transfers between users
- 💵 Razorpay integration for adding funds
- 📝 Data validation with Zod
- 🔒 Security best practices

## Tech Stack

- Node.js & Express
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Bcrypt password hashing
- Razorpay payment gateway
- Zod for data validation

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Razorpay account for payment integration

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd wealth-guardian-backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Copy the `.env.example` file to `.env`
   - Update the database connection string and other variables
   - Add your Razorpay API credentials

4. Set up the database
   ```
   npm run db:migrate
   ```

5. Start the development server
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token
- `POST /api/users/logout` - Logout and clear token
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Accounts
- `GET /api/accounts` - Get all user accounts
- `GET /api/accounts/:id` - Get specific account
- `POST /api/accounts` - Create a new account
- `PUT /api/accounts/:id` - Update an account
- `DELETE /api/accounts/:id` - Delete an account
- `GET /api/accounts/summary` - Get accounts summary

### Transactions
- `GET /api/transactions` - Get all transactions (with filtering)
- `GET /api/transactions/:id` - Get specific transaction
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `GET /api/transactions/categories` - Get transaction categories summary

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get specific budget
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget
- `GET /api/budgets/progress` - Get budget progress

### Goals
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get specific goal
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/:id` - Update a goal
- `DELETE /api/goals/:id` - Delete a goal
- `PUT /api/goals/:id/contribute` - Contribute to a goal
- `GET /api/goals/summary` - Get goals summary

### Wallet & Payments
- `GET /api/wallet` - Get wallet details and recent transactions
- `GET /api/wallet/transactions` - Get wallet transaction history
- `POST /api/wallet/deposit` - Create Razorpay payment order
- `POST /api/wallet/verify-payment` - Verify payment and add funds to wallet
- `POST /api/wallet/transfer` - Transfer money to another user
- `POST /api/wallet/webhook` - Razorpay webhook endpoint (for payment notifications)

## Data Models

### User
- id (UUID)
- email (unique)
- password (hashed)
- name
- createdAt
- updatedAt
- resetToken (for password reset)
- resetTokenExp (expiration for reset token)

### Account
- id (UUID)
- name
- type (CHECKING, SAVINGS, CREDIT_CARD, INVESTMENT, CASH, OTHER)
- balance
- currency
- userId
- createdAt
- updatedAt

### Transaction
- id (UUID)
- amount
- description
- date
- category
- type (INCOME, EXPENSE, TRANSFER)
- userId
- accountId
- createdAt
- updatedAt

### Budget
- id (UUID)
- name
- amount
- category
- period (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)
- startDate
- endDate
- userId
- createdAt
- updatedAt

### Goal
- id (UUID)
- name
- targetAmount
- currentAmount
- startDate
- targetDate
- category
- userId
- createdAt
- updatedAt

### Wallet
- id (UUID)
- balance (default: 1000)
- userId
- createdAt
- updatedAt

### WalletTransaction
- id (UUID)
- amount
- type (DEPOSIT, WITHDRAWAL, TRANSFER_IN, TRANSFER_OUT)
- description
- status (PENDING, COMPLETED, FAILED, CANCELLED)
- senderId (for transfers)
- receiverId (for transfers)
- walletId
- razorpayPaymentId (for deposits)
- createdAt
- updatedAt

### RazorpayPayment
- id (payment ID)
- orderId (unique)
- amount
- currency (default: INR)
- status (CREATED, AUTHORIZED, CAPTURED, REFUNDED, FAILED)
- walletId
- createdAt
- updatedAt

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License. 