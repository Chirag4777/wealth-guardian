const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for user authentication
 * @param {String} id - User ID
 * @returns {String} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

/**
 * Set JWT token as HTTP-only cookie in response
 * @param {Object} res - Express response object
 * @param {String} token - JWT token
 */
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  res.cookie('jwt', token, cookieOptions);
};

/**
 * Clear JWT token cookie from response
 * @param {Object} res - Express response object
 */
const clearTokenCookie = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

module.exports = {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
}; 