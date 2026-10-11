import { useMemo, useState } from 'react';
import { Download, FileText, Store, Wallet, AlertCircle, QrCode, MessageSquareWarning, Smartphone, ArrowUpRight, CalendarClock } from 'lucide-react';
import { bills, complaints, contracts, traders, stalls, PERIODS, marketById, traderById, stallById, fmtBil, fmtPct, fmtNum, fmtMil, fmtDate } from '../data/db';
import { useScoped, useScopeName, useScopedMarkets } from '../lib/scope';
import { useApp } from '../lib/app';
import { Badge, Button, Card, PageHeader, Select, Stat, useToast, MessageBar, cx } from '../components/ui';
import { StackedBars, HBarList, useChartColors, LegendRow, Donut, Sparkline } from '../components/charts';
import { COMPLAINT_STATUS } from '../lib/status';

export default function Dashboard() {
  const { go, market } = useApp();
  const toast = useToast();
  const scopeName = useScopeName();
  const ms = useScopedMarkets();
  const bs = useScoped(bills);
  const cs = useScoped(complaints);
  const ct = useScoped(contracts);
  const tr = useScoped(traders);
  const st = useScoped(stalls);
  const [period, setPeriod] = useState(11);
  const col = useChartColors();

  const k = useMemo(() => {
    const cur = bs.filter((b) => b.periodIdx === period);
    const target = cur.reduce((a, b) => a + b.total, 0), got = cur.reduce((a, b) => a + b.paid, 0);
    const prev = bs.filter((b) => b.periodIdx === period - 1).reduce((a, b) => a + b.paid, 0);
    const debt = bs.filter((b) => b.periodIdx < period).reduce((a, b) => a + b.total - b.paid, 0);
    const debtors = new Set(bs.filter((b) => b.periodIdx < period && b.paid < b.total).map((b) => b.traderId)).size;
    const paid = cur.filter((b) => b.paid > 0);
    const cashless = paid.filter((b) => b.method === 'VietQR' || b.method === 'Chuyển khoản').length / (paid.length || 1);
    const occ = st.filter((s) => s.status === 'rented' || s.status === 'suspended').length;
    return { target, got, prev, debt, debtors, cashless, occ, rate: occ / (st.length || 1) };
  }, [bs, st, period]);

  const series = useMemo(() => PERIODS.map((p, i) => {
    const row: any = { label: 'T' + p.slice(0, 2).replace(/^0/, ''), period: p };
    for (const b of bs) if (b.periodIdx === i && b.paid) { const key = b.method === 'VietQR' ? 'qr' : b.method === 'Chuyển khoản' ? 'ck' : b.method === 'Thu trên thiết bị di động' ? 'mb' : 'tm'; row[key] = (row[key] || 0) + b.paid; }
    return row;
  }), [bs]);
  const cashSpark = useMemo(() => PERIODS.map((_, i) => { const p = bs.filter((b) => b.periodIdx === i && b.paid); return p.filter((b) => b.method === 'VietQR' || b.method === 'Chuyển khoản').length / (p.length || 1); }), [bs]);

  const openC = cs.filter((c) => c.status !== 'resolved');
  const overdue = cs.filter((c) => c.status === 'overdue');
  const rated = cs.filter((c) => c.rating);
  const sat = rated.reduce((a, c) => a + (c.rating ?? 0), 0) / (rated.length || 1);
  const expiring = ct.filter((c) => c.status === 'expiring').sort((a, b) => a.daysLeft - b.daysLeft);
  const appRate = tr.filter((t) => t.appUser).length / (tr.length || 1);
  const byCat = useMemo(() => { const m: Record<string, number> = {}; cs.forEach((c) => (m[c.category] = (m[c.category] || 0) + 1)); return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6); }, [cs]);

  const methodKeys = [{ key: 'qr', label: 'VietQR', color: col.c1 }, { key: 'ck', label: 'Chuyển khoản', color: col.c3 }, { key: 'mb', label: 'Thu trên thiết bị di động', color: col.c4 }, { key: 'tm', label: 'Tiền mặt tại quầy', color: col.c2 }];

  return (
    <>
      <PageHeader uc="UC-31 · Dashboard điều hành tổng hợp" title={`Tình hình hoạt động · ${scopeName}`} subtitle={`Số liệu cập nhật lúc 08:15 ngày 11/10/2026 · ${ms.length} chợ, ${fmtNum(st.length)} sạp/kiốt, ${fmtNum(tr.length)} tiểu thương.`}
        actions={<>
          <Select aria-label="Kỳ thu" value={period} onChange={(e) => setPeriod(+e.target.value)} className="w-[150px]">{PERIODS.map((p, i) => <option key={p} value={i}>Kỳ {p}</option>)}</Select>
          <Button icon={<Download />} onClick={() => toast({ intent: 'success', title: 'Đã xuất dashboard ra Excel', body: `Dashboard_${scopeName.replace(/\s/g, '')}_${PERIODS[period].replace('/', '-')}.xlsx` })}>Excel</Button>
          <Button icon={<FileText />} onClick={() => toast({ intent: 'success', title: 'Đã xuất dashboard ra PDF', body: 'Tệp gồm 4 trang, khổ A4 ngang.' })}>PDF</Button>
        </>} />

      {overdue.length > 0 && <div className="mb-4"><MessageBar intent="warning" title={`${overdue.length} phản ánh quá hạn xử lý`} action={<Button size="sm" variant="secondary" onClick={() => go('complaints')}>Xem danh sách</Button>}>Cần phân công lại hoặc gia hạn theo quy chế tiếp nhận phản ánh.</MessageBar></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Stat label="Tỷ lệ lấp đầy sạp/kiốt" icon={<Store />} value={fmtPct(k.rate)} sub={`${fmtNum(k.occ)} / ${fmtNum(st.length)} sạp đang khai thác`} onClick={() => go('floorplan')} />
        <Stat label={`Thu phí kỳ ${PERIODS[period]}`} icon={<Wallet />} value={fmtBil(k.got)} sub={<span>Đạt {fmtPct(k.got / (k.target || 1))} kế hoạch {fmtBil(k.target)}</span>} onClick={() => go('fees')} />
        <Stat label="Công nợ tồn các kỳ trước" icon={<AlertCircle />} value={fmtMil(k.debt)} tone="bad" sub={`${fmtNum(k.debtors)} tiểu thương còn nợ`} onClick={() => go('fees', { focus: 'debt' })} />
        <div className="bg-surface rounded-card shadow-card p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-cap text-fg-2 font-semibold">Thanh toán không tiền mặt<QrCode className="w-4 h-4 text-fg-3" /></div>
          <div className="flex items-end justify-between gap-2"><span className="text-title1 font-semibold tnum leading-tight">{fmtPct(k.cashless)}</span><Sparkline values={cashSpark} color={col.c1} /></div>
          <div className="text-cap text-ok">Tăng từ {fmtPct(cashSpark[0], 0)} (kỳ 11/2025)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="xl:col-span-2" title="Số thu theo hình thức thanh toán" subtitle="12 kỳ gần nhất · đơn vị: triệu đồng" actions={<Button size="sm" variant="subtle" icon={<ArrowUpRight />} onClick={() => go('reports')}>Báo cáo chi tiết</Button>}>
          <LegendRow items={methodKeys.map((m) => ({ label: m.label, color: m.color }))} />
          <div className="mt-2"><StackedBars data={series} keys={methodKeys} fmt={(n) => fmtMil(n)} yFmt={(n) => (n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} /></div>
        </Card>
        <Card title="Phản ánh, kiến nghị" subtitle="90 ngày gần nhất">
          <div className="flex items-center gap-4">
            <Donut size={128} label={String(openC.length)} sub="đang mở" parts={[
              { label: 'Mới tiếp nhận', value: cs.filter((c) => c.status === 'new').length, color: col.brand },
              { label: 'Đang xử lý', value: cs.filter((c) => c.status === 'processing' || c.status === 'waiting').length, color: col.c4 },
              { label: 'Quá hạn', value: overdue.length, color: col.bad },
            ]} />
            <ul className="flex-1 text-cap flex flex-col gap-1.5">
              <li className="flex justify-between"><span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: col.brand }} />Mới tiếp nhận</span><b className="tnum">{cs.filter((c) => c.status === 'new').length}</b></li>
              <li className="flex justify-between"><span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: col.c4 }} />Đang xử lý</span><b className="tnum">{cs.filter((c) => c.status === 'processing' || c.status === 'waiting').length}</b></li>
              <li className="flex justify-between"><span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: col.bad }} />Quá hạn</span><b className="tnum">{overdue.length}</b></li>
              <li className="flex justify-between border-t border-line pt-1.5 mt-0.5"><span>Đã xử lý</span><b className="tnum">{cs.length - openC.length}</b></li>
              <li className="flex justify-between"><span>Mức hài lòng TB</span><b className="tnum">{sat.toFixed(1)}/5</b></li>
            </ul>
          </div>
          <p className="text-cap font-semibold text-fg-2 mt-4 mb-2">Lĩnh vực phản ánh nhiều nhất</p>
          <HBarList rows={byCat.map(([l, v]) => ({ label: l, value: v }))} fmt={(n) => `${n}`} color={col.c1} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card title="Tỷ lệ lấp đầy theo chợ" subtitle="Nhấn vào chợ để mở sơ đồ mặt bằng" className="xl:col-span-1">
          <div className="max-h-[420px] overflow-y-auto pr-1">
            <HBarList rows={[...ms].sort((a, b) => b.fillRate - a.fillRate).map((m) => ({ id: m.id, label: m.name, value: m.fillRate, sub: `${m.rented + m.suspended}/${m.rented + m.suspended + m.empty}`, tone: m.fillRate < 0.8 ? col.c4 : col.c1 }))} max={1} fmt={(n) => fmtPct(n, 0)} onClick={(id) => go('floorplan', { market: id })} />
          </div>
        </Card>
        <Card title="Hợp đồng sắp hết hạn" subtitle={`${expiring.length} hợp đồng trong 60 ngày tới`} actions={<Button size="sm" variant="subtle" onClick={() => go('contracts', { focus: 'expiring' })}>Tất cả</Button>}>
          <ul className="divide-y divide-line">
            {expiring.slice(0, 7).map((c) => (
              <li key={c.id}><button onClick={() => go('contracts', { market: market === 'all' ? undefined : market, focus: c.id })} className="w-full text-left py-2 flex items-center gap-3 hover:bg-hover -mx-2 px-2 rounded-control">
                <CalendarClock className={cx('w-4 h-4 shrink-0', c.daysLeft <= 15 ? 'text-bad' : 'text-warn')} />
                <span className="min-w-0 flex-1"><span className="block font-semibold truncate">{traderById[c.traderId].name}</span><span className="block text-cap text-fg-3 truncate">{stallById[c.stallId].code} · {marketById[c.marketId].name}</span></span>
                <Badge tone={c.daysLeft <= 15 ? 'bad' : 'warn'}>còn {c.daysLeft} ngày</Badge>
              </button></li>
            ))}
            {!expiring.length && <li className="py-6 text-center text-fg-3">Chưa có dữ liệu trong kỳ chọn</li>}
          </ul>
        </Card>
        <Card title="Phản ánh cần chú ý" subtitle="Quá hạn và mới tiếp nhận" actions={<Button size="sm" variant="subtle" onClick={() => go('complaints')}>Tất cả</Button>}>
          <ul className="divide-y divide-line">
            {[...overdue, ...cs.filter((c) => c.status === 'new')].slice(0, 7).map((c) => (
              <li key={c.id}><button onClick={() => go('complaints', { focus: c.id })} className="w-full text-left py-2 flex items-start gap-3 hover:bg-hover -mx-2 px-2 rounded-control">
                <MessageSquareWarning className={cx('w-4 h-4 mt-0.5 shrink-0', c.status === 'overdue' ? 'text-bad' : 'text-brand')} />
                <span className="min-w-0 flex-1"><span className="block font-semibold truncate">{c.title}</span><span className="block text-cap text-fg-3 truncate">{marketById[c.marketId].name} · hạn {fmtDate(c.deadline)}</span></span>
                <Badge tone={COMPLAINT_STATUS[c.status][1]}>{COMPLAINT_STATUS[c.status][0]}</Badge>
              </button></li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Xếp hạng các chợ" subtitle={`Kỳ ${PERIODS[period]} · sắp xếp theo tỷ lệ thu`} pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead><tr className="text-left text-fg-2 border-y border-line">{['Chợ', 'Hạng', 'Lấp đầy', 'Số thu kỳ', 'Tỷ lệ thu', 'Công nợ tồn', 'Không tiền mặt', 'Phản ánh mở'].map((h, i) => <th key={h} className={cx('px-4 h-9 font-semibold whitespace-nowrap', i > 1 && 'text-right')}>{h}</th>)}</tr></thead>
            <tbody>
              {[...ms].sort((a, b) => b.collectRate - a.collectRate).slice(0, 12).map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0 hover:bg-hover cursor-pointer" onClick={() => go('markets', { focus: m.id })}>
                  <td className="px-4 py-2"><span className="font-semibold">{m.name}</span>{m.pilot && <Badge tone="brand" className="ml-2">Thí điểm</Badge>}<div className="text-cap text-fg-3">{m.khuVuc}</div></td>
                  <td className="px-4">{m.cls}</td>
                  <td className="px-4 text-right tnum">{fmtPct(m.fillRate, 0)}</td>
                  <td className="px-4 text-right tnum">{fmtMil(m.monthRevenue)}</td>
                  <td className="px-4 text-right tnum"><span className={m.collectRate < 0.6 ? 'text-bad font-semibold' : ''}>{fmtPct(m.collectRate, 0)}</span></td>
                  <td className="px-4 text-right tnum">{fmtMil(m.debt)}</td>
                  <td className="px-4 text-right tnum">{fmtPct(m.cashlessRate, 0)}</td>
                  <td className="px-4 text-right tnum">{m.openComplaints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <Stat label="Tiểu thương dùng app" icon={<Smartphone />} value={fmtPct(appRate)} sub={`${fmtNum(tr.filter((t) => t.appUser).length)} tài khoản đã kích hoạt`} onClick={() => go('mobile')} />
        <Stat label="Hồ sơ tiểu thương đã xác thực LGSP" value={fmtPct(tr.filter((t) => t.verify === 'verified').length / (tr.length || 1))} sub={`${tr.filter((t) => t.verify === 'pending').length} hồ sơ chờ xác thực`} onClick={() => go('traders', { focus: 'pending' })} />
        <Stat label="Thu kỳ này so với kỳ trước" value={(k.prev ? (k.got / k.prev - 1) * 100 : 0).toFixed(1).replace('.', ',') + '%'} sub="Kỳ hiện tại đang thu, chưa kết thúc" />
      </div>
    </>
  );
}
