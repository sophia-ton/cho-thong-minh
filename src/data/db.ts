// Bộ sinh dữ liệu mô phỏng có hạt giống cố định (deterministic) — mỗi lần tải đều ra cùng một bộ số liệu.
import { MARKET_SEEDS, MarketSeed, MarketClass } from './markets';

let seed = 20261011;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const ri = (a: number, b: number) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
const chance = (p: number) => rnd() < p;
const pad = (n: number, w = 4) => String(n).padStart(w, '0');

export const TODAY = new Date(2026, 9, 11);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;

// ---------------- Từ điển tiếng Việt ----------------
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đoàn', 'Trương', 'Mai', 'Lương', 'Thái'];
const DEM_NU = ['Thị', 'Thị', 'Thị', 'Ngọc', 'Thu', 'Kim', 'Mỹ', 'Thanh', 'Bích', 'Hoài'];
const DEM_NAM = ['Văn', 'Văn', 'Đức', 'Minh', 'Quang', 'Hữu', 'Công', 'Tấn', 'Thanh', 'Ngọc'];
const TEN_NU = ['Lan', 'Hoa', 'Hương', 'Mai', 'Hạnh', 'Thủy', 'Nga', 'Loan', 'Phượng', 'Liên', 'Hằng', 'Trang', 'Yến', 'Dung', 'Xuân', 'Thảo', 'Vân', 'Oanh', 'Sương', 'Lệ', 'Tuyết', 'Hiền', 'Nhung', 'Diệu', 'Ánh'];
const TEN_NAM = ['Hùng', 'Dũng', 'Sơn', 'Tuấn', 'Hải', 'Minh', 'Phúc', 'Lộc', 'Tài', 'Bình', 'Khoa', 'Long', 'Nam', 'Thắng', 'Trung', 'Vinh', 'Quý', 'Đạt', 'Hiếu', 'Toàn'];
const STREETS = ['Lê Duẩn', 'Hùng Vương', 'Ông Ích Khiêm', 'Nguyễn Văn Linh', 'Hoàng Diệu', 'Trưng Nữ Vương', 'Núi Thành', 'Điện Biên Phủ', 'Hà Huy Tập', 'Tôn Đức Thắng', 'Âu Cơ', 'Ngô Quyền', 'Phạm Văn Đồng', 'Lê Văn Hiến', 'Tôn Đản', 'Cách Mạng Tháng 8', 'Nguyễn Tri Phương', 'Trần Cao Vân', 'Lê Đình Lý', 'Phan Châu Trinh'];

export const CATEGORIES = [
  'Thịt gia súc, gia cầm', 'Hải sản tươi sống', 'Rau củ quả', 'Trái cây', 'Hàng khô – gia vị', 'Đặc sản Đà Nẵng',
  'Vải – may đo', 'Quần áo may sẵn', 'Giày dép – túi xách', 'Đồ gia dụng', 'Mỹ phẩm', 'Vàng bạc – trang sức',
  'Ẩm thực – ăn uống', 'Hoa – cây cảnh', 'Điện thoại – điện tử', 'Tạp hóa',
] as const;
export type Category = typeof CATEGORIES[number];

const ZONE_CATS: Record<string, Category[]> = {
  'thực phẩm': ['Thịt gia súc, gia cầm', 'Hải sản tươi sống', 'Rau củ quả', 'Hàng khô – gia vị'],
  'tươi sống': ['Thịt gia súc, gia cầm', 'Hải sản tươi sống', 'Rau củ quả'],
  'hải sản': ['Hải sản tươi sống'], 'cá': ['Hải sản tươi sống'], 'thủy sản': ['Hải sản tươi sống'], 'sơ chế': ['Hải sản tươi sống'], 'bến': ['Hải sản tươi sống'],
  'vải': ['Vải – may đo', 'Quần áo may sẵn'], 'may': ['Vải – may đo', 'Quần áo may sẵn', 'Giày dép – túi xách'],
  'gia dụng': ['Đồ gia dụng', 'Tạp hóa', 'Điện thoại – điện tử'], 'điện': ['Điện thoại – điện tử', 'Đồ gia dụng'],
  'ăn uống': ['Ẩm thực – ăn uống'], 'ẩm thực': ['Ẩm thực – ăn uống'], 'đặc sản': ['Đặc sản Đà Nẵng', 'Hàng khô – gia vị'],
  'hàng khô': ['Hàng khô – gia vị', 'Tạp hóa', 'Đặc sản Đà Nẵng'], 'rau': ['Rau củ quả'], 'trái cây': ['Trái cây'], 'nông sản': ['Rau củ quả', 'Trái cây'],
  'kiốt': ['Vàng bạc – trang sức', 'Mỹ phẩm', 'Điện thoại – điện tử', 'Giày dép – túi xách', 'Tạp hóa'], 'đá': ['Tạp hóa'], 'tập kết': ['Rau củ quả', 'Trái cây'],
};
const catsForZone = (z: string): Category[] => {
  const k = Object.keys(ZONE_CATS).find((key) => z.toLowerCase().includes(key));
  return k ? ZONE_CATS[k] : (CATEGORIES as unknown as Category[]);
};

// Đơn giá dịch vụ sử dụng diện tích bán hàng (đồng/m²/tháng) — mô phỏng theo hạng chợ
export const FEE_RATE: Record<MarketClass, number> = { 'Hạng 1': 285000, 'Hạng 2': 190000, 'Hạng 3': 120000, 'Đầu mối': 160000 };
export const ELECTRIC_PRICE = 3200; // đ/kWh (mô phỏng giá kinh doanh bình quân)
export const WATER_PRICE = 16500;   // đ/m³
export const SANITATION_FEE = 60000;

// ---------------- Kiểu dữ liệu ----------------
export type StallStatus = 'rented' | 'empty' | 'suspended' | 'reserved';
export interface Stall { id: string; code: string; marketId: string; zone: string; zoneIdx: number; row: number; col: number; area: number; category: Category; status: StallStatus; traderId?: string; contractId?: string; monthlyFee: number; frontage: boolean; history: { date: string; event: string; by: string }[] }
export type VerifyStatus = 'verified' | 'pending' | 'rejected';
export interface Trader { id: string; code: string; name: string; gender: 'Nam' | 'Nữ'; birthYear: number; phone: string; cccd: string; address: string; category: Category; marketId: string; stallIds: string[]; verify: VerifyStatus; joined: string; violations: number; appUser: boolean; zalo: boolean; taxCode?: string }
export type ContractStatus = 'active' | 'expiring' | 'expired' | 'pending_sign' | 'pending_approval' | 'terminated';
export interface Contract { id: string; code: string; traderId: string; stallId: string; marketId: string; start: string; end: string; monthlyFee: number; deposit: number; status: ContractStatus; signedBql: boolean; signedTrader: boolean; template: string; daysLeft: number }
export type PayMethod = 'VietQR' | 'Tiền mặt' | 'Chuyển khoản' | 'Thu trên thiết bị di động';
export interface Bill { id: string; code: string; period: string; periodIdx: number; contractId: string; traderId: string; stallId: string; marketId: string; rent: number; electric: number; water: number; sanitation: number; parking: number; total: number; paid: number; method?: PayMethod; paidAt?: string; receipt?: string; dueDate: string }
export type ComplaintStatus = 'new' | 'processing' | 'waiting' | 'resolved' | 'overdue';
export interface Complaint { id: string; code: string; title: string; detail: string; category: string; source: string; marketId: string; sender: string; senderType: 'Tiểu thương' | 'Người dân'; created: string; deadline: string; status: ComplaintStatus; assignee?: string; rating?: number; location: string; hasPhoto: boolean }
export interface Inspection { id: string; code: string; marketId: string; type: 'ATTP' | 'PCCC'; date: string; team: string; scope: string; result: 'Đạt' | 'Đạt, có khuyến nghị' | 'Không đạt' | 'Chưa kiểm tra'; findings: string; fixDeadline?: string; fixStatus: 'Không yêu cầu' | 'Đang khắc phục' | 'Đã khắc phục' | 'Quá hạn khắc phục'; stalls: number }
export interface ServiceReg { id: string; code: string; traderId: string; stallId: string; marketId: string; service: 'Điện' | 'Nước' | 'Vệ sinh' | 'Giữ xe' | 'Kho lạnh'; requested: string; status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Đang sử dụng'; note: string; channel: 'App' | 'Quầy BQL' }
export interface MeterReading { id: string; stallId: string; marketId: string; traderId: string; type: 'Điện' | 'Nước'; meterNo: string; prev: number; curr: number; usage: number; amount: number; readAt?: string; reader?: string; status: 'Chưa ghi' | 'Đã ghi' | 'Bất thường' }
export interface Doc { id: string; code: string; title: string; kind: string; marketId: string; ref: string; created: string; retention: string; expire: string; size: string; pages: number; by: string; confidential: boolean }
export interface Notice { id: string; title: string; body: string; audience: string; channels: string[]; marketId: string | 'all'; sentAt: string; status: 'Đã gửi' | 'Đã lên lịch' | 'Nháp'; reach: number; read: number; kind: 'Thông báo' | 'Tin tức' | 'Chính sách' | 'Nhắc nợ' }
export interface User { id: string; name: string; username: string; role: string; unit: string; markets: string[]; status: 'Hoạt động' | 'Tạm khóa'; lastLogin: string; sso: boolean; mfa: boolean }
export interface AuditLog { id: string; time: string; user: string; action: string; object: string; ip: string; result: 'Thành công' | 'Thất bại'; module: string }
export interface Product { id: string; traderId: string; stallId: string; marketId: string; name: string; price: number; unit: string; category: Category; views: number }

export interface Market extends MarketSeed { manager: string; phone: string; areaM2: number; rented: number; empty: number; suspended: number; fillRate: number; traders: number; contracts: number; monthRevenue: number; monthTarget: number; collectRate: number; debt: number; openComplaints: number; lastInspection: string; cashlessRate: number }

// ---------------- Sinh dữ liệu ----------------
const personName = (g: 'Nam' | 'Nữ') => `${pick(HO)} ${g === 'Nữ' ? pick(DEM_NU) : pick(DEM_NAM)} ${g === 'Nữ' ? pick(TEN_NU) : pick(TEN_NAM)}`;
const phone = () => `0${pick(['905', '935', '914', '983', '977', '788', '765', '898', '932', '944'])}${pad(ri(0, 999), 3)}${pad(ri(0, 999), 3)}`;

const STAFF = Array.from({ length: 60 }, () => personName(chance(0.5) ? 'Nữ' : 'Nam'));

export const stalls: Stall[] = [];
export const traders: Trader[] = [];
export const contracts: Contract[] = [];
export const bills: Bill[] = [];
export const meterReadings: MeterReading[] = [];
export const serviceRegs: ServiceReg[] = [];
export const products: Product[] = [];

// 12 kỳ thu: 11/2025 → 10/2026
export const PERIODS = Array.from({ length: 12 }, (_, i) => { const d = new Date(2025, 10 + i, 1); return `${pad(d.getMonth() + 1, 2)}/${d.getFullYear()}`; });
export const CURRENT_PERIOD = PERIODS[11];

const PRODUCT_NAMES: Partial<Record<Category, [string, number, string][]>> = {
  'Đặc sản Đà Nẵng': [['Chả bò Đà Nẵng', 280000, 'kg'], ['Mắm nêm Ông Tây', 45000, 'chai'], ['Bánh khô mè Cẩm Lệ', 35000, 'hộp'], ['Mực một nắng', 650000, 'kg'], ['Tré bà Đệ', 60000, 'chục'], ['Nước mắm Nam Ô', 120000, 'lít']],
  'Hải sản tươi sống': [['Cá thu', 260000, 'kg'], ['Mực lá', 320000, 'kg'], ['Tôm sú', 380000, 'kg'], ['Cá nục', 70000, 'kg'], ['Ghẹ xanh', 420000, 'kg']],
  'Vải – may đo': [['May áo dài lụa', 850000, 'bộ'], ['Vải lụa tơ tằm', 180000, 'mét'], ['May vest nam', 2200000, 'bộ']],
  'Ẩm thực – ăn uống': [['Mì Quảng gà', 35000, 'tô'], ['Bánh xèo', 40000, 'phần'], ['Bún mắm nêm', 30000, 'tô'], ['Bánh canh cá lóc', 35000, 'tô']],
  'Hàng khô – gia vị': [['Tiêu Tiên Phước', 220000, 'kg'], ['Tỏi Lý Sơn', 180000, 'kg'], ['Hạt điều rang', 320000, 'kg']],
  'Trái cây': [['Xoài cát Hòa Lộc', 75000, 'kg'], ['Bưởi Đoan Hùng', 60000, 'quả']],
  'Vàng bạc – trang sức': [['Nhẫn bạc ta', 450000, 'chiếc']],
  'Rau củ quả': [['Rau La Hường', 15000, 'bó'], ['Cà chua', 25000, 'kg']],
};

function genMarket(ms: MarketSeed) {
  const zonesN = ms.zones.length;
  const perZone = Math.ceil(ms.stalls / zonesN);
  const fillBase = ms.cls === 'Hạng 1' ? 0.93 : ms.cls === 'Đầu mối' ? 0.88 : ms.cls === 'Hạng 2' ? 0.86 : 0.78;
  let n = 0;
  ms.zones.forEach((zone, zi) => {
    const cols = zone.toLowerCase().includes('kiốt') ? 18 : 16;
    const count = Math.min(perZone, ms.stalls - n);
    for (let k = 0; k < count; k++) {
      n++;
      const row = Math.floor(k / cols), col = k % cols;
      const cats = catsForZone(zone);
      const category = pick(cats);
      const frontage = zone.toLowerCase().includes('kiốt') || row === 0;
      const area = frontage ? pick([6, 8, 9, 12, 16]) : pick([2, 2.5, 3, 3, 4, 4, 4.5, 6]);
      const fee = Math.round((area * FEE_RATE[ms.cls] * (frontage ? 1.35 : 1)) / 1000) * 1000;
      const r = rnd();
      const status: StallStatus = r < fillBase ? 'rented' : r < fillBase + 0.025 ? 'suspended' : r < fillBase + 0.04 ? 'reserved' : 'empty';
      const code = `${ms.code}-${String.fromCharCode(65 + zi)}${pad(k + 1, 3)}`;
      const s: Stall = { id: `${ms.id}-${zi}-${k}`, code, marketId: ms.id, zone, zoneIdx: zi, row, col, area, category, status, monthlyFee: fee, frontage, history: [] };
      stalls.push(s);
      const histStart = ri(2012, 2022);
      s.history.push({ date: `${histStart}-0${ri(1, 9)}-1${ri(0, 9)}`, event: `Số hóa sạp vào CSDL – diện tích ${area} m², ngành hàng ${category}`, by: 'Hệ thống' });
      if (status === 'rented' || status === 'suspended') {
        const g = chance(0.68) ? 'Nữ' : 'Nam';
        const t: Trader = {
          id: `t-${s.id}`, code: `TT-${ms.code}-${pad(traders.length + 1, 5)}`, name: personName(g), gender: g, birthYear: ri(1958, 1998), phone: phone(),
          cccd: `048${ri(0, 1)}${pad(ri(0, 99), 2)}${pad(ri(0, 999999), 6)}`, address: `${ri(1, 420)} ${pick(STREETS)}, ${ms.phuong}`, category, marketId: ms.id, stallIds: [s.id],
          verify: chance(0.86) ? 'verified' : chance(0.85) ? 'pending' : 'rejected', joined: `${ri(2005, 2025)}-${pad(ri(1, 12), 2)}-${pad(ri(1, 28), 2)}`,
          violations: chance(0.88) ? 0 : ri(1, 3), appUser: chance(ms.pilot ? 0.72 : 0.31), zalo: chance(0.8), taxCode: chance(0.4) ? `04${pad(ri(0, 99999999), 8)}` : undefined,
        };
        traders.push(t);
        s.traderId = t.id;
        // Hợp đồng
        const startY = ri(2022, 2026); const startM = ri(1, 12);
        const start = new Date(startY, startM - 1, 1);
        const term = pick([12, 24, 36, 36, 60]);
        let end = new Date(startY, startM - 1 + term, 0);
        if (end < TODAY && chance(0.75)) end = new Date(TODAY.getFullYear() + ri(0, 2), ri(0, 11), 28);
        const daysLeft = Math.round((end.getTime() - TODAY.getTime()) / 86400000);
        let cstatus: ContractStatus = daysLeft < 0 ? 'expired' : daysLeft <= 60 ? 'expiring' : 'active';
        if (start > TODAY) cstatus = 'pending_sign';
        const ccode = `HĐ-${startY}/${ms.code}-${pad(contracts.length + 1, 4)}`;
        const c: Contract = { id: `c-${s.id}`, code: ccode, traderId: t.id, stallId: s.id, marketId: ms.id, start: iso(start), end: iso(end), monthlyFee: fee, deposit: fee * 2, status: cstatus, signedBql: cstatus !== 'pending_sign', signedTrader: cstatus !== 'pending_sign', template: frontage ? 'Mẫu HĐ thuê kiốt mặt tiền (MHĐ-02)' : 'Mẫu HĐ thuê sạp trong nhà lồng (MHĐ-01)', daysLeft };
        contracts.push(c);
        s.contractId = c.id;
        s.history.push({ date: c.start, event: `Ký ${ccode} với ${t.name}`, by: pick(STAFF) });
        if (chance(0.2)) s.history.push({ date: `2025-${pad(ri(1, 12), 2)}-${pad(ri(1, 28), 2)}`, event: `Điều chỉnh ngành hàng sang ${category}`, by: pick(STAFF) });
        if (status === 'suspended') s.history.push({ date: iso(addDays(TODAY, -ri(5, 60))), event: 'Tạm ngưng kinh doanh theo đề nghị của tiểu thương', by: pick(STAFF) });
        // Hóa đơn 12 kỳ
        const reliability = rnd();
        const cashless = ms.pilot ? 0.62 : 0.24;
        PERIODS.forEach((p, pi) => {
          const kwh = ['Thịt gia súc, gia cầm', 'Hải sản tươi sống', 'Ẩm thực – ăn uống'].includes(category) ? ri(90, 320) : ri(20, 140);
          const m3 = ['Hải sản tươi sống', 'Ẩm thực – ăn uống', 'Thịt gia súc, gia cầm'].includes(category) ? ri(4, 18) : ri(0, 3);
          const electric = kwh * ELECTRIC_PRICE, water = m3 * WATER_PRICE;
          const rent = status === 'suspended' && pi > 9 ? Math.round(fee * 0.5) : fee;
          const parking = chance(0.35) ? 50000 : 0;
          const total = rent + electric + water + SANITATION_FEE + parking;
          const age = 11 - pi;
          const payP = age === 0 ? 0.52 + reliability * 0.3 : age === 1 ? 0.88 + reliability * 0.1 : 0.965 + reliability * 0.035;
          const paidFull = rnd() < payP;
          const partial = !paidFull && chance(0.18);
          const paid = paidFull ? total : partial ? Math.round(total * 0.5 / 1000) * 1000 : 0;
          const method: PayMethod | undefined = paid ? (rnd() < cashless + pi * 0.012 ? 'VietQR' : chance(0.12) ? 'Chuyển khoản' : chance(0.3) ? 'Thu trên thiết bị di động' : 'Tiền mặt') : undefined;
          const [mm, yy] = p.split('/').map(Number);
          bills.push({ id: `b-${s.id}-${pi}`, code: `BK-${yy}${pad(mm, 2)}-${ms.code}-${pad(bills.length % 99999, 5)}`, period: p, periodIdx: pi, contractId: c.id, traderId: t.id, stallId: s.id, marketId: ms.id, rent, electric, water, sanitation: SANITATION_FEE, parking, total, paid, method, paidAt: paid ? `${yy}-${pad(mm, 2)}-${pad(ri(3, 25), 2)} ${pad(ri(6, 18), 2)}:${pad(ri(0, 59), 2)}` : undefined, receipt: paid ? `BL${yy}${pad(ri(1, 999999), 6)}` : undefined, dueDate: `${yy}-${pad(mm, 2)}-20` });
          if (pi === 11) {
            const readDone = chance(0.78);
            meterReadings.push({ id: `me-${s.id}`, stallId: s.id, marketId: ms.id, traderId: t.id, type: 'Điện', meterNo: `CT${ms.code}${pad(k + 1, 4)}`, prev: 1200 + ri(0, 9000), curr: 0, usage: kwh, amount: electric, readAt: readDone ? `2026-10-${pad(ri(1, 10), 2)}` : undefined, reader: readDone ? pick(STAFF) : undefined, status: readDone ? (kwh > 300 ? 'Bất thường' : 'Đã ghi') : 'Chưa ghi' });
            if (m3 > 0) meterReadings.push({ id: `mw-${s.id}`, stallId: s.id, marketId: ms.id, traderId: t.id, type: 'Nước', meterNo: `DH${ms.code}${pad(k + 1, 4)}`, prev: 100 + ri(0, 2000), curr: 0, usage: m3, amount: water, readAt: readDone ? `2026-10-${pad(ri(1, 10), 2)}` : undefined, reader: readDone ? pick(STAFF) : undefined, status: readDone ? 'Đã ghi' : 'Chưa ghi' });
          }
        });
        if (chance(0.06)) serviceRegs.push({ id: `sr-${serviceRegs.length}`, code: `DV-2026-${pad(serviceRegs.length + 1, 4)}`, traderId: t.id, stallId: s.id, marketId: ms.id, service: pick(['Điện', 'Nước', 'Vệ sinh', 'Giữ xe', 'Kho lạnh'] as const), requested: iso(addDays(TODAY, -ri(0, 30))), status: pick(['Chờ duyệt', 'Chờ duyệt', 'Đã duyệt', 'Đang sử dụng', 'Từ chối'] as const), note: pick(['Nâng công suất lên 3 pha', 'Lắp đồng hồ nước riêng', 'Đăng ký giữ xe máy theo tháng', 'Thuê ô kho lạnh 1 m³', 'Thu gom rác 2 lần/ngày']), channel: chance(0.6) ? 'App' : 'Quầy BQL' });
        const pn = PRODUCT_NAMES[category];
        if (pn && t.appUser && chance(0.25)) pn.slice(0, ri(1, pn.length)).forEach(([name, price, unit]) => products.push({ id: `p-${products.length}`, traderId: t.id, stallId: s.id, marketId: ms.id, name, price: Math.round(price * (0.9 + rnd() * 0.25) / 1000) * 1000, unit, category, views: ri(12, 2400) }));
      }
    }
  });
}
MARKET_SEEDS.forEach(genMarket);

// Phản ánh, kiến nghị
const COMPLAINT_TPL: [string, string, string][] = [
  ['Vệ sinh môi trường', 'Rác tồn đọng khu vực cuối dãy', 'Rác thải chưa được thu gom từ sáng, bốc mùi ảnh hưởng việc buôn bán.'],
  ['Vệ sinh môi trường', 'Cống thoát nước khu tươi sống bị nghẹt', 'Nước đọng sau mưa, nền trơn trượt, đề nghị BQL nạo vét.'],
  ['Điện, nước', 'Mất điện cục bộ dãy sạp', 'Mất điện từ 6h sáng, hàng đông lạnh có nguy cơ hư hỏng.'],
  ['Điện, nước', 'Chỉ số đồng hồ nước tăng bất thường', 'Tháng này tiền nước gấp 3 lần mọi tháng, đề nghị kiểm tra lại đồng hồ.'],
  ['An ninh trật tự', 'Xe máy đỗ lấn lối đi', 'Khách gửi xe lấn vào lối đi chính, gây cản trở khách mua hàng.'],
  ['An ninh trật tự', 'Mất trộm hàng hóa ban đêm', 'Sạp bị cạy khóa, mất một số hàng hóa, đề nghị tăng cường bảo vệ.'],
  ['Giá cả, cân đong', 'Nghi vấn cân thiếu tại sạp hải sản', 'Mua 1 kg cá, cân lại tại trạm cân đối chứng chỉ được 850 g.'],
  ['Giá cả, cân đong', 'Chèo kéo, nói thách giá với du khách', 'Du khách phản ánh bị nói giá cao gấp đôi so với niêm yết.'],
  ['Cơ sở hạ tầng', 'Mái tôn dột khi mưa', 'Mái tôn khu B bị thủng, mưa xuống ướt hàng hóa.'],
  ['Cơ sở hạ tầng', 'Đèn chiếu sáng lối đi hư hỏng', 'Nhiều bóng đèn lối đi không sáng, buổi tối rất tối.'],
  ['Phòng cháy chữa cháy', 'Bình chữa cháy hết hạn kiểm định', 'Bình chữa cháy tại cột C12 đã hết hạn từ tháng trước.'],
  ['Phòng cháy chữa cháy', 'Hàng hóa lấn chiếm lối thoát hiểm', 'Một số sạp để hàng chắn cửa thoát hiểm phía Đông.'],
  ['Thu phí, hợp đồng', 'Chưa nhận được biên lai điện tử', 'Đã thanh toán qua VietQR nhưng chưa nhận được biên lai qua Zalo.'],
  ['Thu phí, hợp đồng', 'Đề nghị gia hạn hợp đồng sớm', 'Hợp đồng sắp hết hạn, đề nghị hướng dẫn thủ tục gia hạn trên app.'],
  ['Thái độ phục vụ', 'Nhân viên thu phí thiếu niềm nở', 'Nhân viên thu phí to tiếng với tiểu thương lớn tuổi.'],
  ['An toàn thực phẩm', 'Nghi ngờ thịt không rõ nguồn gốc', 'Một số sạp bán thịt không có tem kiểm dịch.'],
];
const SOURCES = ['App tiểu thương', 'Danang Smart City (1022)', 'Zalo OA BQL chợ', 'Trực tiếp tại BQL', 'Đường dây nóng'];
export const complaints: Complaint[] = Array.from({ length: 186 }, (_, i) => {
  const m = pick(MARKET_SEEDS.filter((x) => chance(x.pilot ? 0.9 : 0.35)) .concat(MARKET_SEEDS[0]));
  const [cat, title, detail] = pick(COMPLAINT_TPL);
  const created = addDays(TODAY, -Math.floor(Math.pow(rnd(), 1.6) * 90));
  const deadline = addDays(created, cat === 'Phòng cháy chữa cháy' || cat === 'Điện, nước' ? 2 : 5);
  const age = (TODAY.getTime() - created.getTime()) / 86400000;
  let status: ComplaintStatus = age > 12 ? (chance(0.95) ? 'resolved' : 'overdue') : age < 1 ? 'new' : pick(['processing', 'processing', 'waiting', 'resolved', 'new'] as const);
  if (status !== 'resolved' && deadline < TODAY) status = 'overdue';
  const senderType: Complaint['senderType'] = chance(0.62) ? 'Tiểu thương' : 'Người dân';
  const ms = stalls.filter((s) => s.marketId === m.id);
  return {
    id: `pa-${i}`, code: `PA-2026-${pad(4120 + i, 5)}`, title, detail, category: cat, source: senderType === 'Tiểu thương' ? pick(['App tiểu thương', 'App tiểu thương', 'Zalo OA BQL chợ', 'Trực tiếp tại BQL']) : pick(SOURCES.slice(1)),
    marketId: m.id, sender: personName(chance(0.6) ? 'Nữ' : 'Nam'), senderType, created: `${iso(created)} ${pad(ri(6, 20), 2)}:${pad(ri(0, 59), 2)}`, deadline: iso(deadline), status,
    assignee: status === 'new' ? undefined : pick(STAFF), rating: status === 'resolved' && chance(0.7) ? pick([3, 4, 4, 5, 5, 5]) : undefined, location: ms.length ? `Gần sạp ${pick(ms).code}` : m.zones[0], hasPhoto: chance(0.7),
  };
}).sort((a, b) => b.created.localeCompare(a.created));

// Kiểm tra ATTP, PCCC
export const inspections: Inspection[] = [];
MARKET_SEEDS.forEach((m) => {
  (['ATTP', 'PCCC'] as const).forEach((type) => {
    const nPast = ri(2, 4);
    for (let i = 0; i < nPast; i++) {
      const date = addDays(TODAY, -ri(5, 300));
      const result = pick(['Đạt', 'Đạt', 'Đạt, có khuyến nghị', 'Đạt, có khuyến nghị', 'Không đạt'] as const);
      const fixDeadline = result === 'Đạt' ? undefined : iso(addDays(date, 30));
      const fixStatus = result === 'Đạt' ? 'Không yêu cầu' : addDays(date, 30) < TODAY ? (chance(0.8) ? 'Đã khắc phục' : 'Quá hạn khắc phục') : 'Đang khắc phục';
      inspections.push({ id: `ki-${inspections.length}`, code: `KT-${type}-2026-${pad(inspections.length + 1, 4)}`, marketId: m.id, type, date: iso(date), team: type === 'ATTP' ? 'Đoàn liên ngành ATTP TP. Đà Nẵng' : 'Phòng Cảnh sát PCCC & CNCH – Công an TP', scope: type === 'ATTP' ? pick(['Khu thực phẩm tươi sống', 'Khu ẩm thực', 'Toàn chợ']) : pick(['Hệ thống báo cháy, chữa cháy', 'Lối thoát nạn, điện', 'Toàn chợ']), result, findings: result === 'Đạt' ? 'Không phát hiện vi phạm' : type === 'ATTP' ? pick(['03 sạp thịt thiếu giấy kiểm dịch', 'Khu sơ chế chưa tách khu sống – chín', '02 sạp không có giấy xác nhận tập huấn ATTP']) : pick(['05 bình chữa cháy hết hạn', 'Hàng hóa lấn chiếm lối thoát nạn', 'Đấu nối điện không đảm bảo tại 04 sạp']), fixDeadline, fixStatus, stalls: ri(12, 160) });
    }
    if (chance(0.5)) inspections.push({ id: `ki-${inspections.length}`, code: `KH-${type}-2026-${pad(inspections.length + 1, 4)}`, marketId: m.id, type, date: iso(addDays(TODAY, ri(3, 45))), team: type === 'ATTP' ? 'Đoàn liên ngành ATTP TP. Đà Nẵng' : 'Phòng Cảnh sát PCCC & CNCH – Công an TP', scope: 'Kiểm tra định kỳ Quý IV/2026', result: 'Chưa kiểm tra', findings: '—', fixStatus: 'Không yêu cầu', stalls: 0 });
  });
});
inspections.sort((a, b) => b.date.localeCompare(a.date));

// Hồ sơ lưu trữ
const DOC_KINDS = [['Hợp đồng thuê sạp', '10 năm'], ['Hồ sơ tiểu thương', '10 năm'], ['Biên bản kiểm tra ATTP', '05 năm'], ['Biên bản kiểm tra PCCC', '05 năm'], ['Biên bản thanh lý', '10 năm'], ['Quyết định cho thuê', 'Vĩnh viễn'], ['Bảng kê thu phí', '10 năm'], ['Sơ đồ mặt bằng', 'Vĩnh viễn']] as const;
export const docs: Doc[] = Array.from({ length: 140 }, (_, i) => {
  const [kind, retention] = pick(DOC_KINDS);
  const c = pick(contracts);
  const created = addDays(TODAY, -ri(1, 3200));
  const yrs = retention === 'Vĩnh viễn' ? 999 : parseInt(retention);
  const expire = retention === 'Vĩnh viễn' ? '—' : iso(new Date(created.getFullYear() + yrs, created.getMonth(), created.getDate()));
  const t = traders.find((x) => x.id === c.traderId)!;
  return { id: `d-${i}`, code: `HS-${pad(created.getFullYear(), 4)}-${pad(i + 1, 5)}`, title: kind === 'Hợp đồng thuê sạp' ? `${c.code} – ${t.name}` : kind === 'Hồ sơ tiểu thương' ? `Hồ sơ ${t.code} – ${t.name}` : `${kind} – ${MARKET_SEEDS.find((m) => m.id === c.marketId)!.name}`, kind, marketId: c.marketId, ref: c.code, created: iso(created), retention, expire, size: `${(rnd() * 8 + 0.3).toFixed(1)} MB`, pages: ri(2, 40), by: pick(STAFF), confidential: kind.includes('tiểu thương') };
}).sort((a, b) => b.created.localeCompare(a.created));

// Thông báo
export const notices: Notice[] = [
  { id: 'n1', title: 'Thông báo thu phí kỳ tháng 10/2026', body: 'Đề nghị tiểu thương hoàn thành nộp giá dịch vụ sử dụng diện tích bán hàng kỳ 10/2026 trước ngày 20/10/2026. Khuyến khích thanh toán bằng mã VietQR trên ứng dụng.', audience: 'Toàn bộ tiểu thương', channels: ['Push', 'Zalo OA', 'SMS'], marketId: 'all', sentAt: '2026-10-01 07:30', status: 'Đã gửi', reach: 4812, read: 3960, kind: 'Thông báo' },
  { id: 'n2', title: 'Lịch kiểm tra PCCC định kỳ Quý IV/2026', body: 'Phòng Cảnh sát PCCC & CNCH sẽ kiểm tra từ 20–24/10/2026. Đề nghị tiểu thương dọn dẹp lối thoát nạn, kiểm tra đấu nối điện.', audience: 'Tiểu thương Chợ Hàn, Chợ Cồn', channels: ['Push', 'Zalo OA'], marketId: 'han', sentAt: '2026-10-09 15:00', status: 'Đã gửi', reach: 1324, read: 1010, kind: 'Thông báo' },
  { id: 'n3', title: 'Nhắc nợ kỳ 09/2026 lần 2', body: 'Quý tiểu thương còn nợ kỳ 09/2026, vui lòng thanh toán trước 15/10/2026 để tránh phát sinh xử lý theo hợp đồng.', audience: 'Tiểu thương còn nợ ≥ 1 kỳ', channels: ['SMS', 'Zalo OA'], marketId: 'all', sentAt: '2026-10-08 08:00', status: 'Đã gửi', reach: 512, read: 433, kind: 'Nhắc nợ' },
  { id: 'n4', title: 'Chương trình "Chợ 4.0 – Đi chợ không tiền mặt"', body: 'Tặng 50.000đ vào ví cho khách hàng thanh toán VietQR lần đầu tại các chợ thí điểm từ 15/10 đến 15/11/2026.', audience: 'Người dân, tiểu thương', channels: ['Push', 'Zalo OA'], marketId: 'all', sentAt: '2026-10-15 08:00', status: 'Đã lên lịch', reach: 0, read: 0, kind: 'Tin tức' },
  { id: 'n5', title: 'Quy định mới về niêm yết giá tại chợ du lịch', body: 'Tiểu thương kinh doanh tại Chợ Hàn, Chợ Bắc Mỹ An bắt buộc niêm yết giá bằng tiếng Việt và tiếng Anh từ 01/11/2026.', audience: 'Tiểu thương chợ du lịch', channels: ['Push'], marketId: 'bacmyan', sentAt: '2026-10-05 10:15', status: 'Đã gửi', reach: 980, read: 702, kind: 'Chính sách' },
  { id: 'n6', title: 'Tạm ngừng cấp nước khu C để sửa chữa', body: 'Ngày 13/10/2026 từ 13h–16h tạm ngừng cấp nước khu C – Thực phẩm tươi sống Chợ Cồn để thay đường ống.', audience: 'Tiểu thương Chợ Cồn – Khu C', channels: ['Push', 'SMS'], marketId: 'con', sentAt: '2026-10-11 09:00', status: 'Đã gửi', reach: 168, read: 74, kind: 'Thông báo' },
  { id: 'n7', title: 'Tập huấn ATTP cho tiểu thương ngành thực phẩm', body: 'Lớp tập huấn kiến thức ATTP sáng 26/10/2026 tại hội trường BQL Chợ Hòa Khánh. Đăng ký trên ứng dụng.', audience: 'Ngành thực phẩm', channels: ['Push', 'Zalo OA'], marketId: 'hoakhanh', sentAt: '', status: 'Nháp', reach: 0, read: 0, kind: 'Thông báo' },
];

// Người dùng & nhật ký
const ROLES = ['Lãnh đạo Sở', 'Lãnh đạo BQL chợ', 'Cán bộ BQL chợ', 'Cán bộ thu phí', 'Kế toán', 'Quản trị hệ thống'];
export const users: User[] = [
  { id: 'u0', name: 'Trần Thị Ngọc Ánh', username: 'anhttn@danang.gov.vn', role: 'Lãnh đạo BQL chợ', unit: 'BQL Chợ Hàn', markets: ['han'], status: 'Hoạt động', lastLogin: '2026-10-11 07:42', sso: true, mfa: true },
  ...Array.from({ length: 41 }, (_, i): User => {
    const m = pick(MARKET_SEEDS.filter((x) => x.pilot || chance(0.2)));
    const name = STAFF[i % STAFF.length];
    const role = i < 2 ? 'Lãnh đạo Sở' : i < 4 ? 'Quản trị hệ thống' : pick(ROLES.slice(1, 5));
    return { id: `u${i + 1}`, name, username: `${name.split(' ').pop()!.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()}${i}@danang.gov.vn`, role, unit: role === 'Lãnh đạo Sở' || role === 'Quản trị hệ thống' ? 'Sở Khoa học và Công nghệ' : m.bql, markets: role === 'Lãnh đạo Sở' || role === 'Quản trị hệ thống' ? ['all'] : [m.id], status: chance(0.93) ? 'Hoạt động' : 'Tạm khóa', lastLogin: `2026-10-${pad(ri(1, 11), 2)} ${pad(ri(6, 21), 2)}:${pad(ri(0, 59), 2)}`, sso: chance(0.9), mfa: chance(0.6) };
  }),
];
const ACTIONS: [string, string][] = [['Đăng nhập SSO', 'SYS'], ['Ghi nhận thu tiền mặt', 'FI'], ['Xác nhận thanh toán VietQR (webhook)', 'FI'], ['Phát hành biên lai điện tử', 'FI'], ['Cập nhật trạng thái sạp', 'MD'], ['Lập hợp đồng', 'LS'], ['Ký số hợp đồng', 'LS'], ['Phân công xử lý phản ánh', 'CS'], ['Gửi thông báo đa kênh', 'CS'], ['Ghi chỉ số điện', 'AS'], ['Xuất báo cáo Excel', 'DB'], ['Tra cứu định danh qua LGSP', 'MD'], ['Đối soát sao kê ngân hàng', 'FI'], ['Tải hồ sơ số', 'DS']];
export const auditLogs: AuditLog[] = Array.from({ length: 220 }, (_, i) => {
  const [action, module] = pick(ACTIONS);
  const t = addDays(TODAY, -Math.floor(rnd() * 7));
  return { id: `l${i}`, time: `${iso(t)} ${pad(ri(6, 22), 2)}:${pad(ri(0, 59), 2)}:${pad(ri(0, 59), 2)}`, user: action.includes('webhook') ? 'system@vietqr' : pick(users).username, action, object: action.includes('hợp đồng') ? pick(contracts).code : action.includes('sạp') || action.includes('chỉ số') ? pick(stalls).code : action.includes('phản ánh') ? pick(complaints).code : pick(bills).code, ip: `10.${ri(10, 60)}.${ri(0, 255)}.${ri(2, 254)}`, result: (chance(0.96) ? 'Thành công' : 'Thất bại') as AuditLog['result'], module };
}).sort((a, b) => b.time.localeCompare(a.time));

// ---------------- Tổng hợp theo chợ ----------------
export const markets: Market[] = MARKET_SEEDS.map((ms) => {
  const ss = stalls.filter((s) => s.marketId === ms.id);
  const rented = ss.filter((s) => s.status === 'rented').length;
  const suspended = ss.filter((s) => s.status === 'suspended').length;
  const empty = ss.filter((s) => s.status === 'empty' || s.status === 'reserved').length;
  const bs = bills.filter((b) => b.marketId === ms.id);
  const cur = bs.filter((b) => b.periodIdx === 11);
  const monthTarget = cur.reduce((a, b) => a + b.total, 0);
  const monthRevenue = cur.reduce((a, b) => a + b.paid, 0);
  const paidBills = bs.filter((b) => b.paid > 0);
  return {
    ...ms, manager: personName(chance(0.5) ? 'Nữ' : 'Nam'), phone: `0236 ${ri(3, 3)}${pad(ri(500000, 899999), 6)}`.replace(/(\d{3})(\d{3})$/, '$1 $2'), areaM2: Math.round(ss.reduce((a, s) => a + s.area, 0) * 1.8),
    rented, empty, suspended, fillRate: (rented + suspended) / ss.length, traders: traders.filter((t) => t.marketId === ms.id).length, contracts: contracts.filter((c) => c.marketId === ms.id && c.status !== 'terminated').length,
    monthRevenue, monthTarget, collectRate: monthTarget ? monthRevenue / monthTarget : 0, debt: bs.filter((b) => b.periodIdx < 11).reduce((a, b) => a + (b.total - b.paid), 0),
    openComplaints: complaints.filter((c) => c.marketId === ms.id && c.status !== 'resolved').length, lastInspection: inspections.find((i) => i.marketId === ms.id && i.result !== 'Chưa kiểm tra')?.date ?? '—',
    cashlessRate: paidBills.length ? paidBills.filter((b) => b.method === 'VietQR' || b.method === 'Chuyển khoản').length / paidBills.length : 0,
  };
});

// ---------------- Chỉ mục tra cứu nhanh ----------------
export const marketById = Object.fromEntries(markets.map((m) => [m.id, m])) as Record<string, Market>;
export const traderById = Object.fromEntries(traders.map((t) => [t.id, t])) as Record<string, Trader>;
export const stallById = Object.fromEntries(stalls.map((s) => [s.id, s])) as Record<string, Stall>;
export const contractById = Object.fromEntries(contracts.map((c) => [c.id, c])) as Record<string, Contract>;

export const fmtVND = (n: number) => n.toLocaleString('vi-VN') + ' đ';
export const fmtMil = (n: number) => (n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr';
export const fmtBil = (n: number) => (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';
export const fmtPct = (n: number, d = 1) => (n * 100).toLocaleString('vi-VN', { maximumFractionDigits: d, minimumFractionDigits: d }) + '%';
export const fmtDate = (s?: string) => { if (!s || s === '—') return '—'; const [d, t] = s.split(' '); const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}${t ? ' ' + t.slice(0, 5) : ''}`; };
export const fmtNum = (n: number) => n.toLocaleString('vi-VN');
