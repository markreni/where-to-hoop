import { useEffect, useId } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import supabase from '../utils/supabase'

const useEnrollmentsRealtime = () => {
  const queryClient = useQueryClient()
  const id: string = useId()

  useEffect(() => {
    const channel = supabase
      .channel(`enrollments-realtime-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_enrollment' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['enrollments'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, id])
}

export default useEnrollmentsRealtime
