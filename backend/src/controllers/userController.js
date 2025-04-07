const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/jwtUtils');

/**
 * Register a new user
 * @route POST /api/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user and wallet in a transaction to ensure atomicity
  const result = await prisma.$transaction(async (prisma) => {
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create wallet with default balance of 1000
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 1000, // Default balance
      },
    });

    // Create initial transaction for default balance
    await prisma.walletTransaction.create({
      data: {
        amount: 1000,
        type: 'DEPOSIT',
        description: 'Initial wallet balance',
        walletId: wallet.id,
      },
    });

    return { user, wallet };
  });

  // Generate token
  const token = generateToken(result.user.id);
  setTokenCookie(res, token);

  // Return user data
  res.status(201).json({
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    wallet: {
      id: result.wallet.id,
      balance: result.wallet.balance,
    },
  });
});

/**
 * Authenticate user and get token
 * @route POST /api/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      wallet: true,
    },
  });

  // Check if user exists and password matches
  if (user && (await bcrypt.compare(password, user.password))) {
    // Generate token
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    // Create wallet if it doesn't exist (for existing users)
    let wallet = user.wallet;
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 1000, // Default balance
        },
      });

      // Create initial transaction for default balance
      await prisma.walletTransaction.create({
        data: {
          amount: 1000,
          type: 'DEPOSIT',
          description: 'Initial wallet balance',
          walletId: wallet.id,
        },
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      wallet: wallet ? {
        id: wallet.id,
        balance: wallet.balance,
      } : null,
    });
  } else {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
});

/**
 * Log out user by clearing cookie
 * @route POST /api/users/logout
 * @access Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: 'Logged out successfully' });
});

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
      wallet: {
        select: {
          id: true,
          balance: true,
        },
      },
    },
  });

  if (user) {
    res.json(user);
  } else {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
});

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Prepare data for update
  const updateData = {
    name: req.body.name || user.name,
    email: req.body.email || user.email,
    phone: req.body.phone || user.phone,
    address: req.body.address || user.address,
  };

  // If password is provided, hash it
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(req.body.password, salt);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
      updatedAt: true,
      wallet: {
        select: {
          id: true,
          balance: true,
        },
      },
    },
  });

  res.json(updatedUser);
});

/**
 * Check if an email exists in the database
 * @route GET /api/users/check-email
 * @access Public
 */
const checkEmailExists = asyncHandler(async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true } // Only select ID to minimize data retrieved
    });
    
    // Return only whether the user exists, not user details for security
    return res.json({ 
      success: true, 
      exists: !!user 
    });
    
  } catch (error) {
    console.error('Error checking email:', error);
    const err = new Error('Server error checking email');
    err.statusCode = 500;
    throw err;
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  checkEmailExists,
}; 