import { useState } from 'react';
import { Plus, Bell, MessageCircle, MessageSquare, Smartphone, CalendarClock, Eye } from 'lucide-react';
import { notices, Notice, markets, marketById, fmtDate, fmtNum, traders } from '../data/db';
import { Badge, Button, Card, Checkbox, Dialog, Field, Input, PageHeader, Progress, Select, Tabs, Textarea, useToast, cx } from '../components/ui';

const CH_ICON: Record<string, JSX.Element> = { Push: <Bell className="w-3.5 h-3.5" />, 'Zalo OA': <MessageCircle className="w-3.5 h-3.5" />, SMS: <MessageSquare className="w-3.5 h-3.5" /> };

export default function Notices() {
  const toast = useToast();
  const [tab, setTab] = useState<'all' | 'Thông báo' | 'Tin tức' | 'Chính sách' | 'Nhắc nợ'>('all');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Lịch phun khử khuẩn toàn chợ ngày 19/10/2026');
  const [body, setBody] = useState('Từ 18h00 ngày 19/10/2026, BQL tổ chức phun khử khuẩn toàn chợ. Đề nghị tiểu thương che đậy hàng hóa, đóng sạp trước 17h45.');
  const [ch, setCh] = useState({ Push: true, 'Zalo OA': true, SMS: false });
  const [aud, setAud] = useState('all');
  const list = notices.filter((n) => tab === 'all' || n.kind === tab);
  const reach = aud === 'all' ? traders.length : aud === 'debt' ? 512 : traders.filter((t) => t.marketId === aud).length;
  const smsCost = ch.SMS ? reach * 750 : 0;

  return (
    <>
      <PageHeader uc="UC-22 · UC-23 · Đăng thông báo, gửi đa kênh" title="Thông báo & truyền thông" subtitle="Đăng thông báo, tin tức, chính sách tới tiểu thương; gửi theo nhóm đối tượng qua thông báo đẩy trên app, Zalo OA và SMS." actions={<Button variant="primary" icon={<Plus />} onClick={() => setOpen(true)}>Soạn thông báo</Button>} />
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'Tất cả', count: notices.length }, ...(['Thông báo', 'Tin tức', 'Chính sách', 'Nhắc nợ'] as const).map((k) => ({ id: k, label: k, count: notices.filter((n) => n.kind === k).length }))]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {list.map((n) => <NoticeCard key={n.id} n={n} />)}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Soạn thông báo" width="max-w-4xl"
        footer={<><Button onClick={() => setOpen(false)}>Lưu nháp</Button><Button icon={<CalendarClock />} onClick={() => { setOpen(false); toast({ intent: 'success', title: 'Đã lên lịch gửi lúc 07:00 ngày 12/10/2026' }); }}>Lên lịch</Button><Button variant="primary" disabled={!Object.values(ch).some(Boolean) || !title.trim()} onClick={() => { setOpen(false); toast({ intent: 'success', title: `Đang gửi tới ${fmtNum(reach)} tiểu thương`, body: Object.entries(ch).filter(([, v]) => v).map(([k]) => k).join(', ') }); }}>Gửi ngay</Button></>}>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
          <div className="grid gap-4 content-start">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Loại">{(id) => <Select id={id}><option>Thông báo</option><option>Tin tức</option><option>Chính sách</option></Select>}</Field>
              <Field label="Đối tượng nhận">{(id) => <Select id={id} value={aud} onChange={(e) => setAud(e.target.value)}><option value="all">Toàn bộ tiểu thương</option><option value="debt">Tiểu thương còn nợ ≥ 1 kỳ</option>{markets.map((m) => <option key={m.id} value={m.id}>Tiểu thương {m.name}</option>)}</Select>}</Field>
            </div>
            <Field label="Tiêu đề" required error={!title.trim() ? 'Nhập tiêu đề thông báo.' : undefined}>{(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!title.trim()} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />}</Field>
            <Field label="Nội dung" hint={`${body.length}/1000 ký tự · SMS sẽ được rút gọn còn 160 ký tự`}>{(id, d) => <Textarea id={id} aria-describedby={d} value={body} onChange={(e) => setBody(e.target.value)} rows={5} />}</Field>
            <fieldset><legend className="text-body font-semibold mb-2">Kênh gửi</legend><div className="flex flex-wrap gap-4">{(Object.keys(ch) as (keyof typeof ch)[]).map((k) => <Checkbox key={k} label={k === 'Push' ? 'Thông báo đẩy (app)' : k} checked={ch[k]} onChange={(v) => setCh({ ...ch, [k]: v })} />)}</div></fieldset>
            <p className="text-cap text-fg-2">Dự kiến tiếp cận <b className="tnum">{fmtNum(reach)}</b> tiểu thương{ch.SMS && <> · chi phí SMS ước tính <b className="tnum">{fmtNum(smsCost)} đ</b></>}.</p>
          </div>
          <div className="hidden md:block">
            <p className="text-cap text-fg-3 mb-2 flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Xem trước trên app</p>
            <div className="rounded-[28px] border-[6px] border-fg/80 bg-canvas p-3 h-[420px] overflow-hidden">
              <p className="text-[11px] text-center text-fg-3 mb-3">09:41</p>
              <div className="bg-surface rounded-card shadow-flyout p-3">
                <p className="text-[11px] text-fg-3 flex items-center gap-1"><Smartphone className="w-3 h-3" />CHỢ THÔNG MINH · bây giờ</p>
                <p className="font-semibold text-body mt-1">{title || 'Tiêu đề thông báo'}</p>
                <p className="text-cap text-fg-2 mt-0.5 line-clamp-4">{body}</p>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function NoticeCard({ n }: { n: Notice }) {
  const rate = n.reach ? n.read / n.reach : 0;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2 mb-1"><Badge tone={n.kind === 'Nhắc nợ' ? 'warn' : n.kind === 'Chính sách' ? 'info' : 'brand'}>{n.kind}</Badge><Badge tone={n.status === 'Đã gửi' ? 'ok' : n.status === 'Nháp' ? 'idle' : 'info'} dot>{n.status}</Badge></div><p className="font-semibold text-sub">{n.title}</p></div>
      </div>
      <p className="text-body text-fg-2 mt-2 line-clamp-2">{n.body}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-cap text-fg-3">
        <span>{n.audience}</span><span>{n.marketId === 'all' ? 'Toàn thành phố' : marketById[n.marketId].name}</span>
        <span className="inline-flex gap-1.5">{n.channels.map((c) => <span key={c} className="inline-flex items-center gap-1 text-fg-2">{CH_ICON[c]}{c}</span>)}</span>
        {n.sentAt && <span className="tnum">{n.status === 'Đã lên lịch' ? 'Gửi lúc ' : ''}{fmtDate(n.sentAt)}</span>}
      </div>
      {n.status === 'Đã gửi' && <div className="mt-3"><div className="flex justify-between text-cap mb-1"><span className="text-fg-2">Đã xem {fmtNum(n.read)}/{fmtNum(n.reach)}</span><span className="tnum font-semibold">{Math.round(rate * 100)}%</span></div><Progress value={rate} tone={rate > 0.7 ? 'ok' : 'brand'} label="Tỷ lệ đã xem" /></div>}
    </Card>
  );
}
