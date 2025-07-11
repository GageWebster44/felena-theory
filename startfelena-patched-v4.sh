#!/bin/zsh

echo "🧠 Felena Theory Boot Script v4 — Full Patch Mode"

APP_DIR=~/Downloads/felena-theory-app

# Step 1: Ensure correct working directory
cd "$APP_DIR" || {
  echo "❌ Error: Could not find app folder at $APP_DIR"
  exit 1
}

# Step 2: Fix broken <Link><a> patterns across all .tsx files
echo "🔁 Cleaning <Link><a> patterns..."
find . -name "*.tsx" | while read file; do
  sed -i '' -E 's|<Link([^>]*)><a([^>]*)>([^<]*)</a></Link>|<Link\1\2>\3</Link>|g' "$file"
done

# Step 3: Ensure entrypoint files exist
echo "📄 Validating required files..."

mkdir -p pages

if [ ! -f pages/_app.tsx ]; then
  echo "📎 Creating _app.tsx..."
  cat > pages/_app.tsx <<EOF
import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
EOF
fi

if [ ! -f pages/index.tsx ]; then
  echo "📎 Creating index.tsx..."
  cat > pages/index.tsx <<EOF
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold">Felena Theory is Live 🚀</h1>
    </div>
  )
}
EOF
fi

# Step 4: Safe install + build check before launch
echo "📦 Installing dependencies..."
npm install

echo "🔍 Verifying build integrity..."
npm run build || {
  echo "❌ Build failed. Fix the code before running dev server."
  exit 1
}

echo "🚀 All systems go. Starting dev server..."
npm run dev
