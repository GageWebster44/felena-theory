// lib/withXPGuard.tsx
import { useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'

export default function withXPGuard(Component, requiredXP) {
  return function Wrapped() {
    const user = useUser()
    const router = useRouter()
    const supabase = useSupabaseClient()
    const [xp, setXP] = useState(0)

    useEffect(() => {
      if (!user) return
      const fetchXP = async () => {
  try {
    const { data } = await supabase.from('xp_log').select('amount').eq('user_id', user.id)
  } catch (error) {
    console.error('❌ Supabase error in withXPGuard.tsx', error);
  }
        const totalXP = data?.reduce((acc, row) => acc + row.amount, 0) || 0
        setXP(totalXP)
        if (totalXP < requiredXP) router.push('/locked')
      }
      fetchXP()
    }, [user])

    return xp >= requiredXP ? <Component /> : <p>🔒 Accessing restricted simulation...</p>
  }
}
