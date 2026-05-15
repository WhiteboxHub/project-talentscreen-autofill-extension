#!/usr/bin/env node
/**
 * Build script for TalentScreen - Whitebox Learning Autofill Extension
 * Creates a production-ready ZIP file for Chrome Web Store
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_FILE = 'extension.zip';
const EXCLUDE_PATTERNS = [
  '.git',
  '.claude',
  'node_modules',
  'build',
  'docs',
  '.gitignore',
  'package.json',
  'package-lock.json',
  'README.md',
  'PRIVACY_POLICY.md',
  '*.zip',
  '*.old'
];

console.log('🔨 Building TalentScreen - Whitebox Learning Autofill Extension...\n');

// Clean previous build
if (fs.existsSync(OUTPUT_FILE)) {
  fs.unlinkSync(OUTPUT_FILE);
  console.log('✓ Cleaned previous build');
}

// Create ZIP using system zip command
const excludeArgs = EXCLUDE_PATTERNS.map(p => `-x "*/${p}/*" "${p}" "*${p}"`).join(' ');
const command = `zip -r ${OUTPUT_FILE} . ${excludeArgs}`;

try {
  execSync(command, { stdio: 'pipe' });
  const stats = fs.statSync(OUTPUT_FILE);
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`✓ Created ${OUTPUT_FILE} (${sizeKB} KB)`);
  console.log('\n✅ Build complete! Ready for Chrome Web Store upload.\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
