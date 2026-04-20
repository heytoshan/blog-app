// Skeleton loading components
export const BlogCardSkeleton = () => (
  <div className="surface rounded-2xl overflow-hidden">
    <div className="h-52 skeleton" />
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full skeleton" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-24 skeleton" />
          <div className="h-2.5 w-16 skeleton" />
        </div>
      </div>
      <div className="h-4 w-full skeleton" />
      <div className="h-4 w-4/5 skeleton" />
      <div className="h-3.5 w-3/4 skeleton" />
      <div className="h-3.5 w-2/3 skeleton" />
    </div>
  </div>
);

export const BlogDetailSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-pulse">
    <div className="h-10 w-3/4 skeleton rounded-xl" />
    <div className="h-5 w-1/3 skeleton rounded-full" />
    <div className="h-[420px] skeleton rounded-2xl" />
    <div className="space-y-4">
      {[100, 90, 95, 80, 85, 70].map((w, i) => (
        <div key={i} className="skeleton rounded-full" style={{ height: 14, width: `${w}%` }} />
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-10">
    <div className="surface rounded-2xl p-8 mb-8">
      <div className="flex gap-8">
        <div className="w-28 h-28 rounded-2xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-48 skeleton rounded-xl" />
          <div className="h-4 w-32 skeleton rounded-full" />
          <div className="h-4 w-full skeleton rounded-full" />
          <div className="h-4 w-3/4 skeleton rounded-full" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-60 skeleton rounded-2xl" />)}
    </div>
  </div>
);
