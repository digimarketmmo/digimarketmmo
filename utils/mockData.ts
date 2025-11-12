import { User, Product, Order, Message, Notification, Complaint, UserRole, UserStatus, OrderStatus, ProductStatus, ProductDeliveryType, NotificationType, ComplaintStatus, InventoryItem, InventoryItemStatus, Category, ContentPage, SiteNotification, FinancialRequest, FinancialRequestStatus, FinancialRequestType, Transaction, TransactionType, PlatformBankAccount, SystemSettings, Task, TaskStatus, TaskReview, VerificationStatus, AdCampaign, AdCampaignStatus, Ad, AdType, FAQCategory, ExchangeRates, PlatformBalances, BlogPost, BlogPostStatus, BlogPostComment, BlogPostCommentStatus } from '../types.ts';

// Helper to generate a random number in a range
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Mock Users
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice', email: 'alice@example.com', phone: '0912345678', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=alice@example.com', role: UserRole.BUYER, status: UserStatus.ACTIVE, balance: 1250000, createdAt: new Date('2023-10-01'), verificationStatus: VerificationStatus.NOT_VERIFIED, emailVerified: true, emailVerificationCode: null, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24), twoFactorEnabled: false, twoFactorSecret: null, referralCode: 'ALICE123' },
  { id: 'user-2', name: 'Bob - Creative Shop', email: 'bob@example.com', phone: '0987654321', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=bob@example.com', role: UserRole.SELLER, status: UserStatus.ACTIVE, balance: 5300000, brandName: 'Creative Shop', brandDescription: 'Cung cấp các tài khoản premium và key bản quyền.', createdAt: new Date('2023-09-15'), verificationStatus: VerificationStatus.VERIFIED, emailVerified: true, emailVerificationCode: null, lastSeen: new Date(Date.now() - 1000 * 60 * 2), twoFactorEnabled: false, twoFactorSecret: null, referralCode: 'BOB456', referredBy: 'user-1' },
  { id: 'user-3', name: 'Charlie', email: 'charlie@example.com', phone: '0905123456', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=charlie@example.com', role: UserRole.BUYER, status: UserStatus.BLOCKED, balance: 50000, createdAt: new Date('2023-11-05'), verificationStatus: VerificationStatus.PENDING, emailVerified: true, emailVerificationCode: null, verificationDocumentUrl: 'https://source.unsplash.com/random/800x600/?document', lastSeen: new Date(Date.now() - 1000 * 60 * 30), twoFactorEnabled: false, twoFactorSecret: null, referralCode: 'CHARLIE789' },
  { 
    id: 'user-admin', 
    name: 'DigiMarket Admin', 
    email: 'digimarket.admin@gmail.com',
    phone: '0909090909',
    password: 'adminpassword',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin@example.com', 
    role: UserRole.ADMIN, 
    status: UserStatus.ACTIVE, 
    balance: 999999999, 
    createdAt: new Date('2023-01-01'), 
    verificationStatus: VerificationStatus.VERIFIED, 
    emailVerified: true,
    emailVerificationCode: null,
    lastSeen: new Date(),
    permissions: {
        isSuperAdmin: true,
        canManageShop: true,
        canManageUsers: true,
        canManageFinance: true,
    },
    twoFactorEnabled: false, 
    twoFactorSecret: null,
    referralCode: 'ADMIN',
  },
  {
    id: 'user-admin-limited', 
    name: 'Shop Manager', 
    email: 'shop.manager@example.com', 
    phone: '0908080808',
    password: 'password123',
    avatarUrl: 'https://i.pravatar.cc/150?u=shop.manager@example.com', 
    role: UserRole.ADMIN, 
    status: UserStatus.ACTIVE, 
    balance: 0, 
    createdAt: new Date('2023-11-01'), 
    verificationStatus: VerificationStatus.VERIFIED, 
    emailVerified: true,
    emailVerificationCode: null,
    lastSeen: new Date(),
    permissions: {
        isSuperAdmin: false,
        canManageShop: true,
        canManageUsers: false,
        canManageFinance: false,
    },
    twoFactorEnabled: false, 
    twoFactorSecret: null,
    referralCode: 'MANAGER',
  },
  { id: 'user-4', name: 'Diana - Design Hub', email: 'diana@example.com', phone: '0939393939', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=diana@example.com', role: UserRole.SELLER, status: UserStatus.ACTIVE, balance: 12000000, brandName: 'Design Hub', brandDescription: 'Template thiết kế và đồ họa chất lượng cao.', createdAt: new Date('2023-08-20'), verificationStatus: VerificationStatus.VERIFIED, emailVerified: true, emailVerificationCode: null, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3), twoFactorEnabled: false, twoFactorSecret: null, referralCode: 'DIANA101', referredBy: 'user-2' },
];

export const initialCategories: Category[] = [
    { id: 'cat-task', name: 'Làm nhiệm vụ kiếm tiền', slug: 'lam-nhiem-vu', description: 'Survey, social media, app install', icon: 'CheckCircle', color: 'text-green-400' },
    { id: 'cat-survey', name: 'Trả lời khảo sát', slug: 'khao-sat', description: 'Khảo sát, form, research', icon: 'ClipboardList', color: 'text-blue-400' },
    { id: 'cat-graphics', name: 'Thiết kế đồ họa', slug: 'thiet-ke-do-hoa', description: 'Logo, banner, poster, branding', icon: 'Paintbrush', color: 'text-purple-400' },
    { id: 'cat-video', name: 'Video & Animation', slug: 'video-animation', description: 'Video ads, motion graphics, editing', icon: 'Video', color: 'text-red-400' },
    { id: 'cat-tech', name: 'Lập trình & Tech', slug: 'lap-trinh-tech', description: 'Web, app, plugin, automation', icon: 'Code2', color: 'text-indigo-400' },
    { id: 'cat-digital-marketing', name: 'Digital Marketing', slug: 'digital-marketing', description: 'SEO, social media, ads, content', icon: 'Megaphone', color: 'text-green-400' },
    { id: 'cat-ebook', name: 'Khóa học & Ebook', slug: 'khoa-hoc-ebook', description: 'Khóa học online, tài liệu, ebook', icon: 'BookOpen', color: 'text-orange-400' },
    { id: 'cat-templates', name: 'Template & Tools', slug: 'template-tools', description: 'Website template, design assets', icon: 'Sparkles', color: 'text-pink-400' },
    { id: 'cat-facebook', name: 'Dịch vụ Facebook', slug: 'dich-vu-facebook', description: 'Quản lý fanpage, Facebook Ads', icon: 'Facebook', color: 'text-blue-500' },
    { id: 'cat-youtube', name: 'Dịch vụ YouTube', slug: 'dich-vu-youtube', description: 'SEO YouTube, thumbnail, editing', icon: 'Youtube', color: 'text-red-500' },
    { id: 'cat-tiktok', name: 'Dịch vụ TikTok', slug: 'dich-vu-tiktok', description: 'Video TikTok, TikTok Ads', icon: 'Video', color: 'text-fuchsia-400' },
    { id: 'cat-google', name: 'Dịch vụ Google', slug: 'dich-vu-google', description: 'Google Ads, SEO, Analytics', icon: 'Search', color: 'text-teal-400' },
    { id: 'cat-zalo', name: 'Dịch vụ Zalo', slug: 'dich-vu-zalo', description: 'Zalo OA, Zalo Ads, marketing', icon: 'MessageCircle', color: 'text-sky-400' },
    { id: 'cat-email', name: 'Email Marketing', slug: 'email-marketing', description: 'Chiến dịch email, newsletter', icon: 'MailIcon', color: 'text-indigo-400' },
    { id: 'cat-automation', name: 'Tools & Automation', slug: 'tools-automation', description: 'Công cụ tự động hóa, bot', icon: 'Settings', color: 'text-gray-400' },
    { id: 'cat-writing', name: 'Viết lách & Dịch thuật', slug: 'viet-lach-dich-thuat', description: 'Viết bài, content, dịch thuật', icon: 'FilePenLine', color: 'text-slate-400' },
    { id: 'cat-audio', name: 'Âm nhạc & Âm thanh', slug: 'am-nhac-am-thanh', description: 'Sản xuất âm nhạc, lồng tiếng', icon: 'Music', color: 'text-amber-400' },
    { id: 'cat-ai', name: 'Dịch vụ AI', slug: 'dich-vu-ai', description: 'AI artists, chatbots, AI models', icon: 'BrainCircuit', color: 'text-cyan-400' },
    { id: 'cat-business', name: 'Kinh doanh', slug: 'kinh-doanh', description: 'Tư vấn, kế hoạch, pháp lý', icon: 'LineChart', color: 'text-blue-400' },
    { id: 'cat-gaming', name: 'Gaming', slug: 'gaming', description: 'Cày thuê, vật phẩm, tài khoản', icon: 'Gamepad2', color: 'text-violet-400' }
];

// Mock Products
export const mockProducts: Product[] = [
  { 
    id: 'prod-1', name: 'Tài khoản Netflix Premium 1 tháng', sellerId: 'user-2',
    slug: 'tai-khoan-netflix-premium-1-thang',
    description: 'Tài khoản Netflix Premium chính chủ, xem phim 4K không giới hạn.', 
    categoryId: 'cat-video', imageUrl: 'https://source.unsplash.com/random/400x300/?netflix',
    variants: [
        { id: 'v1-1', name: 'Gói 1 tháng', price: 90000, stock: 50 },
        { id: 'v1-2', name: 'Gói 3 tháng', price: 250000, stock: 20 }
    ],
    rating: 4.8, reviews: [{id: 'rev-1', userId: 'user-1', rating: 5, comment: 'Giao hàng nhanh, uy tín!', date: '2023-11-10'}],
    deliveryType: ProductDeliveryType.INVENTORY, status: ProductStatus.APPROVED, createdAt: new Date('2023-10-02'),
    affiliateCommissionRate: 15,
    affiliateCommissionLastUpdated: new Date('2023-10-02')
  },
  { 
    id: 'prod-2', name: 'Key Windows 11 Pro bản quyền', sellerId: 'user-2',
    slug: 'key-windows-11-pro-ban-quyen',
    description: 'Key kích hoạt bản quyền Windows 11 Pro vĩnh viễn.', 
    categoryId: 'cat-tech', imageUrl: 'https://source.unsplash.com/random/400x300/?windows',
    variants: [{ id: 'v2-1', name: 'Bản quyền vĩnh viễn', price: 250000, stock: 150 }],
    rating: 4.9, reviews: [],
    deliveryType: ProductDeliveryType.INVENTORY, status: ProductStatus.APPROVED, createdAt: new Date('2023-10-05'),
    affiliateCommissionRate: 10
  },
  { 
    id: 'prod-3', name: 'Bộ template Powerpoint chuyên nghiệp', sellerId: 'user-4',
    slug: 'bo-template-powerpoint-chuyen-nghiep',
    description: 'Hơn 100 template Powerpoint hiện đại, phù hợp cho mọi ngành nghề.', 
    categoryId: 'cat-templates', imageUrl: 'https://source.unsplash.com/random/400x300/?design',
    variants: [{ id: 'v3-1', name: 'Gói cơ bản', price: 150000, stock: 999 }],
    rating: 4.5, reviews: [],
    deliveryType: ProductDeliveryType.MANUAL, status: ProductStatus.APPROVED, createdAt: new Date('2023-09-01')
  },
  { 
    id: 'prod-4', name: 'Tài khoản Spotify Premium 1 năm', sellerId: 'user-2',
    slug: 'tai-khoan-spotify-premium-1-nam',
    description: 'Nghe nhạc không quảng cáo, chất lượng cao.', 
    categoryId: 'cat-audio', imageUrl: 'https://source.unsplash.com/random/400x300/?spotify',
    variants: [{ id: 'v4-1', name: 'Gói 1 năm', price: 500000, stock: 30 }],
    rating: 4.7, reviews: [],
    deliveryType: ProductDeliveryType.INVENTORY, status: ProductStatus.PENDING, createdAt: new Date('2023-11-12')
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  { 
    id: 'order-101', userId: 'user-1', 
    items: [
        { product: mockProducts[0], variant: mockProducts[0].variants[0], quantity: 1, deliveredItemData: ['user:pass123'] },
        { product: mockProducts[1], variant: mockProducts[1].variants[0], quantity: 1, deliveredItemData: ['ABCDE-FGHIJ-KLMNO-PQRST-UVWXY'] }
    ], 
    total: mockProducts[0].variants[0].price + mockProducts[1].variants[0].price,
    date: '2023-11-10T10:30:00Z', status: OrderStatus.COMPLETED 
  },
  { 
    id: 'order-102', userId: 'user-3', 
    items: [{ product: mockProducts[2], variant: mockProducts[2].variants[0], quantity: 1 }], 
    total: mockProducts[2].variants[0].price, 
    date: '2023-11-11T14:00:00Z', status: OrderStatus.PENDING 
  },
  {
    id: 'order-103', userId: 'user-1',
    items: [{ product: mockProducts[3], variant: mockProducts[3].variants[0], quantity: 2 }], // No delivered data for pending product
    total: mockProducts[3].variants[0].price * 2,
    date: '2023-11-12T18:00:00Z', status: OrderStatus.PENDING
  }
];

// Mock Messages
export const mockMessages: Message[] = [
    { id: 'msg-1', senderId: 'user-1', receiverId: 'user-2', content: 'Chào shop, tài khoản Netflix của mình có vấn đề.', timestamp: new Date(Date.now() - 1000 * 60 * 15), isRead: false, relatedOrderId: 'order-101' },
    { id: 'msg-2', senderId: 'user-2', receiverId: 'user-1', content: 'Chào bạn, bạn vui lòng cung cấp chi tiết lỗi để mình kiểm tra nhé.', timestamp: new Date(Date.now() - 1000 * 60 * 14), isRead: false },
    { id: 'msg-3', senderId: 'user-3', receiverId: 'user-admin', content: 'Tôi cần hỗ trợ về vấn đề nạp tiền.', timestamp: new Date(Date.now() - 1000 * 60 * 60), isRead: true },
    { id: 'msg-4', senderId: 'user-admin', receiverId: 'user-3', content: 'Chào bạn, bộ phận hỗ trợ sẽ liên hệ bạn ngay.', timestamp: new Date(Date.now() - 1000 * 60 * 59), isRead: true },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
    { id: 'notif-1', userId: 'user-1', type: NotificationType.ORDER_UPDATE, title: 'Đơn hàng đã hoàn thành', message: 'Đơn hàng #order-101 của bạn đã được giao.', link: '/order/order-101', isRead: false, timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    { id: 'notif-2', userId: 'user-2', type: NotificationType.NEW_ORDER_SELLER, title: 'Bạn có đơn hàng mới!', message: 'Alice đã mua sản phẩm "Tài khoản Netflix Premium 1 tháng".', link: '/seller/orders', isRead: true, timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    { id: 'notif-3', userId: 'user-1', type: NotificationType.ADMIN_ANNOUNCEMENT, title: 'Bảo trì hệ thống', message: 'Hệ thống sẽ bảo trì vào 2h sáng ngày mai.', link: '#', isRead: true, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

// Mock Complaints
export const mockComplaints: Complaint[] = [
    { id: 'comp-1', userId: 'user-1', orderId: 'order-101', subject: 'Tài khoản Netflix không hoạt động', description: 'Tôi đã mua tài khoản Netflix nhưng không thể đăng nhập được.', status: ComplaintStatus.OPEN, date: '2023-11-10T11:00:00Z' }
];

// Mock Inventory
export const mockInventory: InventoryItem[] = [
    ...Array.from({ length: 50 }, (_, i) => ({ id: `inv-nf-${i}`, productId: 'prod-1', variantId: 'v1-1', data: `netflixuser${i+1}@demo.com:pass123`, status: InventoryItemStatus.AVAILABLE, addedDate: '2023-10-02' })),
    ...Array.from({ length: 150 }, (_, i) => ({ id: `inv-win-${i}`, productId: 'prod-2', variantId: 'v2-1', data: `WINKEY-${Math.random().toString(36).substring(2, 15).toUpperCase()}`, status: InventoryItemStatus.AVAILABLE, addedDate: '2023-10-05' })),
];
// Mark some as sold
mockInventory[0].status = InventoryItemStatus.SOLD;
mockInventory[0].orderId = 'order-101';
mockInventory[51].status = InventoryItemStatus.SOLD;
mockInventory[51].orderId = 'order-101';

export const initialContentPages: ContentPage[] = [
    { id: 'page-1', slug: 'terms-of-service', title: 'Điều khoản dịch vụ', content: '<h1>Điều khoản Dịch vụ</h1><p>Nội dung chi tiết về điều khoản dịch vụ...</p>', lastUpdated: new Date() },
    { id: 'page-2', slug: 'privacy-policy', title: 'Chính sách bảo mật', content: '<h1>Chính sách Bảo mật</h1><p>Nội dung chi tiết về chính sách bảo mật...</p>', lastUpdated: new Date() },
    { id: 'page-3', slug: 'about-us', title: 'Về chúng tôi', content: '<h1>Về chúng tôi</h1><p>DigiMarket là sàn thương mại điện tử...</p>', lastUpdated: new Date() },
];

export const initialSiteNotifications: SiteNotification[] = [
    { id: 'sn-1', message: 'Chào mừng đến với DigiMarket! Nền tảng đang trong giai đoạn thử nghiệm.', isActive: true },
    { id: 'sn-2', message: 'Chương trình khuyến mãi giảm 10% cho tất cả sản phẩm.', isActive: false },
];

export const initialFinancialRequests: FinancialRequest[] = [
    { id: 'fr-1', userId: 'user-2', type: FinancialRequestType.DEPOSIT, amount: 5000000, status: FinancialRequestStatus.APPROVED, date: new Date('2023-11-01'), transactionCode: 'FT231101ABC', processedDate: new Date('2023-11-01') },
    { id: 'fr-2', userId: 'user-1', type: FinancialRequestType.DEPOSIT, amount: 1000000, status: FinancialRequestStatus.PENDING, date: new Date(Date.now() - 1000 * 60 * 60 * 5), transactionCode: 'FT231112XYZ' },
    { id: 'fr-3', userId: 'user-4', type: FinancialRequestType.WITHDRAWAL, amount: 2000000, status: FinancialRequestStatus.REJECTED, date: new Date('2023-11-08'), bankName: 'ACB', accountHolder: 'DIANA DESIGN', accountNumber: '123456789', processedDate: new Date('2023-11-08') },
];

export const initialTransactions: Transaction[] = [
    { id: 'txn-1', userId: 'user-1', type: TransactionType.PURCHASE, amount: -340000, description: 'Thanh toán đơn hàng order-101', date: new Date('2023-11-10'), relatedOrderId: 'order-101' },
    { id: 'txn-2', userId: 'user-2', type: TransactionType.SALE, amount: 323000, description: 'Doanh thu từ đơn hàng order-101', date: new Date('2023-11-10'), relatedOrderId: 'order-101' },
    { id: 'txn-3', userId: 'user-admin', type: TransactionType.FEE, amount: 17000, description: 'Phí từ đơn hàng order-101', date: new Date('2023-11-10'), relatedOrderId: 'order-101' },
    { id: 'txn-4', userId: 'user-2', type: TransactionType.DEPOSIT, amount: 5000000, description: 'Nạp tiền vào ví', date: new Date('2023-11-01'), relatedRequestId: 'fr-1' },
];

export const initialBankAccounts: PlatformBankAccount[] = [
    { id: 'ba-1', bankName: 'Vietcombank', accountHolder: 'DIGIMARKET JOINT STOCK COMPANY', accountNumber: '999988887777', branch: 'Sở Giao Dịch', qrCodeUrl: 'https://img.vietqr.io/image/970436-999988887777-compact.png' },
    { id: 'ba-2', bankName: 'Techcombank', accountHolder: 'DIGIMARKET JOINT STOCK COMPANY', accountNumber: '1903123456789', branch: 'Hội sở chính' },
];

export const initialSystemSettings: SystemSettings = {
    transactionFeePercent: 2,
    platformFeePercent: 5,
    affiliateF1CommissionRate: 10,
    affiliateF2CommissionRate: 5,
};

const mockTaskReview: TaskReview = {
    id: 'tr-1',
    taskId: 'task-1',
    reviewerId: 'user-1',
    rating: 5,
    comment: 'Tuyệt vời, người tạo nhiệm vụ duyệt rất nhanh!',
    date: new Date('2023-11-10'),
};

export const mockTasks: Task[] = [
    {
        id: 'task-1', creatorId: 'user-2', title: 'Đánh giá 5 sao cho ứng dụng "Super App"', description: 'Tải và đánh giá 5 sao cho ứng dụng của chúng tôi trên Google Play.', reward: 10000, quantity: 50, status: TaskStatus.COMPLETED, createdAt: new Date('2023-11-08'), taskType: 'Đánh giá app', timeLimit: 10, requirements: 'Tài khoản Google Play Việt Nam.', instructions: '1. Tìm app "Super App". 2. Tải về và sử dụng 2 phút. 3. Đánh giá 5 sao kèm bình luận tích cực. 4. Chụp màn hình lại.', assigneeId: 'user-1', completionProof: { text: 'Đã hoàn thành', images: ['https://source.unsplash.com/random/400x800/?screenshot'] }, review: mockTaskReview, categoryId: 'cat-task'
    },
    {
        id: 'task-2', creatorId: 'user-4', title: 'Follow trang Instagram @designhub', description: 'Tăng lượng người theo dõi cho trang Instagram của chúng tôi.', reward: 2000, quantity: 200, status: TaskStatus.ACTIVE, createdAt: new Date('2023-11-11'), taskType: 'Social Media', timeLimit: 2, requirements: 'Tài khoản Instagram thật.', instructions: '1. Truy cập @designhub. 2. Nhấn nút Follow. 3. Chụp màn hình đã follow.', categoryId: 'cat-digital-marketing'
    },
    {
        id: 'task-3', creatorId: 'user-1', title: 'Dịch 1 trang văn bản Anh-Việt', description: 'Dịch một trang A4 từ tiếng Anh sang tiếng Việt, chủ đề công nghệ.', reward: 50000, quantity: 5, status: TaskStatus.PENDING_APPROVAL, createdAt: new Date('2023-11-12'), taskType: 'Dịch thuật', timeLimit: 60, requirements: 'Có kinh nghiệm dịch thuật, ngữ pháp tốt.', instructions: 'Văn bản sẽ được cung cấp sau khi nhận nhiệm vụ.', categoryId: 'cat-writing'
    },
];

export const mockAdCampaigns: AdCampaign[] = [
    { id: 'ad-1', itemId: 'prod-1', itemType: 'product', sellerId: 'user-2', status: AdCampaignStatus.ACTIVE, dailyBudget: 20000, bidAmount: 500, totalSpend: 12500, clicks: 25, createdAt: new Date() },
    { id: 'ad-2', itemId: 'task-2', itemType: 'task', sellerId: 'user-4', status: AdCampaignStatus.PAUSED, dailyBudget: 10000, bidAmount: 200, totalSpend: 5000, clicks: 25, createdAt: new Date() },
    { id: 'ad-3', itemId: 'prod-3', itemType: 'product', sellerId: 'user-4', status: AdCampaignStatus.ACTIVE, dailyBudget: 15000, bidAmount: 700, totalSpend: 14900, clicks: 21, createdAt: new Date() },
];

export const initialAds: Ad[] = [
    { id: 'ad-loc-1', locationId: 'tools-sidebar', type: AdType.IMAGE, content: 'https://source.unsplash.com/random/300x450/?advertisement', link: '#', isActive: true },
    { id: 'ad-loc-2', locationId: 'tools-main-bottom', type: AdType.SCRIPT, content: '<div style="background:#222;color:white;text-align:center;padding:20px;height:100%;box-sizing:border-box;"><h3>Đây là quảng cáo Script</h3><p>Nội dung động từ đối tác.</p></div>', isActive: true },
    { id: 'ad-loc-3', locationId: 'tools-right-sidebar', type: AdType.IMAGE, content: 'https://source.unsplash.com/random/300x451/?tech,ad', link: '#', isActive: false },
    { id: 'ad-loc-blog-sidebar', locationId: 'blog-post-sidebar', type: AdType.IMAGE, content: 'https://source.unsplash.com/random/500x500/?business,office', link: '#', isActive: true },
    { id: 'ad-loc-blog-footer', locationId: 'blog-post-footer', type: AdType.SCRIPT, content: '<div style="background:#333;color:white;text-align:center;padding:20px;height:100%;box-sizing:border-box;"><h3>Quảng cáo Script</h3><p>Vị trí chân bài viết blog.</p></div>', isActive: true },
    { id: 'ad-loc-blog-top', locationId: 'blog-post-top-content', type: AdType.IMAGE, content: 'https://source.unsplash.com/random/800x250/?technology,banner', link: '#', isActive: true },
];


export const mockSupportFAQs: FAQCategory[] = [
    {
        category: "Tài khoản",
        icon: "User",
        faqs: [
            { q: "Làm thế nào để thay đổi mật khẩu?", a: "Bạn có thể thay đổi mật khẩu trong trang 'Hồ sơ cá nhân' -> 'Bảo mật'." },
            { q: "Làm sao để xác thực tài khoản (KYC)?", a: "Truy cập 'Hồ sơ cá nhân' -> 'Xác thực tài khoản' và làm theo hướng dẫn để tải lên giấy tờ tùy thân của bạn." },
        ]
    },
    {
        category: "Nạp/Rút tiền",
        icon: "Wallet",
        faqs: [
            { q: "Nạp tiền vào tài khoản mất bao lâu?", a: "Giao dịch nạp tiền thường được xử lý tự động trong vòng 5-10 phút. Nếu sau thời gian này bạn vẫn chưa nhận được tiền, vui lòng liên hệ hỗ trợ." },
            { q: "Phí rút tiền là bao nhiêu?", a: "Phí rút tiền là 2% trên tổng số tiền rút. Vui lòng xem chi tiết tại trang rút tiền." },
        ]
    },
    {
        category: "Bán hàng",
        icon: "Store",
        faqs: [
            { q: "Làm thế nào để đăng sản phẩm?", a: "Sau khi trở thành người bán, bạn có thể truy cập 'Kênh người bán' -> 'Quản lý kho' để thêm sản phẩm mới." },
            { q: "Phí bán hàng trên DigiMarket là bao nhiêu?", a: "Chúng tôi thu phí 5% trên mỗi giao dịch thành công. Không có phí đăng sản phẩm hay phí duy trì." },
        ]
    }
];

// FIX: Add mock blog post data.
export const mockBlogPosts: BlogPost[] = [
    {
        id: 'blog-1',
        title: 'Hướng dẫn trở thành người bán thành công trên DigiMarket',
        slug: 'huong-dan-tro-thanh-nguoi-ban-thanh-cong',
        content: '<h3>Bước 1: Chuẩn bị sản phẩm</h3><p>Sản phẩm số của bạn cần chất lượng và có giá trị...</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam. Proin sed quam. Sed vitae eros. Nam vitae sapien.</p>',
        creatorId: 'user-admin',
        createdAt: new Date('2023-11-10T10:00:00Z'),
        updatedAt: new Date('2023-11-10T10:00:00Z'),
        status: BlogPostStatus.PUBLISHED,
        category: 'Hướng dẫn',
        imageUrl: 'https://source.unsplash.com/random/800x400/?guide,success'
    },
    {
        id: 'blog-2',
        title: '5 mẹo để tăng doanh thu từ Affiliate',
        slug: '5-meo-tang-doanh-thu-affiliate',
        content: '<p>Affiliate marketing là một cách tuyệt vời để kiếm tiền...</p>',
        creatorId: 'user-2', // A seller can write a blog post
        createdAt: new Date('2023-11-12T14:00:00Z'),
        updatedAt: new Date('2023-11-12T14:00:00Z'),
        status: BlogPostStatus.PUBLISHED,
        category: 'Mẹo vặt và Thủ thuật',
        imageUrl: 'https://source.unsplash.com/random/800x400/?marketing,money'
    },
     {
        id: 'blog-3',
        title: 'Cập nhật hệ thống và chính sách mới tháng 12',
        slug: 'cap-nhat-he-thong-thang-12',
        content: '<p>Thông báo về các thay đổi quan trọng sắp tới...</p>',
        creatorId: 'user-admin',
        createdAt: new Date('2023-11-15T09:00:00Z'),
        updatedAt: new Date('2023-11-15T09:00:00Z'),
        status: BlogPostStatus.PUBLISHED,
        category: 'Thông báo',
        imageUrl: 'https://source.unsplash.com/random/800x400/?update,news'
    },
     {
        id: 'blog-4',
        title: 'Bí quyết tối ưu hóa sản phẩm của bạn trên DigiMarket',
        slug: 'bi-quyet-toi-uu-hoa-san-pham',
        content: '<p>Để sản phẩm của bạn nổi bật, hãy chú ý đến hình ảnh, mô tả và giá cả...</p>',
        creatorId: 'user-4',
        createdAt: new Date('2023-11-14T11:00:00Z'),
        updatedAt: new Date('2023-11-14T11:00:00Z'),
        status: BlogPostStatus.PUBLISHED,
        category: 'Hướng dẫn',
        imageUrl: 'https://source.unsplash.com/random/800x400/?optimization,product'
    }
];

export const mockBlogPostComments: BlogPostComment[] = [
    {
        id: 'comment-1',
        postId: 'blog-1',
        userId: 'user-1',
        content: 'Bài viết rất hay và chi tiết. Cảm ơn admin!',
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        status: BlogPostCommentStatus.APPROVED,
    },
    {
        id: 'comment-2',
        postId: 'blog-1',
        userId: 'user-3',
        content: 'Mình đã làm theo và thấy rất hiệu quả. Sẽ tiếp tục ủng hộ DigiMarket.',
        createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
        status: BlogPostCommentStatus.APPROVED,
    },
    {
        id: 'comment-3',
        postId: 'blog-2',
        userId: 'user-1',
        content: 'Cảm ơn vì những mẹo hay! Tôi sẽ thử áp dụng.',
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        status: BlogPostCommentStatus.PENDING,
    },
];

export const initialExchangeRates: ExchangeRates = {
    payeer: { buy: 25000, sell: 25500 },
    paypal: { buy: 24800, sell: 25200 },
    usdt: { buy: 25200, sell: 25600 },
    pm: { buy: 25100, sell: 25400 },
    wmz: { buy: 24900, sell: 25300 },
};

export const initialPlatformBalances: PlatformBalances = {
    payeer: 519.39,
    paypal: 2150.75,
    usdt: 10000.00,
    vnd: 146015130,
};