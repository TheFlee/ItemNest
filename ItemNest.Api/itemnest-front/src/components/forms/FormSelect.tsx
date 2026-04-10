interface FormSelectOption {
  label: string;
  value: string | number;
}

interface FormSelectProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  required?: boolean;
  placeholder?: string;
}

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
}: FormSelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={`${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}