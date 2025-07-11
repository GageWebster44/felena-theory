// pages/index.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4">Felena Theory</h1>
      <p className="text-lg text-center max-w-xl mb-6">
        Welcome to the first game where XP unlocks real-life royalty income. Analyze live market moves. Upgrade engines. Earn rewards.
      </p>

      <div className="flex space-x-4">
        <Link href="/dashboard">
          <a className="px-6 py-3 bg-green-600 rounded hover:bg-green-700 transition">Dashboard</a>
        </Link>
        <Link href="/marketplace">
          <a className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition">Marketplace</a>
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-8">Felena Holdings LLC © {new Date().getFullYear()}</p>
    </div>
  );
}