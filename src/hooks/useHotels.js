import { useCallback, useState } from 'react'
import { fetchHotelOffers } from '../api/amadeus'

export function useHotels(initialFilters = {}) {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nextPage, setNextPage] = useState(null)
  const [filters, setFilters] = useState({
    cityCode: 'PAR',
    adults: 1,
    checkInDate: '',
    checkOutDate: '',
    ...initialFilters,
  })

  const search = useCallback(
    async (page = 1, append = false) => {
      setError(null)
      setLoading(true)
      try {
        const result = await fetchHotelOffers({
          ...filters,
          page,
          pageSize: 10,
        })
        if (append) {
          setHotels((prev) => [...prev, ...result.data])
        } else {
          setHotels(result.data || [])
        }
        setNextPage(result.nextPage ?? null)
        return result
      } catch (e) {
        const message = e?.message || 'Failed to load hotels'
        setError(message)
        if (!append) setHotels([])
        setNextPage(null)
      } finally {
        setLoading(false)
      }
    },
    [filters]
  )

  const loadMore = useCallback(() => {
    if (!nextPage || loading) return
    search(nextPage, true)
  }, [nextPage, loading, search])

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  return {
    hotels,
    loading,
    error,
    nextPage,
    filters,
    updateFilters,
    search,
    loadMore,
  }
}
