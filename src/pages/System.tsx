import { useMemo, useState } from 'react';
import { UserPlus, KeyRound, Lock, CheckCircle2, AlertTriangle, Activity, Download, RefreshCw } from 'lucide-react';
import { users, auditLogs, marketById, fmtDate, markets } from '../data/db';
import { Avatar, Badge, Button, Card, Checkbox, DataTable, Dialog, Field, Input, PageHeader, SearchBox, Select, Stat, Tabs, Toolbar, useToast, cx, MessageBar } from '../components/ui';

const MODULES = ['MD – Dữ liệu chợ', 'LS – Hợp đồng', 'FI – Tài chính', 'CS – Phản ánh', 'AS – Dịch vụ', 'DS – Hồ sơ', 'DB – Báo cáo', 'SYS – Quản trị'];
const ROLE_MATRIX: Record<string, string[]> = {
  'Lãnh đạo Sở': ['Xem', 'Xem', 'Xem', 'Xem', 'Xem', 'Xem', 'Toàn quyền', '—'],
  'Lãnh đạo BQL chợ': ['Toàn quyền', 'Phê duyệt', 'Phê duyệt', 'Toàn quyền', 'Phê duyệt', 'Toàn quyền', 'Toàn quyền', '—'],
  'Cán bộ BQL chợ': ['Cập nhật', 'Lập', 'Xem', 'Xử lý', 'Cập nhật', 'Cập nhật', 'Xem', '—'],
  'Cán bộ thu phí': ['Xem', 'Xem', 'Thu phí', '—', 'Ghi chỉ số', '—', '—', '—'],
  'Kế toán': ['Xem', 'Xem', 'Toàn quyền', '—', 'Xem', 'Xem', 'Xem', '—'],
  'Quản trị hệ thống': ['—', '—', '—', '—', '—', '—', 'Xem', 'Toàn quyền'],
};

export function UsersPage() {
  const toast = useToast();
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const rows = users.filter((u) => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.username.includes(q.toLowerCase()));
  return (
    <>
      <PageHeader uc="UC-38 · Quản lý người dùng, phân quyền" title="Người dùng & phân quyền" subtitle="Cán bộ đăng nhập bằng SSO thành phố; phân quyền theo vai trò (RBAC) và theo phạm vi chợ." actions={<Button variant="primary" icon={<UserPlus />} onClick={() => setAdding(true)}>Thêm người dùng</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Tài khoản cán bộ" value={users.length} sub={`${users.filter((u) => u.status === 'Hoạt động').length} đang hoạt động`} />
        <Stat label="Đăng nhập qua SSO" value={`${Math.round((users.filter((u) => u.sso).length / users.length) * 100)}%`} tone="ok" />
        <Stat label="Bật xác thực 2 lớp" value={`${Math.round((users.filter((u) => u.mfa).length / users.length) * 100)}%`} tone="warn" sub="Khuyến nghị 100% với cán bộ thu phí" />
        <Stat label="Vai trò" value={Object.keys(ROLE_MATRIX).length} />
      </div>
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'users', label: 'Người dùng', count: users.length }, { id: 'roles', label: 'Ma trận phân quyền' }]} />
      {tab === 'users' ? (
        <>
          <Toolbar><SearchBox value={q} onChange={setQ} placeholder="Tên, tài khoản" className="w-full sm:w-72" /></Toolbar>
          <Card pad={false}><div className="p-1"><DataTable rows={rows} pageSize={14} caption="Người dùng" columns={[
            { key: 'n', header: 'Người dùng', render: (u) => <div className="flex items-center gap-2"><Avatar name={u.name} size={30} /><div><p className="font-semibold">{u.name}</p><p className="text-cap text-fg-3">{u.username}</p></div></div>, sort: (u) => u.name.split(' ').pop()! },
            { key: 'r', header: 'Vai trò', render: (u) => <Badge tone="brand">{u.role}</Badge>, sort: (u) => u.role },
            { key: 'u', header: 'Đơn vị', render: (u) => u.unit, hideSm: true },
            { key: 'm', header: 'Phạm vi chợ', render: (u) => u.markets[0] === 'all' ? 'Tất cả' : u.markets.map((m) => marketById[m].name).join(', '), hideSm: true },
            { key: 'a', header: 'Xác thực', render: (u) => <div className="flex gap-1">{u.sso && <Badge tone="info">SSO</Badge>}{u.mfa && <Badge tone="ok">2FA</Badge>}</div> },
            { key: 'l', header: 'Đăng nhập gần nhất', render: (u) => <span className="tnum text-fg-2">{fmtDate(u.lastLogin)}</span>, sort: (u) => u.lastLogin, hideSm: true },
            { key: 's', header: 'Trạng thái', render: (u) => <Badge tone={u.status === 'Hoạt động' ? 'ok' : 'idle'} dot>{u.status}</Badge> },
          ]} /></div></Card>
        </>
      ) : (
        <Card pad={false}><div className="overflow-x-auto"><table className="w-full text-body"><thead><tr className="border-b border-line text-left"><th className="px-4 h-10 font-semibold text-fg-2 sticky left-0 bg-surface">Vai trò</th>{MODULES.map((m) => <th key={m} className="px-3 font-semibold text-fg-2 whitespace-nowrap text-cap">{m}</th>)}</tr></thead>
          <tbody>{Object.entries(ROLE_MATRIX).map(([r, ps]) => <tr key={r} className="border-b border-line last:border-0"><td className="px-4 py-2.5 font-semibold whitespace-nowrap sticky left-0 bg-surface">{r}</td>{ps.map((p, i) => <td key={i} className="px-3"><span className={cx('text-cap', p === '—' ? 'text-fg-3' : p === 'Toàn quyền' ? 'text-brand-fg font-semibold' : 'text-fg')}>{p}</span></td>)}</tr>)}</tbody></table></div></Card>
      )}
      <Dialog open={adding} onClose={() => setAdding(false)} title="Thêm người dùng" description="Tài khoản cán bộ được đồng bộ từ SSO thành phố." footer={<><Button onClick={() => setAdding(false)}>Hủy</Button><Button variant="primary" onClick={() => { setAdding(false); toast({ intent: 'success', title: 'Đã thêm người dùng', body: 'Người dùng đăng nhập lần đầu qua SSO.' }); }}>Lưu</Button></>}>
        <div className="grid gap-4">
          <Field label="Tài khoản SSO" required hint="Địa chỉ thư công vụ @danang.gov.vn">{(id, d) => <Input id={id} aria-describedby={d} />}</Field>
          <Field label="Vai trò">{(id) => <Select id={id}>{Object.keys(ROLE_MATRIX).map((r) => <option key={r}>{r}</option>)}</Select>}</Field>
          <Field label="Phạm vi chợ">{(id) => <Select id={id}><option>Tất cả chợ</option>{markets.map((m) => <option key={m.id}>{m.name}</option>)}</Select>}</Field>
        </div>
      </Dialog>
    </>
  );
}

export function AuditPage() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [mod, setMod] = useState('');
  const [res, setRes] = useState('');
  const rows = useMemo(() => auditLogs.filter((l) => (!q || l.user.includes(q) || l.object.toLowerCase().includes(q.toLowerCase()) || l.action.toLowerCase().includes(q.toLowerCase())) && (!mod || l.module === mod) && (!res || l.result === res)), [q, mod, res]);
  return (
    <>
      <PageHeader uc="UC-39 · Nhật ký hệ thống" title="Nhật ký truy cập & thao tác" subtitle="Lưu tối thiểu 06 tháng phục vụ yêu cầu an toàn thông tin cấp độ 2; không cho phép sửa, xóa." actions={<Button icon={<Download />} onClick={() => toast({ intent: 'success', title: 'Đã xuất nhật ký', body: `${rows.length} bản ghi · định dạng CSV có chữ ký số` })}>Xuất nhật ký</Button>} />
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Tài khoản, đối tượng, thao tác" className="w-full sm:w-72" />
        <Select aria-label="Phân hệ" value={mod} onChange={(e) => setMod(e.target.value)} className="w-auto"><option value="">Tất cả phân hệ</option>{['MD', 'LS', 'FI', 'CS', 'AS', 'DS', 'DB', 'SYS'].map((m) => <option key={m}>{m}</option>)}</Select>
        <Select aria-label="Kết quả" value={res} onChange={(e) => setRes(e.target.value)} className="w-auto"><option value="">Tất cả kết quả</option><option>Thành công</option><option>Thất bại</option></Select>
      </Toolbar>
      <Card pad={false}><div className="p-1"><DataTable rows={rows} pageSize={18} dense caption="Nhật ký" columns={[
        { key: 't', header: 'Thời gian', render: (l) => <span className="tnum font-mono text-cap">{l.time}</span>, sort: (l) => l.time },
        { key: 'u', header: 'Tài khoản', render: (l) => <span className="text-cap">{l.user}</span> },
        { key: 'm', header: 'Phân hệ', render: (l) => <Badge tone="idle">{l.module}</Badge> },
        { key: 'a', header: 'Thao tác', render: (l) => l.action },
        { key: 'o', header: 'Đối tượng', render: (l) => <span className="font-mono text-cap">{l.object}</span>, hideSm: true },
        { key: 'i', header: 'IP', render: (l) => <span className="font-mono text-cap text-fg-3">{l.ip}</span>, hideSm: true },
        { key: 'r', header: 'Kết quả', render: (l) => <Badge tone={l.result === 'Thành công' ? 'ok' : 'bad'} dot>{l.result}</Badge> },
      ]} /></div></Card>
    </>
  );
}

export function IntegrationsPage() {
  const toast = useToast();
  const items = [
    { name: 'LGSP Đà Nẵng', desc: 'Tra cứu định danh CSDL dân cư, chia sẻ dữ liệu tiểu thương, sạp', proto: 'REST/JSON · OAuth2', status: 'ok', latency: '182 ms', calls: '3.412', last: '11/10/2026 08:14' },
    { name: 'SSO thành phố', desc: 'Đăng nhập một lần cho cán bộ', proto: 'OIDC', status: 'ok', latency: '96 ms', calls: '1.208', last: '11/10/2026 08:15' },
    { name: 'Cổng thanh toán VietQR / ngân hàng', desc: 'Sinh mã QR động, nhận báo có qua webhook có chữ ký số', proto: 'REST · Webhook HMAC', status: 'ok', latency: '8,4 s (báo có)', calls: '2.916', last: '11/10/2026 08:13' },
    { name: 'Biên lai / hóa đơn điện tử', desc: 'Phát hành biên lai thu giá dịch vụ tự động', proto: 'REST/SOAP', status: 'warn', latency: '1,9 s', calls: '2.871', last: '11/10/2026 08:13' },
    { name: 'SMS Brandname', desc: 'Gửi OTP, nhắc nợ, thông báo khẩn', proto: 'HTTP API', status: 'ok', latency: '420 ms', calls: '640', last: '11/10/2026 08:00' },
    { name: 'Zalo OA', desc: 'Gửi thông báo, biên lai, nhận phản ánh', proto: 'Zalo OA API', status: 'ok', latency: '350 ms', calls: '4.102', last: '11/10/2026 08:12' },
    { name: 'Push notification (FCM/APNs)', desc: 'Thông báo đẩy tới app tiểu thương', proto: 'HTTP v1', status: 'ok', latency: '210 ms', calls: '5.880', last: '11/10/2026 08:15' },
    { name: 'Dịch vụ ký số từ xa', desc: 'Ký số hợp đồng điện tử của BQL và tiểu thương', proto: 'CSC API', status: 'ok', latency: '2,6 s', calls: '38', last: '10/10/2026 16:42' },
    { name: 'Danang Smart City (1022)', desc: 'Đồng bộ phản ánh của người dân liên quan đến chợ', proto: 'REST/JSON qua LGSP', status: 'err', latency: '—', calls: '0', last: '10/10/2026 23:10' },
  ];
  return (
    <>
      <PageHeader uc="UC-40 · Tích hợp LGSP, SSO thành phố" title="Tích hợp hệ thống" subtitle="Trạng thái kết nối tới các nền tảng dùng chung và dịch vụ bên ngoài, giám sát qua API Gateway." actions={<Button icon={<RefreshCw />} onClick={() => toast({ intent: 'info', title: 'Đang kiểm tra lại các kết nối…' })}>Kiểm tra kết nối</Button>} />
      <div className="mb-4"><MessageBar intent="error" title="Mất kết nối Danang Smart City (1022) từ 23:10 ngày 10/10.">Phản ánh mới từ 1022 đang được xếp hàng tại LGSP, sẽ tự đồng bộ khi kết nối phục hồi.</MessageBar></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((i) => (
          <Card key={i.name}>
            <div className="flex items-start justify-between gap-2"><p className="font-semibold">{i.name}</p>{i.status === 'ok' ? <Badge tone="ok" dot>Hoạt động</Badge> : i.status === 'warn' ? <Badge tone="warn" dot>Chậm</Badge> : <Badge tone="bad" dot>Mất kết nối</Badge>}</div>
            <p className="text-cap text-fg-2 mt-1">{i.desc}</p>
            <dl className="grid grid-cols-3 gap-2 mt-3 text-cap"><div><dt className="text-fg-3">Giao thức</dt><dd>{i.proto}</dd></div><div><dt className="text-fg-3">Độ trễ</dt><dd className="tnum">{i.latency}</dd></div><div><dt className="text-fg-3">Lượt gọi hôm nay</dt><dd className="tnum">{i.calls}</dd></div></dl>
            <p className="text-[11px] text-fg-3 mt-2 inline-flex items-center gap-1"><Activity className="w-3 h-3" />Gần nhất {i.last}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
