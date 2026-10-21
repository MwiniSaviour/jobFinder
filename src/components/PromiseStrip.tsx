export function PromiseStrip({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2 rounded-[16px] border border-border bg-surface-alt px-4 py-3.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          {item}
        </li>
      ))}
    </ul>
  );
}
