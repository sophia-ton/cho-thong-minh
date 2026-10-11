import { useEffect, useMemo, useState } from 'react';
import { Plus, Map, Download, Pencil, LayoutGrid, List } from 'lucide-react';
import { markets, Market, CATEGORIES, stalls, fmtPct, fmtMil, fmtNum, fmtDate, FEE_RATE } from '../data/db';
import { useApp } from '../lib/app';
import { Badge, Button, Card, DataTable, Dialog, Drawer, Field, Input, KV, PageHeader, Progress, SearchBox, Select, Tabs, Toolbar, useToast, IconButton, cx } from '../components/ui';

export default function Markets() {
  const { go, focus } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState<'list' | 'zones' | 'cats'>('list');
  const [q, setQ] = useState('');
  const [area, setArea] = useState('');
  const [cls, setCls] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [sel, setSel] = useState<Market | null>(null);
  const [adding, setAdding] = useState(false);
  useEffect(() => { if (focus) setSel(markets.find((m) => m.id === focus) ?? null); }, [focus]);

  const areas = [...new Set(markets.map((m) => m.khuVuc))];
  const rows = useMemo(() => markets.filter((m) => (!q || m.name.toLowerCase().includes(q.toLowerCase()) || m.address.toLowerCase().includes(q.toLowerCase())) && (!area || m.khuVuc === area) && (!cls || m.cls === cls)), [q, area, cls]);
  const total = rows.reduce((a, m) => a + m.rented + m.empty + m.suspended, 0);

  return (
    <>
      <PageHeader uc="UC-01 · Quản lý danh mục chợ, khu, ngành hàng" title="Danh mục chợ" subtitle={`${markets.length} chợ trên địa bàn TP. Đà Nẵng, trong đó ${markets.filter((m) => m.pilot).length} chợ thuộc giai đoạn thí điểm.`}
        actions={<><Button icon={<Download />} onClick={() => toast({ intent: 'success', title: 'Đã xuất danh mục chợ', body: 'DanhMucCho_DaNang.xlsx' })}>Xuất Excel</Button><Button variant="primary" icon={<Plus />} onClick={() => setAdding(true)}>Thêm chợ</Button></>} />
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'list', label: 'Chợ', count: markets.length }, { id: 'zones', label: 'Khu / dãy / tầng', count: markets.reduce((a, m) => a + m.zones.length, 0) }, { id: 'cats', label: 'Ngành hàng', count: CATEGORIES.length }]} />

      {tab === 'list' && (
        <>
          <Toolbar>
            <SearchBox value={q} onChange={setQ} placeholder="Tìm theo tên chợ, địa chỉ" className="w-full sm:w-72" />
            <Select aria-label="Khu vực" value={area} onChange={(e) => setArea(e.target.value)} className="w-auto"><option value="">Tất cả khu vực</option>{areas.map((a) => <option key={a}>{a}</option>)}</Select>
            <Select aria-label="Hạng chợ" value={cls} onChange={(e) => setCls(e.target.value)} className="w-auto"><option value="">Tất cả hạng</option>{['Hạng 1', 'Hạng 2', 'Hạng 3', 'Đầu mối'].map((a) => <option key={a}>{a}</option>)}</Select>
            <div className="flex-1" />
            <span className="text-cap text-fg-3 tnum">{rows.length} chợ · {fmtNum(total)} sạp/kiốt</span>
            <div className="flex border border-line rounded-control">
              <IconButton label="Dạng bảng" onClick={() => setView('table')} className={cx(view === 'table' && 'bg-subtle text-brand')}><List /></IconButton>
              <IconButton label="Dạng thẻ" onClick={() => setView('grid')} className={cx(view === 'grid' && 'bg-subtle text-brand')}><LayoutGrid /></IconButton>
            </div>
          </Toolbar>
          {view === 'table' ? (
            <Card pad={false}><div className="p-1">
              <DataTable rows={rows} onRowClick={setSel} pageSize={15} caption="Danh mục chợ" columns={[
                { key: 'code', header: 'Mã', render: (m) => <span className="font-mono text-cap">{m.code}</span>, sort: (m) => m.code },
                { key: 'name', header: 'Tên chợ', render: (m) => <div><span className="font-semibold">{m.name}</span>{m.pilot && <Badge tone="brand" className="ml-2">Thí điểm</Badge>}<div className="text-cap text-fg-3">{m.address}, {m.phuong}</div></div>, sort: (m) => m.name },
                { key: 'kv', header: 'Khu vực', render: (m) => m.khuVuc, sort: (m) => m.khuVuc, hideSm: true },
                { key: 'cls', header: 'Hạng', render: (m) => <Badge tone={m.cls === 'Hạng 1' ? 'info' : m.cls === 'Đầu mối' ? 'warn' : 'idle'}>{m.cls}</Badge>, sort: (m) => m.cls },
                { key: 'stalls', header: 'Sạp/kiốt', align: 'right', render: (m) => fmtNum(m.rented + m.empty + m.suspended), sort: (m) => m.stalls },
                { key: 'fill', header: 'Lấp đầy', render: (m) => <div className="w-28"><div className="flex justify-between text-cap mb-1"><span className="tnum">{fmtPct(m.fillRate, 0)}</span><span className="text-fg-3 tnum">{m.empty} trống</span></div><Progress value={m.fillRate} tone={m.fillRate < 0.8 ? 'warn' : 'brand'} label={`Lấp đầy ${m.name}`} /></div>, sort: (m) => m.fillRate },
                { key: 'tt', header: 'Tiểu thương', align: 'right', render: (m) => fmtNum(m.traders), sort: (m) => m.traders, hideSm: true },
                { key: 'bql', header: 'Đơn vị quản lý', render: (m) => <span className="text-fg-2">{m.bql}</span>, hideSm: true },
                { key: 'h', header: 'Giờ hoạt động', render: (m) => <span className="tnum text-fg-2">{m.hours}</span>, hideSm: true },
              ]} />
            </div></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {rows.map((m) => (
                <button key={m.id} onClick={() => setSel(m)} className="text-left bg-surface rounded-card shadow-card p-4 hover:bg-hover flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-sub">{m.name}</p><p className="text-cap text-fg-3">{m.address}, {m.phuong}</p></div><Badge tone={m.cls === 'Hạng 1' ? 'info' : 'idle'}>{m.cls}</Badge></div>
                  <div className="grid grid-cols-3 gap-2 text-cap"><div><p className="text-fg-3">Sạp</p><p className="font-semibold tnum text-body">{fmtNum(m.rented + m.empty + m.suspended)}</p></div><div><p className="text-fg-3">Lấp đầy</p><p className="font-semibold tnum text-body">{fmtPct(m.fillRate, 0)}</p></div><div><p className="text-fg-3">Thu kỳ</p><p className="font-semibold tnum text-body">{fmtMil(m.monthRevenue)}</p></div></div>
                  <Progress value={m.fillRate} label={`Lấp đầy ${m.name}`} />
                  <p className="text-cap text-fg-2">{m.specialty}{m.pilot && ' · Thí điểm giai đoạn 1'}</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'zones' && (
        <Card pad={false}><div className="p-1">
          <DataTable pageSize={15} rows={markets.flatMap((m) => m.zones.map((z, i) => ({ id: `${m.id}-${i}`, m, z, i, n: stalls.filter((s) => s.marketId === m.id && s.zoneIdx === i).length, empty: stalls.filter((s) => s.marketId === m.id && s.zoneIdx === i && s.status === 'empty').length })))} columns={[
            { key: 'c', header: 'Mã khu', render: (r) => <span className="font-mono text-cap">{r.m.code}-{String.fromCharCode(65 + r.i)}</span> },
            { key: 'z', header: 'Tên khu / dãy / tầng', render: (r) => <span className="font-semibold">{r.z}</span>, sort: (r) => r.z },
            { key: 'm', header: 'Chợ', render: (r) => r.m.name, sort: (r) => r.m.name },
            { key: 'n', header: 'Số sạp', align: 'right', render: (r) => r.n, sort: (r) => r.n },
            { key: 'e', header: 'Sạp trống', align: 'right', render: (r) => r.empty, sort: (r) => r.empty },
            { key: 'a', header: '', render: (r) => <Button size="sm" variant="subtle" icon={<Map />} onClick={() => go('floorplan', { market: r.m.id, focus: 'zone-' + r.i })}>Sơ đồ</Button> },
          ]} />
        </div></Card>
      )}

      {tab === 'cats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {CATEGORIES.map((c) => { const n = stalls.filter((s) => s.category === c).length; return (
            <Card key={c}><div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{c}</p><p className="text-cap text-fg-3 tnum mt-0.5">{fmtNum(n)} sạp · {fmtNum(stalls.filter((s) => s.category === c && s.status === 'rented').length)} đang kinh doanh</p></div><IconButton label={`Sửa ngành hàng ${c}`} onClick={() => toast({ intent: 'info', title: 'Chế độ sửa ngành hàng', body: c })}><Pencil /></IconButton></div></Card>
          ); })}
        </div>
      )}

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.name} subtitle={sel && <>{sel.address}, {sel.phuong} · {sel.cls}</>} footer={sel && <><Button onClick={() => setSel(null)}>Đóng</Button><Button variant="primary" icon={<Map />} onClick={() => go('floorplan', { market: sel.id })}>Mở sơ đồ mặt bằng</Button></>}>
        {sel && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-2">
              {[['Tổng sạp', fmtNum(sel.rented + sel.empty + sel.suspended)], ['Đang thuê', fmtNum(sel.rented)], ['Trống', fmtNum(sel.empty)], ['Tiểu thương', fmtNum(sel.traders)], ['Thu kỳ 10/2026', fmtMil(sel.monthRevenue)], ['Công nợ tồn', fmtMil(sel.debt)]].map(([k, v]) => <div key={k} className="bg-subtle rounded-card p-3"><p className="text-cap text-fg-3">{k}</p><p className="font-semibold tnum text-sub">{v}</p></div>)}
            </div>
            <section><h3 className="font-semibold mb-2">Thông tin chung</h3><KV items={[['Mã chợ', <span className="font-mono">{sel.code}</span>], ['Khu vực (quận/huyện cũ)', sel.khuVuc], ['Đơn vị quản lý', sel.bql], ['Trưởng ban/Đội trưởng', sel.manager], ['Điện thoại', <span className="tnum select-all">{sel.phone}</span>], ['Giờ hoạt động', sel.hours], ['Năm đưa vào sử dụng', sel.yearBuilt], ['Tổng diện tích sử dụng', `${fmtNum(sel.areaM2)} m²`], ['Đặc trưng', sel.specialty], ['Đơn giá cơ sở', `${fmtNum(FEE_RATE[sel.cls])} đ/m²/tháng`], ['Kiểm tra gần nhất', fmtDate(sel.lastInspection)], ['Giai đoạn', sel.pilot ? 'Thí điểm (giai đoạn 1)' : 'Nhân rộng (giai đoạn 2)']]} /></section>
            <section><h3 className="font-semibold mb-2">Khu / dãy / tầng</h3><ul className="divide-y divide-line border border-line rounded-card">{sel.zones.map((z, i) => { const zs = stalls.filter((s) => s.marketId === sel.id && s.zoneIdx === i); return <li key={z} className="flex items-center justify-between px-3 py-2"><span><span className="font-mono text-cap text-fg-3 mr-2">{String.fromCharCode(65 + i)}</span>{z}</span><span className="text-cap text-fg-2 tnum">{zs.length} sạp · {zs.filter((s) => s.status === 'empty').length} trống</span></li>; })}</ul></section>
          </div>
        )}
      </Drawer>

      <AddMarketDialog open={adding} onClose={() => setAdding(false)} onSave={(n) => { setAdding(false); toast({ intent: 'success', title: 'Đã thêm chợ mới', body: `${n} đã được thêm vào danh mục, chờ số hóa sơ đồ mặt bằng.` }); }} />
    </>
  );
}

function AddMarketDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  return (
    <Dialog open={open} onClose={onClose} title="Thêm chợ vào danh mục" description="Thông tin cơ bản; sơ đồ mặt bằng được số hóa ở bước sau." footer={<><Button onClick={onClose}>Hủy</Button><Button variant="primary" onClick={() => { if (!name.trim()) { setErr('Nhập tên chợ, ví dụ: Chợ Hòa Phát.'); return; } setErr(''); onSave(name); setName(''); }}>Lưu chợ</Button></>}>
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="sm:col-span-2"><Field label="Tên chợ" required error={err}>{(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!err} value={name} onChange={(e) => setName(e.target.value)} placeholder="Chợ …" />}</Field></div>
        <Field label="Hạng chợ" required>{(id) => <Select id={id}><option>Hạng 1</option><option>Hạng 2</option><option>Hạng 3</option><option>Đầu mối</option></Select>}</Field>
        <Field label="Phường/xã" required>{(id) => <Select id={id}>{[...new Set(markets.map((m) => m.phuong))].map((p) => <option key={p}>{p}</option>)}</Select>}</Field>
        <div className="sm:col-span-2"><Field label="Địa chỉ" hint="Số nhà, tên đường">{(id, d) => <Input id={id} aria-describedby={d} />}</Field></div>
        <Field label="Giờ mở cửa">{(id) => <Input id={id} type="time" defaultValue="05:00" />}</Field>
        <Field label="Giờ đóng cửa">{(id) => <Input id={id} type="time" defaultValue="18:00" />}</Field>
      </form>
    </Dialog>
  );
}
