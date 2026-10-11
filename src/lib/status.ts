import type { Tone } from '../components/ui';
import type { StallStatus, ContractStatus, ComplaintStatus, VerifyStatus } from '../data/db';
export const STALL_STATUS: Record<StallStatus, [string, Tone]> = { rented: ['Đang thuê', 'brand'], empty: ['Trống', 'ok'], suspended: ['Tạm ngưng', 'warn'], reserved: ['Đang giữ chỗ', 'info'] };
export const CONTRACT_STATUS: Record<ContractStatus, [string, Tone]> = { active: ['Hiệu lực', 'ok'], expiring: ['Sắp hết hạn', 'warn'], expired: ['Hết hạn', 'bad'], pending_sign: ['Chờ ký số', 'info'], pending_approval: ['Chờ phê duyệt', 'brand'], terminated: ['Đã thanh lý', 'idle'] };
export const COMPLAINT_STATUS: Record<ComplaintStatus, [string, Tone]> = { new: ['Mới tiếp nhận', 'brand'], processing: ['Đang xử lý', 'info'], waiting: ['Chờ phản hồi', 'warn'], resolved: ['Đã xử lý', 'ok'], overdue: ['Quá hạn', 'bad'] };
export const VERIFY_STATUS: Record<VerifyStatus, [string, Tone]> = { verified: ['Đã xác thực', 'ok'], pending: ['Chờ xác thực', 'warn'], rejected: ['Không khớp dữ liệu', 'bad'] };
