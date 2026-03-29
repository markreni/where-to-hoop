import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { fetchFollowing, fetchPublicProfiles, toggleFollowRequest, fetchOutgoingFollowRequestIds } from '../utils/requests'
import type { PublicProfile } from '../types/types'

const useFollowing = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: followingIds = [], isLoading: isLoadingIds } = useQuery<string[]>({
    queryKey: ['following', user?.id],
    queryFn: () => fetchFollowing(user!.id),
    enabled: !!user,
  })

  const { data: requestedIds = [], isLoading: isLoadingRequested } = useQuery<string[]>({
    queryKey: ['followRequests', user?.id],
    queryFn: () => fetchOutgoingFollowRequestIds(user!.id),
    enabled: !!user,
  })

  const { data: followingProfiles = [], isLoading: isLoadingProfiles } = useQuery<PublicProfile[]>({
    queryKey: ['followingProfiles', followingIds],
    queryFn: () => fetchPublicProfiles(followingIds),
    enabled: followingIds.length > 0,
  })

  const mutation = useMutation({
    mutationFn: ({ targetId, add, targetIsPublic }: { targetId: string; add: boolean; targetIsPublic: boolean }) =>
      toggleFollowRequest(user!.id, targetId, add, targetIsPublic),
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
      queryClient.invalidateQueries({ queryKey: ['followRequests', user?.id] })
    },
  })

  const isFollowing = (targetId: string) => followingIds.includes(targetId)
  const isRequested = (targetId: string) => requestedIds.includes(targetId)

  const toggleFollow = (targetId: string, targetIsPublic: boolean) => {
    if (!user) return
    const add = !isFollowing(targetId) && !isRequested(targetId)
    mutation.mutate({ targetId, add, targetIsPublic })
  }

  return {
    followingIds,
    requestedIds,
    followingProfiles,
    isLoading: isLoadingIds || isLoadingProfiles || isLoadingRequested,
    isFollowing,
    isRequested,
    toggleFollow,
  }
}

export { useFollowing }
