#!/bin/bash

echo "🔧 Building BeastValidator..."

SRC_JS="js/validate.js"
DEST_JS="dist/validate.min.js"

SRC_CSS="css/style.css"
DEST_CSS="dist/style.min.css"

mkdir -p dist

# Ensure terser and clean-css-cli are installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js and npm."
    exit 1
fi

# Minify JS
npx terser "$SRC_JS" --compress --mangle --output "$DEST_JS"
JS_ORIG=$(wc -c < "$SRC_JS")
JS_MIN=$(wc -c < "$DEST_JS")

# Minify CSS
npx cleancss "$SRC_CSS" -o "$DEST_CSS"
CSS_ORIG=$(wc -c < "$SRC_CSS")
CSS_MIN=$(wc -c < "$DEST_CSS")

cp $SRC_JS dist/
cp $SRC_CSS dist/

echo "✅ JS: $JS_ORIG → $JS_MIN bytes ($(awk "BEGIN {printf \"%.1f\", 100 - ($JS_MIN/$JS_ORIG)*100}")% saved)"
echo "✅ CSS: $CSS_ORIG → $CSS_MIN bytes ($(awk "BEGIN {printf \"%.1f\", 100 - ($CSS_MIN/$CSS_ORIG)*100}")% saved)"

echo "🚀 All assets built to ./dist/"

