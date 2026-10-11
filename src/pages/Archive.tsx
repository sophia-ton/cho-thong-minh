import { useMemo, useState } from 'react';
import { Upload, FileText, Download, Lock, AlertTriangle, FolderOpen, Eye } from 'lucide-react';
import { docs, Doc, marketById, fmtDate, fmtNum, TODAY } from '../data/db';
import { useScoped, useScopeName } from '../lib/scope';
import { Badge, Button, Card, DataTable, Dialog, Drawer, Field, Input, KV, MessageBar, PageHeader, SearchBox, Select, Stat, Toolbar, useToast, cx } from '../components/ui';

export default function ArchivePage() {
  const toast = useToast();
  const scope = useScopeName();
  const all = useScoped(docs);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [sel, setSel] = useState<Doc | null>(null);
  const [up, setUp] = useState(false);
  const kinds = [...new Set(docs.map((d) => d.kind))];
  const soon = (d: Doc) => d.expire !== '—' && new Date(d.expire) < new Date(TODAY.getFullYear() + 1, TODAY.getMonth(), TODAY.getDate());
  const rows = useMemo(() => all.filter((d) => (!q || d.title.toLowerCase().includes(q.toLowerCase()) || d.code.toLowerCase().includes(q.toLowerCase())) && (!kind || d.kind === kind)), [all, q, kind]);
  return (
    <>
      <PageHeader uc="UC-28 ÷ UC-30 · Số hóa, tra cứu, thời hạn lưu trữ hồ sơ" title={`Hồ sơ lưu trữ · ${scope}`} subtitle="Số hóa, phân loại hồ sơ tiểu thương, hợp đồng, biên bản; tra cứu theo phân quyền; cảnh báo hồ sơ đến hạn lưu trữ." actions={<Button variant="primary" icon={<Upload />} onClick={() => setUp(true)}>Số hóa hồ sơ</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Hồ sơ số" value={fmtNum(all.length)} sub={`${fmtNum(all.reduce((a, d) => a + d.pages, 0))} trang đã số hóa`} />
        <Stat label="Hồ sơ có dữ liệu cá nhân" value={all.filter((d) => d.confidential).length} sub="Chỉ cán bộ được phân quyền xem" />
        <Stat label="Đến hạn lưu trữ trong 12 tháng" value={all.filter(soon).length} tone="warn" sub="Cần lập danh mục hủy/chuyển" />
        <Stat label="Dung lượng sử dụng" value={`${all.reduce((a, d) => a + parseFloat(d.size), 0).toFixed(0)} MB`} sub="Lưu trữ đối tượng tương thích S3" />
      </div>
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Tên hồ sơ, mã hồ sơ, số hợp đồng" className="w-full sm:w-80" />
        <Select aria-label="Loại hồ sơ" value={kind} onChange={(e) => setKind(e.target.value)} className="w-auto"><option value="">Tất cả loại hồ sơ</option>{kinds.map((k) => <option key={k}>{k}</option>)}</Select>
      </Toolbar>
      <Card pad={false}><div className="p-1"><DataTable rows={rows} onRowClick={setSel} pageSize={14} caption="Hồ sơ lưu trữ" columns={[
        { key: 'c', header: 'Mã hồ sơ', render: (d) => <span className="font-mono text-cap">{d.code}</span>, sort: (d) => d.code },
        { key: 't', header: 'Tên hồ sơ', render: (d) => <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4 text-bad shrink-0" /><span className="font-semibold">{d.title}</span>{d.confidential && <Lock className="w-3.5 h-3.5 text-fg-3" aria-label="Có dữ liệu cá nhân" />}</span> },
        { key: 'k', header: 'Loại', render: (d) => <Badge tone="idle">{d.kind}</Badge>, sort: (d) => d.kind, hideSm: true },
        { key: 'm', header: 'Chợ', render: (d) => marketById[d.marketId].name, hideSm: true },
        { key: 'cr', header: 'Ngày số hóa', render: (d) => <span className="tnum">{fmtDate(d.created)}</span>, sort: (d) => d.created },
        { key: 'r', header: 'Thời hạn', render: (d) => d.retention, hideSm: true },
        { key: 'e', header: 'Hết hạn lưu trữ', render: (d) => <span className={cx('tnum', soon(d) && 'text-warn font-semibold')}>{soon(d) && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}{fmtDate(d.expire)}</span>, sort: (d) => d.expire },
        { key: 'sz', header: 'Dung lượng', align: 'right', render: (d) => d.size, hideSm: true },
      ]} /></div></Card>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.title} subtitle={sel?.code} footer={sel && <><Button icon={<Eye />} onClick={() => toast({ intent: 'info', title: 'Mở trình xem tài liệu', body: `${sel.pages} trang` })}>Xem</Button><Button variant="primary" icon={<Download />} onClick={() => toast({ intent: 'success', title: 'Đã ghi nhật ký tải hồ sơ', body: 'Tệp có đóng dấu bản sao điện tử.' })}>Tải xuống</Button></>}>
        {sel && <div className="flex flex-col gap-4">
          <div className="aspect-[3/4] max-w-[240px] mx-auto w-full rounded-card border border-line bg-subtle flex flex-col items-center justify-center gap-2 text-fg-3"><FolderOpen className="w-10 h-10" /><span className="text-cap">{sel.pages} trang · {sel.size}</span></div>
          <KV items={[['Loại hồ sơ', sel.kind], ['Chợ', marketById[sel.marketId].name], ['Liên kết', sel.ref], ['Người số hóa', sel.by], ['Ngày số hóa', fmtDate(sel.created)], ['Thời hạn lưu trữ', sel.retention], ['Hết hạn', fmtDate(sel.expire)], ['Mức truy cập', sel.confidential ? 'Hạn chế – dữ liệu cá nhân' : 'Nội bộ BQL']]} />
          {sel.confidential && <MessageBar intent="info">Mọi lượt xem, tải hồ sơ đều được ghi nhật ký theo yêu cầu bảo vệ dữ liệu cá nhân.</MessageBar>}
        </div>}
      </Drawer>
      <Dialog open={up} onClose={() => setUp(false)} title="Số hóa hồ sơ" description="Tải lên bản scan và gắn thông tin phân loại." footer={<><Button onClick={() => setUp(false)}>Hủy</Button><Button variant="primary" onClick={() => { setUp(false); toast({ intent: 'success', title: 'Đã lưu hồ sơ số', body: 'Thời hạn lưu trữ được gán tự động theo loại hồ sơ.' }); }}>Lưu hồ sơ</Button></>}>
        <div className="grid gap-4">
          <Field label="Tệp scan" required hint="PDF/JPG, tối đa 50 MB">{(id, d) => <input id={id} aria-describedby={d} type="file" accept="application/pdf,image/*" className="text-body file:mr-3 file:h-8 file:px-3 file:rounded-control file:border file:border-line-strong file:bg-surface file:text-fg" />}</Field>
          <Field label="Loại hồ sơ">{(id) => <Select id={id}>{kinds.map((k) => <option key={k}>{k}</option>)}</Select>}</Field>
          <Field label="Liên kết với" hint="Số hợp đồng, mã tiểu thương hoặc mã sạp">{(id, d) => <Input id={id} aria-describedby={d} />}</Field>
        </div>
      </Dialog>
    </>
  );
}
