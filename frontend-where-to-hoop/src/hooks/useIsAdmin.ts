import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import supabase from '../utils/supabase'

const useIsAdmin = () => {
  const { user } = useAuth()

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
      if (error) return false
      return !!data
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return { isAdmin, isLoading }
}

export default useIsAdmin
