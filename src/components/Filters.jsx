import { useCallback } from 'react'
import { LocationSearch } from './LocationSearch'

export function Filters({ filters, onFiltersChange, onSearch, disabled }) {
  const handleChange = useCallback(
    (field, value) => {
      onFiltersChange({ [field]: value })
    },
    [onFiltersChange]
  )

  const handleLocationChange = useCallback(
    (location) => {
      onFiltersChange({ location })
    },
    [onFiltersChange]
  )

  const inputClass =
    'w-full min-h-[42px] rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-5 transition-colors duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5 items-end">
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Location
          </label>
          <LocationSearch
            value={filters.location || null}
            onChange={handleLocationChange}
            disabled={disabled}
            placeholder="City, area, or landmark"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Check-in
          </label>
          <input
            type="date"
            value={filters.checkInDate}
            onChange={(e) => handleChange('checkInDate', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Check-out
          </label>
          <input
            type="date"
            value={filters.checkOutDate}
            onChange={(e) => handleChange('checkOutDate', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Guests
          </label>
          <input
            type="number"
            min={1}
            max={9}
            value={filters.adults}
            onChange={(e) => handleChange('adults', Number(e.target.value) || 1)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <button
            type="button"
            onClick={onSearch}
            disabled={disabled}
            className="w-full min-h-[42px] rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  )
}
