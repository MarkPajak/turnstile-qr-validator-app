// scripts/setupSecrets.js

const fs = require('fs');
const path = require('path');

// Define paths
const secretDir = path.join(__dirname, '..', 'secret');
const sourceFile = path.join(__dirname, '..', 'secret_template.json');
const destFile = path.join(secretDir, 'pretix_settings.json');

// Create secret directory if it doesn't exist
if (!fs.existsSync(secretDir)) {
  fs.mkdirSync(secretDir);
  console.log('✅ Created "secret" directory.');
} else {
  console.log('ℹ️ "secret" directory already exists.');
}

// Copy template file if it doesn't already exist
if (!fs.existsSync(destFile)) {
  fs.copyFileSync(sourceFile, destFile);
  console.log('✅ Copied "secret_template.json" to "secret/pretix_settings.json".');
} else {
  console.log('ℹ️ "secret/pretix_settings.json" already exists. Skipping copy.');
}
