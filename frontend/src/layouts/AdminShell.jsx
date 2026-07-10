export function AdminShell({ children }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,rgba(57,91,100,0.08),transparent_320px)] p-4 sm:p-5 lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden lg:p-4">
      <header className="mx-auto mb-3 grid w-full max-w-[1440px] shrink-0 gap-2 sm:flex sm:items-start sm:justify-between">
        <div>
          <h1 className="break-words text-3xl font-extrabold leading-tight tracking-normal text-slate-950 lg:text-[34px]">ShineHub VPP Batch Dispatch</h1>
          <p className="mt-1.5 text-slate-500">Safe control-event dispatch, live device status, retries, and audit evidence.</p>
        </div>
        <div>
          <span className="inline-flex min-h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700">Admin Portal Prototype</span>
        </div>
      </header>
      {children}
    </main>
  );
}
