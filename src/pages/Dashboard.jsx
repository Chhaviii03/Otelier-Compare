import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Filters } from '../components/Filters'
import { HotelCard } from '../components/HotelCard'
import { Loader } from '../components/Loader'
import { CompareDrawer } from '../components/CompareDrawer'
import { RequireRole } from '../components/RequireRole'
import { AdminFilters, applyAdminFilters } from '../components/AdminFilters'
import { useHotels } from '../hooks/useHotels'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const compareOpen = searchParams.get('compare') === 'open'
  const { isAdmin } = useAuth()
  const [adminFilters, setAdminFilters] = useState({})

  const {
    hotels,
    loading,
    error,
    nextPage,
    filters,
    updateFilters,
    search,
    loadMore,
  } = useHotels()

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: !!nextPage,
    loading,
  })

  const filteredHotels = isAdmin ? applyAdminFilters(hotels, adminFilters) : hotels

  useEffect(() => {
    search(1, false)
  }, [])

  const handleSearch = () => search(1, false)
  const closeCompare = () => setSearchParams({}, { replace: true })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <Filters
        filters={filters}
        onFiltersChange={updateFilters}
        onSearch={handleSearch}
        disabled={loading}
      />

      <RequireRole role="admin">
        <div className="mt-4">
          <AdminFilters
            adminFilters={adminFilters}
            onAdminFiltersChange={setAdminFilters}
            disabled={loading}
          />
        </div>
      </RequireRole>

      {error && (
        <div
          className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      {loading && <Loader />}

      {!loading && filteredHotels.length === 0 && !error && (
        <div className="mt-12 text-center text-gray-500">
          <p>
            {isAdmin && hotels.length > 0
              ? 'No hotels match the admin filters.'
              : 'No hotels found. Try another city or dates and click Search.'}
          </p>
        </div>
      )}

      {/* Sentinel for infinite scroll: when visible, next page is fetched */}
      {nextPage && <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />}

      <CompareDrawer open={compareOpen} onClose={closeCompare} />
    </div>
  )
}
