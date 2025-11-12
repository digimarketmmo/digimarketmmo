import { UserRole as UserRoleType } from './types.ts';

// ENUMS
export enum UserRole {
  BUYER = 'Buyer',
  SELLER = 'Seller',
  ADMIN = 'Admin',
}

export enum UserStatus {
  ACTIVE = 'Hoạt động',
  BLOCKED = 'Bị khóa',
}

export enum VerificationStatus {
  NOT_VERIFIED = 'Chưa xác thực',
  PENDING = 'Chờ xác thực',
  VERIFIED = 'Đã xác thực',
  REJECTED = 'Bị từ chối',
}

export enum ProductStatus {
  PENDING = 'Chờ duyệt',
  APPROVED = 'Đã duyệt',
  REJECTED = 'Bị từ chối',
}

export enum ProductDeliveryType {
  INVENTORY = 'Tự động (Kho)',
  MANUAL = 'Thủ công',
}

export enum OrderStatus {
  PENDING = 'Chờ xử lý',
  COMPLETED = 'Hoàn thành',
  CANCELLED = 'Đã hủy',
  PRE_ORDER = 'Đặt trước',
}

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  NEW_ORDER_SELLER = 'NEW_ORDER_SELLER',
  ADMIN_ANNOUNCEMENT = 'ADMIN_ANNOUNCEMENT',
  NEW_MESSAGE = 'NEW_MESSAGE',
  PROMOTION_STATUS_UPDATE = 'PROMOTION_STATUS_UPDATE',
  FINANCIAL_REQUEST_PENDING = 'FINANCIAL_REQUEST_PENDING',
  SUPPORT_REQUEST = 'SUPPORT_REQUEST',
  EXCHANGE_REQUEST_PENDING = 'EXCHANGE_REQUEST_PENDING',
}

export enum ComplaintStatus {
  OPEN = 'Mở',
  IN_PROGRESS = 'Đang xử lý',
  RESOLVED = 'Đã giải quyết',
}

export enum InventoryItemStatus {
  AVAILABLE = 'Có sẵn',
  SOLD = 'Đã bán',
}

export enum FinancialRequestType {
  DEPOSIT = 'Nạp tiền',
  WITHDRAWAL = 'Rút tiền',
  EXCHANGE = 'Giao dịch Mua/Bán',
}

export enum FinancialRequestStatus {
  PENDING = 'Chờ xử lý',
  APPROVED = 'Đã duyệt',
  REJECTED = 'Bị từ chối',
}

export enum TransactionType {
  PURCHASE = 'Thanh toán mua hàng',
  SALE = 'Doanh thu bán hàng',
  FEE = 'Phí giao dịch',
  DEPOSIT = 'Nạp tiền',
  WITHDRAWAL = 'Rút tiền',
  TASK_CREATION_FEE = 'Phí tạo nhiệm vụ',
  TASK_REWARD = 'Thưởng nhiệm vụ',
  AD_PAYMENT = 'Thanh toán Quảng cáo',
  AFFILIATE_COMMISSION = 'Hoa hồng giới thiệu',
}

export enum TaskStatus {
  ACTIVE = 'Đang hoạt động',
  PENDING_APPROVAL = 'Chờ duyệt',
  COMPLETED = 'Hoàn thành',
  IN_PROGRESS = 'Đang thực hiện',
  PENDING_COMPLETION_APPROVAL = 'Chờ duyệt hoàn thành',
  REJECTED = 'Bị từ chối',
  CANCELLED = 'Đã hủy',
}

export enum AdCampaignStatus {
    ACTIVE = 'Đang hoạt động',
    PAUSED = 'Tạm dừng',
    OUT_OF_BUDGET = 'Hết ngân sách',
    ENDED = 'Đã kết thúc',
}

export enum AdType {
    IMAGE = 'image',
    SCRIPT = 'script',
}

// Live Support Chat Enums
export enum SupportSender {
    USER = 'user',
    AGENT = 'agent',
}

export enum SupportMessageType {
    TEXT = 'text',
    IMAGE = 'image',
}

// INTERFACES
export interface AdminPermissions {
  isSuperAdmin: boolean;
  canManageShop: boolean;
  canManageUsers: boolean;
  canManageFinance: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  createdAt: Date;
  verificationStatus: VerificationStatus;
  emailVerified: boolean;
  emailVerificationCode: string | null;
  lastSeen: Date;
  brandName?: string;
  brandDescription?: string;
  verificationDocumentUrl?: string;
  permissions?: AdminPermissions;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  referralCode: string;
  referredBy?: string; // ID of the user who referred this user
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface ProductReview {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AdCampaign {
    id: string;
    itemId: string;
    itemType: 'product' | 'task';
    sellerId: string;
    status: AdCampaignStatus;
    dailyBudget: number;
    bidAmount: number; // Cost-per-click bid
    totalSpend: number; // Spend for the current day
    clicks: number;
    createdAt: Date;
    endDate?: Date;
}

export interface Ad {
    id: string;
    locationId: string; // e.g., 'tools-sidebar', 'tools-main-content'
    type: AdType;
    content: string; // Image URL or JS script content
    link?: string; // Click-through URL for image ads
    isActive: boolean;
}

// FIX: Added Category interface.
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sellerId: string;
  description: string;
  imageUrl: string;
  variants: ProductVariant[];
  rating: number;
  reviews: ProductReview[];
  deliveryType: ProductDeliveryType;
  status: ProductStatus;
  createdAt: Date;
  // FIX: Added categoryId property to the Product interface.
  categoryId: string;
  affiliateCommissionRate?: number; // Percentage
  affiliateCommissionLastUpdated?: Date;
}

export interface OrderItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  deliveredItemData?: string[];
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: OrderStatus;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  relatedOrderId?: string;
  complaintId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  timestamp: Date;
}

export interface Complaint {
  id: string;
  userId: string;
  orderId: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  date: string;
  resolutionNotes?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  variantId: string;
  data: string;
  status: InventoryItemStatus;
  addedDate: string;
  orderId?: string;
}

export interface InventoryUploadLog {
  id: string;
  productId: string;
  variantId: string;
  fileName: string;
  fileContent: string;
  uploadDate: string;
  successCount: number;
  errorCount: number;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: Date;
}

export interface SiteNotification {
  id: string;
  message: string;
  isActive: boolean;
}

// FIX: Added BlogPostStatus enum and BlogPost interface.
export enum BlogPostStatus {
    DRAFT = 'Bản nháp',
    PUBLISHED = 'Đã xuất bản',
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  status: BlogPostStatus;
  category: string;
}

export enum BlogPostCommentStatus {
    PENDING = 'Chờ duyệt',
    APPROVED = 'Đã duyệt',
}

export interface BlogPostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  status: BlogPostCommentStatus;
}

export interface ExchangeDetails {
    currency: 'Payeer' | 'PayPal' | 'USDT';
    direction: 'buy' | 'sell'; // 'buy' = user buys from platform, 'sell' = user sells to platform
    usdAmount: number;
    vndAmount: number;
    userWalletAddress?: string;
    usdtNetwork?: 'trc20' | 'bep20';
    // For when user sells to platform, we need their bank info
    userBankName?: string;
    userAccountNumber?: string;
    userAccountHolder?: string;
}

export interface FinancialRequest {
  id: string;
  userId: string;
  type: FinancialRequestType;
  amount: number;
  status: FinancialRequestStatus;
  date: Date;
  bankDetails?: string; // Obsolete, kept for potential compatibility
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  transactionCode?: string;
  processedDate?: Date;
  exchangeDetails?: ExchangeDetails;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  relatedOrderId?: string;
  relatedRequestId?: string;
  relatedTaskId?: string;
  sourceUserId?: string; // For affiliate commissions, the user who made the purchase
}

export interface PlatformBankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branch?: string;
  qrCodeUrl?: string;
}

export interface SystemSettings {
  transactionFeePercent: number;
  platformFeePercent: number;
  affiliateF1CommissionRate: number; // e.g. 10% of sub-affiliate's earnings
  affiliateF2CommissionRate: number; // e.g. 5% of sub-sub-affiliate's earnings
}

export interface TaskReview {
  id: string;
  taskId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface Task {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  reward: number;
  quantity: number;
  status: TaskStatus;
  createdAt: Date;
  taskType: string;
  timeLimit: number;
  requirements: string;
  instructions: string;
  assigneeId?: string;
  instructionImages?: string[];
  review?: TaskReview;
  completionProof?: {
    text?: string;
    images?: string[];
  };
  imageUrl?: string;
  expiryDate?: Date;
  // FIX: Added optional categoryId property to the Task interface.
  categoryId?: string;
}

// Support Center
export interface FAQ {
  q: string;
  a: string;
}

export interface FAQCategory {
  category: string;
  icon: string;
  faqs: FAQ[];
}

// Live Support Chat
export interface SupportMessage {
    id: string;
    sender: SupportSender;
    type: SupportMessageType;
    content: string; // Text content or image data URL
    timestamp: Date;
}

// Exchange Page Interfaces
export interface Rate {
    buy: number;
    sell: number;
}

export interface ExchangeRates {
    payeer: Rate;
    paypal: Rate;
    usdt: Rate;
    pm: Rate;
    wmz: Rate;
}

export interface PlatformBalances {
    payeer: number;
    paypal: number;
    usdt: number;
    vnd: number;
}