const variants = {
  draft: {
    bg: 'bg-warning-500/15',
    text: 'text-warning-500',
    dot: 'bg-warning-500',
    label: 'Draft',
  },
  approved: {
    bg: 'bg-success-500/15',
    text: 'text-success-500',
    dot: 'bg-success-500',
    label: 'Approved',
  },
  received: {
    bg: 'bg-info-500/15',
    text: 'text-info-500',
    dot: 'bg-info-500',
    label: 'Received',
  },
};

export default function StatusBadge({ status }) {
  const v = variants[status] || variants.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${v.bg} ${v.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
      {v.label}
    </span>
  );
}
