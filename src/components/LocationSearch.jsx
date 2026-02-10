import { useCallback, useEffect, useState } from 'react'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

/**
 * Uses OpenStreetMap Nominatim (free, no API key) to geocode user input into
 * { name, latitude, longitude } for the existing Amadeus nearby hotel search.
 * Replaces paid/Google-based location search with a fully open-source option.
 */
function searchNominatim(query) {
  if (!query || !String(query).trim()) return Promise.resolve([])
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '8',
  })
  return fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'OTELIER-WEB/1.0 (hospitality frontend)' },
  })
    .then((res) => res.json())
    .then((list) => (Array.isArray(list) ? list : []))
}

/**
 * LocationSearch: free location search via OSM Nominatim.
 * Returns { name, latitude, longitude } on selection. Same contract as before for filters/Amadeus.
 */
export function LocationSearch({ value, onChange, disabled, placeholder }) {
  const [query, setQuery] = useState(value ? value.name : '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setQuery(value ? value.name : '')
  }, [value?.name, value === null])

  const runSearch = useCallback(async () => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    setOpen(true)
    try {
      const list = await searchNominatim(q)
      setResults(list)
    } catch (_) {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleSelect = useCallback(
    (item) => {
      const name = item.display_name || ''
      const lat = item.lat != null ? parseFloat(item.lat) : null
      const lon = item.lon != null ? parseFloat(item.lon) : null
      if (name && lat != null && lon != null) {
        onChange({ name, latitude: lat, longitude: lon })
        setQuery(name)
        setOpen(false)
        setResults([])
      }
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    onChange(null)
    setQuery('')
    setResults([])
    setOpen(false)
  }, [onChange])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        runSearch()
      }
    },
    [runSearch]
  )

  const handleBlur = useCallback(() => {
    setTimeout(() => setOpen(false), 200)
  }, [])

  const inputClass =
    'flex-1 min-h-[42px] rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const btnSecondaryClass =
    'shrink-0 min-h-[42px] rounded-xl border border-gray-300 dark:border-gray-500 bg-transparent text-gray-600 dark:text-gray-400 px-3 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
  const btnTextClass =
    'shrink-0 min-h-[42px] rounded-xl px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 transition-colors'

  return (
    <div className="w-full relative">
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder || 'City, area, or landmark'}
          autoComplete="off"
          className={inputClass}
          aria-label="Search by city, neighborhood, or landmark"
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={disabled || loading || !query.trim()}
          className={btnSecondaryClass}
          aria-label="Search location"
        >
          {loading ? '…' : 'Search'}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={btnTextClass}
            aria-label="Clear location"
          >
            Clear
          </button>
        )}
      </div>
      {open && (results.length > 0 || loading) && (
        <ul
          className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto"
          role="listbox"
        >
          {loading && (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Searching…
            </li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No results found. Try another query.
            </li>
          )}
          {!loading &&
            results.map((item, i) => (
              <li
                key={item.place_id ?? i}
                role="option"
                tabIndex={0}
                onClick={() => handleSelect(item)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(item)}
                className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                {item.display_name}
              </li>
            ))}
        </ul>
      )}
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        Search by city, neighborhood, or landmark
      </p>
    </div>
  )
}
