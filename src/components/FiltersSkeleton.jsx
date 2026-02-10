export function FiltersSkeleton() {
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
