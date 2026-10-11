// Thư viện thành phần Fluent 2-inspired (token hóa qua Tailwind + CSS variables)
import React, { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Info, CheckCircle2, AlertTriangle, XCircle, Search, Inbox } from 'lucide-react';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// ---------- Button ----------
type BtnVariant = 'primary' | 'secondary' | 'subtle' | 'transparent' | 'danger';
export function Button({ variant = 'secondary', size = 'md', icon, children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md'; icon?: React.ReactNode }) {
  const v: Record<BtnVariant, string> = {
    primary: 'bg-brand text-fg-inv hover:bg-brand-hover active:bg-brand-pressed border border-transparent',
    secondary: 'bg-surface text-fg border border-line-strong hover:bg-hover active:bg-subtle',
    subtle: 'bg-transparent text-fg hover:bg-hover border border-transparent',
    transparent: 'bg-transparent text-brand-fg hover:underline border border-transparent',
    danger: 'bg-bad text-fg-inv hover:opacity-90 border border-transparent',
  };
  return (
    <button {...p} className={cx('inline-flex items-center justify-center gap-1.5 rounded-control font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap', size === 'sm' ? 'h-7 px-2 text-cap' : 'h-8 px-3 text-body', v[variant], className)}>
      {icon && <span className="[&>svg]:w-4 [&>svg]:h-4 shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
export function IconButton({ label, children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button aria-label={label} title={label} {...p} className={cx('inline-flex h-8 w-8 items-center justify-center rounded-control text-fg-2 hover:bg-hover hover:text-fg [&>svg]:w-[18px] [&>svg]:h-[18px]', className)}>{children}</button>;
}

// ---------- Card ----------
export function Card({ title, subtitle, actions, children, className, pad = true, ...rest }: { title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; children?: React.ReactNode; className?: string; pad?: boolean } & Omit<React.HTMLAttributes<HTMLElement>, 'title'>) {
  return (
    <section {...rest} className={cx('bg-surface rounded-card shadow-card min-w-0', className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
          <div className="min-w-0"><h3 className="text-sub font-semibold">{title}</h3>{subtitle && <p className="text-cap text-fg-3 mt-0.5">{subtitle}</p>}</div>
          {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={cx(pad && 'px-4 pb-4', !title && pad && 'pt-4')}>{children}</div>
    </section>
  );
}

// ---------- Badge ----------
export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'idle' | 'brand';
const toneCls: Record<Tone, string> = { ok: 'bg-ok-soft text-ok', warn: 'bg-warn-soft text-warn', bad: 'bg-bad-soft text-bad', info: 'bg-info-soft text-info', idle: 'bg-idle-soft text-idle', brand: 'bg-brand-soft text-brand-fg' };
export function Badge({ tone = 'idle', children, dot, className }: { tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2 h-5 text-cap font-semibold whitespace-nowrap', toneCls[tone], className)}>{dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}{children}</span>;
}

// ---------- Field / inputs ----------
export function Field({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: (id: string, describedBy?: string) => React.ReactNode }) {
  const id = useId();
  const dId = hint || error ? `${id}-d` : undefined;
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label htmlFor={id} className="text-body font-semibold text-fg">{label}{required && <span className="text-bad"> *</span>}</label>
      {children(id, dId)}
      {(error || hint) && <p id={dId} className={cx('text-cap', error ? 'text-bad' : 'text-fg-3')}>{error || hint}</p>}
    </div>
  );
}
const wFull = (c?: string) => (c && /(^|\s)w-/.test(c) ? '' : 'w-full');
const inputBase = 'h-8 rounded-control bg-surface border border-line-strong border-b-fg-3 px-2.5 text-body text-fg placeholder:text-fg-3 focus:outline-none focus:border-b-brand focus:border-b-2 aria-[invalid=true]:border-b-bad';
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) { return <input ref={ref} {...p} className={cx(inputBase, wFull(className), className)} />; });
export function Select({ className, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...p} className={cx(inputBase, wFull(className), 'pr-7 cursor-pointer', className)}>{children}</select>; }
export function Textarea({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...p} className={cx(inputBase, 'w-full h-auto py-1.5 min-h-[80px]', className)} />; }
export function SearchBox({ value, onChange, placeholder = 'Tìm kiếm', className, id }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; id?: string }) {
  return (
    <div className={cx('relative', className)}>
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" aria-hidden />
      <input id={id} aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cx(inputBase, 'w-full pl-8')} />
    </div>
  );
}
export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer text-body"><input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[rgb(var(--brand))]" />{label}</label>;
}
export function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-body">
      <span className={cx('relative w-10 h-5 rounded-full border transition-colors', checked ? 'bg-brand border-brand' : 'bg-surface border-fg-3')}>
        <span className={cx('absolute top-[3px] w-3 h-3 rounded-full transition-all', checked ? 'left-[22px] bg-fg-inv' : 'left-[3px] bg-fg-2')} />
      </span>{label}
    </button>
  );
}

// ---------- Tabs ----------
export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    refs.current[n]?.focus(); onChange(tabs[n].id);
  };
  return (
    <div role="tablist" className={cx('flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((t, i) => (
        <button key={t.id} ref={(el) => (refs.current[i] = el)} role="tab" aria-selected={value === t.id} tabIndex={value === t.id ? 0 : -1} onKeyDown={(e) => onKey(e, i)} onClick={() => onChange(t.id)}
          className={cx('relative px-3 h-10 text-body whitespace-nowrap hover:text-fg', value === t.id ? 'font-semibold text-fg' : 'text-fg-2')}>
          {t.label}{t.count !== undefined && <span className="ml-1.5 text-cap text-fg-3 tnum">{t.count.toLocaleString('vi-VN')}</span>}
          {value === t.id && <span className="absolute left-3 right-3 bottom-0 h-[3px] rounded-full bg-brand" />}
        </button>
      ))}
    </div>
  );
}

// ---------- MessageBar ----------
export function MessageBar({ intent = 'info', title, children, action, onDismiss }: { intent?: 'info' | 'success' | 'warning' | 'error'; title?: string; children?: React.ReactNode; action?: React.ReactNode; onDismiss?: () => void }) {
  const map = { info: ['bg-info-soft', 'text-info', Info], success: ['bg-ok-soft', 'text-ok', CheckCircle2], warning: ['bg-warn-soft', 'text-warn', AlertTriangle], error: ['bg-bad-soft', 'text-bad', XCircle] } as const;
  const [bg, fg, Icon] = map[intent];
  return (
    <div role={intent === 'error' ? 'alert' : 'status'} className={cx('flex items-start gap-2.5 rounded-control px-3 py-2 border border-line', bg)}>
      <Icon className={cx('w-4 h-4 mt-0.5 shrink-0', fg)} aria-hidden />
      <div className="flex-1 min-w-0 text-body">{title && <span className="font-semibold mr-1.5">{title}</span>}<span className="text-fg-2">{children}</span></div>
      {action}
      {onDismiss && <IconButton label="Đóng" onClick={onDismiss} className="h-6 w-6 -mr-1"><X /></IconButton>}
    </div>
  );
}

// ---------- Dialog & Drawer (focus trap + restore) ----------
function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const sel = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    setTimeout(() => (el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>(sel))?.focus(), 10);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'Tab' && el) {
        const f = Array.from(el.querySelectorAll<HTMLElement>(sel)).filter((x) => !x.hasAttribute('disabled'));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open]);
  return ref;
}
export function Dialog({ open, onClose, title, description, children, footer, width = 'max-w-lg' }: { open: boolean; onClose: () => void; title: string; description?: string; children?: React.ReactNode; footer?: React.ReactNode; width?: string }) {
  const ref = useFocusTrap(open, onClose);
  const id = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-t`} aria-describedby={description ? `${id}-d` : undefined} className={cx('anim-pop w-full bg-surface rounded-panel shadow-dialog flex flex-col max-h-[90vh]', width)}>
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-2">
          <div><h2 id={`${id}-t`} className="text-title3 font-semibold">{title}</h2>{description && <p id={`${id}-d`} className="text-body text-fg-2 mt-1">{description}</p>}</div>
          <IconButton label="Đóng hộp thoại" onClick={onClose}><X /></IconButton>
        </div>
        <div className="px-6 py-3 overflow-y-auto">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 px-6 pb-5 pt-3">{footer}</div>}
      </div>
    </div>
  );
}
export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-[560px]' }: { open: boolean; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; width?: string }) {
  const ref = useFocusTrap(open, onClose);
  const id = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/25" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-t`} className={cx('anim-slide h-full w-full bg-surface shadow-dialog flex flex-col', width)}>
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3 border-b border-line">
          <div className="min-w-0"><h2 id={`${id}-t`} className="text-title3 font-semibold">{title}</h2>{subtitle && <div className="text-body text-fg-2 mt-0.5">{subtitle}</div>}</div>
          <IconButton label="Đóng" onClick={onClose}><X /></IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 px-6 py-3 border-t border-line">{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Toast ----------
type ToastT = { id: number; intent: 'success' | 'info' | 'warning' | 'error'; title: string; body?: string };
const ToastCtx = createContext<(t: Omit<ToastT, 'id'>) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastT[]>([]);
  const push = (t: Omit<ToastT, 'id'>) => { const id = Date.now() + Math.random(); setItems((x) => [...x, { ...t, id }]); setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4200); };
  const icon = { success: <CheckCircle2 className="w-5 h-5 text-ok" />, info: <Info className="w-5 h-5 text-info" />, warning: <AlertTriangle className="w-5 h-5 text-warn" />, error: <XCircle className="w-5 h-5 text-bad" /> };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[min(360px,calc(100vw-32px))]">
        {items.map((t) => (
          <div key={t.id} className="anim-slide flex gap-3 bg-surface rounded-card shadow-flyout p-3 border border-line">
            {icon[t.intent]}<div className="min-w-0"><p className="font-semibold">{t.title}</p>{t.body && <p className="text-cap text-fg-2 mt-0.5">{t.body}</p>}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------- DataTable ----------
export interface Column<T> { key: string; header: string; render: (r: T) => React.ReactNode; sort?: (r: T) => string | number; align?: 'left' | 'right' | 'center'; width?: string; hideSm?: boolean }
export function DataTable<T extends { id: string }>({ rows, columns, onRowClick, pageSize = 12, empty = 'Không có dữ liệu phù hợp với bộ lọc.', dense, selectable, selected, onSelect, caption }: { rows: T[]; columns: Column<T>[]; onRowClick?: (r: T) => void; pageSize?: number; empty?: string; dense?: boolean; selectable?: boolean; selected?: Set<string>; onSelect?: (s: Set<string>) => void; caption?: string }) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [rows.length]);
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sort) return rows;
    return [...rows].sort((a, b) => { const x = col.sort!(a), y = col.sort!(b); return (x > y ? 1 : x < y ? -1 : 0) * dir; });
  }, [rows, sortKey, dir, columns]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const view = sorted.slice(page * pageSize, page * pageSize + pageSize);
  const allSel = selectable && view.length > 0 && view.every((r) => selected?.has(r.id));
  return (
    <div className="min-w-0">
      <div className="overflow-x-auto">
        <table className="w-full text-body border-collapse">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line text-left">
              {selectable && <th className="w-10 px-3"><input type="checkbox" aria-label="Chọn tất cả" checked={!!allSel} onChange={(e) => { const s = new Set(selected); view.forEach((r) => (e.target.checked ? s.add(r.id) : s.delete(r.id))); onSelect?.(s); }} className="w-4 h-4 accent-[rgb(var(--brand))]" /></th>}
              {columns.map((c) => (
                <th key={c.key} scope="col" style={{ width: c.width }} className={cx('px-3 h-9 font-semibold text-fg-2 whitespace-nowrap', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center', c.hideSm && 'hidden md:table-cell')} aria-sort={sortKey === c.key ? (dir === 1 ? 'ascending' : 'descending') : undefined}>
                  {c.sort ? (
                    <button className="inline-flex items-center gap-1 hover:text-fg" onClick={() => { if (sortKey === c.key) setDir((d) => (d === 1 ? -1 : 1)); else { setSortKey(c.key); setDir(1); } }}>
                      {c.header}{sortKey === c.key ? (dir === 1 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : null}
                    </button>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr key={r.id} onClick={() => onRowClick?.(r)} onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(r)} tabIndex={onRowClick ? 0 : undefined}
                className={cx('border-b border-line last:border-0', onRowClick && 'cursor-pointer hover:bg-hover focus:bg-hover', selected?.has(r.id) && 'bg-brand-soft')}>
                {selectable && <td className="px-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label="Chọn dòng" checked={!!selected?.has(r.id)} onChange={(e) => { const s = new Set(selected); e.target.checked ? s.add(r.id) : s.delete(r.id); onSelect?.(s); }} className="w-4 h-4 accent-[rgb(var(--brand))]" /></td>}
                {columns.map((c) => <td key={c.key} className={cx('px-3', dense ? 'py-1.5' : 'py-2.5', c.align === 'right' && 'text-right tnum', c.align === 'center' && 'text-center', c.hideSm && 'hidden md:table-cell')}>{c.render(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <EmptyState title="Không có kết quả" body={empty} />}
      </div>
      {rows.length > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-cap text-fg-2">
          <span className="tnum">Hiển thị {page * pageSize + 1}–{Math.min(rows.length, (page + 1) * pageSize)} / {rows.length.toLocaleString('vi-VN')} bản ghi</span>
          <div className="flex items-center gap-1">
            <IconButton label="Trang trước" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-30"><ChevronLeft /></IconButton>
            <span className="tnum px-2">Trang {page + 1}/{pages}</span>
            <IconButton label="Trang sau" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-30"><ChevronRight /></IconButton>
          </div>
        </div>
      )}
    </div>
  );
}

export function EmptyState({ title, body, action, icon }: { title: string; body?: string; action?: React.ReactNode; icon?: React.ReactNode }) {
  return <div className="flex flex-col items-center text-center py-10 px-4 gap-2">{icon ?? <Inbox className="w-10 h-10 text-fg-3" aria-hidden />}<p className="text-sub font-semibold">{title}</p>{body && <p className="text-body text-fg-2 max-w-sm">{body}</p>}{action}</div>;
}
export function Skeleton({ className }: { className?: string }) { return <div className={cx('animate-pulse rounded-control bg-subtle', className)} />; }

export function Progress({ value, tone = 'brand', label }: { value: number; tone?: Tone; label?: string }) {
  const c: Record<Tone, string> = { brand: 'bg-brand', ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', info: 'bg-info', idle: 'bg-idle' };
  return <div role="progressbar" aria-label={label} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full rounded-full bg-subtle overflow-hidden"><div className={cx('h-full rounded-full', c[tone])} style={{ width: `${Math.min(100, value * 100)}%` }} /></div>;
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const parts = name.trim().split(' ');
  const ini = (parts[parts.length - 1]?.[0] ?? '') + (parts.length > 1 ? parts[0][0] : '');
  const hues = ['bg-brand-soft text-brand-fg', 'bg-ok-soft text-ok', 'bg-warn-soft text-warn', 'bg-info-soft text-info', 'bg-bad-soft text-bad'];
  const h = hues[name.length % hues.length];
  return <span aria-hidden className={cx('inline-flex items-center justify-center rounded-full font-semibold shrink-0', h)} style={{ width: size, height: size, fontSize: size * 0.38 }}>{ini.toUpperCase()}</span>;
}

export function PageHeader({ title, subtitle, uc, actions }: { title: string; subtitle?: string; uc?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div className="min-w-0">
        {uc && <p className="text-cap font-semibold tracking-wide text-fg-3 uppercase mb-1">{uc}</p>}
        <h1 className="text-title2 font-semibold">{title}</h1>
        {subtitle && <p className="text-body text-fg-2 mt-1 max-w-3xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, tone, icon, onClick }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: Tone; icon?: React.ReactNode; onClick?: () => void }) {
  const Comp: any = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className={cx('text-left bg-surface rounded-card shadow-card p-4 flex flex-col gap-1 min-w-0', onClick && 'hover:bg-hover transition-colors')}>
      <div className="flex items-center justify-between gap-2 text-cap text-fg-2 font-semibold">{label}{icon && <span className="text-fg-3 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}</div>
      <div className="text-title1 font-semibold tnum leading-tight">{value}</div>
      {sub && <div className={cx('text-cap', tone ? `text-${tone}` : 'text-fg-3')}>{sub}</div>}
    </Comp>
  );
}

export function KV({ items, cols = 2 }: { items: [string, React.ReactNode][]; cols?: number }) {
  return <dl className={cx('grid gap-x-6 gap-y-3', cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1')}>{items.map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-cap text-fg-3">{k}</dt><dd className="text-body mt-0.5 break-words">{v}</dd></div>)}</dl>;
}

export function Menu({ trigger, items }: { trigger: (open: () => void, isOpen: boolean) => React.ReactNode; items: { label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false); document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  return (
    <div ref={ref} className="relative" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      {trigger(() => setOpen((o) => !o), open)}
      {open && (
        <div role="menu" className="anim-pop absolute right-0 mt-1 z-30 min-w-[200px] bg-surface rounded-card shadow-flyout border border-line py-1">
          {items.map((it) => <button role="menuitem" key={it.label} onClick={() => { setOpen(false); it.onClick(); }} className={cx('w-full flex items-center gap-2 px-3 h-8 text-body hover:bg-hover text-left [&>svg]:w-4 [&>svg]:h-4', it.danger && 'text-bad')}>{it.icon}{it.label}</button>)}
        </div>
      )}
    </div>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) { return <div className="flex flex-wrap items-end gap-2 mb-3">{children}</div>; }
