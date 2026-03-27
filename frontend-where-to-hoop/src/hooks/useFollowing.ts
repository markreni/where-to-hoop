import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { fetchFollowing, fetchPublicProfiles, toggleFollowRequest } from '../utils/requests'
import type { PublicProfile } from '../types/types'

const useFollowing = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: followingIds = [], isLoading: isLoadingIds } = useQuery<string[]>({
    queryKey: ['following', user?.id],
    queryFn: () => fetchFollowing(user!.id),
    enabled: !!user,
  })

  const { data: followingProfiles = [], isLoading: isLoadingProfiles } = useQuery<PublicProfile[]>({
    queryKey: ['followingProfiles', followingIds],
    queryFn: () => fetchPublicProfiles(followingIds),
    enabled: followingIds.length > 0,
  })

  const mutation = useMutation({
    mutationFn: ({ targetId, add }: { targetId: string; add: boolean }) =>
      toggleFollowRequest(user!.id, targetId, add),
    onMutate: async ({ targetId, add }) => {
      await queryClient.cancelQueries({ queryKey: ['following', user?.id] })
      const previous = queryClient.getQueryData<string[]>(['following', user?.id])
      queryClient.setQueryData<string[]>(['following', user?.id], old => {
        const current = old ?? []
        return add
          ? [...new Set([...current, targetId])]
          : current.filter(id => id !== targetId)
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['following', user?.id], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['followingProfiles'] })
    },
  })

  const isFollowing = (targetId: string) => followingIds.includes(targetId)

  const toggleFollow = (targetId: string) => {
    if (!user) return
    mutation.mutate({ targetId, add: !isFollowing(targetId) })
  }

  return {
    followingIds,
    followingProfiles,
    isLoading: isLoadingIds || isLoadingProfiles,
    isFollowing,
    toggleFollow,
  }
}

export { useFollowing }
