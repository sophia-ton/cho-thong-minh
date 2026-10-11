import { useEffect, useMemo, useState } from 'react';
import { UserPlus, ShieldCheck, Download, CheckCircle2, XCircle, Loader2, Smartphone, MessageCircle } from 'lucide-react';
import { traders, Trader, marketById, stallById, contracts, bills, CATEGORIES, fmtVND, fmtDate, fmtNum, complaints } from '../data/db';
import { useApp } from '../lib/app';
import { useScoped } from '../lib/scope';
import { VERIFY_STATUS, CONTRACT_STATUS, STALL_STATUS } from '../lib/status';
import { Avatar, Badge, Button, Card, DataTable, Dialog, Drawer, Field, Input, KV, MessageBar, PageHeader, SearchBox, Select, Tabs, Toolbar, useToast, cx } from '../components/ui';

const maskId = (s: string) => s.slice(0, 4) + '•••••' + s.slice(-3);
const maskPhone = (s: string) => s.slice(0, 4) + '•••' + s.slice(-3);

export default function Traders() {
  const { focus } = useApp();
  const toast = useToast();
  const all = useScoped(traders);
  const [tab, setTab] = useState<'all' | 'pending' | 'rejected'>(focus === 'pending' ? 'pending' : 'all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [app, setApp] = useState('');
  const [sel, setSel] = useState<Trader | null>(null);
  const [verify, setVerify] = useState<Trader | null>(null);
  const [adding, setAdding] = useState(false);
  useEffect(() => { const t = traders.find((x) => x.id === focus); if (t) setSel(t); }, [focus]);

  const rows = useMemo(() => all.filter((t) => (tab === 'all' || t.verify === tab) && (!q || t.name.toLowerCase().includes(q.toLowerCase()) || t.phone.includes(q) || t.code.toLowerCase().includes(q.toLowerCase())) && (!cat || t.category === cat) && (!app || (app === 'y') === t.appUser)), [all, tab, q, cat, app]);

  return (
    <>
      <PageHeader uc="UC-03 · UC-04 · Hồ sơ tiểu thương, đăng ký & xác thực" title="Tiểu thương" subtitle="Dữ liệu định danh được đối chiếu với CSDL quốc gia về dân cư qua nền tảng LGSP thành phố. Thông tin cá nhân được che theo Luật Bảo vệ dữ liệu cá nhân."
        actions={<><Button icon={<Download />} onClick={() => toast({ intent: 'success', title: 'Đã xuất danh sách tiểu thương', body: `${rows.length} bản ghi · dữ liệu cá nhân đã được che` })}>Xuất Excel</Button><Button variant="primary" icon={<UserPlus />} onClick={() => setAdding(true)}>Lập hồ sơ</Button></>} />
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'Tất cả', count: all.length }, { id: 'pending', label: 'Chờ xác thực', count: all.filter((t) => t.verify === 'pending').length }, { id: 'rejected', label: 'Không khớp dữ liệu', count: all.filter((t) => t.verify === 'rejected').length }]} />
      {tab === 'pending' && <div className="mb-3"><MessageBar intent="info" title="Hồ sơ đăng ký trực tuyến từ app.">Chọn hồ sơ và nhấn “Xác thực LGSP” để đối chiếu họ tên, ngày sinh, số CCCD với CSDL dân cư.</MessageBar></div>}
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Tên, mã, số điện thoại" className="w-full sm:w-72" />
        <Select aria-label="Ngành hàng" value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto max-w-[220px]"><option value="">Tất cả ngành hàng</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select aria-label="Ứng dụng di động" value={app} onChange={(e) => setApp(e.target.value)} className="w-auto"><option value="">App: tất cả</option><option value="y">Đã dùng app</option><option value="n">Chưa dùng app</option></Select>
      </Toolbar>
      <Card pad={false}><div className="p-1">
        <DataTable rows={rows} onRowClick={setSel} pageSize={14} caption="Danh sách tiểu thương" columns={[
          { key: 'n', header: 'Tiểu thương', render: (t) => <div className="flex items-center gap-2.5"><Avatar name={t.name} size={30} /><div><p className="font-semibold">{t.name}</p><p className="text-cap text-fg-3">{t.code}</p></div></div>, sort: (t) => t.name.split(' ').pop()! },
          { key: 'm', header: 'Chợ · Sạp', render: (t) => <div><p>{marketById[t.marketId].name}</p><p className="text-cap text-fg-3 font-mono">{t.stallIds.map((s) => stallById[s].code).join(', ')}</p></div>, sort: (t) => t.marketId },
          { key: 'c', header: 'Ngành hàng', render: (t) => <span className="text-fg-2">{t.category}</span>, sort: (t) => t.category, hideSm: true },
          { key: 'p', header: 'Điện thoại', render: (t) => <span className="tnum">{maskPhone(t.phone)}</span>, hideSm: true },
          { key: 'a', header: 'App', align: 'center', render: (t) => t.appUser ? <Smartphone className="w-4 h-4 text-ok inline" aria-label="Đã dùng app" /> : <span className="text-fg-3">—</span>, hideSm: true },
          { key: 'v', header: 'Xác thực', render: (t) => <Badge tone={VERIFY_STATUS[t.verify][1]} dot>{VERIFY_STATUS[t.verify][0]}</Badge>, sort: (t) => t.verify },
          { key: 'x', header: '', render: (t) => t.verify !== 'verified' ? <Button size="sm" icon={<ShieldCheck />} onClick={(e) => { e.stopPropagation(); setVerify(t); }}>Xác thực LGSP</Button> : null },
        ]} />
      </div></Card>

      <TraderDrawer t={sel} onClose={() => setSel(null)} />
      <VerifyDialog t={verify} onClose={() => setVerify(null)} onDone={(ok) => { const t = verify!; setVerify(null); if (ok) { t.verify = 'verified'; toast({ intent: 'success', title: 'Xác thực thành công', body: `${t.name} – thông tin khớp CSDL dân cư.` }); } }} />
      <Dialog open={adding} onClose={() => setAdding(false)} title="Lập hồ sơ tiểu thương" description="Nhập CCCD để tự động điền thông tin từ CSDL dân cư (qua LGSP)." width="max-w-2xl"
        footer={<><Button onClick={() => setAdding(false)}>Hủy</Button><Button variant="primary" onClick={() => { setAdding(false); toast({ intent: 'success', title: 'Đã lưu hồ sơ tiểu thương', body: 'Đã gửi SMS kích hoạt tài khoản app.' }); }}>Lưu hồ sơ</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Số CCCD" required hint="12 chữ số">{(id, d) => <Input id={id} aria-describedby={d} inputMode="numeric" maxLength={12} />}</Field>
          <Field label="Họ và tên" required>{(id) => <Input id={id} />}</Field>
          <Field label="Số điện thoại" required hint="Dùng đăng nhập app và nhận OTP">{(id, d) => <Input id={id} aria-describedby={d} inputMode="tel" />}</Field>
          <Field label="Ngành hàng">{(id) => <Select id={id}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>}</Field>
          <div className="sm:col-span-2"><Field label="Địa chỉ thường trú">{(id) => <Input id={id} />}</Field></div>
          <div className="sm:col-span-2"><MessageBar intent="info">Tiểu thương sẽ nhận thông báo về việc xử lý dữ liệu cá nhân và xác nhận đồng ý trên app khi đăng nhập lần đầu.</MessageBar></div>
        </div>
      </Dialog>
    </>
  );
}

function VerifyDialog({ t, onClose, onDone }: { t: Trader | null; onClose: () => void; onDone: (ok: boolean) => void }) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle');
  useEffect(() => { if (t) { setPhase('loading'); const x = setTimeout(() => setPhase('done'), 1100); return () => clearTimeout(x); } }, [t]);
  if (!t) return null;
  const mismatch = t.verify === 'rejected';
  const rows: [string, string, string, boolean][] = [['Họ và tên', t.name, t.name, true], ['Năm sinh', String(t.birthYear), String(mismatch ? t.birthYear + 1 : t.birthYear), !mismatch], ['Số CCCD', maskId(t.cccd), maskId(t.cccd), true], ['Giới tính', t.gender, t.gender, true]];
  return (
    <Dialog open onClose={onClose} title="Xác thực định danh qua LGSP" description={`Đối chiếu hồ sơ ${t.code} với CSDL quốc gia về dân cư.`} width="max-w-xl"
      footer={phase === 'done' ? <><Button onClick={onClose}>Đóng</Button>{mismatch ? <Button variant="danger" onClick={() => onDone(false)}>Yêu cầu bổ sung</Button> : <Button variant="primary" onClick={() => onDone(true)}>Xác nhận hồ sơ</Button>}</> : undefined}>
      {phase === 'loading' ? <div className="flex items-center gap-3 py-8 justify-center text-fg-2" role="status"><Loader2 className="w-5 h-5 animate-spin" />Đang gửi yêu cầu tới LGSP Đà Nẵng…</div> : (
        <div className="flex flex-col gap-3">
          <table className="w-full text-body"><thead><tr className="text-left text-fg-2 border-b border-line"><th className="py-2 font-semibold">Trường</th><th className="font-semibold">Hồ sơ khai báo</th><th className="font-semibold">CSDL dân cư</th><th /></tr></thead>
            <tbody>{rows.map(([k, a, b, ok]) => <tr key={k} className="border-b border-line"><td className="py-2 text-fg-2">{k}</td><td>{a}</td><td>{b}</td><td>{ok ? <CheckCircle2 className="w-4 h-4 text-ok" aria-label="Khớp" /> : <XCircle className="w-4 h-4 text-bad" aria-label="Không khớp" />}</td></tr>)}</tbody></table>
          {mismatch ? <MessageBar intent="error" title="Năm sinh không khớp.">Đề nghị tiểu thương cập nhật hồ sơ hoặc mang CCCD đến BQL để đối chiếu.</MessageBar> : <MessageBar intent="success" title="Thông tin khớp.">Mã giao dịch LGSP: LGSP-DN-20261011-{t.id.length}{t.code.slice(-4)}</MessageBar>}
        </div>
      )}
    </Dialog>
  );
}

function TraderDrawer({ t, onClose }: { t: Trader | null; onClose: () => void }) {
  const [tab, setTab] = useState<'info' | 'contracts' | 'payments' | 'cs'>('info');
  useEffect(() => setTab('info'), [t?.id]);
  if (!t) return null;
  const cs = contracts.filter((c) => c.traderId === t.id);
  const bs = bills.filter((b) => b.traderId === t.id);
  const debt = bs.filter((b) => b.periodIdx < 11).reduce((a, b) => a + b.total - b.paid, 0);
  const pas = complaints.filter((c) => c.sender === t.name);
  return (
    <Drawer open onClose={onClose} title={<span className="flex items-center gap-3"><Avatar name={t.name} size={36} />{t.name}</span>} subtitle={<span className="flex flex-wrap gap-2 items-center">{t.code}<Badge tone={VERIFY_STATUS[t.verify][1]}>{VERIFY_STATUS[t.verify][0]}</Badge>{t.appUser && <Badge tone="ok">Dùng app</Badge>}{t.zalo && <Badge tone="info"><MessageCircle className="w-3 h-3" />Zalo OA</Badge>}</span>}>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-subtle rounded-card p-3"><p className="text-cap text-fg-3">Sạp đang dùng</p><p className="font-semibold">{t.stallIds.map((s) => stallById[s].code).join(', ')}</p></div>
        <div className="bg-subtle rounded-card p-3"><p className="text-cap text-fg-3">Công nợ tồn</p><p className={cx('font-semibold tnum', debt > 0 && 'text-bad')}>{fmtVND(debt)}</p></div>
        <div className="bg-subtle rounded-card p-3"><p className="text-cap text-fg-3">Vi phạm</p><p className="font-semibold">{t.violations || 'Không'}</p></div>
      </div>
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'info', label: 'Hồ sơ' }, { id: 'contracts', label: 'Hợp đồng', count: cs.length }, { id: 'payments', label: 'Thanh toán', count: bs.filter((b) => b.paid).length }, { id: 'cs', label: 'Phản ánh', count: pas.length }]} />
      {tab === 'info' && <KV items={[['Họ và tên', t.name], ['Giới tính · Năm sinh', `${t.gender} · ${t.birthYear}`], ['Số CCCD', <span className="tnum">{maskId(t.cccd)}</span>], ['Điện thoại', <span className="tnum">{t.phone}</span>], ['Mã số thuế hộ KD', t.taxCode ?? 'Chưa đăng ký'], ['Ngành hàng', t.category], ['Chợ', marketById[t.marketId].name], ['Kinh doanh từ', fmtDate(t.joined)], ['Địa chỉ', t.address], ['Trạng thái sạp', STALL_STATUS[stallById[t.stallIds[0]].status][0]]]} />}
      {tab === 'contracts' && <ul className="flex flex-col gap-2">{cs.map((c) => <li key={c.id} className="border border-line rounded-card p-3"><div className="flex justify-between gap-2"><span className="font-semibold">{c.code}</span><Badge tone={CONTRACT_STATUS[c.status][1]}>{CONTRACT_STATUS[c.status][0]}</Badge></div><p className="text-cap text-fg-2 mt-1">{stallById[c.stallId].code} · {fmtDate(c.start)} – {fmtDate(c.end)} · {fmtVND(c.monthlyFee)}/tháng</p></li>)}</ul>}
      {tab === 'payments' && <table className="w-full text-body"><thead><tr className="text-left text-fg-2 border-b border-line"><th className="py-2 font-semibold">Kỳ</th><th className="font-semibold text-right">Số tiền</th><th className="font-semibold pl-3">Hình thức</th><th className="font-semibold">Biên lai</th></tr></thead><tbody>{[...bs].reverse().map((b) => <tr key={b.id} className="border-b border-line"><td className="py-2 tnum">{b.period}</td><td className={cx('text-right tnum', b.paid < b.total && 'text-bad')}>{fmtVND(b.paid)}{b.paid < b.total && <span className="block text-cap">nợ {fmtVND(b.total - b.paid)}</span>}</td><td className="pl-3 text-fg-2">{b.method ?? '—'}</td><td className="font-mono text-cap">{b.receipt ?? '—'}</td></tr>)}</tbody></table>}
      {tab === 'cs' && (pas.length ? <ul className="flex flex-col gap-2">{pas.map((p) => <li key={p.id} className="border border-line rounded-card p-3"><p className="font-semibold">{p.title}</p><p className="text-cap text-fg-3">{p.code} · {fmtDate(p.created)}</p></li>)}</ul> : <p className="text-fg-3">Chưa gửi phản ánh nào.</p>)}
    </Drawer>
  );
}
