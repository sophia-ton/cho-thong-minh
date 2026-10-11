import { useEffect, useMemo, useState } from 'react';
import { Plus, PenLine, RefreshCw, ArrowLeftRight, FileX, BellRing, FileText, Check, ShieldCheck, Loader2, Copy } from 'lucide-react';
import { contracts, Contract, traderById, stallById, marketById, stalls, traders, fmtVND, fmtDate, fmtNum } from '../data/db';
import { useApp } from '../lib/app';
import { useScoped } from '../lib/scope';
import { CONTRACT_STATUS } from '../lib/status';
import { Badge, Button, Card, DataTable, Dialog, Drawer, Field, Input, KV, MessageBar, PageHeader, SearchBox, Select, Tabs, Textarea, Toolbar, useToast, Stat, cx, Switch } from '../components/ui';

type TabId = 'all' | 'expiring' | 'pending_sign' | 'expired' | 'templates';
const TEMPLATES = [
  { id: 'MHĐ-01', name: 'Hợp đồng thuê sạp trong nhà lồng', ver: '2.1', updated: '2026-07-01', vars: 14, used: 0 },
  { id: 'MHĐ-02', name: 'Hợp đồng thuê kiốt mặt tiền', ver: '1.4', updated: '2026-07-01', vars: 16, used: 0 },
  { id: 'PL-01', name: 'Phụ lục gia hạn thời hạn thuê', ver: '1.2', updated: '2026-05-15', vars: 8, used: 0 },
  { id: 'PL-02', name: 'Phụ lục điều chỉnh đơn giá', ver: '1.0', updated: '2026-01-10', vars: 7, used: 0 },
  { id: 'BB-01', name: 'Biên bản thanh lý hợp đồng', ver: '1.3', updated: '2026-03-20', vars: 11, used: 0 },
  { id: 'VB-01', name: 'Văn bản chấp thuận chuyển nhượng quyền sử dụng sạp', ver: '1.1', updated: '2026-03-20', vars: 12, used: 0 },
];

export default function Contracts() {
  const { focus } = useApp();
  const toast = useToast();
  const all = useScoped(contracts);
  const [tab, setTab] = useState<TabId>(focus === 'expiring' ? 'expiring' : 'all');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Contract | null>(null);
  const [creating, setCreating] = useState(false);
  const [action, setAction] = useState<null | 'renew' | 'transfer' | 'terminate' | 'sign'>(null);
  const [alertCfg, setAlertCfg] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  useEffect(() => { const c = contracts.find((x) => x.id === focus); if (c) setSel(c); }, [focus]);

  const rows = useMemo(() => all.filter((c) => (tab === 'all' || c.status === tab) && (!q || c.code.toLowerCase().includes(q.toLowerCase()) || traderById[c.traderId].name.toLowerCase().includes(q.toLowerCase()) || stallById[c.stallId].code.toLowerCase().includes(q.toLowerCase()))), [all, tab, q]);
  const n = (s: string) => all.filter((c) => c.status === s).length;

  return (
    <>
      <PageHeader uc="UC-07 ÷ UC-11 · Quản lý vòng đời hợp đồng" title="Hợp đồng thuê sạp/kiốt" subtitle="Lập hợp đồng từ mẫu, ký số qua dịch vụ chữ ký số từ xa, gia hạn – chuyển nhượng – thanh lý; trạng thái sạp và công nợ được cập nhật tự động."
        actions={<><Button icon={<BellRing />} onClick={() => setAlertCfg(true)}>Ngưỡng cảnh báo</Button><Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>Lập hợp đồng</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Đang hiệu lực" value={fmtNum(n('active') + n('expiring'))} sub="Bao gồm sắp hết hạn" onClick={() => setTab('all')} />
        <Stat label="Sắp hết hạn (≤ 60 ngày)" value={fmtNum(n('expiring'))} tone="warn" sub="Cần gửi thông báo gia hạn" onClick={() => setTab('expiring')} />
        <Stat label="Chờ ký số" value={fmtNum(n('pending_sign'))} tone="info" sub="Đã duyệt, chờ hai bên ký" onClick={() => setTab('pending_sign')} />
        <Stat label="Đã hết hạn" value={fmtNum(n('expired'))} tone="bad" sub="Chưa gia hạn hoặc thanh lý" onClick={() => setTab('expired')} />
      </div>
      <Tabs className="mb-4" value={tab} onChange={(t) => { setTab(t); setPicked(new Set()); }} tabs={[{ id: 'all', label: 'Tất cả', count: all.length }, { id: 'expiring', label: 'Sắp hết hạn', count: n('expiring') }, { id: 'pending_sign', label: 'Chờ ký số', count: n('pending_sign') }, { id: 'expired', label: 'Hết hạn', count: n('expired') }, { id: 'templates', label: 'Mẫu hợp đồng', count: TEMPLATES.length }]} />

      {tab === 'templates' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start gap-3"><span className="w-10 h-12 rounded-control bg-brand-soft text-brand-fg inline-flex items-center justify-center shrink-0"><FileText className="w-5 h-5" /></span>
                <div className="min-w-0 flex-1"><p className="font-semibold">{t.name}</p><p className="text-cap text-fg-3">{t.id} · phiên bản {t.ver} · cập nhật {fmtDate(t.updated)}</p><p className="text-cap text-fg-2 mt-2">{t.vars} biến trộn: {'{ho_ten}'}, {'{ma_sap}'}, {'{dien_tich}'}, {'{don_gia}'}, {'{thoi_han}'}…</p></div></div>
              <div className="flex gap-2 mt-3"><Button size="sm" onClick={() => toast({ intent: 'info', title: `Xem trước ${t.id}`, body: t.name })}>Xem trước</Button><Button size="sm" variant="subtle" icon={<Copy />} onClick={() => toast({ intent: 'success', title: 'Đã tạo bản sao mẫu', body: `${t.id} – bản nháp v${(+t.ver + 0.1).toFixed(1)}` })}>Nhân bản</Button></div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {tab === 'expiring' && <div className="mb-3"><MessageBar intent="warning" title={`${n('expiring')} hợp đồng sắp hết hạn.`} action={<Button size="sm" variant="primary" disabled={!picked.size} onClick={() => { toast({ intent: 'success', title: `Đã gửi thông báo gia hạn tới ${picked.size} tiểu thương`, body: 'Qua push app, Zalo OA và SMS.' }); setPicked(new Set()); }}>Gửi thông báo ({picked.size})</Button>}>Chọn hợp đồng để gửi thông báo gia hạn hàng loạt.</MessageBar></div>}
          <Toolbar><SearchBox value={q} onChange={setQ} placeholder="Số hợp đồng, tên tiểu thương, mã sạp" className="w-full sm:w-80" /></Toolbar>
          <Card pad={false}><div className="p-1">
            <DataTable rows={rows} onRowClick={setSel} pageSize={14} selectable={tab === 'expiring'} selected={picked} onSelect={setPicked} caption="Danh sách hợp đồng" columns={[
              { key: 'code', header: 'Số hợp đồng', render: (c) => <span className="font-semibold">{c.code}</span>, sort: (c) => c.code },
              { key: 't', header: 'Tiểu thương', render: (c) => traderById[c.traderId].name, sort: (c) => traderById[c.traderId].name.split(' ').pop()! },
              { key: 's', header: 'Sạp · Chợ', render: (c) => <div><span className="font-mono text-cap">{stallById[c.stallId].code}</span><p className="text-cap text-fg-3">{marketById[c.marketId].name}</p></div> },
              { key: 'p', header: 'Thời hạn', render: (c) => <span className="tnum text-fg-2">{fmtDate(c.start)} – {fmtDate(c.end)}</span>, sort: (c) => c.end, hideSm: true },
              { key: 'd', header: 'Còn lại', align: 'right', render: (c) => <span className={cx('tnum', c.daysLeft < 0 ? 'text-bad' : c.daysLeft <= 60 ? 'text-warn font-semibold' : 'text-fg-2')}>{c.daysLeft < 0 ? `quá ${-c.daysLeft} ngày` : `${fmtNum(c.daysLeft)} ngày`}</span>, sort: (c) => c.daysLeft },
              { key: 'f', header: 'Đơn giá/tháng', align: 'right', render: (c) => fmtVND(c.monthlyFee), sort: (c) => c.monthlyFee, hideSm: true },
              { key: 'st', header: 'Trạng thái', render: (c) => <Badge tone={CONTRACT_STATUS[c.status][1]} dot>{CONTRACT_STATUS[c.status][0]}</Badge>, sort: (c) => c.status },
            ]} />
          </div></Card>
        </>
      )}

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.code} subtitle={sel && <Badge tone={CONTRACT_STATUS[sel.status][1]}>{CONTRACT_STATUS[sel.status][0]}</Badge>}
        footer={sel && (sel.status === 'pending_sign' ? <Button variant="primary" icon={<PenLine />} onClick={() => setAction('sign')}>Ký số hợp đồng</Button> : sel.status === 'terminated' ? null : <>
          <Button icon={<FileX />} onClick={() => setAction('terminate')}>Thanh lý</Button>
          <Button icon={<ArrowLeftRight />} onClick={() => setAction('transfer')}>Chuyển nhượng</Button>
          <Button variant="primary" icon={<RefreshCw />} onClick={() => setAction('renew')}>Gia hạn</Button></>)}>
        {sel && <ContractDetail c={sel} />}
      </Drawer>

      <ContractAction kind={action} c={sel} onClose={() => setAction(null)} onDone={(msg) => { setAction(null); toast({ intent: 'success', title: msg, body: sel?.code }); }} />
      <CreateWizard open={creating} onClose={() => setCreating(false)} onDone={(code) => { setCreating(false); toast({ intent: 'success', title: 'Đã trình phê duyệt hợp đồng', body: `${code} · chờ Lãnh đạo BQL phê duyệt` }); }} />
      <AlertConfig open={alertCfg} onClose={() => setAlertCfg(false)} onSave={() => { setAlertCfg(false); toast({ intent: 'success', title: 'Đã lưu ngưỡng cảnh báo hợp đồng' }); }} />
    </>
  );
}

function ContractDetail({ c }: { c: Contract }) {
  const t = traderById[c.traderId], s = stallById[c.stallId], m = marketById[c.marketId];
  const steps = [['Lập dự thảo', true], ['Phê duyệt', c.status !== 'pending_approval'], ['BQL ký số', c.signedBql], ['Tiểu thương ký số', c.signedTrader], ['Có hiệu lực', c.signedBql && c.signedTrader]] as const;
  return (
    <div className="flex flex-col gap-5">
      <ol className="flex items-start gap-1" aria-label="Tiến trình hợp đồng">
        {steps.map(([l, done], i) => <li key={l} className="flex-1 flex flex-col items-center text-center gap-1"><span className={cx('w-7 h-7 rounded-full inline-flex items-center justify-center text-cap font-semibold border-2', done ? 'bg-brand border-brand text-fg-inv' : 'border-line-strong text-fg-3')}>{done ? <Check className="w-4 h-4" /> : i + 1}</span><span className={cx('text-[11px] leading-tight', done ? 'text-fg' : 'text-fg-3')}>{l}</span></li>)}
      </ol>
      <section><h3 className="font-semibold mb-2">Bên thuê</h3><KV items={[['Tiểu thương', t.name], ['Mã', t.code], ['Điện thoại', t.phone], ['Ngành hàng', t.category]]} /></section>
      <section><h3 className="font-semibold mb-2">Đối tượng thuê</h3><KV items={[['Sạp/kiốt', `${s.code} · ${s.area} m²`], ['Chợ', `${m.name} · ${s.zone}`], ['Đơn giá', fmtVND(c.monthlyFee) + '/tháng'], ['Tiền đặt cọc', fmtVND(c.deposit)], ['Thời hạn', `${fmtDate(c.start)} – ${fmtDate(c.end)}`], ['Mẫu áp dụng', c.template]]} /></section>
      <section className="border border-line rounded-card p-4 bg-subtle">
        <p className="text-cap font-semibold text-fg-2 mb-2">Chữ ký số</p>
        <ul className="flex flex-col gap-2 text-body">
          <li className="flex items-center gap-2">{c.signedBql ? <ShieldCheck className="w-4 h-4 text-ok" /> : <span className="w-4 h-4 rounded-full border-2 border-line-strong" />}<span className="flex-1">{m.bql} (Bên cho thuê)</span><span className="text-cap text-fg-3">{c.signedBql ? `Ký ${fmtDate(c.start)} · USB Token` : 'Chưa ký'}</span></li>
          <li className="flex items-center gap-2">{c.signedTrader ? <ShieldCheck className="w-4 h-4 text-ok" /> : <span className="w-4 h-4 rounded-full border-2 border-line-strong" />}<span className="flex-1">{t.name} (Bên thuê)</span><span className="text-cap text-fg-3">{c.signedTrader ? 'Ký số từ xa qua app' : 'Chưa ký'}</span></li>
        </ul>
      </section>
    </div>
  );
}

function ContractAction({ kind, c, onClose, onDone }: { kind: null | 'renew' | 'transfer' | 'terminate' | 'sign'; c: Contract | null; onClose: () => void; onDone: (m: string) => void }) {
  const [otp, setOtp] = useState('');
  const [signing, setSigning] = useState(false);
  useEffect(() => { setOtp(''); setSigning(false); }, [kind]);
  if (!kind || !c) return null;
  const t = traderById[c.traderId];
  if (kind === 'sign') return (
    <Dialog open onClose={onClose} title="Ký số hợp đồng" description={`${c.code} · ký số từ xa (remote signing) qua nhà cung cấp dịch vụ chữ ký số.`}
      footer={<><Button onClick={onClose}>Hủy</Button><Button variant="primary" disabled={otp.length !== 6 || signing} onClick={() => { setSigning(true); setTimeout(() => onDone('Đã ký số thành công, đã gửi yêu cầu ký tới tiểu thương'), 1200); }}>{signing ? <><Loader2 className="w-4 h-4 animate-spin" />Đang ký…</> : 'Xác nhận ký'}</Button></>}>
      <div className="flex flex-col gap-4">
        <MessageBar intent="info">Mã OTP đã được gửi tới thiết bị đăng ký chữ ký số của Lãnh đạo BQL. Tài liệu băm SHA-256 sẽ được ký và gắn dấu thời gian.</MessageBar>
        <Field label="Mã OTP" required hint="6 chữ số, hiệu lực 120 giây">{(id, d) => <Input id={id} aria-describedby={d} inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="tracking-[0.5em] text-center font-mono text-sub h-10" />}</Field>
      </div>
    </Dialog>
  );
  const cfg = { renew: ['Gia hạn hợp đồng', 'Lập phụ lục gia hạn (PL-01). Công nợ phải thu được sinh tự động theo thời hạn mới.', 'Lập phụ lục gia hạn', 'Đã lập phụ lục gia hạn, chờ ký số'], transfer: ['Chuyển nhượng quyền sử dụng sạp', 'Chuyển quyền thuê cho tiểu thương khác; hợp đồng cũ được thanh lý, hợp đồng mới được lập với cùng sạp.', 'Trình phê duyệt chuyển nhượng', 'Đã trình phê duyệt chuyển nhượng'], terminate: ['Thanh lý hợp đồng', 'Sạp sẽ chuyển về trạng thái Trống. Hệ thống đối trừ tiền đặt cọc với công nợ còn lại.', 'Thanh lý hợp đồng', 'Đã thanh lý hợp đồng, sạp chuyển sang Trống'] } as const;
  const [title, desc, btn, msg] = cfg[kind];
  return (
    <Dialog open onClose={onClose} title={title} description={desc} footer={<><Button onClick={onClose}>Hủy</Button><Button variant={kind === 'terminate' ? 'danger' : 'primary'} onClick={() => onDone(msg)}>{btn}</Button></>}>
      <div className="grid gap-4">
        {kind === 'renew' && <div className="grid grid-cols-2 gap-4"><Field label="Gia hạn thêm">{(id) => <Select id={id}><option>12 tháng</option><option>24 tháng</option><option>36 tháng</option></Select>}</Field><Field label="Đơn giá mới (đ/tháng)" hint="Theo biểu phí hiện hành">{(id, d) => <Input id={id} aria-describedby={d} defaultValue={c.monthlyFee.toLocaleString('vi-VN')} />}</Field></div>}
        {kind === 'transfer' && <><Field label="Bên nhận chuyển nhượng" required hint="Phải có hồ sơ tiểu thương đã xác thực">{(id, d) => <Select id={id} aria-describedby={d}>{traders.filter((x) => x.marketId === c.marketId && x.verify === 'verified').slice(0, 30).map((x) => <option key={x.id}>{x.name} – {x.code}</option>)}</Select>}</Field><Field label="Lý do">{(id) => <Textarea id={id} defaultValue="Chuyển nhượng cho người thân trong gia đình tiếp tục kinh doanh." />}</Field></>}
        {kind === 'terminate' && <><Field label="Ngày thanh lý">{(id) => <Input id={id} type="date" defaultValue="2026-10-31" />}</Field><Field label="Lý do thanh lý" required>{(id) => <Select id={id}><option>Tiểu thương đề nghị chấm dứt</option><option>Hết hạn không gia hạn</option><option>Vi phạm hợp đồng</option></Select>}</Field><MessageBar intent="warning">Tiểu thương {t.name} sẽ nhận thông báo thanh lý qua app và Zalo OA.</MessageBar></>}
      </div>
    </Dialog>
  );
}

function CreateWizard({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (code: string) => void }) {
  const [step, setStep] = useState(0);
  const [stallId, setStallId] = useState('');
  const [traderId, setTraderId] = useState('');
  const [term, setTerm] = useState(36);
  useEffect(() => { if (open) { setStep(0); setStallId(''); setTraderId(''); } }, [open]);
  const empty = useMemo(() => stalls.filter((s) => s.status === 'empty' || s.status === 'reserved').slice(0, 80), []);
  const st = stallId ? stalls.find((s) => s.id === stallId) : undefined;
  const tr = traderId ? traderById[traderId] : undefined;
  const code = `HĐ-2026/${st ? marketById[st.marketId].code : 'XXX'}-${String(contracts.length + 1).padStart(4, '0')}`;
  const steps = ['Sạp & tiểu thương', 'Điều khoản', 'Xem trước & trình duyệt'];
  return (
    <Dialog open={open} onClose={onClose} title="Lập hợp đồng thuê sạp" width="max-w-2xl"
      footer={<>{step > 0 && <Button onClick={() => setStep(step - 1)}>Quay lại</Button>}<Button onClick={onClose}>Hủy</Button>{step < 2 ? <Button variant="primary" disabled={step === 0 && (!stallId || !traderId)} onClick={() => setStep(step + 1)}>Tiếp tục</Button> : <Button variant="primary" onClick={() => onDone(code)}>Trình phê duyệt</Button>}</>}>
      <ol className="flex gap-2 mb-5">{steps.map((s, i) => <li key={s} className={cx('flex-1 border-t-[3px] pt-2 text-cap', i <= step ? 'border-brand text-fg font-semibold' : 'border-line text-fg-3')}>{i + 1}. {s}</li>)}</ol>
      {step === 0 && <div className="grid gap-4">
        <Field label="Sạp/kiốt trống" required hint="Chỉ hiển thị sạp ở trạng thái Trống hoặc Đang giữ chỗ">{(id, d) => <Select id={id} aria-describedby={d} value={stallId} onChange={(e) => setStallId(e.target.value)}><option value="">— Chọn sạp —</option>{empty.map((s) => <option key={s.id} value={s.id}>{s.code} · {marketById[s.marketId].name} · {s.area} m² · {s.category}</option>)}</Select>}</Field>
        <Field label="Tiểu thương" required>{(id) => <Select id={id} value={traderId} onChange={(e) => setTraderId(e.target.value)}><option value="">— Chọn tiểu thương đã xác thực —</option>{traders.filter((t) => t.verify === 'verified' && (!st || t.marketId === st.marketId)).slice(0, 60).map((t) => <option key={t.id} value={t.id}>{t.name} · {t.code}</option>)}</Select>}</Field>
      </div>}
      {step === 1 && st && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Mẫu hợp đồng">{(id) => <Select id={id} defaultValue={st.frontage ? 'MHĐ-02' : 'MHĐ-01'}>{TEMPLATES.slice(0, 2).map((t) => <option key={t.id} value={t.id}>{t.id} – {t.name}</option>)}</Select>}</Field>
        <Field label="Ngày hiệu lực">{(id) => <Input id={id} type="date" defaultValue="2026-11-01" />}</Field>
        <Field label="Thời hạn thuê">{(id) => <Select id={id} value={term} onChange={(e) => setTerm(+e.target.value)}>{[12, 24, 36, 60].map((x) => <option key={x} value={x}>{x} tháng</option>)}</Select>}</Field>
        <Field label="Đơn giá (đ/tháng)" hint={`${st.area} m² × biểu phí ${marketById[st.marketId].cls}`}>{(id, d) => <Input id={id} aria-describedby={d} readOnly value={st.monthlyFee.toLocaleString('vi-VN')} />}</Field>
        <Field label="Tiền đặt cọc" hint="02 tháng giá dịch vụ">{(id, d) => <Input id={id} aria-describedby={d} readOnly value={(st.monthlyFee * 2).toLocaleString('vi-VN')} />}</Field>
        <Field label="Kỳ thanh toán">{(id) => <Select id={id}><option>Hằng tháng, trước ngày 20</option><option>Hằng quý</option></Select>}</Field>
      </div>}
      {step === 2 && st && tr && (
        <div className="border border-line rounded-card p-5 bg-surface text-body leading-relaxed max-h-[46vh] overflow-y-auto">
          <p className="text-center font-semibold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p><p className="text-center">Độc lập – Tự do – Hạnh phúc</p>
          <p className="text-center font-semibold text-sub mt-4">HỢP ĐỒNG THUÊ ĐIỂM KINH DOANH TẠI CHỢ</p><p className="text-center text-fg-2">Số: {code}</p>
          <p className="mt-4"><b>Bên cho thuê:</b> {marketById[st.marketId].bql}, địa chỉ {marketById[st.marketId].address}, {marketById[st.marketId].phuong}, TP. Đà Nẵng.</p>
          <p><b>Bên thuê:</b> Ông/Bà {tr.name}, sinh năm {tr.birthYear}, CCCD số {tr.cccd.slice(0, 4)}•••••{tr.cccd.slice(-3)}, điện thoại {tr.phone}.</p>
          <p className="mt-2"><b>Điều 1.</b> Bên cho thuê đồng ý cho Bên thuê sử dụng sạp số <b>{st.code}</b>, diện tích {st.area} m², thuộc {st.zone}, ngành hàng {st.category}.</p>
          <p><b>Điều 2.</b> Thời hạn {term} tháng kể từ ngày 01/11/2026. Giá dịch vụ sử dụng diện tích bán hàng: <b>{fmtVND(st.monthlyFee)}/tháng</b>; đặt cọc {fmtVND(st.monthlyFee * 2)}.</p>
          <p><b>Điều 3.</b> Phương thức thanh toán: chuyển khoản/VietQR hoặc tiền mặt tại quầy thu; biên lai điện tử được gửi qua ứng dụng.</p>
          <p className="text-fg-3 mt-2">… (các điều khoản về quyền, nghĩa vụ, ATTP, PCCC theo mẫu) …</p>
        </div>
      )}
    </Dialog>
  );
}

function AlertConfig({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [a, setA] = useState(true), [b, setB] = useState(true), [c, setC] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title="Ngưỡng cảnh báo hợp đồng sắp hết hạn" description="UC-10 · Hệ thống tự động gửi cảnh báo cho cán bộ và tiểu thương theo các mốc dưới đây." footer={<><Button onClick={onClose}>Hủy</Button><Button variant="primary" onClick={onSave}>Lưu cấu hình</Button></>}>
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-3">{[['Mốc 1', 60], ['Mốc 2', 30], ['Mốc 3', 7]].map(([l, v]) => <Field key={l} label={`${l} (ngày)`}>{(id) => <Input id={id} type="number" defaultValue={v} />}</Field>)}</div>
        <Switch label="Gửi thông báo đẩy trên app cho tiểu thương" checked={a} onChange={setA} />
        <Switch label="Gửi tin Zalo OA" checked={b} onChange={setB} />
        <Switch label="Gửi SMS (phát sinh chi phí)" checked={c} onChange={setC} />
      </div>
    </Dialog>
  );
}
