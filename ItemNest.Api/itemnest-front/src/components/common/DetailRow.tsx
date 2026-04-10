interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

export default function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-1 border-b border-slate-200 py-4 last:border-b-0 sm:grid-cols-[160px_1fr] sm:gap-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="text-sm font-medium text-slate-800 sm:text-[15px]">{value}</div>
    </div>
  );
}