# Chợ Thông Minh Đà Nẵng – Lovable prompt (Fluent 2)

## Lovable prompt
Build "Phần mềm quản lý chợ thông minh – TP. Đà Nẵng" using a Fluent 2-inspired Microsoft enterprise UI. All UI copy in Vietnamese (Unicode, TCVN 6909:2001).

### Product goal
Số hóa toàn diện công tác quản lý chợ cho Sở KH&CN và các Ban quản lý chợ: dữ liệu tiểu thương & sạp/kiốt trên sơ đồ mặt bằng số, vòng đời hợp đồng có ký số, thu phí – công nợ – VietQR – đối soát, phản ánh và thông báo đa kênh, dịch vụ tiện ích, hồ sơ lưu trữ, dashboard điều hành, app di động cho tiểu thương, quản trị/tích hợp LGSP-SSO. Scope: 9 phân hệ (MD, LS, FI, CS, AS, DS, DB, APP, SYS), 40 use case, 6 vai trò.

### Screens/routes
- `#dashboard` UC-31 – KPI (lấp đầy, thu kỳ, công nợ, % không tiền mặt), stacked bar thu theo hình thức, donut phản ánh, lấp đầy theo chợ, cảnh báo HĐ sắp hết hạn / phản ánh quá hạn, bảng xếp hạng chợ, xuất Excel/PDF.
- `#markets` UC-01 – danh mục chợ (bảng/thẻ), khu-dãy-tầng, ngành hàng; drawer chi tiết.
- `#floorplan` UC-02/05/06 – sơ đồ SVG theo khu, màu theo trạng thái, zoom, lọc, tìm; drawer sạp (thông tin, lịch sử biến động, thu phí), cho thuê.
- `#traders` UC-03/04 – hồ sơ tiểu thương, xác thực định danh qua LGSP (dialog so khớp), che dữ liệu cá nhân.
- `#contracts` UC-07…11 – tab trạng thái, wizard lập HĐ 3 bước + xem trước, ký số OTP, gia hạn/chuyển nhượng/thanh lý, ngưỡng cảnh báo, mẫu HĐ.
- `#fees` UC-13…17 – bảng kê kỳ thu, công nợ + nhắc nợ 3 mức, thu tại quầy (POS), VietQR động + mô phỏng webhook, biên lai điện tử.
- `#reconcile` UC-18, `#tariff` UC-12.
- `#complaints` UC-19…21 – Kanban/list, SLA, phân công, phản hồi, đánh giá sao.
- `#notices` UC-22/23 – soạn thông báo đa kênh (Push/Zalo OA/SMS) + preview điện thoại.
- `#services` UC-24/25, `#inspections` UC-26, `#shops` UC-27.
- `#archive` UC-28…30, `#reports` UC-32/33.
- `#mobile` UC-34…37 – mô phỏng app tiểu thương trong khung điện thoại, chế độ chữ lớn.
- `#users` UC-38 (RBAC + ma trận quyền), `#audit` UC-39, `#integrations` UC-40.

### Design system requirements
- Tokenized colors (RGB triplet CSS variables mapped into Tailwind: `canvas`, `surface`, `subtle`, `brand`, `fg`, `line`, `ok/warn/bad/info/idle`), radius (`control 4px`, `card 8px`, `panel 12px`), shadows (`card`, `flyout`, `dialog`), type ramp (cap 12, body 14, sub 16, title3 20, title2 24, title1 28).
- Light + dark themes via `:root`, `prefers-color-scheme` and `[data-theme]`.
- Font: Segoe UI → Be Vietnam Pro → system-ui. Brand accent Fluent blue #0F6CBD used only for primary actions, selection, focus.
- App shell: 48px command bar (search Ctrl+K, phạm vi chợ, theme, cảnh báo, vai trò), 256px grouped side nav with module codes, content max 1480px.

### Components to create
Button (primary/secondary/subtle/transparent/danger), IconButton, Field (label+hint+error), Input, Select, Textarea, SearchBox, Checkbox, Switch, Tabs (arrow-key), Card, Stat, Badge, MessageBar, Dialog & Drawer (focus trap, Esc, restore focus), Toast (aria-live), DataTable (sort, paging, selection), Menu, Progress, Avatar, EmptyState, Skeleton, charts (StackedBars, TrendArea, HBarList, Donut, Sparkline), FakeQR.

### Interaction and states
Empty states for tables, validation messages tied with `aria-describedby`, loading states for LGSP/ký số/VietQR, success toasts after every action, warning bars for overdue items.

### Accessibility requirements
Keyboard reachable, visible focus ring, labelled fields, `aria-sort`, `aria-current`, `role=dialog` + `aria-modal`, `aria-live` for async results, WCAG 2.0 A minimum.

### Data and behavior
Deterministic mock generator (`src/data/db.ts`) for 29 chợ thực tế ở Đà Nẵng (gồm Hội An, Tam Kỳ, Vĩnh Điện sau hợp nhất), ~6.800 sạp, ~6.100 tiểu thương, hợp đồng, 12 kỳ bảng kê, phản ánh, kiểm tra ATTP/PCCC, hồ sơ, người dùng, nhật ký. Quy mô, đơn giá là số liệu mô phỏng.

### Acceptance checklist
- [ ] All 19 routes render with realistic data, no console errors
- [ ] Market scope filter changes every screen; role switch restricts scope
- [ ] Light/dark correct; no horizontal page scroll at 400px
- [ ] Every dialog traps focus and closes with Esc

## Implementation notes for Lovable
`src/index.css` (tokens) · `tailwind.config.js` (token mapping) · `src/components/ui.tsx` · `src/components/charts.tsx` · `src/data/markets.ts`, `src/data/db.ts` · `src/pages/*` · `src/App.tsx` (shell + hash routing).
Run: `npm install && npm run dev`; `npm run build` outputs a single-file `dist/index.html`.
