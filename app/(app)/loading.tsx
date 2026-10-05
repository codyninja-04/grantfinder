export default function Loading() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="skeleton h-9 w-64" />
      <div className="skeleton h-4 w-96 max-w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-40" />
        ))}
      </div>
    </div>
  );
}
