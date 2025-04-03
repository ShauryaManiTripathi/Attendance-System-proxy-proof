const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Attempting to fix bcrypt installation...');

try {
  // Remove existing bcrypt installation
  console.log('Removing existing bcrypt...');
  execSync('pnpm remove bcrypt', { stdio: 'inherit' });
  
  // Clean any residual node_modules
  const bcryptPath = path.join(__dirname, '..', 'node_modules', 'bcrypt');
  if (fs.existsSync(bcryptPath)) {
    console.log('Cleaning residual bcrypt files...');
    fs.rmSync(bcryptPath, { recursive: true, force: true });
  }
  
  // Reinstall bcrypt
  console.log('Reinstalling bcrypt...');
  execSync('pnpm add bcrypt', { stdio: 'inherit' });
  
  console.log('bcrypt successfully reinstalled!');
} catch (error) {
  console.error('Failed to fix bcrypt:', error);
  console.log('You can continue to use the application with the fallback password utilities.');
}
