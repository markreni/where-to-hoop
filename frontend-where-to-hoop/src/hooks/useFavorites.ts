import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { fetchFavorites, toggleFavoriteRequest } from '../utils/requests'

const useFavorites = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: favoriteIds = [], isLoading } = useQuery<string[]>({
    queryKey: ['favorites', user?.id],
    queryFn: () => fetchFavorites(user!.id),
    enabled: !!user,
  })

  const mutation = useMutation({
    mutationFn: ({ hoopId, add }: { hoopId: string; add: boolean }) =>
      toggleFavoriteRequest(user!.id, hoopId, add),
    onMutate: async ({ hoopId, add }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] })
      const previous = queryClient.getQueryData<string[]>(['favorites', user?.id])
      queryClient.setQueryData<string[]>(['favorites', user?.id], old => {
        const current = old ?? []
        return add
          ? [...new Set([...current, hoopId])]
          : current.filter(id => id !== hoopId)
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['favorites', user?.id], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    },
  })

  const isFavorited = (hoopId: string) => favoriteIds.includes(hoopId)

  const toggleFavorite = (hoopId: string) => {
    if (!user) return
    mutation.mutate({ hoopId, add: !isFavorited(hoopId) })
  }

  return { favoriteIds, isFavorited, toggleFavorite, isLoading }
}

export { useFavorites }
