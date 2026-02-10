import { useCompare } from '../context/CompareContext'

export function HotelCard({ hotel }) {
  const { toggleHotel, isSelected, maxCompare, selected } = useCompare()
  const selectedCount = selected.length
  const canAdd = isSelected(hotel.id) || selectedCount < maxCompare

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{hotel.name}</h3>
            {hotel.address && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate" title={hotel.address}>
                {hotel.address}
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
            <span className="text-sm text-gray-600 dark:text-gray-400">Compare</span>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {hotel.price != null && (
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              €{Number(hotel.price).toFixed(0)}
            </span>
          )}
          {hotel.rating != null && (
            <span className="text-gray-600 dark:text-gray-400">
              Rating: {Number(hotel.rating).toFixed(1)}
            </span>
          )}
          {hotel.distance != null && (
            <span className="text-gray-500 dark:text-gray-500">{hotel.distance} km from center</span>
          )}
        </div>
      </div>
    </div>
  )
}
