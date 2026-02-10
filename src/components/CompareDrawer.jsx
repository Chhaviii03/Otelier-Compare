import { useCompare } from '../context/CompareContext'
import { PriceChart, RatingChart } from './Charts'

export function CompareDrawer({ open, onClose }) {
  const { selected, clearAll, canCompare } = useCompare()

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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col overflow-hidden transition-colors duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Compare hotels</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!canCompare && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Select at least 2 hotels to compare.
            </p>
          )}
          {canCompare && (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price comparison
                </h3>
                <PriceChart hotels={selected} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating comparison
                </h3>
                <RatingChart hotels={selected} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
