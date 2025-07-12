#!/bin/zsh

echo "📎 Deep Scan: Showing ALL <Link><a> usage by filename + line"

cd ~/Downloads/felena-theory-app || {
  echo "❌ App folder not found. Is it in ~/Downloads?"
  exit 1
}

echo "🔍 Scanning .tsx files..."
echo "---------------------------------------------"

# Show filename + line + context
grep -rIn '<Link' . --include="*.tsx" | grep '<a'

echo "---------------------------------------------"
echo "🔧 FIX: Replace this pattern:"
echo "  <Link href='/x'><a className='...'>Text</a></Link>"
echo "WITH:"
echo "  <Link href='/x' className='...'>Text</Link>"
