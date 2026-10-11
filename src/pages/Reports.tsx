import { useMemo, useState } from 'react';
import { FileSpreadsheet, FileText, FileBarChart, Clock } from 'lucide-react';
import { bills, markets, PERIODS, fmtNum, fmtMil, fmtPct, stalls, traders, complaints } from '../data/db';
import { useScoped, useScopeName, useScopedMarkets } from '../lib/scope';
import { Badge, Button, Card, Field, PageHeader, Select, useToast, cx } from '../components/ui';
import { TrendArea, useChartColors } from '../components/charts';

const TEMPLATES = [
  { id: 'BC01', name: 'Báo cáo tình hình thu giá dịch vụ sử dụng diện tích bán hàng', period: 'Tháng / Quý / Năm', to: 'Sở Tài chính, UBND TP' },
  { id: 'BC02', name: 'Báo cáo tình hình sử dụng sạp/kiốt và điểm kinh doanh', period: 'Quý', to: 'Sở Công Thương' },
  { id: 'BC03', name: 'Báo cáo số lượng tiểu thương theo ngành hàng', period: '6 tháng', to: 'Sở Công Thương' },
  { id: 'BC04', name: 'Báo cáo tiếp nhận, giải quyết phản ánh kiến nghị', period: 'Tháng', to: 'Văn phòng UBND TP' },
  { id: 'BC05', name: 'Báo cáo kết quả kiểm tra ATTP, PCCC tại chợ', period: 'Quý', to: 'Ban chỉ đạo liên ngành ATTP' },
  { id: 'BC06', name: 'Báo cáo công nợ và tình hình thanh toán không dùng tiền mặt', period: 'Tháng', to: 'Lãnh đạo Sở KH&CN' },
];

export default function Reports() {
  const toast = useToast();
  const scope = useScopeName();
  const ms = useScopedMarkets();
  const bs = useScoped(bills);
  const [tpl, setTpl] = useState('BC01');
  const [from, setFrom] = useState(9), [to, setTo] = useState(11);
  const col = useChartColors();
  const data = useMemo(() => ms.map((m) => { const b = bs.filter((x) => x.marketId === m.id && x.periodIdx >= from && x.periodIdx <= to); const t = b.reduce((a, x) => a + x.total, 0), p = b.reduce((a, x) => a + x.paid, 0); return { id: m.id, name: m.name, cls: m.cls, t, p, rate: t ? p / t : 0, qr: b.filter((x) => x.method === 'VietQR').reduce((a, x) => a + x.paid, 0) }; }).sort((a, b) => b.t - a.t), [ms, bs, from, to]);
  const trend = useMemo(() => PERIODS.map((p, i) => ({ label: p.slice(0, 2) + '/' + p.slice(5), v: bs.filter((b) => b.periodIdx === i).reduce((a, b) => a + b.paid, 0) / 1e6 })), [bs]);
  const T = data.reduce((a, d) => a + d.t, 0), P = data.reduce((a, d) => a + d.p, 0), Q = data.reduce((a, d) => a + d.qr, 0);
  const tp = TEMPLATES.find((x) => x.id === tpl)!;
  return (
    <>
      <PageHeader uc="UC-32 · UC-33 · Báo cáo thống kê theo mẫu, xuất Excel/PDF" title="Báo cáo thống kê" subtitle="Lập báo cáo theo mẫu quy định; xuất Excel hoặc PDF (≤ 10 giây với dữ liệu 01 năm)." />
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
        <Card title="Mẫu báo cáo" pad={false}>
          <ul className="px-2 pb-2">{TEMPLATES.map((t) => <li key={t.id}><button onClick={() => setTpl(t.id)} aria-pressed={tpl === t.id} className={cx('w-full text-left flex gap-3 p-2.5 rounded-control', tpl === t.id ? 'bg-brand-soft' : 'hover:bg-hover')}><FileBarChart className={cx('w-5 h-5 shrink-0 mt-0.5', tpl === t.id ? 'text-brand' : 'text-fg-3')} /><span><span className="block font-semibold text-body leading-snug">{t.name}</span><span className="block text-cap text-fg-3 mt-0.5">{t.id} · {t.period} · gửi {t.to}</span></span></button></li>)}</ul>
        </Card>
        <div className="flex flex-col gap-4 min-w-0">
          <Card>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Từ kỳ">{(id) => <Select id={id} value={from} onChange={(e) => setFrom(+e.target.value)} className="w-32">{PERIODS.map((p, i) => <option key={p} value={i}>{p}</option>)}</Select>}</Field>
              <Field label="Đến kỳ">{(id) => <Select id={id} value={to} onChange={(e) => setTo(+e.target.value)} className="w-32">{PERIODS.map((p, i) => <option key={p} value={i} disabled={i < from}>{p}</option>)}</Select>}</Field>
              <Field label="Phạm vi">{(id) => <Select id={id} disabled className="w-48"><option>{scope}</option></Select>}</Field>
              <div className="flex-1" />
              <Button icon={<FileSpreadsheet />} onClick={() => toast({ intent: 'success', title: 'Đã xuất Excel', body: `${tp.id}_${PERIODS[from].replace('/', '')}-${PERIODS[to].replace('/', '')}.xlsx · 1,8 giây` })}>Xuất Excel</Button>
              <Button variant="primary" icon={<FileText />} onClick={() => toast({ intent: 'success', title: 'Đã xuất PDF có ký số', body: `${tp.id} · ${data.length} chợ` })}>Xuất PDF</Button>
            </div>
          </Card>
          <Card pad={false}>
            <div className="p-6 border-b border-line text-center">
              <p className="text-cap text-fg-3 uppercase tracking-wide">Sở Khoa học và Công nghệ TP. Đà Nẵng · Mẫu {tp.id}</p>
              <h2 className="text-title3 font-semibold mt-1">{tp.name.toUpperCase()}</h2>
              <p className="text-body text-fg-2">Kỳ {PERIODS[from]} – {PERIODS[to]} · {scope}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-line">
              {[['Tổng phải thu', fmtMil(T)], ['Tổng đã thu', fmtMil(P)], ['Thu qua VietQR', `${fmtMil(Q)} (${fmtPct(Q / (P || 1), 0)})`]].map(([k, v]) => <div key={k} className="p-4 sm:border-r last:border-0 border-line"><p className="text-cap text-fg-3">{k}</p><p className="text-title3 font-semibold tnum">{v}</p></div>)}
            </div>
            <div className="p-4 border-b border-line"><p className="text-cap font-semibold text-fg-2 mb-1">Số thu theo kỳ (triệu đồng)</p><TrendArea data={trend} dataKey="v" name="Đã thu" color={col.c1} height={180} fmt={(n) => `${fmtNum(Math.round(n))} tr`} /></div>
            <div className="overflow-x-auto">
              <table className="w-full text-body">
                <thead><tr className="text-left text-fg-2 border-b border-line">{['TT', 'Chợ', 'Hạng', 'Phải thu', 'Đã thu', 'Tỷ lệ', 'Qua VietQR'].map((h, i) => <th key={h} className={cx('px-4 h-9 font-semibold whitespace-nowrap', i > 2 && 'text-right')}>{h}</th>)}</tr></thead>
                <tbody>{data.map((d, i) => <tr key={d.id} className="border-b border-line"><td className="px-4 py-2 tnum text-fg-3">{i + 1}</td><td className="px-4 font-semibold">{d.name}</td><td className="px-4">{d.cls}</td><td className="px-4 text-right tnum">{fmtNum(Math.round(d.t / 1000))}</td><td className="px-4 text-right tnum">{fmtNum(Math.round(d.p / 1000))}</td><td className="px-4 text-right tnum">{fmtPct(d.rate, 1)}</td><td className="px-4 text-right tnum">{fmtNum(Math.round(d.qr / 1000))}</td></tr>)}
                  <tr className="font-semibold bg-subtle"><td className="px-4 py-2" /><td className="px-4">Tổng cộng</td><td /><td className="px-4 text-right tnum">{fmtNum(Math.round(T / 1000))}</td><td className="px-4 text-right tnum">{fmtNum(Math.round(P / 1000))}</td><td className="px-4 text-right tnum">{fmtPct(P / (T || 1), 1)}</td><td className="px-4 text-right tnum">{fmtNum(Math.round(Q / 1000))}</td></tr>
                </tbody>
              </table>
              <p className="px-4 py-2 text-cap text-fg-3">Đơn vị: nghìn đồng · Dữ liệu mô phỏng phục vụ thử nghiệm giao diện.</p>
            </div>
          </Card>
          <Card title="Báo cáo định kỳ đã lập lịch" subtitle="Tự động lập và gửi qua hệ thống quản lý văn bản">
            <ul className="divide-y divide-line">{[['BC01 – Tháng', 'Ngày 05 hằng tháng, 07:00', 'Lãnh đạo Sở, Sở Tài chính'], ['BC04 – Tháng', 'Ngày 03 hằng tháng, 07:00', 'Văn phòng UBND TP'], ['BC02 – Quý', 'Ngày 10 tháng đầu quý', 'Sở Công Thương']].map(([a, b, c]) => <li key={a} className="flex flex-wrap items-center gap-3 py-2"><Clock className="w-4 h-4 text-fg-3" /><span className="font-semibold">{a}</span><span className="text-fg-2 text-cap">{b}</span><span className="ml-auto text-cap text-fg-3">{c}</span><Badge tone="ok">Đang bật</Badge></li>)}</ul>
          </Card>
        </div>
      </div>
    </>
  );
}
