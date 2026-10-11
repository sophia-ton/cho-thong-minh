import { useMemo, useState } from 'react';
import { Home, FileText, Bell, MessageSquarePlus, User, QrCode, ChevronRight, Zap, Droplets, Trash2, Bike, Camera, CheckCircle2, Type, ShieldCheck, ArrowLeft, Receipt } from 'lucide-react';
import { traders, bills, contracts, notices, stallById, marketById, fmtVND, fmtDate, fmtNum, CURRENT_PERIOD } from '../data/db';
import { CONTRACT_STATUS } from '../lib/status';
import { Badge, Button, Card, Field, PageHeader, Select, Stat, Switch, cx } from '../components/ui';
import { FakeQR } from '../components/qr';

type Screen = 'home' | 'contract' | 'pay' | 'notice' | 'report' | 'service' | 'account' | 'paid';

export default function MobileApp() {
  const samples = useMemo(() => traders.filter((t) => t.appUser && t.verify === 'verified' && bills.some((b) => b.traderId === t.id && b.paid < b.total)).slice(0, 12), []);
  const [tid, setTid] = useState(samples[0].id);
  const [big, setBig] = useState(false);
  const appUsers = traders.filter((t) => t.appUser).length;
  return (
    <>
      <PageHeader uc="UC-34 ÷ UC-37 · Ứng dụng di động cho tiểu thương" title="App Chợ Thông Minh (Android/iOS)" subtitle="Mô phỏng tương tác trên điện thoại: xem hợp đồng, công nợ, thanh toán VietQR, gửi phản ánh, nhận thông báo và đăng ký dịch vụ. Cỡ chữ lớn, thao tác đơn giản cho tiểu thương lớn tuổi." />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] gap-6 items-start">
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Stat label="Tài khoản kích hoạt" value={fmtNum(appUsers)} sub={`${Math.round((appUsers / traders.length) * 100)}% tiểu thương`} />
            <Stat label="Hoạt động 30 ngày" value={fmtNum(Math.round(appUsers * 0.74))} sub="MAU" />
            <Stat label="Thanh toán qua app" value="61%" tone="ok" sub="Tại các chợ thí điểm" />
            <Stat label="Đánh giá kho ứng dụng" value="4,6★" sub="Google Play · App Store" />
          </div>
          <Card title="Cấu hình mô phỏng">
            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <Field label="Đăng nhập với tài khoản tiểu thương">{(id) => <Select id={id} value={tid} onChange={(e) => setTid(e.target.value)}>{samples.map((t) => <option key={t.id} value={t.id}>{t.name} · {stallById[t.stallIds[0]].code}</option>)}</Select>}</Field>
              <Switch label="Chế độ chữ lớn (người lớn tuổi)" checked={big} onChange={setBig} />
            </div>
          </Card>
          <Card title="Chức năng theo use case">
            <ul className="grid sm:grid-cols-2 gap-3">{[['UC-34', 'Đăng nhập SĐT + OTP, đổi mật khẩu, cập nhật tài khoản, đồng ý xử lý dữ liệu cá nhân'], ['UC-35', 'Xem hợp đồng, công nợ, lịch sử thanh toán; thanh toán nhanh bằng VietQR'], ['UC-36', 'Gửi phản ánh kèm ảnh, vị trí; nhận thông báo đẩy'], ['UC-37', 'Đăng ký điện, nước, vệ sinh, giữ xe; theo dõi trạng thái duyệt']].map(([u, d]) => <li key={u} className="border border-line rounded-card p-3"><Badge tone="brand">{u}</Badge><p className="text-body mt-1.5">{d}</p></li>)}</ul>
          </Card>
        </div>
        <div className="order-1 lg:order-2 flex justify-center"><Phone key={tid} traderId={tid} big={big} /></div>
      </div>
    </>
  );
}

function Phone({ traderId, big }: { traderId: string; big: boolean }) {
  const t = traders.find((x) => x.id === traderId)!;
  const [screen, setScreen] = useState<Screen>('home');
  const [sent, setSent] = useState(false);
  const [svc, setSvc] = useState<string | null>(null);
  const mine = bills.filter((b) => b.traderId === t.id);
  const unpaid = mine.filter((b) => b.paid < b.total);
  const debt = unpaid.reduce((a, b) => a + b.total - b.paid, 0);
  const c = contracts.find((x) => x.traderId === t.id)!;
  const s = stallById[t.stallIds[0]];
  const tx = big ? 'text-[17px] leading-6' : 'text-[14px] leading-5';
  const h = big ? 'text-[22px]' : 'text-[18px]';
  const Back = ({ title }: { title: string }) => <div className="flex items-center gap-2 mb-3"><button aria-label="Quay lại" onClick={() => setScreen('home')} className="w-9 h-9 rounded-full hover:bg-hover inline-flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button><p className={cx('font-semibold', h)}>{title}</p></div>;

  return (
    <div className="w-[360px] max-w-full rounded-[44px] border-[10px] border-[#1d1f22] bg-[#1d1f22] shadow-dialog">
      <div className="rounded-[34px] overflow-hidden bg-canvas h-[720px] flex flex-col relative">
        <div className="h-8 flex items-center justify-between px-6 text-[12px] font-semibold"><span>09:41</span><span className="w-24 h-5 rounded-full bg-[#1d1f22] absolute left-1/2 -translate-x-1/2 top-1.5" /><span>5G ▮▮▮</span></div>
        <div className={cx('flex-1 overflow-y-auto px-4 pb-4', tx)}>
          {screen === 'home' && (
            <>
              <div className="flex items-center justify-between py-2"><div><p className="text-fg-3 text-[12px]">Xin chào,</p><p className={cx('font-semibold', h)}>{t.name.split(' ').slice(-2).join(' ')}</p></div><button onClick={() => setScreen('notice')} aria-label="Thông báo" className="relative w-10 h-10 rounded-full bg-surface shadow-card inline-flex items-center justify-center"><Bell className="w-5 h-5" /><span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-bad" /></button></div>
              <div className="rounded-panel p-4 bg-brand text-fg-inv mt-1">
                <p className="opacity-85 text-[12px]">Sạp {s.code} · {marketById[t.marketId].name}</p>
                <p className="opacity-85 mt-2">Số tiền cần thanh toán</p>
                <p className="text-[28px] font-bold tnum leading-tight">{fmtVND(debt)}</p>
                <p className="opacity-85 text-[12px]">{unpaid.length} kỳ · hạn nộp kỳ {CURRENT_PERIOD}: 20/10/2026</p>
                <button onClick={() => setScreen('pay')} disabled={!debt} className="mt-3 w-full h-11 rounded-card bg-surface text-brand-fg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"><QrCode className="w-5 h-5" />Thanh toán ngay</button>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">{[[FileText, 'Hợp đồng', 'contract'], [MessageSquarePlus, 'Phản ánh', 'report'], [Zap, 'Dịch vụ', 'service'], [Receipt, 'Biên lai', 'contract']].map(([I, l, sc]: any) => <button key={l} onClick={() => setScreen(sc)} className="flex flex-col items-center gap-1.5 py-2 rounded-card hover:bg-hover"><span className="w-12 h-12 rounded-card bg-surface shadow-card inline-flex items-center justify-center text-brand"><I className="w-6 h-6" /></span><span className="text-[12px]">{l}</span></button>)}</div>
              <p className="font-semibold mt-4 mb-2">Thông báo mới</p>
              {notices.filter((n) => n.status === 'Đã gửi').slice(0, 3).map((n) => <button key={n.id} onClick={() => setScreen('notice')} className="w-full text-left bg-surface rounded-card shadow-card p-3 mb-2"><p className="font-semibold line-clamp-1">{n.title}</p><p className="text-fg-3 text-[12px]">{fmtDate(n.sentAt)}</p></button>)}
            </>
          )}
          {screen === 'pay' && (
            <>
              <Back title="Thanh toán" />
              <div className="bg-surface rounded-panel shadow-card p-4 flex flex-col items-center gap-2">
                <FakeQR seed={t.id + debt} size={200} />
                <p className="text-[26px] font-bold tnum">{fmtVND(debt)}</p>
                <p className="text-fg-3 text-[12px] text-center">Mở ứng dụng ngân hàng, quét mã để thanh toán. Biên lai điện tử được gửi tự động.</p>
              </div>
              <ul className="mt-3 bg-surface rounded-card shadow-card divide-y divide-line">{unpaid.map((b) => <li key={b.id} className="flex justify-between px-3 py-2.5"><span>Kỳ {b.period}</span><b className="tnum">{fmtVND(b.total - b.paid)}</b></li>)}</ul>
              <Button variant="primary" className="w-full h-11 mt-3" onClick={() => setScreen('paid')}>Tôi đã chuyển khoản</Button>
            </>
          )}
          {screen === 'paid' && (
            <div className="flex flex-col items-center text-center pt-16 gap-3">
              <CheckCircle2 className="w-16 h-16 text-ok" />
              <p className={cx('font-semibold', h)}>Thanh toán thành công</p>
              <p className="text-fg-2">BQL đã nhận {fmtVND(debt)}. Biên lai điện tử số BL26{t.code.slice(-6)} đã được gửi.</p>
              <Button className="mt-4" onClick={() => setScreen('home')}>Về trang chủ</Button>
            </div>
          )}
          {screen === 'contract' && (
            <>
              <Back title="Hợp đồng & lịch sử" />
              <div className="bg-surface rounded-panel shadow-card p-4">
                <div className="flex justify-between gap-2"><p className="font-semibold">{c.code}</p><Badge tone={CONTRACT_STATUS[c.status][1]}>{CONTRACT_STATUS[c.status][0]}</Badge></div>
                <dl className="grid grid-cols-2 gap-2 mt-3 text-[12px]"><div><dt className="text-fg-3">Sạp</dt><dd className={tx}>{s.code} · {s.area} m²</dd></div><div><dt className="text-fg-3">Đơn giá</dt><dd className={cx(tx, 'tnum')}>{fmtVND(c.monthlyFee)}</dd></div><div><dt className="text-fg-3">Từ ngày</dt><dd className={tx}>{fmtDate(c.start)}</dd></div><div><dt className="text-fg-3">Đến ngày</dt><dd className={tx}>{fmtDate(c.end)}</dd></div></dl>
                <p className="mt-3 inline-flex items-center gap-1.5 text-ok text-[12px]"><ShieldCheck className="w-4 h-4" />Đã ký số bởi hai bên</p>
              </div>
              <p className="font-semibold mt-4 mb-2">Lịch sử thanh toán</p>
              <ul className="bg-surface rounded-card shadow-card divide-y divide-line">{[...mine].reverse().slice(0, 8).map((b) => <li key={b.id} className="flex justify-between items-center px-3 py-2.5"><span>Kỳ {b.period}<span className="block text-[12px] text-fg-3">{b.method ?? 'Chưa thanh toán'}</span></span><span className={cx('tnum font-semibold', b.paid < b.total && 'text-bad')}>{fmtVND(b.paid < b.total ? b.total - b.paid : b.paid)}</span></li>)}</ul>
            </>
          )}
          {screen === 'notice' && (
            <>
              <Back title="Thông báo" />
              {notices.filter((n) => n.status === 'Đã gửi').map((n) => <div key={n.id} className="bg-surface rounded-card shadow-card p-3 mb-2"><Badge tone={n.kind === 'Nhắc nợ' ? 'warn' : 'brand'}>{n.kind}</Badge><p className="font-semibold mt-1">{n.title}</p><p className="text-fg-2 mt-1">{n.body}</p><p className="text-fg-3 text-[12px] mt-1">{fmtDate(n.sentAt)}</p></div>)}
            </>
          )}
          {screen === 'report' && (
            <>
              <Back title="Gửi phản ánh" />
              {sent ? <div className="flex flex-col items-center text-center pt-10 gap-3"><CheckCircle2 className="w-14 h-14 text-ok" /><p className="font-semibold">Đã gửi phản ánh PA-2026-04307</p><p className="text-fg-2">BQL sẽ phản hồi trước 16/10/2026. Bạn có thể theo dõi tiến độ trong mục Thông báo.</p><Button onClick={() => { setSent(false); setScreen('home'); }}>Về trang chủ</Button></div> : (
                <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                  <label className="flex flex-col gap-1"><span className="font-semibold">Vấn đề</span><select className="h-11 rounded-card border border-line-strong bg-surface px-3"><option>Vệ sinh môi trường</option><option>Điện, nước</option><option>An ninh trật tự</option><option>Cơ sở hạ tầng</option></select></label>
                  <label className="flex flex-col gap-1"><span className="font-semibold">Nội dung</span><textarea rows={4} defaultValue="Cống thoát nước trước sạp bị nghẹt, nước tràn ra lối đi." className="rounded-card border border-line-strong bg-surface p-3" /></label>
                  <button type="button" className="h-20 rounded-card border-2 border-dashed border-line-strong text-fg-2 inline-flex items-center justify-center gap-2"><Camera className="w-5 h-5" />Chụp hoặc chọn ảnh</button>
                  <p className="text-[12px] text-fg-3">Vị trí: sạp {s.code}, {s.zone}</p>
                  <Button variant="primary" type="submit" className="h-11">Gửi phản ánh</Button>
                </form>
              )}
            </>
          )}
          {screen === 'service' && (
            <>
              <Back title="Đăng ký dịch vụ" />
              {[[Zap, 'Điện', 'Nâng công suất, lắp công tơ riêng'], [Droplets, 'Nước', 'Lắp đồng hồ nước riêng'], [Trash2, 'Vệ sinh', 'Thu gom rác tăng cường'], [Bike, 'Giữ xe', 'Vé tháng xe máy · 50.000 đ']].map(([I, l, d]: any) => (
                <button key={l} onClick={() => setSvc(l)} className={cx('w-full text-left bg-surface rounded-card shadow-card p-3 mb-2 flex items-center gap-3', svc === l && 'ring-2 ring-brand')}><span className="w-11 h-11 rounded-card bg-brand-soft text-brand inline-flex items-center justify-center"><I className="w-5 h-5" /></span><span className="flex-1"><span className="block font-semibold">{l}</span><span className="block text-[12px] text-fg-3">{d}</span></span><ChevronRight className="w-4 h-4 text-fg-3" /></button>
              ))}
              {svc && <div className="mt-2 rounded-card bg-ok-soft text-ok p-3 text-[13px] font-semibold flex gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" />Đã gửi đăng ký dịch vụ {svc.toLowerCase()}. Trạng thái: Chờ BQL duyệt.</div>}
            </>
          )}
          {screen === 'account' && (
            <>
              <Back title="Tài khoản" />
              <div className="bg-surface rounded-panel shadow-card p-4 text-center"><span className="w-16 h-16 rounded-full bg-brand-soft text-brand-fg inline-flex items-center justify-center text-[22px] font-bold">{t.name.split(' ').pop()![0]}</span><p className="font-semibold mt-2">{t.name}</p><p className="text-fg-3 text-[12px]">{t.code} · {t.phone}</p><Badge tone="ok" className="mt-2">Đã xác thực định danh</Badge></div>
              <ul className="mt-3 bg-surface rounded-card shadow-card divide-y divide-line">{['Đổi mật khẩu', 'Cỡ chữ hiển thị', 'Quyền riêng tư & dữ liệu cá nhân', 'Hướng dẫn sử dụng', 'Đăng xuất'].map((l) => <li key={l} className="flex justify-between items-center px-3 py-3"><span className={l === 'Đăng xuất' ? 'text-bad' : ''}>{l}</span>{l === 'Cỡ chữ hiển thị' ? <Type className="w-4 h-4 text-fg-3" /> : <ChevronRight className="w-4 h-4 text-fg-3" />}</li>)}</ul>
            </>
          )}
        </div>
        <nav aria-label="Thanh điều hướng app" className="h-16 bg-surface border-t border-line grid grid-cols-5 shrink-0">
          {[[Home, 'Trang chủ', 'home'], [FileText, 'Hợp đồng', 'contract'], [QrCode, 'Thanh toán', 'pay'], [MessageSquarePlus, 'Phản ánh', 'report'], [User, 'Tài khoản', 'account']].map(([I, l, sc]: any) => <button key={l} onClick={() => setScreen(sc)} aria-current={screen === sc ? 'page' : undefined} className={cx('flex flex-col items-center justify-center gap-0.5 text-[11px]', screen === sc ? 'text-brand font-semibold' : 'text-fg-3')}><I className="w-5 h-5" />{l}</button>)}
        </nav>
      </div>
    </div>
  );
}
