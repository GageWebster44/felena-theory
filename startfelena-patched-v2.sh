#!/bin/zsh

echo "🛠 Running Felena Theory Deep Patch..."

# Fix legacy <Link><a> tags across all TSX files in the app
echo "🔁 Scanning for invalid <Link> usage..."

find . -name "*.tsx" | while read file; do
  echo "   ↪️  Patching: $file"
  # Remove nested <a> inside <Link>
  sed -i '' -E 's|<Link([^>]*)><a([^>]*)>([^<]*)</a></Link>|<Link\1\2>\3</Link>|g' "$file"
done

echo "✅ All <Link> patches complete."

# Ensure _app.tsx exists
if [ ! -f ./pages/_app.tsx ]; then
  echo "🛠 Creating _app.tsx..."
  cat > ./pages/_app.tsx <<EOF
import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
EOF
fi

# Ensure index.tsx exists
if [ ! -f ./pages/index.tsx ]; then
  echo "🛠 Creating index.tsx..."
  cat > ./pages/index.tsx <<EOF
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold">Felena Theory is Live 🚀</h1>
    </div>
  )
}
EOF
fi

echo "🚀 Starting dev server..."
npm run dev
