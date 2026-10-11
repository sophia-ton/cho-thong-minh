import { useMemo, useState } from 'react';
import { Check, X, Zap, Droplets, Plus, ShieldCheck, Flame, CalendarDays, Store, Eye, MapPin, Gauge } from 'lucide-react';
import { serviceRegs, meterReadings, inspections, Inspection, products, traderById, stallById, marketById, markets, fmtDate, fmtNum, fmtVND, ELECTRIC_PRICE, WATER_PRICE } from '../data/db';
import { useScoped, useScopeName } from '../lib/scope';
import { Badge, Button, Card, DataTable, Dialog, Drawer, Field, Input, KV, MessageBar, PageHeader, SearchBox, Select, Stat, Tabs, Textarea, Toolbar, useToast, cx, Avatar } from '../components/ui';

// ---------------- UC-24, UC-25 ----------------
export function Services() {
  const toast = useToast();
  const scope = useScopeName();
  const regs = useScoped(serviceRegs);
  const meters = useScoped(meterReadings);
  const [tab, setTab] = useState<'meter' | 'reg'>('meter');
  const [type, setType] = useState<'Điện' | 'Nước'>('Điện');
  const [st, setSt] = useState('');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [, force] = useState(0);
  const mrows = useMemo(() => meters.filter((m) => m.type === type && (!st || m.status === st)), [meters, type, st, vals]);
  const done = meters.filter((m) => m.type === type && m.status !== 'Chưa ghi').length, tot = meters.filter((m) => m.type === type).length;
  const price = type === 'Điện' ? ELECTRIC_PRICE : WATER_PRICE;

  return (
    <>
      <PageHeader uc="UC-24 · UC-25 · Đăng ký dịch vụ, ghi chỉ số, tính tiền" title={`Dịch vụ tiện ích · ${scope}`} subtitle="Cán bộ ghi chỉ số công tơ điện, đồng hồ nước trên web hoặc điện thoại tại sạp; hệ thống tính tiền theo đơn giá và đưa vào bảng kê kỳ thu." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label={`Tiến độ ghi chỉ số ${type.toLowerCase()} kỳ 10`} value={`${Math.round((done / (tot || 1)) * 100)}%`} sub={`${fmtNum(done)}/${fmtNum(tot)} đồng hồ`} />
        <Stat label="Chỉ số bất thường" value={meters.filter((m) => m.status === 'Bất thường').length} tone="warn" sub="Tăng > 50% so với bình quân" />
        <Stat label="Đăng ký chờ duyệt" value={regs.filter((r) => r.status === 'Chờ duyệt').length} sub={`${regs.filter((r) => r.channel === 'App').length} đăng ký qua app`} onClick={() => setTab('reg')} />
        <Stat label={`Tiền ${type.toLowerCase()} kỳ 10`} value={fmtNum(Math.round(meters.filter((m) => m.type === type).reduce((a, m) => a + m.amount, 0) / 1e6)) + ' tr'} sub={`Đơn giá ${fmtNum(price)} đ/${type === 'Điện' ? 'kWh' : 'm³'}`} />
      </div>
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'meter', label: 'Ghi chỉ số điện, nước' }, { id: 'reg', label: 'Đăng ký dịch vụ', count: regs.length }]} />
      {tab === 'meter' ? (
        <>
          <Toolbar>
            <div className="flex border border-line rounded-control overflow-hidden" role="group" aria-label="Loại đồng hồ">
              {(['Điện', 'Nước'] as const).map((t) => <button key={t} aria-pressed={type === t} onClick={() => setType(t)} className={cx('h-8 px-3 inline-flex items-center gap-1.5 text-body', type === t ? 'bg-brand text-fg-inv font-semibold' : 'hover:bg-hover')}>{t === 'Điện' ? <Zap className="w-4 h-4" /> : <Droplets className="w-4 h-4" />}{t}</button>)}
            </div>
            <Select aria-label="Trạng thái ghi" value={st} onChange={(e) => setSt(e.target.value)} className="w-auto"><option value="">Tất cả trạng thái</option><option>Chưa ghi</option><option>Đã ghi</option><option>Bất thường</option></Select>
            <div className="flex-1" />
            <Button variant="primary" disabled={!Object.keys(vals).length} onClick={() => { Object.keys(vals).forEach((id) => { const m = meters.find((x) => x.id === id); if (m) { m.status = 'Đã ghi'; m.readAt = '2026-10-11'; m.reader = 'Lê Văn Tài'; } }); setVals({}); force((x) => x + 1); toast({ intent: 'success', title: `Đã lưu ${Object.keys(vals).length} chỉ số`, body: 'Tiền điện nước được cập nhật vào bảng kê kỳ 10/2026.' }); }}>Lưu chỉ số ({Object.keys(vals).length})</Button>
          </Toolbar>
          <Card pad={false}><div className="p-1"><DataTable rows={mrows} pageSize={14} dense caption="Ghi chỉ số" columns={[
            { key: 's', header: 'Sạp', render: (m) => <div><span className="font-mono text-cap">{stallById[m.stallId].code}</span><p className="text-cap text-fg-3">{traderById[m.traderId].name}</p></div> },
            { key: 'n', header: 'Số đồng hồ', render: (m) => <span className="font-mono text-cap">{m.meterNo}</span>, hideSm: true },
            { key: 'p', header: 'Chỉ số cũ', align: 'right', render: (m) => fmtNum(m.prev) },
            { key: 'c', header: 'Chỉ số mới', align: 'right', render: (m) => m.status === 'Chưa ghi' ? <Input aria-label={`Chỉ số mới ${m.meterNo}`} inputMode="numeric" className="w-28 text-right tnum h-7" placeholder={String(m.prev + m.usage)} value={vals[m.id] ?? ''} onChange={(e) => setVals({ ...vals, [m.id]: e.target.value.replace(/\D/g, '') })} /> : <span className="tnum">{fmtNum(m.prev + m.usage)}</span> },
            { key: 'u', header: 'Tiêu thụ', align: 'right', render: (m) => { const u = vals[m.id] ? +vals[m.id] - m.prev : m.status === 'Chưa ghi' ? null : m.usage; return u === null ? <span className="text-fg-3">—</span> : <span className={cx(u < 0 && 'text-bad')}>{fmtNum(u)} {m.type === 'Điện' ? 'kWh' : 'm³'}</span>; } },
            { key: 'a', header: 'Thành tiền', align: 'right', render: (m) => { const u = vals[m.id] ? +vals[m.id] - m.prev : m.status === 'Chưa ghi' ? null : m.usage; return u === null || u < 0 ? <span className="text-fg-3">—</span> : fmtVND(u * price); } },
            { key: 'st', header: 'Trạng thái', render: (m) => <div><Badge tone={m.status === 'Đã ghi' ? 'ok' : m.status === 'Bất thường' ? 'warn' : 'idle'} dot>{m.status}</Badge>{m.reader && <p className="text-[11px] text-fg-3 mt-0.5">{m.reader.split(' ').slice(-2).join(' ')} · {fmtDate(m.readAt)}</p>}</div> },
          ]} /></div></Card>
        </>
      ) : (
        <Card pad={false}><div className="p-1"><DataTable rows={regs} pageSize={14} caption="Đăng ký dịch vụ" columns={[
          { key: 'c', header: 'Mã', render: (r) => <span className="font-mono text-cap">{r.code}</span> },
          { key: 't', header: 'Tiểu thương · Sạp', render: (r) => <div><p className="font-semibold">{traderById[r.traderId].name}</p><p className="text-cap text-fg-3">{stallById[r.stallId].code} · {marketById[r.marketId].name}</p></div> },
          { key: 's', header: 'Dịch vụ', render: (r) => <Badge tone="brand">{r.service}</Badge> },
          { key: 'n', header: 'Nội dung', render: (r) => <span className="text-fg-2">{r.note}</span>, hideSm: true },
          { key: 'ch', header: 'Kênh', render: (r) => r.channel, hideSm: true },
          { key: 'd', header: 'Ngày gửi', render: (r) => <span className="tnum">{fmtDate(r.requested)}</span>, sort: (r) => r.requested },
          { key: 'st', header: 'Trạng thái', render: (r) => <Badge tone={r.status === 'Chờ duyệt' ? 'warn' : r.status === 'Từ chối' ? 'bad' : 'ok'} dot>{r.status}</Badge> },
          { key: 'x', header: '', render: (r) => r.status === 'Chờ duyệt' ? <div className="flex gap-1"><Button size="sm" icon={<Check />} onClick={() => { r.status = 'Đã duyệt'; force((x) => x + 1); toast({ intent: 'success', title: 'Đã duyệt đăng ký', body: `${r.code} · tiểu thương nhận thông báo trên app` }); }}>Duyệt</Button><Button size="sm" variant="subtle" icon={<X />} onClick={() => { r.status = 'Từ chối'; force((x) => x + 1); }}>Từ chối</Button></div> : null },
        ]} /></div></Card>
      )}
    </>
  );
}

// ---------------- UC-26 ----------------
export function Inspections() {
  const toast = useToast();
  const scope = useScopeName();
  const all = useScoped(inspections);
  const [type, setType] = useState<'all' | 'ATTP' | 'PCCC' | 'plan'>('all');
  const [sel, setSel] = useState<Inspection | null>(null);
  const [adding, setAdding] = useState(false);
  const rows = all.filter((i) => type === 'all' ? i.result !== 'Chưa kiểm tra' : type === 'plan' ? i.result === 'Chưa kiểm tra' : i.type === type && i.result !== 'Chưa kiểm tra');
  const past = all.filter((i) => i.result !== 'Chưa kiểm tra');
  const tone = (r: string) => r === 'Đạt' ? 'ok' : r === 'Không đạt' ? 'bad' : r === 'Chưa kiểm tra' ? 'idle' : 'warn';
  return (
    <>
      <PageHeader uc="UC-26 · Quản lý kiểm tra an toàn thực phẩm, PCCC" title={`Kiểm tra ATTP, PCCC · ${scope}`} subtitle="Lập kế hoạch, ghi nhận kết quả kiểm tra của đoàn liên ngành và theo dõi khắc phục đến khi hoàn thành." actions={<Button variant="primary" icon={<Plus />} onClick={() => setAdding(true)}>Ghi nhận kết quả</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Lượt kiểm tra 12 tháng" value={past.length} sub={`${past.filter((i) => i.type === 'ATTP').length} ATTP · ${past.filter((i) => i.type === 'PCCC').length} PCCC`} />
        <Stat label="Tỷ lệ đạt" value={`${Math.round((past.filter((i) => i.result !== 'Không đạt').length / (past.length || 1)) * 100)}%`} tone="ok" sub="Gồm đạt có khuyến nghị" />
        <Stat label="Đang khắc phục" value={past.filter((i) => i.fixStatus === 'Đang khắc phục').length} tone="warn" sub="Trong thời hạn" />
        <Stat label="Quá hạn khắc phục" value={past.filter((i) => i.fixStatus === 'Quá hạn khắc phục').length} tone="bad" sub="Cần đôn đốc" />
      </div>
      <Tabs className="mb-4" value={type} onChange={setType} tabs={[{ id: 'all', label: 'Tất cả kết quả', count: past.length }, { id: 'ATTP', label: 'An toàn thực phẩm' }, { id: 'PCCC', label: 'Phòng cháy chữa cháy' }, { id: 'plan', label: 'Kế hoạch sắp tới', count: all.length - past.length }]} />
      <Card pad={false}><div className="p-1"><DataTable rows={rows} onRowClick={setSel} pageSize={14} caption="Kết quả kiểm tra" columns={[
        { key: 't', header: 'Loại', render: (i) => <span className="inline-flex items-center gap-1.5 font-semibold">{i.type === 'ATTP' ? <ShieldCheck className="w-4 h-4 text-ok" /> : <Flame className="w-4 h-4 text-bad" />}{i.type}</span> },
        { key: 'c', header: 'Số biên bản', render: (i) => <span className="font-mono text-cap">{i.code}</span>, hideSm: true },
        { key: 'm', header: 'Chợ', render: (i) => marketById[i.marketId].name, sort: (i) => i.marketId },
        { key: 'd', header: 'Ngày', render: (i) => <span className="tnum">{fmtDate(i.date)}</span>, sort: (i) => i.date },
        { key: 's', header: 'Phạm vi', render: (i) => <span className="text-fg-2">{i.scope}</span>, hideSm: true },
        { key: 'r', header: 'Kết quả', render: (i) => <Badge tone={tone(i.result)} dot>{i.result}</Badge> },
        { key: 'f', header: 'Khắc phục', render: (i) => i.fixStatus === 'Không yêu cầu' ? <span className="text-fg-3">—</span> : <Badge tone={i.fixStatus === 'Đã khắc phục' ? 'ok' : i.fixStatus === 'Quá hạn khắc phục' ? 'bad' : 'warn'}>{i.fixStatus}</Badge> },
      ]} /></div></Card>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `Kiểm tra ${sel.type} · ${marketById[sel.marketId].name}` : ''} subtitle={sel?.code} footer={sel && sel.fixStatus !== 'Không yêu cầu' && sel.fixStatus !== 'Đã khắc phục' && <Button variant="primary" icon={<Check />} onClick={() => { sel.fixStatus = 'Đã khắc phục'; setSel(null); toast({ intent: 'success', title: 'Đã xác nhận hoàn thành khắc phục' }); }}>Xác nhận đã khắc phục</Button>}>
        {sel && <div className="flex flex-col gap-4">
          <KV items={[['Ngày kiểm tra', fmtDate(sel.date)], ['Đoàn kiểm tra', sel.team], ['Phạm vi', sel.scope], ['Số sạp được kiểm tra', sel.stalls || '—'], ['Kết quả', <Badge tone={tone(sel.result)}>{sel.result}</Badge>], ['Hạn khắc phục', fmtDate(sel.fixDeadline)]]} />
          <section><h3 className="font-semibold mb-1">Nội dung phát hiện</h3><p>{sel.findings}</p></section>
          {sel.result === 'Không đạt' && <MessageBar intent="error">Đã gửi thông báo yêu cầu khắc phục tới các tiểu thương liên quan qua app và Zalo OA.</MessageBar>}
        </div>}
      </Drawer>
      <Dialog open={adding} onClose={() => setAdding(false)} title="Ghi nhận kết quả kiểm tra" width="max-w-xl" footer={<><Button onClick={() => setAdding(false)}>Hủy</Button><Button variant="primary" onClick={() => { setAdding(false); toast({ intent: 'success', title: 'Đã lưu biên bản kiểm tra', body: 'Biên bản được số hóa vào Hồ sơ lưu trữ.' }); }}>Lưu kết quả</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Loại kiểm tra">{(id) => <Select id={id}><option>ATTP</option><option>PCCC</option></Select>}</Field>
          <Field label="Chợ">{(id) => <Select id={id}>{markets.map((m) => <option key={m.id}>{m.name}</option>)}</Select>}</Field>
          <Field label="Ngày kiểm tra">{(id) => <Input id={id} type="date" defaultValue="2026-10-11" />}</Field>
          <Field label="Kết quả">{(id) => <Select id={id}><option>Đạt</option><option>Đạt, có khuyến nghị</option><option>Không đạt</option></Select>}</Field>
          <div className="sm:col-span-2"><Field label="Nội dung phát hiện">{(id) => <Textarea id={id} />}</Field></div>
          <div className="sm:col-span-2"><Field label="Biên bản scan" hint="PDF, tối đa 20 MB">{(id, d) => <input id={id} aria-describedby={d} type="file" accept="application/pdf" className="text-body file:mr-3 file:h-8 file:px-3 file:rounded-control file:border file:border-line-strong file:bg-surface file:text-fg" />}</Field></div>
        </div>
      </Dialog>
    </>
  );
}

// ---------------- UC-27 ----------------
export function Shops() {
  const ps = useScoped(products);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const shops = useMemo(() => {
    const m: Record<string, { id: string; traderId: string; stallId: string; marketId: string; items: typeof products; views: number }> = {};
    ps.forEach((p) => { const x = (m[p.traderId] ??= { id: p.traderId, traderId: p.traderId, stallId: p.stallId, marketId: p.marketId, items: [], views: 0 }); x.items.push(p); x.views += p.views; });
    return Object.values(m).filter((s) => !q || traderById[s.traderId].name.toLowerCase().includes(q.toLowerCase()) || s.items.some((i) => i.name.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.views - a.views);
  }, [ps, q]);
  const shop = shops.find((s) => s.id === sel);
  return (
    <>
      <PageHeader uc="UC-27 · Gian hàng số giới thiệu sản phẩm" title="Gian hàng số" subtitle="Tiểu thương tạo gian hàng trên app; người dân và du khách xem, tìm kiếm sản phẩm và vị trí sạp trên cổng thông tin công khai." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Gian hàng đang hiển thị" value={fmtNum(shops.length)} />
        <Stat label="Sản phẩm" value={fmtNum(ps.length)} />
        <Stat label="Lượt xem 30 ngày" value={fmtNum(ps.reduce((a, p) => a + p.views, 0))} />
        <Stat label="Chờ duyệt nội dung" value="14" tone="warn" sub="Kiểm duyệt trước khi công khai" />
      </div>
      <Toolbar><SearchBox value={q} onChange={setQ} placeholder="Tìm sản phẩm: chả bò, mực một nắng, áo dài…" className="w-full sm:w-96" /></Toolbar>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {shops.slice(0, 24).map((s) => { const t = traderById[s.traderId]; return (
          <button key={s.id} onClick={() => setSel(s.id)} className="text-left bg-surface rounded-card shadow-card overflow-hidden hover:bg-hover">
            <div className="h-20 bg-brand-soft flex items-end p-3 relative"><Store className="absolute right-3 top-3 w-6 h-6 text-brand/40" aria-hidden /><div className="flex items-center gap-2"><Avatar name={t.name} size={36} /><div><p className="font-semibold leading-tight">{t.name.split(' ').slice(-2).join(' ')} – {stallById[s.stallId].code}</p><p className="text-cap text-fg-2">{t.category}</p></div></div></div>
            <ul className="p-3 flex flex-col gap-1.5">{s.items.slice(0, 3).map((i) => <li key={i.id} className="flex justify-between gap-2 text-body"><span className="truncate">{i.name}</span><span className="tnum font-semibold shrink-0">{fmtNum(i.price)} đ/{i.unit}</span></li>)}</ul>
            <div className="px-3 pb-3 flex justify-between text-cap text-fg-3"><span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{marketById[s.marketId].name}</span><span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(s.views)}</span></div>
          </button>
        ); })}
      </div>
      <Drawer open={!!shop} onClose={() => setSel(null)} title={shop ? `Gian hàng ${traderById[shop.traderId].name}` : ''} subtitle={shop && `${stallById[shop.stallId].code} · ${marketById[shop.marketId].name} · ${stallById[shop.stallId].zone}`}>
        {shop && <div className="grid grid-cols-2 gap-3">{shop.items.map((i) => <div key={i.id} className="border border-line rounded-card overflow-hidden"><div className="aspect-[4/3] max-w-full bg-subtle flex items-center justify-center text-fg-3"><Store className="w-6 h-6" aria-hidden /></div><div className="p-2.5"><p className="font-semibold text-body">{i.name}</p><p className="tnum text-brand-fg font-semibold">{fmtNum(i.price)} đ<span className="text-fg-3 font-normal">/{i.unit}</span></p><p className="text-[11px] text-fg-3">{fmtNum(i.views)} lượt xem</p></div></div>)}</div>}
      </Drawer>
    </>
  );
}
