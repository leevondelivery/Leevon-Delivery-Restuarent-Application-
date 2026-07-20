const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const backupPath = path.join(__dirname, '../package.json.bak');

try {
  console.log('1. Exporting Expo web build...');
  execSync('npx expo export --platform web', { stdio: 'inherit' });

  console.log('2. Backing up package.json...');
  fs.copyFileSync(packageJsonPath, backupPath);

  console.log('3. Modifying package.json (removing runtime dependencies for packager)...');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Emptying dependencies for electron-builder so it skips scanning node_modules
  packageJson.dependencies = {};
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('4. Running electron-builder to package the desktop app...');
  // Run electron-builder
  execSync('npx electron-builder', { stdio: 'inherit' });

  console.log('5. Restoring original package.json...');
  fs.copyFileSync(backupPath, packageJsonPath);
  fs.unlinkSync(backupPath);
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Desktop build failed:', error);
  if (fs.existsSync(backupPath)) {
    console.log('Restoring package.json from backup due to error...');
    fs.copyFileSync(backupPath, packageJsonPath);
    fs.unlinkSync(backupPath);
  }
  process.exit(1);
}
