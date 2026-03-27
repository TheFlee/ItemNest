interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

export default function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="border-b py-3 last:border-b-0">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-1 text-slate-800">{value}</div>
    </div>
  );
}