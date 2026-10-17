export default function JobLoading() {
  return (
    <div className="pt-[72px]">
      <div className="border-b border-line bg-cream/30">
        <div className="container-x pb-10 pt-6">
          <div className="h-2.5 w-52 animate-pulse rounded-full bg-sand" />
          <div className="mt-8 flex items-center gap-3">
            <div className="h-14 w-14 animate-pulse rounded-[14px] bg-sand" />
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-sand" />
              <div className="h-2.5 w-36 animate-pulse rounded-full bg-sand/70" />
            </div>
          </div>
          <div className="mt-7 h-12 w-[32rem] max-w-full animate-pulse rounded-lg bg-sand/80" />
          <div className="mt-5 h-3 w-[26rem] max-w-full animate-pulse rounded-full bg-sand/70" />
        </div>
      </div>
      <div className="container-x grid gap-14 py-14 lg:grid-cols-[minmax(0,1fr)_352px]">
        <div className="max-w-[46rem] space-y-4">
          <div className="h-5 w-full animate-pulse rounded bg-sand/70" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-sand/70" />
          <div className="mt-8 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-4 w-full animate-pulse rounded bg-sand/50"
              />
            ))}
          </div>
        </div>
        <div className="h-72 animate-pulse rounded-2xl border border-line bg-sand/40" />
      </div>
    </div>
  );
}
