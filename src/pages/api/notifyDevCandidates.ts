// pages/api/notifyDevCandidates.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { data: candidates, error } = await supabase
    .from('user_profiles')
    .select('id, username, xp')
    .gte('xp', 100000)
    .neq('devCandidateStatus', 'approved')

  if (error) return res.status(500).json({ error: error.message })
  if (!candidates || candidates.length === 0) return res.status(200).json({ message: 'No new candidates' })

  const alerts = candidates.map(user => `🚨 *Dev Candidate Found*:
• ID: ${user.id}
• XP: ${user.xp}
• Username: ${user.username || 'N/A'}`)

  await fetch(process.env.RECRUITING_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: alerts.join('\n\n') })
  })

  res.status(200).json({ message: `${candidates.length} notifications sent.` })
}