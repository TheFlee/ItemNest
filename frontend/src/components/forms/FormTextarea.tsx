interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
}

export default function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  disabled,
}: FormTextareaProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}
