// Skeleton components for loading states

export function PhotoSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 rounded h-40 w-full"></div>
    </div>
  );
}

export function PhotoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <PhotoSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow">
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded p-3">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
        
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="h-10 bg-gray-300 rounded w-24"></div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </div>

        {/* Leaderboard entries */}
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  <div>
                    <div className="h-5 bg-gray-300 rounded w-32 mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SessionSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-32 mb-4"></div>
        
        {/* Photo */}
        <div className="bg-gray-300 rounded h-96 w-full mb-4"></div>
        
        {/* Form */}
        <div className="space-y-4">
          <div className="h-32 bg-gray-300 rounded"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-300 rounded w-32"></div>
            <div className="h-10 bg-gray-300 rounded w-20"></div>
            <div className="h-10 bg-gray-300 rounded w-20"></div>
            <div className="h-10 bg-gray-300 rounded w-20"></div>
            <div className="h-10 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border rounded p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="h-4 bg-gray-300 rounded w-12"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ 
  title, 
  message, 
  onRetry 
}: { 
  title: string; 
  message: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">😞</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      )}
    </div>
  );
}

export function EmptyState({ 
  title, 
  message, 
  action 
}: { 
  title: string; 
  message: string; 
  action?: React.ReactNode; 
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📭</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      {action}
    </div>
  );
}
