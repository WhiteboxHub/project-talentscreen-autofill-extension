#!/bin/bash
# TalentScreen Extension Validation Script
# Run this before loading extension in Chrome

echo "🔍 TalentScreen - Extension Validator"
echo "======================================="
echo ""

ERRORS=0

# Check manifest.json
echo "📄 Checking manifest.json..."
if python3 -c "import json; json.load(open('manifest.json'))" 2>/dev/null; then
    echo "   ✅ Valid JSON"
else
    echo "   ❌ Invalid JSON"
    ((ERRORS++))
fi

# Check JavaScript files
echo ""
echo "🔧 Checking JavaScript syntax..."

if node --check src/background/background.js 2>/dev/null; then
    echo "   ✅ background.js"
else
    echo "   ❌ background.js has errors"
    ((ERRORS++))
fi

if node --check src/core/resumeProcessor.js 2>/dev/null; then
    echo "   ✅ resumeProcessor.js"
else
    echo "   ❌ resumeProcessor.js has errors"
    ((ERRORS++))
fi

if node --check src/ui/sidepanel.js 2>/dev/null; then
    echo "   ✅ sidepanel.js"
else
    echo "   ❌ sidepanel.js has errors"
    ((ERRORS++))
fi

# Check required files
echo ""
echo "📁 Checking required files..."

FILES=(
    "manifest.json"
    "src/background/background.js"
    "src/core/resumeProcessor.js"
    "src/ui/sidepanel.html"
    "src/ui/sidepanel.js"
    "src/ui/styles.css"
    "assets/icons/icon16.png"
    "assets/icons/icon48.png"
    "assets/icons/icon128.png"
    "assets/icons/logo_sidepanel.png"
    "docs/sample_resume.json"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ Missing: $file"
        ((ERRORS++))
    fi
done

# Check icon sizes
echo ""
echo "🖼️  Checking icon dimensions..."

check_icon_size() {
    local file=$1
    local expected=$2

    if [ -f "$file" ]; then
        # Use sips to get dimensions
        local width=$(sips -g pixelWidth "$file" 2>/dev/null | grep pixelWidth | awk '{print $2}')
        local height=$(sips -g pixelHeight "$file" 2>/dev/null | grep pixelHeight | awk '{print $2}')

        if [ "$width" = "$expected" ] && [ "$height" = "$expected" ]; then
            echo "   ✅ $file (${width}x${height})"
        else
            echo "   ⚠️  $file (${width}x${height}, expected ${expected}x${expected})"
        fi
    fi
}

check_icon_size "assets/icons/icon16.png" "16"
check_icon_size "assets/icons/icon48.png" "48"
check_icon_size "assets/icons/icon128.png" "128"

# Summary
echo ""
echo "======================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All checks passed!"
    echo ""
    echo "📥 Ready to load in Chrome:"
    echo "   1. Open chrome://extensions/"
    echo "   2. Enable 'Developer mode'"
    echo "   3. Click 'Load unpacked'"
    echo "   4. Select this folder:"
    echo "      $(pwd)"
    echo ""
    echo "📖 See LOAD_EXTENSION.md for detailed instructions"
else
    echo "❌ Found $ERRORS error(s)"
    echo "   Please fix errors before loading extension"
fi
echo "======================================="

exit $ERRORS
