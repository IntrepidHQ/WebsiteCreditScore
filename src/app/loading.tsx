export default function Loading() {
  return (
    <main className="presentation-section" id="main-content">
      <div
        aria-busy="true"
        aria-live="polite"
        className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:px-6 lg:px-8"
        role="status"
      >
        <span className="sr-only">Loading audit</span>
        <div className="h-14 w-64 animate-pulse rounded-full bg-panel/70" />
        <div className="h-20 max-w-4xl animate-pulse rounded-[calc(var(--theme-radius-lg))] bg-panel/70" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-[26rem] animate-pulse rounded-[calc(var(--theme-radius-lg))] bg-panel/70" />
          <div className="h-[26rem] animate-pulse rounded-[calc(var(--theme-radius-lg))] bg-panel/70" />
        </div>
      </div>
    </main>
  );
}
