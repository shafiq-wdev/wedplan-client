export default function ServicesLoading() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8fa] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="h-64 animate-pulse-soft rounded-[2rem] bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 sm:h-80" />

        <div className="rounded-3xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/40 sm:p-5">
          <div className="h-12 animate-pulse-soft rounded-2xl bg-rose-50" />
          <div className="mt-4 flex gap-2 overflow-hidden">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="h-9 w-28 shrink-0 animate-pulse-soft rounded-full bg-rose-50"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-7 w-56 animate-pulse-soft rounded-lg bg-rose-100" />
            <div className="h-4 w-80 max-w-full animate-pulse-soft rounded bg-rose-50" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse-soft bg-rose-100" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/2 animate-pulse-soft rounded bg-rose-50" />
                  <div className="h-5 w-3/4 animate-pulse-soft rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse-soft rounded bg-rose-50" />
                  <div className="h-10 animate-pulse-soft rounded-full bg-rose-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
