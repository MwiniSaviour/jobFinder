type NoteFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  className?: string;
};

export function NoteField({
  label,
  value,
  onChange,
  maxLength = 150,
  placeholder,
  className,
}: NoteFieldProps) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-[13px] font-semibold text-foreground">{label}</span>
      <textarea
        value={value}
        maxLength={maxLength}
        rows={3}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full resize-none rounded-[16px] border border-border bg-surface px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-brand"
      />
      <span className="mt-1 block text-right text-[12px] text-muted">
        {`${value.length}/${maxLength}`}
      </span>
    </label>
  );
}
