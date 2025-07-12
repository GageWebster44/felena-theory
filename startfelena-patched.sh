#!/bin/zsh

echo "🔧 Running Felena Theory startup patch..."

# Fix old <Link> with <a> children pattern in pages directory
echo "🔁 Patching <Link> components..."
grep -rl '<Link href=' ./pages | xargs sed -i '' 's|<Link href="\([^"]*\)"><a\(.*\)>\(.*\)</a></Link>|<Link href="\1"\2>\3</Link>|g'

# Ensure _app.tsx exists
if [ ! -f ./pages/_app.tsx ]; then
  echo "🛠  Creating _app.tsx..."
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
  echo "🛠  Creating index.tsx..."
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

echo "✅ All patches applied. Starting dev server..."
npm run dev
