// A fallback implementation for password hashing when bcrypt fails
// This uses built-in crypto to avoid native module dependencies

const crypto = require('crypto');

// Simple password hashing using SHA-256 and a salt
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
};

// Compare a plain password with a hashed password
const comparePassword = async (plainPassword, hashedPassword) => {
  // Check if it's a pbkdf2 hash (our fallback method)
  if (hashedPassword.startsWith('pbkdf2:')) {
    const [prefix, salt, storedHash] = hashedPassword.split(':');
    const hash = crypto.pbkdf2Sync(plainPassword, salt, 10000, 64, 'sha512').toString('hex');
    return storedHash === hash;
  }
  
  // If it's a bcrypt hash or other format, comparison will always fail
  // We have to return false as we can't verify it without bcrypt
  console.warn('Attempted to verify a non-pbkdf2 password hash without bcrypt');
  return false;
};

module.exports = {
  hashPassword,
  comparePassword
};
