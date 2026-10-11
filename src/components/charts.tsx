import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Legend } from 'recharts';

// Đọc màu biểu đồ từ token CSS, cập nhật khi đổi theme (palette categorical đã kiểm định — dataviz skill)
export function useChartColors() {
  const read = () => {
    const s = getComputedStyle(document.documentElement);
    const g = (n: string) => s.getPropertyValue(n).trim();
    return { c1: g('--chart-1'), c2: g('--chart-2'), c3: g('--chart-3'), c4: g('--chart-4'), grid: g('--chart-grid'), axis: g('--chart-axis'), surface: `rgb(${g('--bg-surface')})`, fg: `rgb(${g('--fg-primary')})`, fg2: `rgb(${g('--fg-secondary')})`, line: `rgb(${g('--border-subtle')})`, brand: `rgb(${g('--brand')})`, ok: `rgb(${g('--ok')})`, warn: `rgb(${g('--warn')})`, bad: `rgb(${g('--bad')})`, subtle: `rgb(${g('--bg-subtle')})` };
  };
  const [c, setC] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setC(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const f = () => setC(read());
    mq.addEventListener?.('change', f);
    return () => { mo.disconnect(); mq.removeEventListener?.('change', f); };
  }, []);
  return c;
}

export function ChartTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-line rounded-card shadow-flyout px-3 py-2 text-cap min-w-[180px]">
      <p className="font-semibold text-body mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-fg-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color || p.fill }} />{p.name}</span>
          <span className="tnum font-semibold text-fg">{fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function LegendRow({ items }: { items: { label: string; color: string }[] }) {
  return <div className="flex flex-wrap gap-x-4 gap-y-1 text-cap text-fg-2">{items.map((i) => <span key={i.label} className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: i.color }} />{i.label}</span>)}</div>;
}

export function StackedBars({ data, keys, height = 280, fmt, yFmt }: { data: any[]; keys: { key: string; label: string; color: string }[]; height?: number; fmt?: (n: number) => string; yFmt?: (n: number) => string }) {
  const c = useChartColors();
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: c.line }} tick={{ fill: c.axis, fontSize: 12 }} interval={0} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} tickFormatter={yFmt} width={56} />
          <Tooltip cursor={{ fill: c.subtle, opacity: 0.6 }} content={<ChartTooltip fmt={fmt} />} />
          {keys.map((k, i) => <Bar key={k.key} dataKey={k.key} name={k.label} stackId="a" fill={k.color} stroke={c.surface} strokeWidth={1} radius={i === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendArea({ data, dataKey, name, color, height = 200, fmt, yFmt }: { data: any[]; dataKey: string; name: string; color: string; height?: number; fmt?: (n: number) => string; yFmt?: (n: number) => string }) {
  const c = useChartColors();
  const id = 'g' + dataKey;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.28} /><stop offset="100%" stopColor={color} stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: c.line }} tick={{ fill: c.axis, fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} tickFormatter={yFmt} width={48} />
          <Tooltip content={<ChartTooltip fmt={fmt} />} cursor={{ stroke: c.axis, strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} fill={`url(#${id})`} dot={false} activeDot={{ r: 5, stroke: c.surface, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Thanh ngang HTML (nhẹ, dễ đọc nhãn tiếng Việt dài)
export function HBarList({ rows, max, fmt, color, onClick }: { rows: { label: string; value: number; sub?: string; tone?: string; id?: string }[]; max?: number; fmt: (n: number) => string; color?: string; onClick?: (id: string) => void }) {
  const m = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => (
        <li key={r.label}>
          <button disabled={!onClick} onClick={() => r.id && onClick?.(r.id)} className="w-full text-left group disabled:cursor-default" title={`${r.label}: ${fmt(r.value)}`}>
            <div className="flex justify-between gap-2 text-cap mb-1"><span className="truncate text-fg group-enabled:group-hover:underline">{r.label}</span><span className="tnum font-semibold shrink-0">{fmt(r.value)}{r.sub && <span className="text-fg-3 font-normal"> · {r.sub}</span>}</span></div>
            <div className="h-2 rounded-full bg-subtle overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(r.value / m) * 100}%`, background: r.tone ?? color ?? 'rgb(var(--brand))' }} /></div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({ values, color, w = 96, h = 28 }: { values: number[]; color: string; w?: number; h?: number }) {
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 4) + 2, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  const last = pts[pts.length - 1];
  return <svg width={w} height={h} aria-hidden><path d={`${d}L${last[0]},${h}L2,${h}Z`} fill={color} opacity={0.12} /><path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" /><circle cx={last[0]} cy={last[1]} r={3} fill={color} /></svg>;
}

export function Donut({ parts, size = 132, label, sub }: { parts: { label: string; value: number; color: string }[]; size?: number; label: string; sub: string }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const r = size / 2 - 10, C = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(', ')}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--bg-subtle))" strokeWidth={14} />
        {parts.map((p) => { const len = (p.value / total) * C; const el = <circle key={p.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeWidth={14} strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-off} transform={`rotate(-90 ${size / 2} ${size / 2})`}><title>{p.label}: {p.value}</title></circle>; off += len; return el; })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-title3 font-semibold tnum">{label}</span><span className="text-[11px] text-fg-3">{sub}</span></div>
    </div>
  );
}
