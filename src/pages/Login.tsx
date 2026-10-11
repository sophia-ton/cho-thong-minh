import { useState } from 'react';
import { ShieldCheck, Smartphone, Loader2 } from 'lucide-react';
import { Button, Field, Input, MessageBar } from '../components/ui';
import { markets, traders, fmtNum } from '../data/db';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [busy, setBusy] = useState(false);
  const go = () => { setBusy(true); setTimeout(onLogin, 900); };
  return (
    <div className="min-h-full grid lg:grid-cols-2 bg-canvas">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-brand text-fg-inv">
        <p className="font-semibold">Sở Khoa học và Công nghệ TP. Đà Nẵng</p>
        <div>
          <h1 className="text-hero font-semibold max-w-md">Phần mềm quản lý chợ thông minh</h1>
          <p className="mt-3 opacity-90 max-w-md">Số hóa sạp/kiốt, hợp đồng, thu phí không tiền mặt, phản ánh và điều hành dựa trên dữ liệu tại {markets.length} chợ trên địa bàn thành phố.</p>
          <div className="flex gap-8 mt-8"><div><p className="text-title1 font-semibold tnum">{markets.length}</p><p className="opacity-80 text-cap">chợ</p></div><div><p className="text-title1 font-semibold tnum">{fmtNum(traders.length)}</p><p className="opacity-80 text-cap">tiểu thương</p></div><div><p className="text-title1 font-semibold">40</p><p className="opacity-80 text-cap">chức năng</p></div></div>
        </div>
        <p className="text-cap opacity-80">An toàn thông tin cấp độ 2 · Dữ liệu trong bản thử nghiệm là dữ liệu mô phỏng</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm flex flex-col gap-5">
          <div><h2 className="text-title2 font-semibold">Đăng nhập</h2><p className="text-fg-2">Cán bộ sử dụng tài khoản SSO của thành phố.</p></div>
          <Button variant="primary" className="h-10" icon={busy ? <Loader2 className="animate-spin" /> : <ShieldCheck />} onClick={go} disabled={busy}>{busy ? 'Đang chuyển hướng SSO…' : 'Đăng nhập bằng SSO Đà Nẵng'}</Button>
          <div className="flex items-center gap-3 text-cap text-fg-3"><span className="flex-1 h-px bg-line" />hoặc tiểu thương<span className="flex-1 h-px bg-line" /></div>
          <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); go(); }}>
            <Field label="Số điện thoại">{(id) => <Input id={id} inputMode="tel" defaultValue="0905 123 456" />}</Field>
            <Button type="submit" icon={<Smartphone />}>Nhận mã OTP</Button>
          </form>
          <MessageBar intent="info">Bằng việc đăng nhập, bạn đồng ý với chính sách xử lý dữ liệu cá nhân theo Luật Bảo vệ dữ liệu cá nhân.</MessageBar>
        </div>
      </div>
    </div>
  );
}
