export default function Loading() {
  return (
    <div className="bg-pbs-bg-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb skeleton */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
            <div>/</div>
            <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
          </div>
        </nav>

        {/* Category Header skeleton */}
        <header className="bg-white border-l-4 border-gray-300 p-8 mb-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="h-6 bg-gray-300 rounded w-20 mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-96 animate-pulse"></div>
          </div>
        </header>

        {/* Ad Banner skeleton */}
        <div className="h-24 bg-gray-200 rounded mb-8 animate-pulse"></div>

        {/* Articles Grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-pbs-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-5">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Info skeleton */}
        <div className="mt-12 bg-white border border-pbs-gray-200 p-6">
          <div className="h-6 bg-gray-300 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gray-300 rounded w-24 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-28 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}