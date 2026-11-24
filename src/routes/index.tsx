import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">The Coach</h1>
        <p className="mt-3 text-sm text-muted-foreground">Coming soon</p>
      </div>
    </main>
  );
}
