export default function JobsLoading() {
  return (
    <>
      <section className="border-b border-line bg-cream/40 pb-12 pt-[calc(72px+4rem)]">
        <div className="container-x">
          <div className="h-2.5 w-40 animate-pulse rounded-full bg-sand" />
          <div className="mt-5 h-14 w-[36rem] max-w-full animate-pulse rounded-lg bg-sand/80" />
          <div className="mt-4 h-3.5 w-[28rem] max-w-full animate-pulse rounded-full bg-sand/70" />
        </div>
      </section>
      <section className="container-x py-8">
        <div className="grid gap-10 lg:grid-cols-[248px_1fr] lg:gap-12">
          <div className="hidden space-y-7 lg:block">
            {[5, 6, 4, 3].map((rows, index) => (
              <div key={index} className="space-y-2">
                <div className="h-2 w-24 animate-pulse rounded-full bg-sand" />
                {Array.from({ length: rows }).map((_, row) => (
                  <div
                    key={row}
                    className="h-4 w-40 animate-pulse rounded bg-sand/60"
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between pb-4">
              <div className="h-3 w-24 animate-pulse rounded-full bg-sand/70" />
              <div className="h-8 w-28 animate-pulse rounded-full bg-sand/70" />
            </div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl border border-line px-5 py-5"
              >
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-sand" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-24 animate-pulse rounded-full bg-sand/70" />
                  <div className="h-4 w-56 max-w-full animate-pulse rounded bg-sand" />
                  <div className="h-2 w-40 animate-pulse rounded-full bg-sand/60" />
                </div>
                <div className="h-3 w-20 animate-pulse rounded-full bg-sand/70" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
