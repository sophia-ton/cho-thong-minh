import { useMemo, useState } from 'react';
import { RefreshCw, Upload, CheckCircle2, AlertTriangle, Plus, Pencil, Link2 } from 'lucide-react';
import { bills, FEE_RATE, ELECTRIC_PRICE, WATER_PRICE, SANITATION_FEE, fmtVND, fmtNum, fmtMil, marketById, stallById, traderById, markets } from '../data/db';
import { useScoped, useScopeName } from '../lib/scope';
import { Badge, Button, Card, DataTable, Dialog, Drawer, Field, Input, MessageBar, PageHeader, Select, Stat, Tabs, useToast, cx } from '../components/ui';

// ---------------- UC-18 Đối soát ----------------
export function Reconcile() {
  const toast = useToast();
  const scope = useScopeName();
  const bs = useScoped(bills);
  const [sel, setSel] = useState<string | null>(null);
  const days = useMemo(() => {
    const online = bs.filter((b) => b.periodIdx === 11 && (b.method === 'VietQR' || b.method === 'Chuyển khoản') && b.paidAt);
    const out: { id: string; date: string; n: number; amount: number; bankN: number; bankAmount: number; diff: number; status: 'Khớp' | 'Lệch' | 'Đã xử lý'; bank: string }[] = [];
    for (let d = 10; d >= 1; d--) {
      const ds = `2026-10-${String(d).padStart(2, '0')}`;
      const tx = online.filter((b) => b.paidAt!.startsWith(ds));
      const amount = tx.reduce((a, b) => a + b.paid, 0);
      const mism = d === 10 ? 3 : d === 7 ? 1 : d === 3 ? 2 : 0;
      const diff = mism ? tx.slice(0, mism).reduce((a, b) => a + b.paid, 0) : 0;
      out.push({ id: ds, date: ds, n: tx.length, amount, bankN: tx.length - (d === 7 ? 0 : mism) + (d === 7 ? 1 : 0), bankAmount: amount - (d === 7 ? -diff : diff), diff, status: !mism ? 'Khớp' : d === 3 ? 'Đã xử lý' : 'Lệch', bank: d % 2 ? 'Vietcombank' : 'BIDV' });
    }
    return out;
  }, [bs]);
  const cur = days.find((d) => d.id === sel);
  const sample = useMemo(() => bs.filter((b) => b.periodIdx === 11 && b.method === 'VietQR').slice(0, 3), [bs]);
  return (
    <>
      <PageHeader uc="UC-18 · Đối soát thu phí" title={`Đối soát giao dịch · ${scope}`} subtitle="So khớp giao dịch thu tại quầy, trực tuyến với sao kê ngân hàng hằng ngày; cảnh báo chênh lệch để xử lý."
        actions={<><Button icon={<Upload />} onClick={() => toast({ intent: 'info', title: 'Tải lên sao kê', body: 'Hỗ trợ tệp .xlsx, .csv, MT940' })}>Tải sao kê</Button><Button variant="primary" icon={<RefreshCw />} onClick={() => toast({ intent: 'success', title: 'Đã chạy đối soát ngày 10/10/2026', body: 'Phát hiện 3 giao dịch lệch.' })}>Chạy đối soát</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Giao dịch trực tuyến 10 ngày" value={fmtNum(days.reduce((a, d) => a + d.n, 0))} sub={fmtMil(days.reduce((a, d) => a + d.amount, 0))} />
        <Stat label="Ngày khớp hoàn toàn" value={`${days.filter((d) => d.status === 'Khớp').length}/10`} tone="ok" sub="Tự động, không cần can thiệp" />
        <Stat label="Ngày còn lệch" value={days.filter((d) => d.status === 'Lệch').length} tone="bad" sub="Cần kế toán xử lý" />
        <Stat label="Thời gian ghi nhận TB" value="8,4 giây" sub="Từ lúc ngân hàng báo có (yêu cầu ≤ 30 giây)" />
      </div>
      <Card pad={false}><div className="p-1">
        <DataTable rows={days} onRowClick={(r) => setSel(r.id)} pageSize={10} caption="Kết quả đối soát" columns={[
          { key: 'd', header: 'Ngày', render: (r) => <b className="tnum">{r.date.split('-').reverse().join('/')}</b> },
          { key: 'b', header: 'Ngân hàng', render: (r) => r.bank, hideSm: true },
          { key: 'n', header: 'GD hệ thống', align: 'right', render: (r) => fmtNum(r.n) },
          { key: 'a', header: 'Số tiền hệ thống', align: 'right', render: (r) => fmtVND(r.amount), hideSm: true },
          { key: 'bn', header: 'GD sao kê', align: 'right', render: (r) => fmtNum(r.bankN) },
          { key: 'ba', header: 'Số tiền sao kê', align: 'right', render: (r) => fmtVND(r.bankAmount), hideSm: true },
          { key: 'df', header: 'Chênh lệch', align: 'right', render: (r) => <span className={cx(!!r.diff && r.status === 'Lệch' && 'text-bad font-semibold')}>{r.diff ? fmtVND(r.diff) : '—'}</span> },
          { key: 's', header: 'Kết quả', render: (r) => <Badge tone={r.status === 'Khớp' ? 'ok' : r.status === 'Lệch' ? 'bad' : 'idle'} dot>{r.status}</Badge> },
        ]} />
      </div></Card>
      <Drawer open={!!cur} onClose={() => setSel(null)} title={`Đối soát ngày ${cur?.date.split('-').reverse().join('/')}`} subtitle={cur?.bank}>
        {cur && (cur.status === 'Khớp' ? <MessageBar intent="success" title="Khớp hoàn toàn.">{fmtNum(cur.n)} giao dịch, {fmtVND(cur.amount)}.</MessageBar> : (
          <div className="flex flex-col gap-4">
            <MessageBar intent={cur.status === 'Lệch' ? 'warning' : 'info'} title={cur.status === 'Lệch' ? 'Có giao dịch chênh lệch.' : 'Đã xử lý xong.'}>Chênh lệch {fmtVND(cur.diff)}.</MessageBar>
            {sample.slice(0, cur.id.endsWith('10') ? 3 : cur.id.endsWith('07') ? 1 : 2).map((b, i) => (
              <div key={b.id} className="border border-line rounded-card p-3">
                <div className="flex items-center justify-between gap-2"><span className="font-semibold">{i === 0 && cur.id.endsWith('07') ? 'Có trên sao kê, chưa có trên hệ thống' : 'Có trên hệ thống, chưa có trên sao kê'}</span><AlertTriangle className="w-4 h-4 text-warn" /></div>
                <p className="text-cap text-fg-2 mt-1">{traderById[b.traderId].name} · {stallById[b.stallId].code} · {fmtVND(b.paid)} · ND: <span className="font-mono">{stallById[b.stallId].code} 102026</span></p>
                <div className="flex gap-2 mt-2"><Button size="sm" icon={<Link2 />} onClick={() => toast({ intent: 'success', title: 'Đã ghép giao dịch thủ công' })}>Ghép thủ công</Button><Button size="sm" variant="subtle" onClick={() => toast({ intent: 'info', title: 'Đã gửi yêu cầu tra soát tới ngân hàng' })}>Yêu cầu tra soát</Button></div>
              </div>
            ))}
          </div>
        ))}
      </Drawer>
    </>
  );
}

// ---------------- UC-12 Biểu phí ----------------
export function Tariff() {
  const toast = useToast();
  const [tab, setTab] = useState<'area' | 'service'>('area');
  const [edit, setEdit] = useState<string | null>(null);
  const rows = (Object.keys(FEE_RATE) as (keyof typeof FEE_RATE)[]).flatMap((cls) => [
    { id: cls + 'n', cls, pos: 'Trong nhà lồng', coef: 1, price: FEE_RATE[cls], from: '2026-01-01', basis: 'QĐ của UBND TP về giá dịch vụ sử dụng diện tích bán hàng [cần xác nhận số hiệu]' },
    { id: cls + 'f', cls, pos: 'Mặt tiền / kiốt', coef: 1.35, price: Math.round(FEE_RATE[cls] * 1.35), from: '2026-01-01', basis: 'Hệ số vị trí theo phương án giá của BQL' },
    { id: cls + 'o', cls, pos: 'Khu ngoài trời / tạm', coef: 0.6, price: Math.round(FEE_RATE[cls] * 0.6), from: '2026-01-01', basis: 'Hệ số vị trí theo phương án giá của BQL' },
  ]);
  return (
    <>
      <PageHeader uc="UC-12 · Thiết lập biểu phí, đơn giá" title="Biểu phí & đơn giá dịch vụ" subtitle="Đơn giá theo hạng chợ, vị trí và thời gian hiệu lực. Thay đổi biểu phí chỉ áp dụng cho kỳ thu sau ngày hiệu lực và lưu lịch sử phiên bản." actions={<Button variant="primary" icon={<Plus />} onClick={() => setEdit('new')}>Thêm biểu phí</Button>} />
      <div className="mb-4"><MessageBar intent="info">Số liệu đơn giá trong bản prototype là <b>dữ liệu mô phỏng</b>; khi triển khai sẽ nhập theo quyết định giá hiện hành của UBND thành phố.</MessageBar></div>
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'area', label: 'Giá DV sử dụng diện tích bán hàng' }, { id: 'service', label: 'Điện, nước, vệ sinh, giữ xe' }]} />
      {tab === 'area' ? (
        <Card pad={false}><div className="p-1"><DataTable rows={rows} pageSize={20} caption="Biểu phí diện tích" columns={[
          { key: 'c', header: 'Hạng chợ', render: (r) => <Badge tone={r.cls === 'Hạng 1' ? 'info' : 'idle'}>{r.cls}</Badge> },
          { key: 'p', header: 'Vị trí', render: (r) => r.pos },
          { key: 'k', header: 'Hệ số', align: 'right', render: (r) => r.coef.toLocaleString('vi-VN') },
          { key: 'v', header: 'Đơn giá (đ/m²/tháng)', align: 'right', render: (r) => <b>{fmtNum(r.price)}</b> },
          { key: 'f', header: 'Hiệu lực từ', render: (r) => <span className="tnum">{r.from.split('-').reverse().join('/')}</span> },
          { key: 'b', header: 'Căn cứ', render: (r) => <span className="text-cap text-fg-2">{r.basis}</span>, hideSm: true },
          { key: 'e', header: '', render: (r) => <Button size="sm" variant="subtle" icon={<Pencil />} onClick={() => setEdit(r.id)}>Sửa</Button> },
        ]} /></div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {[['Điện kinh doanh', `${fmtNum(ELECTRIC_PRICE)} đ/kWh`, 'Bình quân, theo biểu giá điện kinh doanh hiện hành'], ['Nước sạch', `${fmtNum(WATER_PRICE)} đ/m³`, 'Theo giá nước kinh doanh dịch vụ'], ['Vệ sinh môi trường', `${fmtNum(SANITATION_FEE)} đ/sạp/tháng`, 'Thu gom, vận chuyển rác thải'], ['Giữ xe máy', '50.000 đ/xe/tháng', 'Vé tháng cho tiểu thương']].map(([t, v, d]) => (
            <Card key={t}><p className="text-cap text-fg-2 font-semibold">{t}</p><p className="text-title3 font-semibold tnum mt-1">{v}</p><p className="text-cap text-fg-3 mt-1">{d}</p><Button size="sm" variant="subtle" icon={<Pencil />} className="mt-2 -ml-2" onClick={() => setEdit(t)}>Cập nhật</Button></Card>
          ))}
        </div>
      )}
      <Dialog open={!!edit} onClose={() => setEdit(null)} title={edit === 'new' ? 'Thêm biểu phí' : 'Cập nhật đơn giá'} description="Đơn giá mới tạo phiên bản biểu phí mới, không ghi đè lịch sử." footer={<><Button onClick={() => setEdit(null)}>Hủy</Button><Button variant="primary" onClick={() => { setEdit(null); toast({ intent: 'success', title: 'Đã lưu biểu phí, chờ phê duyệt', body: 'Áp dụng từ kỳ thu 01/2027' }); }}>Lưu & trình duyệt</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Áp dụng cho">{(id) => <Select id={id}><option>Tất cả chợ hạng 1</option>{markets.slice(0, 8).map((m) => <option key={m.id}>{m.name}</option>)}</Select>}</Field>
          <Field label="Vị trí">{(id) => <Select id={id}><option>Trong nhà lồng</option><option>Mặt tiền / kiốt</option><option>Khu ngoài trời / tạm</option></Select>}</Field>
          <Field label="Đơn giá mới" required>{(id) => <Input id={id} inputMode="numeric" defaultValue="300.000" />}</Field>
          <Field label="Hiệu lực từ" required>{(id) => <Input id={id} type="date" defaultValue="2027-01-01" />}</Field>
          <div className="sm:col-span-2"><Field label="Căn cứ pháp lý" hint="Số, ngày quyết định phê duyệt giá">{(id, d) => <Input id={id} aria-describedby={d} />}</Field></div>
        </div>
      </Dialog>
    </>
  );
}
