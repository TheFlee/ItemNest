interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: string;
}

export default function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  icon,
}: FormInputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
            <ion-icon name={icon} style={{ fontSize: "15px" }} />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60 ${icon ? "py-2.5 pr-3.5 pl-9" : "px-3.5 py-2.5"}`}
        />
      </div>
    </div>
  );
}
