#!/bin/zsh

echo "🔎 Scanning for invalid <Link><a> patterns across project..."

APP_DIR=~/Downloads/felena-theory-app
cd "$APP_DIR" || {
  echo "❌ App directory not found at $APP_DIR"
  exit 1
}

echo "📂 Searching in .tsx files..."
grep -rn '<Link[^>]*>\s*<a' . --include="*.tsx"

echo "\n👆 The above lines still contain nested <a> inside <Link>."
echo "✏️ Please edit these files and apply the fix manually:"
echo "Replace:  <Link href='/x'><a>Text</a></Link>"
echo "With:     <Link href='/x'>Text</Link>"
