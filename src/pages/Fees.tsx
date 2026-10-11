import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Banknote, QrCode, Send, Receipt, Loader2, CheckCircle2, Printer, Search, BellRing } from 'lucide-react';
import { bills, Bill, traderById, stallById, marketById, PERIODS, CURRENT_PERIOD, fmtVND, fmtMil, fmtNum, fmtPct, fmtDate, traders } from '../data/db';
import { useApp } from '../lib/app';
import { useScoped, useScopeName } from '../lib/scope';
import { Badge, Button, Card, DataTable, Dialog, Field, Input, MessageBar, PageHeader, SearchBox, Select, Stat, Tabs, Toolbar, useToast, cx, Avatar, Switch } from '../components/ui';
import { FakeQR } from '../components/qr';

type TabId = 'period' | 'debt' | 'counter';
const billState = (b: Bill): [string, 'ok' | 'warn' | 'bad'] => b.paid >= b.total ? ['Đã thu', 'ok'] : b.paid > 0 ? ['Thu một phần', 'warn'] : ['Chưa thu', 'bad'];

export default function Fees() {
  const { focus } = useApp();
  const toast = useToast();
  const scope = useScopeName();
  const all = useScoped(bills);
  const [tab, setTab] = useState<TabId>(focus === 'debt' ? 'debt' : 'period');
  const [period, setPeriod] = useState(11);
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const [newPeriod, setNewPeriod] = useState(false);
  const [pay, setPay] = useState<{ bills: Bill[]; method: 'cash' | 'qr' } | null>(null);
  const [remind, setRemind] = useState(false);
  const [, force] = useState(0);

  const cur = useMemo(() => all.filter((b) => b.periodIdx === period), [all, period]);
  const total = cur.reduce((a, b) => a + b.total, 0), paid = cur.reduce((a, b) => a + b.paid, 0);
  const rows = useMemo(() => cur.filter((b) => (!state || billState(b)[0] === state) && (!q || traderById[b.traderId].name.toLowerCase().includes(q.toLowerCase()) || stallById[b.stallId].code.toLowerCase().includes(q.toLowerCase()))), [cur, state, q, pay]);

  const debts = useMemo(() => {
    const m: Record<string, { id: string; traderId: string; marketId: string; periods: string[]; amount: number; oldest: number }> = {};
    all.forEach((b) => { if (b.periodIdx < 11 && b.paid < b.total) { const x = (m[b.traderId] ??= { id: b.traderId, traderId: b.traderId, marketId: b.marketId, periods: [], amount: 0, oldest: 99 }); x.periods.push(b.period); x.amount += b.total - b.paid; x.oldest = Math.min(x.oldest, b.periodIdx); } });
    return Object.values(m).sort((a, b) => b.amount - a.amount);
  }, [all, pay]);

  return (
    <>
      <PageHeader uc="UC-13 ÷ UC-17 · Thu phí, thanh toán, biên lai điện tử, công nợ" title={`Thu phí & công nợ · ${scope}`} subtitle="Bảng kê được sinh tự động từ hợp đồng và chỉ số điện nước. Mỗi khoản phải nộp có mã VietQR động; kết quả thanh toán được ngân hàng gửi về trong vòng 30 giây và tự phát hành biên lai điện tử."
        actions={<><Button icon={<BellRing />} onClick={() => setRemind(true)}>Nhắc nợ tự động</Button><Button variant="primary" icon={<CalendarPlus />} onClick={() => setNewPeriod(true)}>Lập kỳ thu 11/2026</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label={`Phải thu kỳ ${PERIODS[period]}`} value={fmtMil(total)} sub={`${fmtNum(cur.length)} bảng kê`} />
        <Stat label="Đã thu" value={fmtMil(paid)} tone="ok" sub={`Đạt ${fmtPct(paid / (total || 1))}`} />
        <Stat label="Chưa thu" value={fmtMil(total - paid)} tone="bad" sub={`${fmtNum(cur.filter((b) => b.paid < b.total).length)} tiểu thương`} />
        <Stat label="Công nợ các kỳ trước" value={fmtMil(debts.reduce((a, d) => a + d.amount, 0))} sub={`${fmtNum(debts.length)} tiểu thương · ${debts.filter((d) => d.periods.length >= 3).length} nợ ≥ 3 kỳ`} onClick={() => setTab('debt')} />
      </div>
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'period', label: 'Bảng kê kỳ thu' }, { id: 'debt', label: 'Công nợ', count: debts.length }, { id: 'counter', label: 'Thu tại quầy / di động' }]} />

      {tab === 'period' && (
        <>
          <Toolbar>
            <Select aria-label="Kỳ thu" value={period} onChange={(e) => setPeriod(+e.target.value)} className="w-[140px]">{PERIODS.map((p, i) => <option key={p} value={i}>Kỳ {p}</option>)}</Select>
            <Select aria-label="Trạng thái thu" value={state} onChange={(e) => setState(e.target.value)} className="w-auto"><option value="">Tất cả trạng thái</option><option>Đã thu</option><option>Thu một phần</option><option>Chưa thu</option></Select>
            <SearchBox value={q} onChange={setQ} placeholder="Tên tiểu thương, mã sạp" className="w-full sm:w-64" />
          </Toolbar>
          <Card pad={false}><div className="p-1">
            <DataTable rows={rows} pageSize={14} caption="Bảng kê phải thu" columns={[
              { key: 's', header: 'Sạp', render: (b) => <div><span className="font-mono text-cap">{stallById[b.stallId].code}</span><p className="text-cap text-fg-3">{marketById[b.marketId].name}</p></div>, sort: (b) => stallById[b.stallId].code },
              { key: 't', header: 'Tiểu thương', render: (b) => traderById[b.traderId].name, sort: (b) => traderById[b.traderId].name.split(' ').pop()! },
              { key: 'r', header: 'Giá DV', align: 'right', render: (b) => fmtNum(b.rent), hideSm: true },
              { key: 'e', header: 'Điện', align: 'right', render: (b) => fmtNum(b.electric), hideSm: true },
              { key: 'w', header: 'Nước', align: 'right', render: (b) => fmtNum(b.water), hideSm: true },
              { key: 'o', header: 'VS, giữ xe', align: 'right', render: (b) => fmtNum(b.sanitation + b.parking), hideSm: true },
              { key: 'tot', header: 'Tổng', align: 'right', render: (b) => <b>{fmtNum(b.total)}</b>, sort: (b) => b.total },
              { key: 'st', header: 'Trạng thái', render: (b) => <div><Badge tone={billState(b)[1]} dot>{billState(b)[0]}</Badge>{b.method && <p className="text-[11px] text-fg-3 mt-0.5">{b.method} · {fmtDate(b.paidAt)}</p>}</div>, sort: (b) => b.paid / b.total },
              { key: 'a', header: '', render: (b) => b.paid < b.total ? <div className="flex gap-1"><Button size="sm" icon={<QrCode />} onClick={() => setPay({ bills: [b], method: 'qr' })}>QR</Button><Button size="sm" icon={<Banknote />} onClick={() => setPay({ bills: [b], method: 'cash' })}>Thu</Button></div> : <Button size="sm" variant="subtle" icon={<Receipt />} onClick={() => toast({ intent: 'info', title: `Biên lai ${b.receipt}`, body: 'Đã gửi lại qua app và Zalo OA.' })}>Biên lai</Button> },
            ]} />
          </div></Card>
        </>
      )}

      {tab === 'debt' && (
        <Card pad={false}><div className="p-1">
          <DataTable rows={debts} pageSize={14} caption="Công nợ" columns={[
            { key: 't', header: 'Tiểu thương', render: (d) => <div className="flex items-center gap-2"><Avatar name={traderById[d.traderId].name} size={28} /><div><p className="font-semibold">{traderById[d.traderId].name}</p><p className="text-cap text-fg-3">{traderById[d.traderId].stallIds.map((s) => stallById[s].code).join(', ')} · {marketById[d.marketId].name}</p></div></div> },
            { key: 'p', header: 'Các kỳ còn nợ', render: (d) => <div className="flex flex-wrap gap-1">{d.periods.slice(0, 4).map((p) => <Badge key={p} tone="idle">{p}</Badge>)}{d.periods.length > 4 && <Badge tone="idle">+{d.periods.length - 4}</Badge>}</div> },
            { key: 'n', header: 'Số kỳ', align: 'right', render: (d) => <span className={cx(d.periods.length >= 3 && 'text-bad font-semibold')}>{d.periods.length}</span>, sort: (d) => d.periods.length },
            { key: 'a', header: 'Số tiền nợ', align: 'right', render: (d) => <b>{fmtVND(d.amount)}</b>, sort: (d) => d.amount },
            { key: 'l', header: 'Mức nhắc', render: (d) => <Badge tone={d.periods.length >= 3 ? 'bad' : d.periods.length === 2 ? 'warn' : 'info'}>{d.periods.length >= 3 ? 'Lần 3 · mời làm việc' : d.periods.length === 2 ? 'Lần 2 · SMS + Zalo' : 'Lần 1 · push app'}</Badge>, hideSm: true },
            { key: 'x', header: '', render: (d) => <Button size="sm" icon={<Send />} onClick={() => toast({ intent: 'success', title: 'Đã gửi nhắc nợ', body: `${traderById[d.traderId].name} · ${fmtVND(d.amount)}` })}>Nhắc nợ</Button> },
          ]} />
        </div></Card>
      )}

      {tab === 'counter' && <Counter onPay={(bs, m) => setPay({ bills: bs, method: m })} />}

      <PayDialog pay={pay} onClose={() => setPay(null)} onPaid={(bs, method) => { bs.forEach((b) => { b.paid = b.total; b.method = method; b.paidAt = '2026-10-11 ' + new Date().toTimeString().slice(0, 5); b.receipt = 'BL26' + String(Math.floor(Math.random() * 1e6)).padStart(6, '0'); }); setPay(null); force((x) => x + 1); toast({ intent: 'success', title: 'Đã ghi nhận thanh toán và phát hành biên lai điện tử', body: `${fmtVND(bs.reduce((a, b) => a + b.total, 0))} · ${method}` }); }} />

      <Dialog open={newPeriod} onClose={() => setNewPeriod(false)} title="Lập kỳ thu tháng 11/2026" description="UC-13 · Sinh bảng kê phải thu cho từng tiểu thương theo hợp đồng hiệu lực và chỉ số điện nước đã ghi."
        footer={<><Button onClick={() => setNewPeriod(false)}>Hủy</Button><Button variant="primary" onClick={() => { setNewPeriod(false); toast({ intent: 'success', title: 'Đã lập kỳ thu 11/2026', body: `${fmtNum(cur.length)} bảng kê được tạo, chờ phát hành.` }); }}>Lập kỳ thu</Button></>}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4"><Field label="Từ ngày">{(id) => <Input id={id} type="date" defaultValue="2026-11-01" />}</Field><Field label="Hạn nộp">{(id) => <Input id={id} type="date" defaultValue="2026-11-20" />}</Field></div>
          <Field label="Phạm vi">{(id) => <Select id={id}><option>{scope}</option></Select>}</Field>
          <MessageBar intent="warning" title="Còn 1.204 sạp chưa ghi chỉ số điện kỳ 10.">Bảng kê của các sạp này sẽ dùng chỉ số bình quân 3 kỳ gần nhất và được đánh dấu để điều chỉnh.</MessageBar>
        </div>
      </Dialog>
      <RemindDialog open={remind} onClose={() => setRemind(false)} onSave={() => { setRemind(false); toast({ intent: 'success', title: 'Đã lưu lịch nhắc nợ tự động' }); }} />
    </>
  );
}

function Counter({ onPay }: { onPay: (b: Bill[], m: 'cash' | 'qr') => void }) {
  const all = useScoped(traders);
  const [q, setQ] = useState('');
  const [tid, setTid] = useState<string | null>(null);
  const hits = q.length >= 2 ? all.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) || t.phone.includes(q) || t.stallIds.some((s) => stallById[s].code.toLowerCase().includes(q.toLowerCase()))).slice(0, 8) : [];
  const t = tid ? traderById[tid] : null;
  const unpaid = t ? bills.filter((b) => b.traderId === t.id && b.paid < b.total) : [];
  const sum = unpaid.reduce((a, b) => a + b.total - b.paid, 0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <Card className="lg:col-span-2" title="Tìm tiểu thương" subtitle="Quét mã sạp, nhập tên hoặc số điện thoại">
        <SearchBox value={q} onChange={setQ} placeholder="VD: HAN-A012, Lan, 0905…" />
        <ul className="mt-3 divide-y divide-line">
          {hits.map((h) => <li key={h.id}><button onClick={() => setTid(h.id)} className={cx('w-full text-left flex items-center gap-3 py-2 px-2 rounded-control hover:bg-hover', tid === h.id && 'bg-brand-soft')}><Avatar name={h.name} size={30} /><span className="min-w-0"><span className="block font-semibold">{h.name}</span><span className="block text-cap text-fg-3">{h.stallIds.map((s) => stallById[s].code).join(', ')} · {marketById[h.marketId].name}</span></span></button></li>)}
          {q.length >= 2 && !hits.length && <li className="py-6 text-center text-fg-3">Không tìm thấy tiểu thương phù hợp.</li>}
          {q.length < 2 && <li className="py-6 text-center text-fg-3 flex flex-col items-center gap-2"><Search className="w-6 h-6" />Nhập ít nhất 2 ký tự để tìm.</li>}
        </ul>
      </Card>
      <Card className="lg:col-span-3" title={t ? t.name : 'Khoản phải nộp'} subtitle={t ? `${t.code} · ${t.stallIds.map((s) => stallById[s].code).join(', ')}` : 'Chọn tiểu thương ở bên trái'}>
        {t ? (unpaid.length ? (
          <>
            <ul className="divide-y divide-line border border-line rounded-card mb-4">{unpaid.map((b) => <li key={b.id} className="flex justify-between px-3 py-2"><span>Kỳ {b.period}<span className="block text-cap text-fg-3">Giá DV {fmtNum(b.rent)} · Điện {fmtNum(b.electric)} · Nước {fmtNum(b.water)}</span></span><b className="tnum">{fmtVND(b.total - b.paid)}</b></li>)}</ul>
            <div className="flex items-center justify-between mb-4"><span className="text-fg-2">Tổng cần thu</span><span className="text-title2 font-semibold tnum">{fmtVND(sum)}</span></div>
            <div className="grid grid-cols-2 gap-2"><Button size="md" icon={<Banknote />} onClick={() => onPay(unpaid, 'cash')} className="h-11">Thu tiền mặt</Button><Button variant="primary" icon={<QrCode />} onClick={() => onPay(unpaid, 'qr')} className="h-11">Tạo mã VietQR</Button></div>
          </>
        ) : <MessageBar intent="success" title="Không có khoản nợ.">Tiểu thương đã hoàn thành nghĩa vụ đến kỳ {CURRENT_PERIOD}.</MessageBar>) : <div className="py-12 text-center text-fg-3">Chưa chọn tiểu thương</div>}
      </Card>
    </div>
  );
}

function PayDialog({ pay, onClose, onPaid }: { pay: { bills: Bill[]; method: 'cash' | 'qr' } | null; onClose: () => void; onPaid: (b: Bill[], m: 'VietQR' | 'Tiền mặt') => void }) {
  const [phase, setPhase] = useState<'wait' | 'got'>('wait');
  const [given, setGiven] = useState('');
  useEffect(() => { setPhase('wait'); setGiven(''); }, [pay]);
  if (!pay) return null;
  const b0 = pay.bills[0];
  const t = traderById[b0.traderId], s = stallById[b0.stallId];
  const amt = pay.bills.reduce((a, b) => a + b.total - b.paid, 0);
  const memo = `${s.code} ${pay.bills.map((b) => b.period.replace('/', '')).join(' ')}`;
  const givenN = +given.replace(/\D/g, '');
  if (pay.method === 'qr') return (
    <Dialog open onClose={onClose} title="Thanh toán bằng mã VietQR" description="Tiểu thương quét mã bằng ứng dụng ngân hàng bất kỳ. Hệ thống nhận kết quả qua webhook có chữ ký số." width="max-w-md"
      footer={phase === 'wait' ? <><Button onClick={onClose}>Đóng</Button><Button variant="primary" onClick={() => { setPhase('got'); setTimeout(() => onPaid(pay.bills, 'VietQR'), 1300); }}>Mô phỏng ngân hàng báo có</Button></> : undefined}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="p-3 rounded-panel border border-line bg-white"><FakeQR seed={memo} size={200} /></div>
        <p className="text-title2 font-semibold tnum">{fmtVND(amt)}</p>
        <dl className="text-cap text-fg-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left">
          <dt>Người nộp</dt><dd className="text-fg">{t.name}</dd>
          <dt>Tài khoản thụ hưởng</dt><dd className="text-fg">{marketById[b0.marketId].bql.toUpperCase()} · 1180 2026 {s.code.slice(0, 3)}</dd>
          <dt>Nội dung</dt><dd className="text-fg font-mono">{memo}</dd>
        </dl>
        <div role="status" aria-live="polite" className={cx('w-full flex items-center justify-center gap-2 rounded-control py-2 text-body', phase === 'wait' ? 'bg-subtle text-fg-2' : 'bg-ok-soft text-ok font-semibold')}>
          {phase === 'wait' ? <><Loader2 className="w-4 h-4 animate-spin" />Đang chờ thanh toán… mã hết hạn sau 14:52</> : <><CheckCircle2 className="w-4 h-4" />Đã nhận tiền · đang phát hành biên lai</>}
        </div>
      </div>
    </Dialog>
  );
  return (
    <Dialog open onClose={onClose} title="Thu tiền mặt" description={`${t.name} · ${s.code} · ${pay.bills.length} kỳ`}
      footer={<><Button onClick={onClose}>Hủy</Button><Button variant="primary" icon={<Printer />} disabled={givenN < amt} onClick={() => onPaid(pay.bills, 'Tiền mặt')}>Xác nhận thu & phát hành biên lai</Button></>}>
      <div className="grid gap-4">
        <div className="flex justify-between items-baseline"><span className="text-fg-2">Số tiền phải thu</span><span className="text-title2 font-semibold tnum">{fmtVND(amt)}</span></div>
        <Field label="Tiền khách đưa" required error={given && givenN < amt ? 'Số tiền chưa đủ so với số phải thu.' : undefined}>{(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!given && givenN < amt} inputMode="numeric" data-autofocus value={given ? givenN.toLocaleString('vi-VN') : ''} onChange={(e) => setGiven(e.target.value)} placeholder="0" className="h-10 text-sub tnum" />}</Field>
        <div className="flex flex-wrap gap-2">{[amt, Math.ceil(amt / 100000) * 100000, Math.ceil(amt / 500000) * 500000].filter((v, i, a) => a.indexOf(v) === i).map((v) => <Button key={v} size="sm" onClick={() => setGiven(String(v))}>{fmtNum(v)}</Button>)}</div>
        {givenN >= amt && <MessageBar intent="success">Tiền thối lại: <b className="tnum">{fmtVND(givenN - amt)}</b></MessageBar>}
      </div>
    </Dialog>
  );
}

function RemindDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [a, setA] = useState(true), [b, setB] = useState(true), [c, setC] = useState(true);
  return (
    <Dialog open={open} onClose={onClose} title="Lịch nhắc nợ tự động" description="UC-17 · Hệ thống tự gửi nhắc nợ theo số kỳ còn nợ." footer={<><Button onClick={onClose}>Hủy</Button><Button variant="primary" onClick={onSave}>Lưu lịch</Button></>}>
      <ol className="flex flex-col gap-3">
        <li className="border border-line rounded-card p-3"><div className="flex justify-between gap-2"><b>Lần 1 · ngày 21 hằng tháng</b><Switch label="" checked={a} onChange={setA} /></div><p className="text-cap text-fg-2">Push app cho tiểu thương chưa nộp kỳ hiện tại.</p></li>
        <li className="border border-line rounded-card p-3"><div className="flex justify-between gap-2"><b>Lần 2 · ngày 05 tháng sau</b><Switch label="" checked={b} onChange={setB} /></div><p className="text-cap text-fg-2">Zalo OA + SMS kèm mã VietQR cho khoản nợ 2 kỳ.</p></li>
        <li className="border border-line rounded-card p-3"><div className="flex justify-between gap-2"><b>Lần 3 · khi nợ ≥ 3 kỳ</b><Switch label="" checked={c} onChange={setC} /></div><p className="text-cap text-fg-2">Tạo giấy mời làm việc, giao cán bộ BQL theo dõi.</p></li>
      </ol>
    </Dialog>
  );
}
