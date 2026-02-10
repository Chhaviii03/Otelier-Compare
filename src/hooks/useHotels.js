import { useCallback, useState } from 'react'
import { fetchHotelOffers, searchHotels } from '../api/amadeus'

/** @typedef {{ isFallback?: boolean, bannerMessage?: string, fallbackCityName?: string, fallbackType?: string }} SearchMeta */

/**
 * Derive city and country from location name (e.g. "Patna, Bihar, India" → city: Patna, country: India).
 */
function parseCityAndCountry(locationName) {
  if (!locationName || typeof locationName !== 'string') return { city: '', country: '' }
  const parts = locationName.split(',').map((p) => p.trim()).filter(Boolean)
  const city = parts[0] || ''
  const country = parts.length > 1 ? parts[parts.length - 1] : ''
  return { city, country }
}

export function useHotels(initialFilters = {}) {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nextPage, setNextPage] = useState(null)
  const [searchMeta, setSearchMeta] = useState(/** @type {SearchMeta} */ ({}))

  const [filters, setFilters] = useState({
    location: null,
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
      const { city, country } = parseCityAndCountry(filters.location?.name)
      const useCapitalSearch = city && country

      try {
        if (useCapitalSearch && !append) {
          // Capital-city fallback path: searchHotels(city, country)
          const result = await searchHotels(city, country, {
            checkInDate: filters.checkInDate || undefined,
            checkOutDate: filters.checkOutDate || undefined,
            adults: filters.adults,
          })
          if (result.error && result.hotels.length === 0) {
            setError(result.error)
            setHotels([])
            setSearchMeta({})
          } else {
            setHotels(result.hotels || [])
            setSearchMeta({
              isFallback: result.isFallback ?? false,
              bannerMessage: result.bannerMessage,
              fallbackCityName: result.fallbackCity,
              fallbackType: result.fallbackType,
            })
          }
          setNextPage(null)
          return result
        }

        // Legacy path: fetchHotelOffers (location lat/long or default)
        const result = await fetchHotelOffers({
          ...filters,
          page,
          pageSize: 10,
        })
        if (append) {
          setHotels((prev) => [...prev, ...result.data])
        } else {
          setHotels(result.data || [])
          setSearchMeta({
            isFallback: result.isFallback ?? false,
            bannerMessage: result.bannerMessage,
            fallbackCityName: result.fallbackCityName,
            fallbackType: undefined,
          })
        }
        setNextPage(result.nextPage ?? null)
        return result
      } catch (e) {
        const message = e?.message || 'Failed to load hotels'
        setError(message)
        if (!append) {
          setHotels([])
          setSearchMeta({})
        }
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
    searchMeta,
  }
}
