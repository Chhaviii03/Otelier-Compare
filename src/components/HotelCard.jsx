import { useCompare } from '../context/CompareContext'

export function HotelCard({ hotel, fallbackCityName, fallbackType, isFallbackMode, showScore }) {
  const { toggleHotel, isSelected, maxCompare, selected, suggestedHotelId } = useCompare()
  const selectedCount = selected.length
  const canAdd = isSelected(hotel.id) || selectedCount < maxCompare
  const isCapitalFallback = isFallbackMode && fallbackType === 'capital' && fallbackCityName
  const isSuggested = suggestedHotelId != null && hotel.id === suggestedHotelId

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                {hotel.name}
              </h3>
              {isSuggested && (
                <span className="shrink-0 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                  ⭐ Suggested
                </span>
              )}
              {!isSuggested && isFallbackMode && fallbackType !== 'capital' && (
                <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                  Recommended
                </span>
              )}
            </div>
            {hotel.address && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate" title={hotel.address}>
                {hotel.address}
              </p>
            )}
            {isCapitalFallback && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                📍 {fallbackCityName} (Capital)
              </p>
            )}
            {isFallbackMode && fallbackCityName && !isCapitalFallback && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Location: {fallbackCityName}
              </p>
            )}
          </div>
          <label className="flex items-center gap-2 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected(hotel.id)}
              disabled={!canAdd}
              onChange={() => toggleHotel(hotel)}
              className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">Compare</span>
          </label>
        </div>
        {/* Price · rating · qualitative location. Distance removed: API often returns missing/NaN, so we show a stable label instead. */}
        <div className="mt-4 flex flex-wrap items-baseline gap-x-1.5 text-sm text-gray-500 dark:text-gray-400">
          {hotel.price != null && !Number.isNaN(Number(hotel.price)) && (
            <>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">€{Number(hotel.price).toFixed(0)}</span>
              <span aria-hidden className="select-none">·</span>
            </>
          )}
          {hotel.rating != null && !Number.isNaN(Number(hotel.rating)) && (
            <>
              <span>{Number(hotel.rating).toFixed(1)} rating</span>
              <span aria-hidden className="select-none">·</span>
            </>
          )}
          <span>Central location</span>
        </div>
        {showScore && hotel.score != null && !Number.isNaN(Number(hotel.score)) && (
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-mono">
            Score: {Number(hotel.score).toFixed(2)}
          </p>
        )}
      </div>
    </div>
  )
}
