import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Store, Map, Users, FileSignature, Wallet, Scale, Tags, MessageSquareWarning, Megaphone, PlugZap, ShieldCheck, ShoppingBag, Archive, FileBarChart, Smartphone, UserCog, ScrollText, Workflow, Menu as MenuIcon, Bell, Sun, Moon, Search, LogOut, ChevronDown, Building2, HelpCircle } from 'lucide-react';
import { AppCtx, Route } from './lib/app';
import { markets, marketById, complaints, contracts, traders, stalls } from './data/db';
import { Avatar, cx, IconButton, Menu, ToastProvider, Select, Dialog, Input, Badge, Button } from './components/ui';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import FloorPlan from './pages/FloorPlan';
import Traders from './pages/Traders';
import Contracts from './pages/Contracts';
import Fees from './pages/Fees';
import { Reconcile, Tariff } from './pages/Finance';
import Complaints from './pages/Complaints';
import Notices from './pages/Notices';
import { Services, Inspections, Shops } from './pages/Utilities';
import ArchivePage from './pages/Archive';
import Reports from './pages/Reports';
import MobileApp from './pages/MobileApp';
import { UsersPage, AuditPage, IntegrationsPage } from './pages/System';
import Login from './pages/Login';

type NavItem = { id: Route; label: string; icon: React.ReactNode; badge?: number };
const NAV: { group: string; code: string; items: NavItem[] }[] = [
  { group: 'Điều hành', code: 'DB', items: [{ id: 'dashboard', label: 'Dashboard điều hành', icon: <LayoutDashboard /> }] },
  { group: 'Dữ liệu chợ', code: 'MD', items: [{ id: 'markets', label: 'Danh mục chợ', icon: <Store /> }, { id: 'floorplan', label: 'Sơ đồ mặt bằng số', icon: <Map /> }, { id: 'traders', label: 'Tiểu thương', icon: <Users /> }] },
  { group: 'Hợp đồng', code: 'LS', items: [{ id: 'contracts', label: 'Hợp đồng thuê sạp', icon: <FileSignature /> }] },
  { group: 'Tài chính', code: 'FI', items: [{ id: 'fees', label: 'Thu phí & công nợ', icon: <Wallet /> }, { id: 'reconcile', label: 'Đối soát', icon: <Scale /> }, { id: 'tariff', label: 'Biểu phí', icon: <Tags /> }] },
  { group: 'Phản ánh & truyền thông', code: 'CS', items: [{ id: 'complaints', label: 'Phản ánh, kiến nghị', icon: <MessageSquareWarning /> }, { id: 'notices', label: 'Thông báo đa kênh', icon: <Megaphone /> }] },
  { group: 'Dịch vụ tiện ích', code: 'AS', items: [{ id: 'services', label: 'Dịch vụ & chỉ số', icon: <PlugZap /> }, { id: 'inspections', label: 'Kiểm tra ATTP, PCCC', icon: <ShieldCheck /> }, { id: 'shops', label: 'Gian hàng số', icon: <ShoppingBag /> }] },
  { group: 'Hồ sơ & báo cáo', code: 'DS', items: [{ id: 'archive', label: 'Hồ sơ lưu trữ', icon: <Archive /> }, { id: 'reports', label: 'Báo cáo thống kê', icon: <FileBarChart /> }] },
  { group: 'Ứng dụng di động', code: 'APP', items: [{ id: 'mobile', label: 'App tiểu thương', icon: <Smartphone /> }] },
  { group: 'Quản trị hệ thống', code: 'SYS', items: [{ id: 'users', label: 'Người dùng & phân quyền', icon: <UserCog /> }, { id: 'audit', label: 'Nhật ký hệ thống', icon: <ScrollText /> }, { id: 'integrations', label: 'Tích hợp LGSP, SSO', icon: <Workflow /> }] },
];
const ALL_ROUTES = NAV.flatMap((g) => g.items.map((i) => i.id));

const ROLES = [
  { id: 'Lãnh đạo Sở', name: 'Phạm Minh Quang', unit: 'Sở Khoa học và Công nghệ', scope: 'all' },
  { id: 'Lãnh đạo BQL chợ', name: 'Trần Thị Ngọc Ánh', unit: 'BQL Chợ Hàn', scope: 'han' },
  { id: 'Cán bộ thu phí', name: 'Lê Văn Tài', unit: 'BQL Chợ Cồn', scope: 'con' },
  { id: 'Quản trị hệ thống', name: 'Võ Đức Long', unit: 'Sở Khoa học và Công nghệ', scope: 'all' },
];

function readHash(): Route { const h = location.hash.replace('#', '') as Route; return ALL_ROUTES.includes(h) ? h : 'dashboard'; }

export default function App() {
  const [route, setRoute] = useState<Route>(readHash);
  const [market, setMarket] = useState('all');
  const [focus, setFocus] = useState<string | undefined>();
  const [role, setRole] = useState(ROLES[0].id);
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [loggedIn, setLoggedIn] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const roleObj = ROLES.find((r) => r.id === role)!;

  useEffect(() => { const f = () => setRoute(readHash()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  useEffect(() => { if (theme) document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  useEffect(() => { if (roleObj.scope !== 'all') setMarket(roleObj.scope); }, [role]);

  const go = (r: Route, opts?: { market?: string; focus?: string }) => {
    if (opts?.market) setMarket(opts.market);
    setFocus(opts?.focus);
    setRoute(r); setNavOpen(false);
    try { history.replaceState(null, '', '#' + r); } catch {}
    document.getElementById('main')?.scrollTo({ top: 0 });
  };

  const isDark = theme === 'dark' || (theme === null && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const overdue = complaints.filter((c) => c.status === 'overdue').length;
  const expiring = contracts.filter((c) => c.status === 'expiring').length;
  const badges: Partial<Record<Route, number>> = { complaints: complaints.filter((c) => c.status === 'new' || c.status === 'overdue').length };

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const page = (() => {
    switch (route) {
      case 'dashboard': return <Dashboard />;
      case 'markets': return <Markets />;
      case 'floorplan': return <FloorPlan />;
      case 'traders': return <Traders />;
      case 'contracts': return <Contracts />;
      case 'fees': return <Fees />;
      case 'reconcile': return <Reconcile />;
      case 'tariff': return <Tariff />;
      case 'complaints': return <Complaints />;
      case 'notices': return <Notices />;
      case 'services': return <Services />;
      case 'inspections': return <Inspections />;
      case 'shops': return <Shops />;
      case 'archive': return <ArchivePage />;
      case 'reports': return <Reports />;
      case 'mobile': return <MobileApp />;
      case 'users': return <UsersPage />;
      case 'audit': return <AuditPage />;
      case 'integrations': return <IntegrationsPage />;
    }
  })();

  const nav = (
    <nav aria-label="Điều hướng chính" className="flex flex-col gap-3 py-3 px-2">
      {NAV.map((g) => (
        <div key={g.group}>
          <p className="px-3 pb-1 text-cap font-semibold text-fg-3 flex justify-between"><span>{g.group}</span><span className="font-mono text-[11px]">{g.code}</span></p>
          {g.items.map((it) => {
            const active = route === it.id;
            return (
              <button key={it.id} onClick={() => go(it.id)} aria-current={active ? 'page' : undefined}
                className={cx('relative w-full flex items-center gap-2.5 h-9 px-3 rounded-control text-body text-left [&>svg]:w-[18px] [&>svg]:h-[18px]', active ? 'bg-surface shadow-card font-semibold text-fg' : 'text-fg-2 hover:bg-hover hover:text-fg')}>
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand" />}
                <span className={cx('[&>svg]:w-[18px] [&>svg]:h-[18px]', active && 'text-brand')}>{it.icon}</span>
                <span className="flex-1 truncate">{it.label}</span>
                {badges[it.id] ? <span className="text-[11px] tnum font-semibold min-w-5 h-5 px-1.5 rounded-full bg-bad text-fg-inv inline-flex items-center justify-center">{badges[it.id]}</span> : null}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <AppCtx.Provider value={{ market, setMarket, route, go, focus, role, setRole }}>
      <ToastProvider>
        <div className="h-full flex flex-col">
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:p-2 focus:bg-surface">Bỏ qua điều hướng</a>
          {/* Command bar */}
          <header className="h-12 shrink-0 flex items-center gap-2 px-2 sm:px-3 bg-surface border-b border-line z-20">
            <IconButton label="Mở menu" className="lg:hidden" onClick={() => setNavOpen(true)}><MenuIcon /></IconButton>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-8 h-8 rounded-control bg-brand text-fg-inv inline-flex items-center justify-center shrink-0" aria-hidden>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l2-6h14l2 6" /><path d="M3 10h18v2a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0z" /><path d="M5 14v6h14v-6" /><path d="M10 20v-4h4v4" /></svg>
              </span>
              <div className="hidden sm:block leading-tight min-w-0">
                <p className="text-body font-semibold truncate">Chợ Thông Minh Đà Nẵng</p>
                <p className="text-[11px] text-fg-3 truncate">Sở Khoa học và Công nghệ TP. Đà Nẵng</p>
              </div>
            </div>
            <button onClick={() => setSearchOpen(true)} className="hidden md:flex items-center gap-2 ml-4 h-8 w-[min(420px,32vw)] px-2.5 rounded-control bg-subtle text-fg-3 text-body hover:bg-hover">
              <Search className="w-4 h-4" /> Tìm sạp, tiểu thương, hợp đồng… <kbd className="ml-auto text-[11px] border border-line rounded px-1">Ctrl K</kbd>
            </button>
            <div className="flex-1" />
            <div className="hidden sm:flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-fg-3" aria-hidden />
              <Select aria-label="Phạm vi chợ" value={market} onChange={(e) => setMarket(e.target.value)} disabled={roleObj.scope !== 'all'} className="w-[200px] border-transparent bg-subtle">
                <option value="all">Tất cả chợ ({markets.length})</option>
                {markets.map((m) => <option key={m.id} value={m.id}>{m.name}{m.pilot ? ' · thí điểm' : ''}</option>)}
              </Select>
            </div>
            <IconButton label="Tìm kiếm" className="md:hidden" onClick={() => setSearchOpen(true)}><Search /></IconButton>
            <IconButton label={isDark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'} onClick={() => setTheme(isDark ? 'light' : 'dark')}>{isDark ? <Sun /> : <Moon />}</IconButton>
            <div className="relative">
              <IconButton label="Thông báo" onClick={() => setNotifOpen((o) => !o)}><Bell /></IconButton>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-bad pointer-events-none" />
              {notifOpen && (
                <div className="anim-pop absolute right-0 mt-1 w-[min(360px,calc(100vw-24px))] bg-surface rounded-card shadow-flyout border border-line z-30">
                  <p className="px-4 pt-3 pb-2 font-semibold">Cảnh báo cần xử lý</p>
                  {[
                    { t: `${overdue} phản ánh quá hạn xử lý`, r: 'complaints' as Route, tone: 'bad' as const },
                    { t: `${expiring} hợp đồng hết hạn trong 60 ngày`, r: 'contracts' as Route, tone: 'warn' as const },
                    { t: 'Đối soát ngày 10/10: lệch 3 giao dịch VietQR', r: 'reconcile' as Route, tone: 'warn' as const },
                    { t: 'Lịch kiểm tra PCCC Chợ Hàn 20/10/2026', r: 'inspections' as Route, tone: 'info' as const },
                  ].map((n) => <button key={n.t} onClick={() => { setNotifOpen(false); go(n.r); }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 hover:bg-hover border-t border-line"><Badge tone={n.tone} dot>{n.tone === 'bad' ? 'Khẩn' : n.tone === 'warn' ? 'Lưu ý' : 'Lịch'}</Badge><span className="text-body">{n.t}</span></button>)}
                </div>
              )}
            </div>
            <IconButton label="Trợ giúp" className="hidden sm:inline-flex"><HelpCircle /></IconButton>
            <Menu trigger={(open) => (
              <button onClick={open} className="flex items-center gap-2 h-9 pl-1 pr-1.5 rounded-control hover:bg-hover">
                <Avatar name={roleObj.name} size={28} />
                <span className="hidden xl:block text-left leading-tight"><span className="block text-cap font-semibold">{roleObj.name}</span><span className="block text-[11px] text-fg-3">{roleObj.id}</span></span>
                <ChevronDown className="w-3.5 h-3.5 text-fg-3 hidden xl:block" />
              </button>
            )} items={[...ROLES.map((r) => ({ label: `Vai trò: ${r.id}`, onClick: () => setRole(r.id) })), { label: 'Đăng xuất', icon: <LogOut />, onClick: () => setLoggedIn(false), danger: true }]} />
          </header>

          <div className="flex flex-1 min-h-0">
            <aside className="hidden lg:block w-[256px] shrink-0 overflow-y-auto bg-canvas border-r border-line">{nav}</aside>
            {navOpen && (
              <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setNavOpen(false)}>
                <aside className="anim-slide w-[280px] h-full overflow-y-auto bg-canvas shadow-dialog" onClick={(e) => e.stopPropagation()}>
                  <div className="p-3 sm:hidden">
                    <Select aria-label="Phạm vi chợ (di động)" value={market} onChange={(e) => setMarket(e.target.value)} disabled={roleObj.scope !== 'all'}>
                      <option value="all">Tất cả chợ ({markets.length})</option>
                      {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </Select>
                  </div>
                  {nav}
                </aside>
              </div>
            )}
            <main id="main" tabIndex={-1} className="flex-1 min-w-0 overflow-y-auto">
              <div key={route + market} className="anim-fade max-w-[1480px] mx-auto px-4 sm:px-6 py-5 sm:py-6">
                {roleObj.scope !== 'all' && <p className="mb-3 text-cap text-fg-3">Đang xem với quyền <b className="text-fg-2">{role}</b> · phạm vi dữ liệu: <b className="text-fg-2">{marketById[roleObj.scope].name}</b></p>}
                {page}
                <footer className="mt-10 pt-4 border-t border-line text-cap text-fg-3 flex flex-wrap justify-between gap-2">
                  <span>Phần mềm quản lý chợ thông minh · Bản thử nghiệm giao diện (prototype) · Dữ liệu mô phỏng, không phải số liệu chính thức</span>
                  <span>ATTT cấp độ 2 · Kết nối LGSP/SSO TP. Đà Nẵng</span>
                </footer>
              </div>
            </main>
          </div>
        </div>
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onPick={(r, m, f) => { setSearchOpen(false); go(r, { market: m, focus: f }); }} />
      </ToastProvider>
    </AppCtx.Provider>
  );
}

function GlobalSearch({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (r: Route, market: string, focus: string) => void }) {
  const [q, setQ] = useState('');
  const res = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const out: { label: string; sub: string; kind: string; r: Route; m: string; f: string }[] = [];
    for (const st of stalls) { if (st.code.toLowerCase().includes(s)) { out.push({ label: st.code, sub: `${marketById[st.marketId].name} · ${st.zone}`, kind: 'Sạp', r: 'floorplan', m: st.marketId, f: st.id }); if (out.length > 5) break; } }
    let n = 0; for (const t of traders) { if (t.name.toLowerCase().includes(s) || t.phone.includes(s)) { out.push({ label: t.name, sub: `${t.code} · ${marketById[t.marketId].name}`, kind: 'Tiểu thương', r: 'traders', m: t.marketId, f: t.id }); if (++n > 6) break; } }
    n = 0; for (const c of contracts) { if (c.code.toLowerCase().includes(s)) { out.push({ label: c.code, sub: marketById[c.marketId].name, kind: 'Hợp đồng', r: 'contracts', m: c.marketId, f: c.id }); if (++n > 4) break; } }
    markets.filter((m) => m.name.toLowerCase().includes(s)).forEach((m) => out.unshift({ label: m.name, sub: `${m.cls} · ${m.address}`, kind: 'Chợ', r: 'markets', m: m.id, f: m.id }));
    return out;
  }, [q]);
  return (
    <Dialog open={open} onClose={onClose} title="Tìm kiếm nhanh" description="Gõ mã sạp (vd. HAN-A012), tên/số điện thoại tiểu thương, số hợp đồng hoặc tên chợ." width="max-w-xl">
      <Input data-autofocus aria-label="Từ khóa tìm kiếm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập ít nhất 2 ký tự…" />
      <ul className="mt-3 max-h-[50vh] overflow-y-auto divide-y divide-line">
        {res.map((r, i) => <li key={i}><button onClick={() => onPick(r.r, r.m, r.f)} className="w-full text-left flex items-center gap-3 px-2 py-2 hover:bg-hover rounded-control"><Badge tone="brand">{r.kind}</Badge><span className="min-w-0"><span className="block font-semibold truncate">{r.label}</span><span className="block text-cap text-fg-3 truncate">{r.sub}</span></span></button></li>)}
        {q.trim().length >= 2 && !res.length && <li className="py-6 text-center text-fg-3">Không tìm thấy kết quả cho “{q}”.</li>}
      </ul>
    </Dialog>
  );
}
