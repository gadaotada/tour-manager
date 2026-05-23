import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: DashboardHome
});

function DashboardHome() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-50">
      <section className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-6 py-10">
        <p className="mb-3 text-sm font-medium text-cyan-300">Admin workspace</p>
        <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">Tour Manager</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
          Foundation ready for contracts, hotels, workers, RBAC, audit logs, reports, and realtime
          sync.
        </p>
      </section>
    </main>
  );
}
