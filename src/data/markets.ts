// Danh mục chợ trên địa bàn TP. Đà Nẵng (tên chợ thực tế; quy mô, số liệu là DỮ LIỆU MÔ PHỎNG phục vụ prototype).
// Địa giới theo mô hình chính quyền 2 cấp (từ 01/7/2025); cột "khuVuc" giữ tên quận/huyện cũ để người dùng dễ nhận biết.

export type MarketClass = 'Hạng 1' | 'Hạng 2' | 'Hạng 3' | 'Đầu mối';

export interface MarketSeed {
  id: string;
  code: string;
  name: string;
  khuVuc: string;
  phuong: string;
  address: string;
  cls: MarketClass;
  stalls: number;
  zones: string[];
  pilot: boolean;
  bql: string;
  yearBuilt: number;
  hours: string;
  specialty: string;
}

export const MARKET_SEEDS: MarketSeed[] = [
  { id: 'han', code: 'HAN', name: 'Chợ Hàn', khuVuc: 'Hải Châu', phuong: 'Phường Hải Châu', address: '119 Trần Phú', cls: 'Hạng 1', stalls: 612, zones: ['Tầng trệt – Khu A', 'Tầng trệt – Khu B', 'Tầng trệt – Khu C (thực phẩm)', 'Tầng 2 – Vải & may mặc', 'Tầng 2 – Đặc sản'], pilot: true, bql: 'BQL Chợ Hàn', yearBuilt: 1990, hours: '06:00 – 19:00', specialty: 'Đặc sản, may đo, du lịch' },
  { id: 'con', code: 'CON', name: 'Chợ Cồn', khuVuc: 'Hải Châu', phuong: 'Phường Hải Châu', address: '290 Hùng Vương', cls: 'Hạng 1', stalls: 846, zones: ['Khu A – Vải sợi', 'Khu B – Gia dụng', 'Khu C – Thực phẩm tươi sống', 'Khu D – Ăn uống', 'Khu E – Điện máy'], pilot: true, bql: 'BQL Chợ Cồn', yearBuilt: 1985, hours: '05:30 – 19:00', specialty: 'Bán buôn, ẩm thực' },
  { id: 'dongda', code: 'DDA', name: 'Chợ Đống Đa', khuVuc: 'Hải Châu', phuong: 'Phường Hải Châu', address: '2 Đống Đa', cls: 'Hạng 2', stalls: 264, zones: ['Nhà lồng chính', 'Khu tươi sống', 'Kiốt mặt tiền'], pilot: true, bql: 'BQL Chợ Đống Đa', yearBuilt: 1995, hours: '05:00 – 18:30', specialty: 'Hải sản, thực phẩm' },
  { id: 'hoacuong', code: 'HCU', name: 'Chợ Hòa Cường', khuVuc: 'Hải Châu', phuong: 'Phường Hòa Cường', address: '342 Núi Thành', cls: 'Hạng 2', stalls: 228, zones: ['Nhà lồng chính', 'Khu rau quả', 'Kiốt mặt tiền'], pilot: false, bql: 'Đội quản lý chợ Hòa Cường', yearBuilt: 2004, hours: '05:00 – 18:00', specialty: 'Dân sinh' },
  { id: 'cholmoi', code: 'MOI', name: 'Chợ Mới', khuVuc: 'Hải Châu', phuong: 'Phường Hòa Cường', address: '57 Hoàng Diệu', cls: 'Hạng 3', stalls: 132, zones: ['Nhà lồng', 'Khu ngoài trời'], pilot: false, bql: 'Đội quản lý chợ Mới', yearBuilt: 1998, hours: '05:00 – 12:00', specialty: 'Dân sinh' },
  { id: 'daumoihc', code: 'DMH', name: 'Chợ đầu mối Hòa Cường', khuVuc: 'Hải Châu', phuong: 'Phường Hòa Cường', address: '30 Tháng 4', cls: 'Đầu mối', stalls: 386, zones: ['Khu nông sản', 'Khu rau củ', 'Khu trái cây', 'Bãi tập kết'], pilot: true, bql: 'BQL Chợ đầu mối Hòa Cường', yearBuilt: 2007, hours: '00:00 – 08:00', specialty: 'Đầu mối nông sản' },
  { id: 'bacmyan', code: 'BMA', name: 'Chợ Bắc Mỹ An', khuVuc: 'Ngũ Hành Sơn', phuong: 'Phường Ngũ Hành Sơn', address: '1 Nguyễn Bá Phát', cls: 'Hạng 1', stalls: 418, zones: ['Khu A – Thực phẩm', 'Khu B – Hàng khô', 'Khu C – Ẩm thực đêm', 'Kiốt mặt tiền'], pilot: true, bql: 'BQL Chợ Bắc Mỹ An', yearBuilt: 2006, hours: '05:00 – 22:00', specialty: 'Du lịch, ẩm thực' },
  { id: 'nonnuoc', code: 'NNU', name: 'Chợ Non Nước', khuVuc: 'Ngũ Hành Sơn', phuong: 'Phường Ngũ Hành Sơn', address: 'Lê Văn Hiến', cls: 'Hạng 3', stalls: 96, zones: ['Nhà lồng', 'Khu đá mỹ nghệ'], pilot: false, bql: 'Đội quản lý chợ Non Nước', yearBuilt: 2010, hours: '05:00 – 17:00', specialty: 'Đá mỹ nghệ' },
  { id: 'hoakhanh', code: 'HKH', name: 'Chợ Hòa Khánh', khuVuc: 'Liên Chiểu', phuong: 'Phường Hòa Khánh', address: '120 Âu Cơ', cls: 'Hạng 1', stalls: 534, zones: ['Khu A – Thực phẩm', 'Khu B – May mặc', 'Khu C – Gia dụng', 'Khu D – Ăn uống'], pilot: true, bql: 'BQL Chợ Hòa Khánh', yearBuilt: 2003, hours: '05:00 – 19:00', specialty: 'Dân sinh, công nhân KCN' },
  { id: 'hoamy', code: 'HMY', name: 'Chợ Hòa Mỹ', khuVuc: 'Liên Chiểu', phuong: 'Phường Hòa Khánh', address: 'Nguyễn Sinh Sắc', cls: 'Hạng 3', stalls: 118, zones: ['Nhà lồng', 'Khu ngoài trời'], pilot: false, bql: 'Đội quản lý chợ Hòa Mỹ', yearBuilt: 2008, hours: '05:00 – 12:00', specialty: 'Dân sinh' },
  { id: 'namo', code: 'NAO', name: 'Chợ Nam Ô', khuVuc: 'Liên Chiểu', phuong: 'Phường Hải Vân', address: 'Nguyễn Văn Cừ', cls: 'Hạng 3', stalls: 84, zones: ['Nhà lồng', 'Khu hải sản'], pilot: false, bql: 'Đội quản lý chợ Nam Ô', yearBuilt: 2001, hours: '04:30 – 11:00', specialty: 'Hải sản, nước mắm Nam Ô' },
  { id: 'thanhkhe', code: 'TKH', name: 'Chợ Thanh Khê', khuVuc: 'Thanh Khê', phuong: 'Phường Thanh Khê', address: 'Trần Cao Vân', cls: 'Hạng 2', stalls: 246, zones: ['Nhà lồng chính', 'Khu tươi sống', 'Kiốt mặt tiền'], pilot: false, bql: 'Đội quản lý chợ Thanh Khê', yearBuilt: 1999, hours: '05:00 – 18:00', specialty: 'Dân sinh' },
  { id: 'thanhlocdan', code: 'TLD', name: 'Chợ Thanh Lộc Đán', khuVuc: 'Thanh Khê', phuong: 'Phường Thanh Khê', address: 'Trần Cao Vân', cls: 'Hạng 3', stalls: 92, zones: ['Nhà lồng', 'Khu ngoài trời'], pilot: false, bql: 'Đội quản lý chợ Thanh Lộc Đán', yearBuilt: 2002, hours: '05:00 – 11:30', specialty: 'Dân sinh' },
  { id: 'ankhe', code: 'AKH', name: 'Chợ An Khê', khuVuc: 'Thanh Khê', phuong: 'Phường An Khê', address: 'Hà Huy Tập', cls: 'Hạng 3', stalls: 104, zones: ['Nhà lồng', 'Khu tươi sống'], pilot: false, bql: 'Đội quản lý chợ An Khê', yearBuilt: 2005, hours: '05:00 – 12:00', specialty: 'Dân sinh' },
  { id: 'anhaidong', code: 'AHD', name: 'Chợ An Hải Đông', khuVuc: 'Sơn Trà', phuong: 'Phường An Hải', address: 'Ngô Quyền', cls: 'Hạng 2', stalls: 212, zones: ['Nhà lồng chính', 'Khu hải sản', 'Kiốt mặt tiền'], pilot: false, bql: 'Đội quản lý chợ An Hải Đông', yearBuilt: 2000, hours: '05:00 – 18:00', specialty: 'Hải sản' },
  { id: 'phuocmy', code: 'PMY', name: 'Chợ Phước Mỹ', khuVuc: 'Sơn Trà', phuong: 'Phường Sơn Trà', address: 'Hồ Nghinh', cls: 'Hạng 3', stalls: 88, zones: ['Nhà lồng', 'Khu hải sản'], pilot: false, bql: 'Đội quản lý chợ Phước Mỹ', yearBuilt: 2009, hours: '05:00 – 12:00', specialty: 'Hải sản, du lịch biển' },
  { id: 'manthai', code: 'MTH', name: 'Chợ Mân Thái', khuVuc: 'Sơn Trà', phuong: 'Phường Sơn Trà', address: 'Hoàng Sa', cls: 'Hạng 3', stalls: 72, zones: ['Nhà lồng', 'Khu hải sản'], pilot: false, bql: 'Đội quản lý chợ Mân Thái', yearBuilt: 2011, hours: '04:30 – 10:30', specialty: 'Hải sản tươi' },
  { id: 'naihiendong', code: 'NHD', name: 'Chợ Nại Hiên Đông', khuVuc: 'Sơn Trà', phuong: 'Phường An Hải', address: 'Trần Hưng Đạo', cls: 'Hạng 3', stalls: 96, zones: ['Nhà lồng', 'Khu ngoài trời'], pilot: false, bql: 'Đội quản lý chợ Nại Hiên Đông', yearBuilt: 2004, hours: '05:00 – 12:00', specialty: 'Dân sinh' },
  { id: 'thoquang', code: 'TQU', name: 'Chợ Thọ Quang', khuVuc: 'Sơn Trà', phuong: 'Phường Sơn Trà', address: 'Ngô Quyền', cls: 'Hạng 3', stalls: 110, zones: ['Nhà lồng', 'Khu tươi sống'], pilot: false, bql: 'Đội quản lý chợ Thọ Quang', yearBuilt: 2003, hours: '05:00 – 12:00', specialty: 'Dân sinh' },
  { id: 'daumoits', code: 'DMT', name: 'Chợ đầu mối thủy sản Thọ Quang', khuVuc: 'Sơn Trà', phuong: 'Phường Sơn Trà', address: 'Âu thuyền Thọ Quang', cls: 'Đầu mối', stalls: 168, zones: ['Khu bán buôn thủy sản', 'Khu sơ chế', 'Bến cá'], pilot: false, bql: 'BQL Âu thuyền và cảng cá Thọ Quang', yearBuilt: 2014, hours: '01:00 – 07:00', specialty: 'Đầu mối thủy sản' },
  { id: 'hoaan', code: 'HAA', name: 'Chợ Hòa An', khuVuc: 'Cẩm Lệ', phuong: 'Phường Cẩm Lệ', address: 'Tôn Đản', cls: 'Hạng 2', stalls: 196, zones: ['Nhà lồng chính', 'Khu tươi sống', 'Kiốt mặt tiền'], pilot: false, bql: 'Đội quản lý chợ Hòa An', yearBuilt: 2006, hours: '05:00 – 18:00', specialty: 'Dân sinh' },
  { id: 'khuetrung', code: 'KTR', name: 'Chợ Khuê Trung', khuVuc: 'Cẩm Lệ', phuong: 'Phường Hòa Xuân', address: 'Trần Phước Thành', cls: 'Hạng 3', stalls: 86, zones: ['Nhà lồng', 'Khu ngoài trời'], pilot: false, bql: 'Đội quản lý chợ Khuê Trung', yearBuilt: 2007, hours: '05:00 – 12:00', specialty: 'Dân sinh' },
  { id: 'camle', code: 'CLE', name: 'Chợ Cẩm Lệ', khuVuc: 'Cẩm Lệ', phuong: 'Phường Cẩm Lệ', address: 'Ông Ích Đường', cls: 'Hạng 3', stalls: 102, zones: ['Nhà lồng', 'Khu tươi sống'], pilot: false, bql: 'Đội quản lý chợ Cẩm Lệ', yearBuilt: 2005, hours: '05:00 – 12:00', specialty: 'Dân sinh' },
  { id: 'tuyloan', code: 'TLO', name: 'Chợ Túy Loan', khuVuc: 'Hòa Vang', phuong: 'Xã Hòa Vang', address: 'Thôn Túy Loan', cls: 'Hạng 3', stalls: 92, zones: ['Nhà lồng', 'Khu nông sản'], pilot: false, bql: 'Tổ quản lý chợ Túy Loan', yearBuilt: 2012, hours: '05:00 – 11:00', specialty: 'Nông sản, mì Quảng Túy Loan' },
  { id: 'letrach', code: 'LTR', name: 'Chợ Lệ Trạch', khuVuc: 'Hòa Vang', phuong: 'Xã Hòa Tiến', address: 'Thôn Lệ Sơn', cls: 'Hạng 3', stalls: 78, zones: ['Nhà lồng', 'Khu nông sản'], pilot: false, bql: 'Tổ quản lý chợ Lệ Trạch', yearBuilt: 2008, hours: '05:00 – 11:00', specialty: 'Nông sản, gia súc' },
  { id: 'mieubong', code: 'MBO', name: 'Chợ Miếu Bông', khuVuc: 'Hòa Vang', phuong: 'Xã Hòa Tiến', address: 'QL1A', cls: 'Hạng 3', stalls: 82, zones: ['Nhà lồng', 'Khu ngoài trời'], pilot: false, bql: 'Tổ quản lý chợ Miếu Bông', yearBuilt: 2009, hours: '05:00 – 12:00', specialty: 'Dân sinh' },
  { id: 'hoian', code: 'HOA', name: 'Chợ Hội An', khuVuc: 'Hội An', phuong: 'Phường Hội An', address: '19 Trần Phú', cls: 'Hạng 1', stalls: 520, zones: ['Nhà lồng chính', 'Khu ẩm thực', 'Khu vải may đo', 'Khu cá – bờ sông'], pilot: false, bql: 'BQL Chợ Hội An', yearBuilt: 1990, hours: '05:00 – 19:00', specialty: 'Du lịch, may đo, ẩm thực' },
  { id: 'tamky', code: 'TKY', name: 'Chợ Tam Kỳ', khuVuc: 'Tam Kỳ', phuong: 'Phường Tam Kỳ', address: 'Nguyễn Thái Học', cls: 'Hạng 1', stalls: 480, zones: ['Khu A – Thực phẩm', 'Khu B – May mặc', 'Khu C – Gia dụng', 'Kiốt mặt tiền'], pilot: false, bql: 'BQL Chợ Tam Kỳ', yearBuilt: 2002, hours: '05:00 – 18:30', specialty: 'Dân sinh, bán buôn' },
  { id: 'vinhdien', code: 'VDI', name: 'Chợ Vĩnh Điện', khuVuc: 'Điện Bàn', phuong: 'Phường Điện Bàn', address: 'QL1A', cls: 'Hạng 2', stalls: 238, zones: ['Nhà lồng chính', 'Khu tươi sống', 'Kiốt mặt tiền'], pilot: false, bql: 'BQL Chợ Vĩnh Điện', yearBuilt: 2000, hours: '05:00 – 18:00', specialty: 'Dân sinh' },
];
