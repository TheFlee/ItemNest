interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export default function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 5,
}: FormTextareaProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
      />
    </div>
  );
}