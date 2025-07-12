import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [xp, setXp] = useState(1200)
  const [level, setLevel] = useState('Bronze')

  useEffect(() => {
    if (xp >= 3000) setLevel('Gold')
    else if (xp >= 1500) setLevel('Silver')
    else setLevel('Bronze')
  }, [xp])

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">XP Tracker</h1>
      <div className="bg-gray-700 w-full rounded-lg overflow-hidden">
        <div
          className="bg-green-500 h-6"
          style={{ width: `${(xp / 3000) * 100}%` }}
        ></div>
      </div>
      <p>XP: {xp}</p>
      <p>Badge Level: {level}</p>
    </div>
  )
}
