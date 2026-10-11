import { useEffect, useMemo, useState } from 'react';
import { Plus, UserCheck, Send, Image as ImageIcon, MapPin, Star, LayoutGrid, List, Clock } from 'lucide-react';
import { complaints, Complaint, ComplaintStatus, marketById, users, fmtDate, markets } from '../data/db';
import { useApp } from '../lib/app';
import { useScoped, useScopeName } from '../lib/scope';
import { COMPLAINT_STATUS } from '../lib/status';
import { Badge, Button, Card, DataTable, Dialog, Drawer, Field, IconButton, Input, KV, MessageBar, PageHeader, SearchBox, Select, Stat, Textarea, Toolbar, useToast, cx, Avatar } from '../components/ui';

const COLS: ComplaintStatus[] = ['new', 'processing', 'waiting', 'overdue', 'resolved'];

export default function Complaints() {
  const { focus } = useApp();
  const toast = useToast();
  const scope = useScopeName();
  const all = useScoped(complaints);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [src, setSrc] = useState('');
  const [sel, setSel] = useState<Complaint | null>(null);
  const [assign, setAssign] = useState(false);
  const [creating, setCreating] = useState(false);
  const [, force] = useState(0);
  useEffect(() => { const c = complaints.find((x) => x.id === focus); if (c) setSel(c); }, [focus]);

  const rows = useMemo(() => all.filter((c) => (!q || c.title.toLowerCase().includes(q.toLowerCase()) || c.code.toLowerCase().includes(q.toLowerCase()) || c.sender.toLowerCase().includes(q.toLowerCase())) && (!cat || c.category === cat) && (!src || c.source === src)), [all, q, cat, src, sel]);
  const cats = [...new Set(complaints.map((c) => c.category))];
  const srcs = [...new Set(complaints.map((c) => c.source))];
  const resolved = all.filter((c) => c.status === 'resolved');
  const rated = resolved.filter((c) => c.rating);
  const onTime = resolved.length ? 0.91 : 0;

  return (
    <>
      <PageHeader uc="UC-19 ÷ UC-21 · Tiếp nhận, xử lý, phản hồi phản ánh" title={`Phản ánh, kiến nghị · ${scope}`} subtitle="Tiếp nhận từ app tiểu thương, Danang Smart City (1022), Zalo OA và trực tiếp; phân công, theo dõi hạn xử lý và lấy đánh giá hài lòng."
        actions={<Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>Tiếp nhận phản ánh</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Đang mở" value={all.length - resolved.length} sub={`${all.filter((c) => c.status === 'new').length} mới chưa phân công`} />
        <Stat label="Quá hạn" value={all.filter((c) => c.status === 'overdue').length} tone="bad" sub="Vượt thời hạn quy định" />
        <Stat label="Xử lý đúng hạn" value={`${Math.round(onTime * 100)}%`} tone="ok" sub={`${resolved.length} phản ánh đã xử lý`} />
        <Stat label="Mức hài lòng" value={`${(rated.reduce((a, c) => a + c.rating!, 0) / (rated.length || 1)).toFixed(1).replace('.', ',')}/5`} sub={`${rated.length} lượt đánh giá`} />
      </div>
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Mã, nội dung, người gửi" className="w-full sm:w-64" />
        <Select aria-label="Lĩnh vực" value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto"><option value="">Tất cả lĩnh vực</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select aria-label="Kênh tiếp nhận" value={src} onChange={(e) => setSrc(e.target.value)} className="w-auto"><option value="">Tất cả kênh</option>{srcs.map((c) => <option key={c}>{c}</option>)}</Select>
        <div className="flex-1" />
        <div className="flex border border-line rounded-control">
          <IconButton label="Dạng bảng Kanban" onClick={() => setView('board')} className={cx(view === 'board' && 'bg-subtle text-brand')}><LayoutGrid /></IconButton>
          <IconButton label="Dạng danh sách" onClick={() => setView('list')} className={cx(view === 'list' && 'bg-subtle text-brand')}><List /></IconButton>
        </div>
      </Toolbar>

      {view === 'board' ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLS.map((s) => { const items = rows.filter((c) => c.status === s); return (
            <section key={s} className="w-[280px] shrink-0 bg-subtle rounded-card p-2 flex flex-col max-h-[70vh]" aria-label={COMPLAINT_STATUS[s][0]}>
              <header className="flex items-center justify-between px-2 py-1.5"><Badge tone={COMPLAINT_STATUS[s][1]} dot>{COMPLAINT_STATUS[s][0]}</Badge><span className="text-cap text-fg-3 tnum">{items.length}</span></header>
              <div className="flex flex-col gap-2 overflow-y-auto p-0.5">
                {items.slice(0, 30).map((c) => (
                  <button key={c.id} onClick={() => setSel(c)} className="text-left bg-surface rounded-card shadow-card p-3 hover:bg-hover">
                    <p className="text-[11px] text-fg-3 flex justify-between"><span className="font-mono">{c.code}</span><span>{c.category}</span></p>
                    <p className="font-semibold mt-1 leading-snug">{c.title}</p>
                    <p className="text-cap text-fg-2 mt-1 truncate">{marketById[c.marketId].name} · {c.location}</p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-fg-3">
                      <span className={cx('inline-flex items-center gap-1', c.status === 'overdue' && 'text-bad font-semibold')}><Clock className="w-3 h-3" />Hạn {fmtDate(c.deadline)}</span>
                      {c.assignee ? <span className="inline-flex items-center gap-1"><Avatar name={c.assignee} size={18} />{c.assignee.split(' ').pop()}</span> : <span className="text-brand-fg">Chưa phân công</span>}
                    </div>
                  </button>
                ))}
                {items.length > 30 && <p className="text-cap text-fg-3 text-center py-1">+{items.length - 30} phản ánh khác</p>}
              </div>
            </section>
          ); })}
        </div>
      ) : (
        <Card pad={false}><div className="p-1"><DataTable rows={rows} onRowClick={setSel} pageSize={14} caption="Danh sách phản ánh" columns={[
          { key: 'c', header: 'Mã', render: (c) => <span className="font-mono text-cap">{c.code}</span>, sort: (c) => c.code },
          { key: 't', header: 'Nội dung', render: (c) => <div><p className="font-semibold">{c.title}</p><p className="text-cap text-fg-3">{c.category} · {c.source}</p></div> },
          { key: 'm', header: 'Chợ', render: (c) => marketById[c.marketId].name, sort: (c) => c.marketId, hideSm: true },
          { key: 'cr', header: 'Tiếp nhận', render: (c) => <span className="tnum text-fg-2">{fmtDate(c.created)}</span>, sort: (c) => c.created, hideSm: true },
          { key: 'd', header: 'Hạn xử lý', render: (c) => <span className={cx('tnum', c.status === 'overdue' && 'text-bad font-semibold')}>{fmtDate(c.deadline)}</span>, sort: (c) => c.deadline },
          { key: 'a', header: 'Người xử lý', render: (c) => c.assignee ?? <span className="text-fg-3">—</span>, hideSm: true },
          { key: 's', header: 'Trạng thái', render: (c) => <Badge tone={COMPLAINT_STATUS[c.status][1]} dot>{COMPLAINT_STATUS[c.status][0]}</Badge>, sort: (c) => c.status },
        ]} /></div></Card>
      )}

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.title} subtitle={sel && <span className="flex flex-wrap items-center gap-2"><span className="font-mono">{sel.code}</span><Badge tone={COMPLAINT_STATUS[sel.status][1]}>{COMPLAINT_STATUS[sel.status][0]}</Badge></span>}
        footer={sel && sel.status !== 'resolved' && <>{!sel.assignee || sel.status === 'overdue' ? <Button icon={<UserCheck />} onClick={() => setAssign(true)}>{sel.assignee ? 'Phân công lại' : 'Phân công'}</Button> : null}<Button variant="primary" icon={<Send />} onClick={() => { sel.status = 'resolved'; force((x) => x + 1); toast({ intent: 'success', title: 'Đã gửi phản hồi kết quả xử lý', body: `Người gửi sẽ được mời đánh giá mức độ hài lòng.` }); setSel(null); }}>Phản hồi & đóng</Button></>}>
        {sel && (
          <div className="flex flex-col gap-5">
            {sel.status === 'overdue' && <MessageBar intent="error" title="Đã quá hạn xử lý.">Hạn {fmtDate(sel.deadline)}. Đề nghị phân công lại hoặc báo cáo lãnh đạo BQL.</MessageBar>}
            <p className="text-body">{sel.detail}</p>
            {sel.hasPhoto && <div className="grid grid-cols-3 gap-2">{[0, 1, 2].slice(0, 2).map((i) => <div key={i} className="aspect-[4/3] max-w-full rounded-card bg-subtle border border-line flex items-center justify-center text-fg-3"><ImageIcon className="w-6 h-6" aria-label="Ảnh đính kèm" /></div>)}</div>}
            <KV items={[['Người gửi', `${sel.sender} (${sel.senderType})`], ['Kênh tiếp nhận', sel.source], ['Chợ', marketById[sel.marketId].name], ['Vị trí', <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{sel.location}</span>], ['Lĩnh vực', sel.category], ['Hạn xử lý', fmtDate(sel.deadline)], ['Người xử lý', sel.assignee ?? 'Chưa phân công'], ['Đánh giá', sel.rating ? <span className="inline-flex gap-0.5" aria-label={`${sel.rating} sao`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={cx('w-4 h-4', i < sel.rating! ? 'fill-warn text-warn' : 'text-fg-3')} />)}</span> : '—']]} />
            <section><h3 className="font-semibold mb-2">Tiến trình xử lý</h3>
              <ol className="relative border-l-2 border-line ml-2 flex flex-col gap-3">
                {[[sel.created, 'Tiếp nhận phản ánh', sel.source, true], [sel.created, 'Phân công xử lý', sel.assignee ?? '—', !!sel.assignee], ['', 'Xử lý tại hiện trường', 'Cập nhật hình ảnh sau xử lý', ['waiting', 'resolved'].includes(sel.status)], ['', 'Phản hồi người gửi', 'Qua app / Zalo OA', sel.status === 'resolved'], ['', 'Người gửi đánh giá', sel.rating ? `${sel.rating}/5 sao` : 'Chưa đánh giá', !!sel.rating]].map(([d, t, s, done], i) => (
                  <li key={i} className="pl-5 relative"><span className={cx('absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-surface', done ? 'bg-brand' : 'bg-line-strong')} /><p className={cx('font-semibold', !done && 'text-fg-3')}>{t as string}</p><p className="text-cap text-fg-3">{d ? fmtDate(d as string) + ' · ' : ''}{s as string}</p></li>
                ))}
              </ol>
            </section>
            {sel.status !== 'resolved' && <Field label="Nội dung phản hồi" hint="Sẽ gửi tới người phản ánh qua kênh đã gửi">{(id, d) => <Textarea id={id} aria-describedby={d} defaultValue={`BQL ${marketById[sel.marketId].name} đã tiếp nhận và xử lý: `} />}</Field>}
          </div>
        )}
      </Drawer>

      <Dialog open={assign} onClose={() => setAssign(false)} title="Phân công xử lý" description={sel?.code} footer={<><Button onClick={() => setAssign(false)}>Hủy</Button><Button variant="primary" onClick={() => { if (sel) { sel.assignee = users[5].name; sel.status = 'processing'; } setAssign(false); force((x) => x + 1); toast({ intent: 'success', title: 'Đã phân công xử lý', body: 'Cán bộ nhận thông báo trên app.' }); }}>Phân công</Button></>}>
        <div className="grid gap-4">
          <Field label="Cán bộ xử lý" required>{(id) => <Select id={id}>{users.filter((u) => u.role.includes('Cán bộ')).slice(0, 12).map((u) => <option key={u.id}>{u.name} – {u.unit}</option>)}</Select>}</Field>
          <Field label="Hạn xử lý">{(id) => <Input id={id} type="date" defaultValue="2026-10-14" />}</Field>
          <Field label="Chỉ đạo">{(id) => <Textarea id={id} placeholder="Ghi chú cho cán bộ xử lý" />}</Field>
        </div>
      </Dialog>
      <Dialog open={creating} onClose={() => setCreating(false)} title="Tiếp nhận phản ánh" description="UC-19 · Ghi nhận phản ánh trực tiếp hoặc qua điện thoại." width="max-w-xl" footer={<><Button onClick={() => setCreating(false)}>Hủy</Button><Button variant="primary" onClick={() => { setCreating(false); toast({ intent: 'success', title: 'Đã tiếp nhận phản ánh PA-2026-04306', body: 'Hạn xử lý 16/10/2026' }); }}>Lưu phản ánh</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Field label="Tiêu đề" required>{(id) => <Input id={id} />}</Field></div>
          <Field label="Lĩnh vực">{(id) => <Select id={id}>{cats.map((c) => <option key={c}>{c}</option>)}</Select>}</Field>
          <Field label="Chợ">{(id) => <Select id={id}>{markets.map((m) => <option key={m.id}>{m.name}</option>)}</Select>}</Field>
          <Field label="Người phản ánh">{(id) => <Input id={id} />}</Field>
          <Field label="Kênh">{(id) => <Select id={id}><option>Trực tiếp tại BQL</option><option>Đường dây nóng</option></Select>}</Field>
          <div className="sm:col-span-2"><Field label="Nội dung chi tiết">{(id) => <Textarea id={id} />}</Field></div>
          <div className="sm:col-span-2"><Field label="Ảnh đính kèm" hint="Tối đa 5 ảnh, mỗi ảnh ≤ 5 MB">{(id, d) => <input id={id} aria-describedby={d} type="file" accept="image/*" multiple className="text-body file:mr-3 file:h-8 file:px-3 file:rounded-control file:border file:border-line-strong file:bg-surface file:text-fg" />}</Field></div>
        </div>
      </Dialog>
    </>
  );
}
