import { useCallback } from 'react'

const CHAINS = [
  { value: '', label: 'Any' },
  { value: 'Hotel', label: 'Generic' },
  { value: 'Marriott', label: 'Marriott' },
  { value: 'Hilton', label: 'Hilton' },
  { value: 'Hyatt', label: 'Hyatt' },
  { value: 'Novotel', label: 'Novotel' },
]

export function AdminFilters({ adminFilters, onAdminFiltersChange, disabled }) {
  const handleChange = useCallback(
    (field, value) => {
      onAdminFiltersChange((prev) => ({ ...prev, [field]: value }))
    },
    [onAdminFiltersChange]
  )

  return (
    <div className="admin-panel bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-amber-800 mb-3">Admin filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Min price (€)
          </label>
          <input
            type="number"
            min={0}
            value={adminFilters.minPrice ?? ''}
            onChange={(e) =>
              handleChange('minPrice', e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={disabled}
            placeholder="0"
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Max price (€)
          </label>
          <input
            type="number"
            min={0}
            value={adminFilters.maxPrice ?? ''}
            onChange={(e) =>
              handleChange('maxPrice', e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={disabled}
            placeholder="Any"
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Min rating
          </label>
          <select
            value={adminFilters.minRating ?? ''}
            onChange={(e) => handleChange('minRating', e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Any</option>
            {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((r) => (
              <option key={r} value={r}>
                {r}+
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Max distance (km)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={adminFilters.maxDistance ?? ''}
            onChange={(e) =>
              handleChange('maxDistance', e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={disabled}
            placeholder="Any"
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Hotel chain
          </label>
          <select
            value={adminFilters.chain ?? ''}
            onChange={(e) => handleChange('chain', e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {CHAINS.map((c) => (
              <option key={c.value || 'any'} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

/**
 * Apply admin filters to hotel list (client-side). Used when role is admin.
 */
export function applyAdminFilters(hotels, adminFilters) {
  if (!adminFilters || !hotels?.length) return hotels
  const { minPrice, maxPrice, minRating, maxDistance, chain } = adminFilters
  return hotels.filter((h) => {
    const price = h.price != null ? Number(h.price) : null
    if (minPrice !== '' && minPrice != null && (price == null || price < minPrice))
      return false
    if (maxPrice !== '' && maxPrice != null && (price == null || price > maxPrice))
      return false
    const rating = h.rating != null ? Number(h.rating) : null
    if (minRating !== '' && minRating != null && (rating == null || rating < minRating))
      return false
    const distance = h.distanceFromAirport ?? h.distance
    const distNum = distance != null && !Number.isNaN(Number(distance)) ? Number(distance) : null
    if (maxDistance !== '' && maxDistance != null && distNum != null && distNum > maxDistance)
      return false
    if (chain && !(h.name || '').toLowerCase().includes(chain.toLowerCase()))
      return false
    return true
  })
}
