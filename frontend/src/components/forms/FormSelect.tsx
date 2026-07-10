interface Option {
  label: string;
  value: string | number;
}

interface FormSelectProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: string;
}

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  icon,
}: FormSelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
            <ion-icon name={icon} style={{ fontSize: "15px" }} />
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={`w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60 ${icon ? "py-2.5 pr-3.5 pl-9" : "px-3.5 py-2.5"}`}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
