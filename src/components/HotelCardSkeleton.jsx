export function HotelCardSkeleton() {
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 overflow-hidden animate-pulse">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          </div>
          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
        </div>
        <div className="mt-4 flex gap-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  )
}
