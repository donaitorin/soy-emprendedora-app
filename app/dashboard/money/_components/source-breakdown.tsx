export default function SourceBreakdown({
  items,
}: {
  items: { label: string; amount: number; percentage: number }[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-secondary">Todavía no registraste ingresos este mes.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-semibold text-primary">{item.label}</span>
            <span className="text-secondary">{item.percentage}%</span>
          </div>
          <div className="h-2.25 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent" style={{ width: `${item.percentage}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
