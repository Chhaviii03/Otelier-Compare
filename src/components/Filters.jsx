import { useCallback } from 'react'

const CITIES = [
  { code: 'PAR', label: 'Paris' },
  { code: 'LON', label: 'London' },
  { code: 'NYC', label: 'New York' },
  { code: 'MAD', label: 'Madrid' },
  { code: 'AMS', label: 'Amsterdam' },
]

export function Filters({ filters, onFiltersChange, onSearch, disabled }) {
  const handleChange = useCallback(
    (field, value) => {
      onFiltersChange({ [field]: value })
    },
    [onFiltersChange]
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm transition-colors duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City
          </label>
          <select
            value={filters.cityCode}
            onChange={(e) => handleChange('cityCode', e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            {CITIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={filters.checkInDate}
            onChange={(e) => handleChange('checkInDate', e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={filters.checkOutDate}
            onChange={(e) => handleChange('checkOutDate', e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Guests
          </label>
          <input
            type="number"
            min={1}
            max={9}
            value={filters.adults}
            onChange={(e) => handleChange('adults', Number(e.target.value) || 1)}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={onSearch}
            disabled={disabled}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  )
}
