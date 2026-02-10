import { useCompare } from '../context/CompareContext'
import { PriceChart, RatingChart, DistanceChart } from './Charts'

export function CompareDrawer({ open, onClose }) {
  const { scoredAndSorted, clearAll, canCompare } = useCompare()
  const suggestedHotel = scoredAndSorted.find((h) => h.isSuggested)

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close comparison"
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col overflow-hidden transition-colors duration-200">
        <div className="flex justify-between items-center px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Compare hotels</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 text-xl leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {!canCompare && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select at least 2 hotels to compare.
            </p>
          )}
          {canCompare && (
            <>
              {suggestedHotel && (
                <div className="mb-6 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                  <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200 uppercase tracking-wide mb-1">
                    Suggested
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Best balance of price, rating, and airport proximity.
                  </p>
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mt-1">
                    ⭐ {suggestedHotel.name}
                  </p>
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Price
                </h3>
                <PriceChart hotels={scoredAndSorted} />
              </div>
              <div className="mb-8">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Rating
                </h3>
                <RatingChart hotels={scoredAndSorted} />
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Distance from airport (km)
                </h3>
                <DistanceChart hotels={scoredAndSorted} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
