#!/bin/bash

# TalentScreen Autofill Extension - Build Script
# Creates production-ready ZIP for Chrome Web Store

set -e

cd "$(dirname "$0")"

echo "🚀 TalentScreen Autofill - Build Script"
echo "========================================"

# Get version from manifest.json
VERSION=$(cat manifest.json | grep '"version"' | sed 's/.*"version": "\(.*\)".*/\1/')
echo "📦 Version: $VERSION"

# Create dist directory
mkdir -p dist

# Output filename
OUTPUT="dist/talentscreen-autofill-v${VERSION}.zip"

echo "🧹 Cleaning old builds..."
rm -f dist/*.zip

echo "📋 Creating package..."

# Create ZIP excluding development files
zip -r "$OUTPUT" . \
  -x "*.DS_Store" \
  -x "*/.DS_Store" \
  -x "*.git*" \
  -x ".claude/*" \
  -x "docs/*" \
  -x "dist/*" \
  -x "node_modules/*" \
  -x "*.log" \
  -x "*.md" \
  -x "build.sh" \
  -x "build.ps1" \
  -x "package*.json" \
  -x ".env*" \
  -x "*.txt" \
  -q

echo "✅ Package created: $OUTPUT"

# Show package info
SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo "📊 Package size: $SIZE"

# List contents
echo ""
echo "📦 Package contents:"
unzip -l "$OUTPUT" | tail -n 20 | head -n 19

echo ""
echo "✨ Build complete!"
echo ""
echo "Next steps:"
echo "1. Test: Load unpacked extension from current directory"
echo "2. Upload: $OUTPUT to Chrome Web Store"
echo "3. Submit: Fill store listing and submit for review"
echo ""
echo "📚 See docs/guides/PUBLISHING_GUIDE.md for details"
