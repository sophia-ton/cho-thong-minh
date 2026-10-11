import { useEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, History, FileSignature, PauseCircle, UserPlus, Phone } from 'lucide-react';
import { stalls, markets, marketById, traderById, contractById, CATEGORIES, Stall, fmtVND, fmtDate, fmtNum, fmtPct, bills } from '../data/db';
import { useApp } from '../lib/app';
import { STALL_STATUS, CONTRACT_STATUS, VERIFY_STATUS } from '../lib/status';
import { Badge, Button, Card, Drawer, IconButton, KV, PageHeader, SearchBox, Select, Tabs, useToast, cx, Avatar, MessageBar, Dialog, Field, Input } from '../components/ui';

const CELL_W = 38, CELL_H = 28, GAP = 4, ZPAD = 14, ZHEAD = 30, AISLE = 14;
const rowY = (r: number) => r * (CELL_H + GAP) + Math.floor(r / 2) * AISLE;
const FILL: Record<string, string> = { rented: 'rgb(var(--brand) / .82)', empty: 'rgb(var(--stall-empty))', suspended: 'rgb(var(--warn) / .75)', reserved: 'rgb(var(--info) / .55)' };

export default function FloorPlan() {
  const { market, setMarket, focus } = useApp();
  const toast = useToast();
  const mId = market === 'all' ? 'han' : market;
  const m = marketById[mId];
  const ms = useMemo(() => stalls.filter((s) => s.marketId === mId), [mId]);
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState('');
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Stall | null>(null);
  const [hover, setHover] = useState<Stall | null>(null);
  const [zoneFilter, setZoneFilter] = useState<number | null>(null);
  const [rentOpen, setRentOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focus) return;
    if (focus.startsWith('zone-')) setZoneFilter(+focus.slice(5));
    else { const s = stalls.find((x) => x.id === focus); if (s) setSel(s); }
  }, [focus]);

  // Bố cục khu: 2 cột
  const layout = useMemo(() => {
    const zones = m.zones.map((z, i) => {
      const zs = ms.filter((s) => s.zoneIdx === i);
      const cols = Math.max(...zs.map((s) => s.col), 0) + 1, rows = Math.max(...zs.map((s) => s.row), 0) + 1;
      return { i, name: z, zs, w: cols * (CELL_W + GAP) - GAP + ZPAD * 2, h: rowY(rows - 1) + CELL_H + ZPAD * 2 + ZHEAD };
    }).filter((z) => zoneFilter === null || z.i === zoneFilter);
    const colsN = zones.length > 1 ? 2 : 1;
    const colW = Math.max(...zones.map((z) => z.w));
    const pos: { x: number; y: number }[] = [];
    const colY = Array(colsN).fill(0);
    zones.forEach((z) => { const c = colY[0] <= (colY[1] ?? Infinity) ? 0 : 1; pos.push({ x: c * (colW + 40), y: colY[c] }); colY[c] += z.h + 28; });
    return { zones, pos, W: colsN * colW + (colsN - 1) * 40, H: Math.max(...colY) - 28 };
  }, [m, ms, zoneFilter]);
  useEffect(() => { const w = box.current?.clientWidth ?? 1000; setZoom(Math.max(0.5, Math.min(1.4, Math.floor((w / (layout.W + 48)) * 20) / 20))); }, [layout]);

  const match = (s: Stall) => (!status || s.status === status) && (!cat || s.category === cat) && (!q || s.code.toLowerCase().includes(q.toLowerCase()) || (s.traderId && traderById[s.traderId].name.toLowerCase().includes(q.toLowerCase())));
  const filtering = !!(status || cat || q);
  const nMatch = filtering ? ms.filter(match).length : ms.length;
  const counts = { rented: ms.filter((s) => s.status === 'rented').length, empty: ms.filter((s) => s.status === 'empty').length, suspended: ms.filter((s) => s.status === 'suspended').length, reserved: ms.filter((s) => s.status === 'reserved').length };

  return (
    <>
      <PageHeader uc="UC-02 · UC-05 · UC-06 · Sơ đồ mặt bằng số" title={`Sơ đồ mặt bằng · ${m.name}`} subtitle={`${m.address}, ${m.phuong} · ${m.zones.length} khu · ${fmtNum(ms.length)} sạp/kiốt · lấp đầy ${fmtPct(m.fillRate)}`}
        actions={<Select aria-label="Chọn chợ" value={mId} onChange={(e) => { setMarket(e.target.value); setZoneFilter(null); }} className="w-[240px]">{markets.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</Select>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
          <button key={k} onClick={() => setStatus(status === k ? '' : k)} aria-pressed={status === k} className={cx('bg-surface rounded-card shadow-card px-4 py-3 text-left flex items-center gap-3 hover:bg-hover', status === k && 'ring-2 ring-brand')}>
            <span className="w-4 h-4 rounded-[3px] border border-line-strong shrink-0" style={{ background: FILL[k] }} />
            <span><span className="block text-cap text-fg-2">{STALL_STATUS[k][0]}</span><span className="block text-title3 font-semibold tnum">{fmtNum(counts[k])}</span></span>
          </button>
        ))}
      </div>

      <Card pad={false}>
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-line">
          <SearchBox value={q} onChange={setQ} placeholder="Tìm mã sạp hoặc tên tiểu thương" className="w-full sm:w-64" />
          <Select aria-label="Ngành hàng" value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto max-w-[220px]"><option value="">Tất cả ngành hàng</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
          <Select aria-label="Khu" value={zoneFilter ?? ''} onChange={(e) => setZoneFilter(e.target.value === '' ? null : +e.target.value)} className="w-auto max-w-[240px]"><option value="">Tất cả khu</option>{m.zones.map((z, i) => <option key={z} value={i}>{z}</option>)}</Select>
          {filtering && <span className="text-cap text-fg-2 tnum">{nMatch} sạp phù hợp</span>}
          <div className="flex-1" />
          <div className="flex items-center gap-0.5 border border-line rounded-control">
            <IconButton label="Thu nhỏ" onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}><ZoomOut /></IconButton>
            <span className="text-cap tnum w-12 text-center">{Math.round(zoom * 100)}%</span>
            <IconButton label="Phóng to" onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}><ZoomIn /></IconButton>
            <IconButton label="Vừa khung" onClick={() => setZoom(1)}><Maximize2 /></IconButton>
          </div>
        </div>
        <div ref={box} className="relative overflow-auto bg-subtle/60 max-h-[68vh]" style={{ backgroundImage: 'radial-gradient(rgb(var(--border-subtle)) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
          <svg width={(layout.W + 48) * zoom} height={(layout.H + 48) * zoom} viewBox={`-24 -24 ${layout.W + 48} ${layout.H + 48}`} role="img" aria-label={`Sơ đồ mặt bằng ${m.name}`} className="block">
            {layout.zones.map((z, zi) => {
              const p = layout.pos[zi];
              return (
                <g key={z.i} transform={`translate(${p.x},${p.y})`}>
                  <rect width={z.w} height={z.h} rx={10} fill="rgb(var(--bg-surface))" stroke="rgb(var(--border-strong))" />
                  <text x={ZPAD} y={20} fontSize={13} fontWeight={600} fill="rgb(var(--fg-primary))">{String.fromCharCode(65 + z.i)} · {z.name}</text>
                  <text x={z.w - ZPAD} y={20} fontSize={11} textAnchor="end" fill="rgb(var(--fg-muted))">{z.zs.length} sạp</text>
                  {z.zs.map((s) => {
                    const x = ZPAD + s.col * (CELL_W + GAP), y = ZHEAD + ZPAD + rowY(s.row);
                    const dim = filtering && !match(s);
                    const isSel = sel?.id === s.id;
                    return (
                      <g key={s.id} transform={`translate(${x},${y})`} className="cursor-pointer" tabIndex={0} role="button" aria-label={`Sạp ${s.code}, ${STALL_STATUS[s.status][0]}`}
                        onClick={() => setSel(s)} onKeyDown={(e) => e.key === 'Enter' && setSel(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(null)} opacity={dim ? 0.18 : 1}>
                        <rect width={CELL_W} height={CELL_H} rx={4} fill={FILL[s.status]} stroke={isSel ? 'rgb(var(--fg-primary))' : s.status === 'empty' ? 'rgb(var(--ok))' : 'rgb(var(--bg-surface))'} strokeWidth={isSel ? 2.5 : s.status === 'empty' ? 1.5 : 1} strokeDasharray={s.status === 'empty' ? '3 2' : undefined} />
                        {s.frontage && <rect width={CELL_W} height={3} rx={1.5} fill="rgb(var(--fg-primary) / .35)" />}
                        <text x={CELL_W / 2} y={CELL_H / 2 + 4} fontSize={10} textAnchor="middle" fontWeight={600} fill={s.status === 'rented' ? 'rgb(var(--fg-inverse))' : 'rgb(var(--fg-primary))'} style={{ pointerEvents: 'none' }}>{s.code.split('-')[1]}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
          {hover && (
            <div className="pointer-events-none sticky bottom-3 left-3 ml-3 mb-3 inline-block bg-surface border border-line rounded-card shadow-flyout px-3 py-2 text-cap max-w-[300px]">
              <p className="font-semibold text-body">{hover.code} · {hover.area} m²</p>
              <p className="text-fg-2">{hover.category}</p>
              <p className="text-fg-2">{hover.traderId ? traderById[hover.traderId].name : 'Chưa có người thuê'} · {fmtVND(hover.monthlyFee)}/tháng</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 border-t border-line text-cap text-fg-2">
          {Object.entries(STALL_STATUS).map(([k, [l]]) => <span key={k} className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-[3px] border border-line-strong" style={{ background: FILL[k] }} />{l}</span>)}
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-fg/40" />Mặt tiền / kiốt</span>
          <span className="ml-auto">Số hóa từ bản vẽ hiện trạng · Cập nhật 02/10/2026</span>
        </div>
      </Card>

      <StallDrawer stall={sel} onClose={() => setSel(null)} onRent={() => setRentOpen(true)} onAction={(t) => toast({ intent: 'success', title: t, body: sel?.code })} />
      <Dialog open={rentOpen} onClose={() => setRentOpen(false)} title={`Cho thuê sạp ${sel?.code ?? ''}`} description="Tạo hồ sơ thuê và chuyển sang lập hợp đồng (UC-07)."
        footer={<><Button onClick={() => setRentOpen(false)}>Hủy</Button><Button variant="primary" onClick={() => { setRentOpen(false); toast({ intent: 'success', title: 'Đã tạo dự thảo hợp đồng', body: `Sạp ${sel?.code} chuyển sang trạng thái Đang giữ chỗ.` }); }}>Tạo dự thảo hợp đồng</Button></>}>
        <div className="grid gap-4">
          <Field label="Tiểu thương" required hint="Nhập số CCCD để tra cứu định danh qua LGSP">{(id, d) => <Input id={id} aria-describedby={d} placeholder="048 1xx xxx xxx" />}</Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ngày bắt đầu">{(id) => <Input id={id} type="date" defaultValue="2026-11-01" />}</Field>
            <Field label="Thời hạn">{(id) => <Select id={id}><option>12 tháng</option><option>24 tháng</option><option>36 tháng</option><option>60 tháng</option></Select>}</Field>
          </div>
          {sel && <MessageBar intent="info">Đơn giá áp dụng: <b>{fmtVND(sel.monthlyFee)}/tháng</b> ({sel.area} m² × biểu phí {marketById[sel.marketId].cls}{sel.frontage ? ', hệ số mặt tiền 1,35' : ''}).</MessageBar>}
        </div>
      </Dialog>
    </>
  );
}

function StallDrawer({ stall, onClose, onRent, onAction }: { stall: Stall | null; onClose: () => void; onRent: () => void; onAction: (t: string) => void }) {
  const [tab, setTab] = useState<'info' | 'history' | 'bills'>('info');
  useEffect(() => setTab('info'), [stall?.id]);
  if (!stall) return null;
  const t = stall.traderId ? traderById[stall.traderId] : null;
  const c = stall.contractId ? contractById[stall.contractId] : null;
  const bs = bills.filter((b) => b.stallId === stall.id).slice(-6).reverse();
  const [label, tone] = STALL_STATUS[stall.status];
  return (
    <Drawer open onClose={onClose} title={<span className="flex items-center gap-2">Sạp {stall.code}<Badge tone={tone}>{label}</Badge></span>} subtitle={`${marketById[stall.marketId].name} · ${stall.zone}`}
      footer={stall.status === 'empty' || stall.status === 'reserved' ? <Button variant="primary" icon={<UserPlus />} onClick={onRent}>Cho thuê sạp</Button> : <><Button icon={<PauseCircle />} onClick={() => onAction('Đã ghi nhận tạm ngưng kinh doanh')}>Tạm ngưng</Button><Button variant="primary" icon={<FileSignature />} onClick={() => onAction('Đã mở hồ sơ gia hạn hợp đồng')}>Gia hạn hợp đồng</Button></>}>
      <Tabs className="mb-4 -mt-1" value={tab} onChange={setTab} tabs={[{ id: 'info', label: 'Thông tin' }, { id: 'history', label: 'Lịch sử biến động', count: stall.history.length }, { id: 'bills', label: 'Thu phí' }]} />
      {tab === 'info' && (
        <div className="flex flex-col gap-5">
          <KV items={[['Mã sạp', <span className="font-mono">{stall.code}</span>], ['Diện tích', `${stall.area} m²`], ['Ngành hàng', stall.category], ['Vị trí', `${stall.frontage ? 'Mặt tiền · ' : ''}Dãy ${stall.row + 1}, ô ${stall.col + 1}`], ['Giá dịch vụ / tháng', <b className="tnum">{fmtVND(stall.monthlyFee)}</b>], ['Đồng hồ điện / nước', <span className="font-mono text-cap">CT{stall.code.replace('-', '')} · DH{stall.code.replace('-', '')}</span>]]} />
          {t ? (
            <section className="border border-line rounded-card p-4">
              <div className="flex items-center gap-3 mb-3"><Avatar name={t.name} size={40} /><div className="min-w-0"><p className="font-semibold">{t.name}</p><p className="text-cap text-fg-3">{t.code} · {t.gender}, sinh năm {t.birthYear}</p></div><Badge tone={VERIFY_STATUS[t.verify][1]} className="ml-auto">{VERIFY_STATUS[t.verify][0]}</Badge></div>
              <KV items={[['Điện thoại', <span className="tnum select-all inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{t.phone}</span>], ['Sử dụng app', t.appUser ? 'Đã kích hoạt' : 'Chưa kích hoạt'], ['Địa chỉ', t.address], ['Vi phạm', t.violations ? `${t.violations} lần` : 'Không']]} />
            </section>
          ) : <MessageBar intent="success" title="Sạp đang trống.">Có thể cho thuê ngay; giá dịch vụ niêm yết {fmtVND(stall.monthlyFee)}/tháng.</MessageBar>}
          {c && (
            <section className="border border-line rounded-card p-4">
              <div className="flex items-center justify-between mb-3"><p className="font-semibold">{c.code}</p><Badge tone={CONTRACT_STATUS[c.status][1]}>{CONTRACT_STATUS[c.status][0]}</Badge></div>
              <KV items={[['Hiệu lực', `${fmtDate(c.start)} – ${fmtDate(c.end)}`], ['Còn lại', c.daysLeft >= 0 ? `${c.daysLeft} ngày` : `Quá hạn ${-c.daysLeft} ngày`], ['Tiền đặt cọc', fmtVND(c.deposit)], ['Mẫu', c.template]]} />
            </section>
          )}
        </div>
      )}
      {tab === 'history' && (
        <ol className="relative border-l-2 border-line ml-2 flex flex-col gap-4">
          {[...stall.history].sort((a, b) => b.date.localeCompare(a.date)).map((h, i) => (
            <li key={i} className="pl-5 relative"><span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-brand border-2 border-surface" /><p className="text-cap text-fg-3 tnum">{fmtDate(h.date)} · {h.by}</p><p className="text-body">{h.event}</p></li>
          ))}
          <li className="pl-5 text-cap text-fg-3 flex items-center gap-1.5"><History className="w-3.5 h-3.5" />Nhật ký được lưu tự động từ các nghiệp vụ hợp đồng, thu phí.</li>
        </ol>
      )}
      {tab === 'bills' && (bs.length ? (
        <table className="w-full text-body"><thead><tr className="text-left text-fg-2 border-b border-line"><th className="py-2 font-semibold">Kỳ</th><th className="font-semibold text-right">Phải thu</th><th className="font-semibold text-right">Đã thu</th><th className="font-semibold pl-3">Hình thức</th></tr></thead>
          <tbody>{bs.map((b) => <tr key={b.id} className="border-b border-line"><td className="py-2 tnum">{b.period}</td><td className="text-right tnum">{fmtVND(b.total)}</td><td className={cx('text-right tnum', b.paid < b.total && 'text-bad font-semibold')}>{fmtVND(b.paid)}</td><td className="pl-3 text-fg-2">{b.method ?? '—'}</td></tr>)}</tbody></table>
      ) : <p className="text-fg-3">Sạp chưa phát sinh khoản thu.</p>)}
    </Drawer>
  );
}
