const num = new Intl.NumberFormat('en-SG', { maximumFractionDigits: 0 });

export function formatSGD(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '';
  return `S$${num.format(value)}`;
}

export function compactSGD(value: number) {
  if (value >= 1_000_000) return `S$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `S$${Math.round(value / 1_000)}k`;
  return `S$${value}`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
