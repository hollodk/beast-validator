#!/bin/bash

echo "🔧 Building BeastValidator..."

SRC_CSS="src/css/style.css"
DEST_CSS="dist/style.min.css"

mkdir -p dist

# Ensure terser and clean-css-cli are installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js and npm."
    exit 1
fi

# Minify CSS
npx cleancss "$SRC_CSS" -o "$DEST_CSS"
CSS_ORIG=$(wc -c < "$SRC_CSS")
CSS_MIN=$(wc -c < "$DEST_CSS")

cp $SRC_CSS dist/

echo "✅ CSS: $CSS_ORIG → $CSS_MIN bytes ($(awk "BEGIN {printf \"%.1f\", 100 - ($CSS_MIN/$CSS_ORIG)*100}")% saved)"

echo "🚀 All assets built to ./dist/"

