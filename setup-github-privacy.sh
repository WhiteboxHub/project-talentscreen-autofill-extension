#!/bin/bash

# Quick setup script for hosting privacy policy on GitHub Pages
# Usage: ./setup-github-privacy.sh YOUR_GITHUB_USERNAME

set -e

if [ -z "$1" ]; then
    echo "❌ Error: GitHub username required"
    echo ""
    echo "Usage: ./setup-github-privacy.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./setup-github-privacy.sh whiteboxhub"
    exit 1
fi

USERNAME=$1
REPO_NAME="talentscreen-privacy"
REPO_URL="https://github.com/$USERNAME/$REPO_NAME.git"
PAGES_URL="https://$USERNAME.github.io/$REPO_NAME/"

echo "🚀 Setting up GitHub Pages for Privacy Policy"
echo "=============================================="
echo ""
echo "📝 Configuration:"
echo "   GitHub User: $USERNAME"
echo "   Repository:  $REPO_NAME"
echo "   Pages URL:   $PAGES_URL"
echo ""

# Check if privacy-policy.html exists
if [ ! -f "privacy-policy.html" ]; then
    echo "❌ Error: privacy-policy.html not found in current directory"
    exit 1
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Created temporary directory: $TEMP_DIR"

# Copy privacy policy
cp privacy-policy.html "$TEMP_DIR/index.html"
echo "✅ Copied privacy-policy.html to index.html"

# Initialize git repo
cd "$TEMP_DIR"
git init
git add index.html
git commit -m "Add privacy policy for TalentScreen Autofill Extension"
echo "✅ Git repository initialized"

# Check if remote repo exists (will fail if not)
echo ""
echo "⚠️  IMPORTANT: Make sure you've created the repository on GitHub:"
echo "   1. Go to: https://github.com/new"
echo "   2. Repository name: $REPO_NAME"
echo "   3. Make it PUBLIC"
echo "   4. Do NOT initialize with README"
echo ""
read -p "Press Enter when repository is created on GitHub..."

# Add remote and push
git branch -M main
git remote add origin "$REPO_URL"
echo "📤 Pushing to GitHub..."
git push -u origin main
echo "✅ Pushed to GitHub successfully"

# Cleanup
cd -
rm -rf "$TEMP_DIR"
echo "🧹 Cleaned up temporary directory"

echo ""
echo "✨ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Go to: https://github.com/$USERNAME/$REPO_NAME/settings/pages"
echo "   2. Under 'Build and deployment':"
echo "      - Source: Deploy from a branch"
echo "      - Branch: main"
echo "      - Folder: / (root)"
echo "   3. Click 'Save'"
echo "   4. Wait 1-2 minutes"
echo "   5. Your privacy policy will be live at:"
echo ""
echo "      $PAGES_URL"
echo ""
echo "   6. Add this URL to Chrome Web Store privacy field"
echo ""
echo "🎉 Done!"
