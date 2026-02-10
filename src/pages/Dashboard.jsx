import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filters } from '../components/Filters'
import { HotelCard } from '../components/HotelCard'
import { HotelCardSkeleton } from '../components/HotelCardSkeleton'
import { FiltersSkeleton } from '../components/FiltersSkeleton'
import { CompareDrawer } from '../components/CompareDrawer'
import { AdminFilters, applyAdminFilters } from '../components/AdminFilters'
import { useAuth } from '../context/AuthContext'
import { useHotels } from '../hooks/useHotels'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { scoreAndSuggestHotels } from '../utils/hotelScoring'

const DEFAULT_FILTERS = { location: null, cityCode: 'PAR', adults: 1, checkInDate: '', checkOutDate: '' }

const SORT_OPTIONS = [
  { value: 'best', label: 'Best overall' },
  { value: 'price', label: 'Lowest price' },
  { value: 'rating', label: 'Highest rating' },
]

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const compareOpen = searchParams.get('compare') === 'open'
  const { role, isAdmin } = useAuth()
  const [adminFilters, setAdminFilters] = useState({})
  const [sortBy, setSortBy] = useState('best')
  const [showFilters, setShowFilters] = useState(false)

  const {
    hotels,
    loading,
    error,
    nextPage,
    filters,
    updateFilters,
    search,
    loadMore,
    searchMeta,
  } = useHotels()

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: !!nextPage,
    loading,
  })

  const filteredHotels = useMemo(() => {
    const list = isAdmin ? applyAdminFilters(hotels, adminFilters) : hotels
    if (!isAdmin || list.length === 0) return list
    const { scoredAndSorted } = scoreAndSuggestHotels(list)
    if (sortBy === 'price') {
      return [...scoredAndSorted].sort((a, b) => (Number(a.price) ?? 0) - (Number(b.price) ?? 0))
    }
    if (sortBy === 'rating') {
      return [...scoredAndSorted].sort((a, b) => (Number(b.rating) ?? 0) - (Number(a.rating) ?? 0))
    }
    return scoredAndSorted
  }, [hotels, isAdmin, adminFilters, sortBy])

  useEffect(() => {
    search(1, false)
  }, [])

  const handleSearch = () => search(1, false)
  const closeCompare = () => setSearchParams({}, { replace: true })

  const handleResetFilters = () => {
    updateFilters(DEFAULT_FILTERS)
    search(1, false)
  }

  const initialLoading = loading && hotels.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {showFilters ? 'Hide filters' : 'Show filters'}
        </button>
        {showFilters && (
          <div className="mt-3">
            {initialLoading ? (
              <FiltersSkeleton />
            ) : (
              <Filters
                filters={filters}
                onFiltersChange={updateFilters}
                onSearch={handleSearch}
                disabled={loading}
              />
            )}
          </div>
        )}
      </div>

      {role === 'admin' && (
        <div className="mt-4 space-y-4">
          <AdminFilters
            adminFilters={adminFilters}
            onAdminFiltersChange={setAdminFilters}
            disabled={loading}
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && (
        <div
          className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {searchMeta?.isFallback === true && searchMeta?.bannerMessage && (
        <div
          className="mt-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 p-4 rounded-r-xl"
          role="status"
        >
          <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">
            {searchMeta.bannerMessage}
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {initialLoading
          ? Array.from({ length: 6 }, (_, i) => <HotelCardSkeleton key={i} />)
          : filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                fallbackCityName={searchMeta?.fallbackCityName}
                fallbackType={searchMeta?.fallbackType}
                isFallbackMode={searchMeta?.isFallback}
                showScore={isAdmin}
              />
            ))}
      </div>

      {loading && hotels.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }, (_, i) => (
            <HotelCardSkeleton key={`more-${i}`} />
          ))}
        </div>
      )}

      {!loading && filteredHotels.length === 0 && !error && (
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-4" aria-hidden>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-1">
            {isAdmin && hotels.length > 0
              ? 'No hotels match the admin filters.'
              : 'No hotels found. Try another city or dates.'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            {isAdmin && hotels.length > 0 ? 'Adjust filters above.' : 'Open filters and click Search.'}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Reset filters
          </button>
        </div>
      )}

      {nextPage && !initialLoading && <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />}

      <CompareDrawer open={compareOpen} onClose={closeCompare} />
    </div>
  )
}
