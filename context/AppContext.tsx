import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import * as T from '../types.ts';
import {
  mockUsers, mockProducts, mockOrders, mockMessages, mockNotifications, mockComplaints, mockInventory,
  initialContentPages, initialSiteNotifications, initialFinancialRequests, initialTransactions,
  initialBankAccounts, initialSystemSettings, mockTasks, mockAdCampaigns, initialAds, mockSupportFAQs, initialCategories,
  initialExchangeRates, initialPlatformBalances, mockBlogPosts, mockBlogPostComments
} from '../utils/mockData.ts';
import { formatCurrency } from '../utils/formatter.ts';
import { generateSecret, verifyToken } from '../utils/totp.ts';

// Helper function to get initial state from localStorage or seed it from mock data
function getInitialState<Type>(key: string, defaultValue: Type): Type {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      // JSON.parse can't revive Date objects, so we need a reviver function.
      return JSON.parse(storedValue, (key, value) => {
        // This regex matches ISO 8601 date strings.
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
          return new Date(value);
        }
        return value;
      });
    }
    // If no value in localStorage, set it with the default and return the default.
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// Custom hook to manage state with localStorage, now with real-time cross-tab synchronization.
function useLocalStorageState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => getInitialState(key, defaultValue));

    // Effect to write state back to localStorage when it changes in this tab
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, state]);
    
    // Effect to listen for changes in other tabs and update state
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    const newState = JSON.parse(e.newValue, (k, value) => {
                        // This regex matches ISO 8601 date strings.
                        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
                          return new Date(value);
                        }
                        return value;
                    });
                    setState(newState);
                } catch (error) {
                    console.error(`Error parsing localStorage key "${key}" on storage event:`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);

    return [state, setState];
}


export interface AppContextType {
  // State
  currentUser: T.User | null;
  users: T.User[];
  products: T.Product[];
  orders: T.Order[];
  messages: T.Message[];
  notifications: T.Notification[];
  complaints: T.Complaint[];
  inventory: T.InventoryItem[];
  inventoryUploadLogs: T.InventoryUploadLog[];
  contentPages: T.ContentPage[];
  siteNotifications: T.SiteNotification[];
  financialRequests: T.FinancialRequest[];
  transactions: T.Transaction[];
  platformBankAccounts: T.PlatformBankAccount[];
  systemSettings: T.SystemSettings;
  tasks: T.Task[];
  adCampaigns: T.AdCampaign[];
  ads: T.Ad[];
  supportFAQs: T.FAQCategory[];
  categories: T.Category[];
  exchangeRates: T.ExchangeRates;
  platformBalances: T.PlatformBalances;
  blogPosts: T.BlogPost[];
  blogPostComments: T.BlogPostComment[];
  
  // Functions
  login: (email: string, password: string) => { success: boolean; message: string; needsVerification?: boolean; email?: string; twoFactorRequired?: boolean; userId?: string; };
  logout: () => void;
  // FIX: Update registerUser signature to accept an optional referredBy property.
  registerUser: (data: { name: string; email: string; phone: string; password: string; referredBy?: string; }) => T.User | null;
  verifyEmail: (email: string, code: string) => { success: boolean; message: string };
  // FIX: Update placeDirectOrder signature to accept an optional referrerId property.
  placeDirectOrder: (product: T.Product, variant: T.ProductVariant, quantity: number, referrerId?: string) => Promise<{ success: boolean, message: string, orderId?: string }>;
  placePreOrder: (product: T.Product, variant: T.ProductVariant, quantity: number) => Promise<{ success: boolean, message: string, orderId?: string }>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  sendMessage: (receiverId: string, content: string, metadata?: { relatedOrderId?: string, complaintId?: string }) => void;
  updateOrderStatus: (orderId: string, status: T.OrderStatus) => void;
  approveProduct: (productId: string) => void;
  rejectProduct: (productId: string) => void;
  updateUser: (userId: string, data: Partial<T.User>) => void;
  deleteUser: (userId: string) => void;
  registerAdmin: (name: string, email: string, permissions: T.AdminPermissions) => { success: boolean, message: string };
  submitVerificationRequest: (userId: string, documentUrl: string) => void;
  processVerification: (userId: string, newStatus: T.VerificationStatus.VERIFIED | T.VerificationStatus.REJECTED) => void;
  updateComplaintStatus: (complaintId: string, status: T.ComplaintStatus) => void;
  resolveComplaint: (complaintId: string, resolution: 'REFUND' | 'REJECT', notes: string) => void;
  sendAdminAnnouncement: (title: string, message: string, link: string, audience: 'all' | 'sellers' | 'buyers') => void;
  addContentPage: (data: Omit<T.ContentPage, 'id' | 'lastUpdated'>) => void;
  updateContentPage: (id: string, data: Omit<T.ContentPage, 'id'| 'lastUpdated'>) => void;
  deleteContentPage: (id: string) => void;
  addSiteNotification: (data: Omit<T.SiteNotification, 'id'>) => void;
  updateSiteNotification: (id: string, data: Partial<Omit<T.SiteNotification, 'id'>>) => void;
  deleteSiteNotification: (id: string) => void;
  createFinancialRequest: (data: { type: T.FinancialRequestType; amount: number; transactionCode?: string; bankName?: string; accountNumber?: string; accountHolder?: string; }) => { success: boolean, message: string };
  processFinancialRequest: (id: string, status: T.FinancialRequestStatus.APPROVED | T.FinancialRequestStatus.REJECTED) => void;
  addPlatformBankAccount: (data: Omit<T.PlatformBankAccount, 'id'>) => void;
  updatePlatformBankAccount: (id: string, data: Omit<T.PlatformBankAccount, 'id'>) => void;
  deletePlatformBankAccount: (id: string) => void;
  updateSystemSettings: (settings: T.SystemSettings) => void;
  becomeSeller: (brandName: string, brandDescription?: string) => void;
  uploadInventoryFile: (data: { productId: string, variantId: string, fileName: string, fileContent: string }) => { success: boolean, message: string };
  deleteAllInventoryForVariant: (productId: string, variantId: string) => void;
  addProduct: (productData: Omit<T.Product, 'id' | 'sellerId' | 'rating' | 'reviews' | 'status' | 'createdAt'>) => void;
  updateProduct: (productId: string, productData: Partial<T.Product>) => void;
  deleteProduct: (productId: string) => void;
  createTask: (taskData: Omit<T.Task, 'id' | 'creatorId' | 'status' | 'createdAt' | 'assigneeId' | 'completionProof' | 'review'>) => { success: boolean, message: string };
  approveTask: (taskId: string) => void;
  rejectTask: (taskId: string) => void;
  acceptTask: (taskId: string) => { success: boolean, message: string };
  submitTaskProof: (taskId: string, proof: { text?: string, images?: string[] }) => { success: boolean, message: string };
  approveTaskCompletion: (taskId: string) => void;
  rejectTaskCompletion: (taskId: string) => void;
  submitTaskReview: (taskId: string, rating: number, comment: string) => { success: boolean, message: string };
  updateAdminPermissions: (userId: string, permissions: T.AdminPermissions) => void;
  createAdCampaign: (data: { itemId: string; itemType: 'product' | 'task'; dailyBudget: number; bidAmount: number; }) => { success: boolean; message: string };
  updateAdCampaign: (campaignId: string, data: { dailyBudget?: number; bidAmount?: number; }) => { success: boolean; message: string };
  pauseAdCampaign: (campaignId: string) => void;
  resumeAdCampaign: (campaignId: string) => void;
  getSponsoredItems: (count: number, categoryId?: string) => (T.Product | T.Task)[];
  generateTwoFactorSecret: (userId: string) => Promise<{ success: boolean; message: string; secret?: string; otpauthUrl?: string; }>;
  verifyAndEnableTwoFactor: (userId: string, token: string) => Promise<{ success: boolean; message: string; }>;
  disableTwoFactor: (userId: string, token: string) => Promise<{ success: boolean; message: string; }>;
  verifyLoginToken: (userId: string, token: string) => Promise<{ success: boolean; message: string; }>;
  updateAd: (adId: string, data: Partial<Omit<T.Ad, 'id'>>) => void;
  sendAdminSupportNotification: (message: string) => void;
  addCategory: (categoryData: Omit<T.Category, 'id'>) => void;
  updateCategory: (categoryId: string, categoryData: Omit<T.Category, 'id'>) => void;
  deleteCategory: (categoryId: string) => void;
  updateExchangeRates: (newRates: T.ExchangeRates) => void;
  updatePlatformBalances: (newBalances: T.PlatformBalances) => void;
  createExchangeRequest: (details: T.ExchangeDetails, transactionCode?: string) => { success: boolean, message: string };
  changePassword: (userId: string, currentPassword: string, newPassword: string) => { success: boolean; message: string; };
  // FIX: Add blog post related properties.
  addBlogPost: (postData: Omit<T.BlogPost, 'id' | 'creatorId' | 'createdAt' | 'updatedAt' | 'status' | 'slug'>) => void;
  updateBlogPost: (postId: string, postData: Partial<Omit<T.BlogPost, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>>) => void;
  deleteBlogPost: (postId: string) => void;
  addBlogPostComment: (postId: string, content: string) => { success: boolean; message: string };
  approveBlogPostComment: (commentId: string) => void;
  deleteBlogPostComment: (commentId: string) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

// A hook to store the previous value of a prop or state.
function usePrevious<Type>(value: Type): Type | undefined {
    const ref = useRef<Type | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const playNotificationSound = () => {
    // A short, simple notification sound as a base64 data URI (WAV format for better browser compatibility)
    const sound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18=");
    sound.play().catch(error => console.error("Error playing sound:", error));
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useLocalStorageState<T.User | null>('currentUser', null);
    const [users, setUsers] = useLocalStorageState<T.User[]>('users', mockUsers);
    const [products, setProducts] = useLocalStorageState<T.Product[]>('products', mockProducts);
    const [orders, setOrders] = useLocalStorageState<T.Order[]>('orders', mockOrders);
    const [messages, setMessages] = useLocalStorageState<T.Message[]>('messages', mockMessages);
    const [notifications, setNotifications] = useLocalStorageState<T.Notification[]>('notifications', mockNotifications);
    const [complaints, setComplaints] = useLocalStorageState<T.Complaint[]>('complaints', mockComplaints);
    const [inventory, setInventory] = useLocalStorageState<T.InventoryItem[]>('inventory', mockInventory);
    const [inventoryUploadLogs, setInventoryUploadLogs] = useLocalStorageState<T.InventoryUploadLog[]>('inventoryUploadLogs', []);
    const [contentPages, setContentPages] = useLocalStorageState<T.ContentPage[]>('contentPages', initialContentPages);
    const [siteNotifications, setSiteNotifications] = useLocalStorageState<T.SiteNotification[]>('siteNotifications', initialSiteNotifications);
    const [financialRequests, setFinancialRequests] = useLocalStorageState<T.FinancialRequest[]>('financialRequests', initialFinancialRequests);
    const [transactions, setTransactions] = useLocalStorageState<T.Transaction[]>('transactions', initialTransactions);
    const [platformBankAccounts, setPlatformBankAccounts] = useLocalStorageState<T.PlatformBankAccount[]>('platformBankAccounts', initialBankAccounts);
    const [systemSettings, setSystemSettings] = useLocalStorageState<T.SystemSettings>('systemSettings', initialSystemSettings);
    const [tasks, setTasks] = useLocalStorageState<T.Task[]>('tasks', mockTasks);
    const [adCampaigns, setAdCampaigns] = useLocalStorageState<T.AdCampaign[]>('adCampaigns', mockAdCampaigns);
    const [ads, setAds] = useLocalStorageState<T.Ad[]>('ads', initialAds);
    const [supportFAQs, setSupportFAQs] = useLocalStorageState<T.FAQCategory[]>('supportFAQs', mockSupportFAQs);
    const [categories, setCategories] = useLocalStorageState<T.Category[]>('categories', initialCategories);
    const [exchangeRates, setExchangeRates] = useLocalStorageState<T.ExchangeRates>('exchangeRates', initialExchangeRates);
    const [platformBalances, setPlatformBalances] = useLocalStorageState<T.PlatformBalances>('platformBalances', initialPlatformBalances);
    const [blogPosts, setBlogPosts] = useLocalStorageState<T.BlogPost[]>('blogPosts', mockBlogPosts);
    const [blogPostComments, setBlogPostComments] = useLocalStorageState<T.BlogPostComment[]>('blogPostComments', mockBlogPostComments);

    const previousNotifications = usePrevious(notifications);

    useEffect(() => {
        if (currentUser && previousNotifications && notifications.length > previousNotifications.length) {
            const newNotifications = notifications.slice(previousNotifications.length);
            if (newNotifications.some(n => n.userId === currentUser.id && !n.isRead)) {
                playNotificationSound();
            }
        }
    }, [notifications, previousNotifications, currentUser]);

    // --- AUTH ---
    const login = useCallback((email: string, password: string): { success: boolean; message: string; needsVerification?: boolean; email?: string; twoFactorRequired?: boolean; userId?: string; } => {
        const user = users.find(u => u.email === email);
        
        if (!user || user.password !== password) {
            return { success: false, message: 'Email hoặc mật khẩu không đúng.' };
        }
    
        if (!user.emailVerified) {
            return { success: false, message: 'Tài khoản của bạn chưa được xác minh email.', needsVerification: true, email: user.email };
        }
    
        if (user.twoFactorEnabled) {
            return { success: true, message: "Yêu cầu xác thực hai yếu tố.", twoFactorRequired: true, userId: user.id };
        }

        setCurrentUser(user);
        return { success: true, message: 'Đăng nhập thành công' };
    }, [users, setCurrentUser]);

    const logout = useCallback(() => {
        setCurrentUser(null);
    }, [setCurrentUser]);

    // FIX: Updated function signature to accept `referredBy` and added `referralCode` to the new user object.
    const registerUser = useCallback((data: { name: string; email: string; phone: string; password: string; referredBy?: string; }): T.User | null => {
        if (users.some(u => u.email === data.email)) {
            return null;
        }
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser: T.User = {
            id: `user-${Date.now()}`,
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
            role: T.UserRole.BUYER,
            status: T.UserStatus.ACTIVE,
            balance: 0,
            createdAt: new Date(),
            verificationStatus: T.VerificationStatus.NOT_VERIFIED,
            emailVerified: false,
            emailVerificationCode: verificationCode,
            lastSeen: new Date(),
            referralCode: data.name.toUpperCase().replace(/\s/g, '') + Math.floor(100 + Math.random() * 900),
            referredBy: data.referredBy,
        };
        setUsers(prev => [...prev, newUser]);
        
        // Simulate sending email for this demo
        alert(`Đăng ký thành công! Mã xác minh của bạn là: ${verificationCode}\n(Đây là bản demo, mã được hiển thị ở đây thay vì gửi qua email)`);

        return newUser;
    }, [users, setUsers]);
    
    const verifyEmail = useCallback((email: string, code: string): { success: boolean; message: string } => {
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) {
            return { success: false, message: 'Email không tồn tại.' };
        }
        
        const user = users[userIndex];
        if (user.emailVerificationCode === code) {
            const updatedUser = { ...user, emailVerified: true, emailVerificationCode: null };
            setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            setCurrentUser(updatedUser); // Automatically log the user in
            return { success: true, message: 'Xác minh email thành công!' };
        } else {
            return { success: false, message: 'Mã xác minh không chính xác.' };
        }
    }, [users, setUsers, setCurrentUser]);
    
    // --- USER ACTIONS ---
    const updateUser = useCallback((userId: string, data: Partial<T.User>) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
        if (currentUser && currentUser.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, ...data } : null);
        }
    }, [setUsers, currentUser, setCurrentUser]);

    const deleteUser = useCallback((userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    }, [setUsers]);

    const becomeSeller = useCallback((brandName: string, brandDescription?: string) => {
        if (currentUser) {
            updateUser(currentUser.id, {
                role: T.UserRole.SELLER,
                brandName,
                brandDescription,
            });
        }
    }, [currentUser, updateUser]);

    const changePassword = useCallback((userId: string, currentPassword: string, newPassword: string): { success: boolean; message: string; } => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'Người dùng không tồn tại.' };
        }

        const user = users[userIndex];
        if (user.password !== currentPassword) {
            return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
        }

        const updatedUser = { ...user, password: newPassword };
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));

        if (currentUser && currentUser.id === userId) {
            setCurrentUser(updatedUser);
        }

        return { success: true, message: 'Đổi mật khẩu thành công!' };
    }, [users, setUsers, currentUser, setCurrentUser]);
    
    // --- NOTIFICATIONS & MESSAGES ---
    const markNotificationAsRead = useCallback((notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    }, [setNotifications]);

    const markAllNotificationsAsRead = useCallback((userId: string) => {
        setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
    }, [setNotifications]);

    const sendMessage = useCallback((receiverId: string, content: string, metadata?: { relatedOrderId?: string, complaintId?: string }) => {
        if (!currentUser) return;
        const newMessage: T.Message = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            receiverId,
            content,
            timestamp: new Date(),
            isRead: false,
            ...metadata,
        };
        setMessages(prev => [...prev, newMessage]);
    }, [currentUser, setMessages]);
    
    const sendAdminSupportNotification = useCallback((message: string) => {
        if (!currentUser) return;

        const admins = users.filter(u => u.role === T.UserRole.ADMIN);
        const newNotifications: T.Notification[] = admins.map(admin => ({
            id: `notif-support-${Date.now()}-${admin.id}`,
            userId: admin.id,
            type: T.NotificationType.SUPPORT_REQUEST,
            title: 'Yêu cầu hỗ trợ mới',
            message: message,
            link: `/messages?user=${currentUser.id}`,
            isRead: false,
            timestamp: new Date(),
        }));
        setNotifications(prev => [...prev, ...newNotifications]);
    }, [currentUser, users, setNotifications]);

    // --- ORDERING ---
    // FIX: Updated function signature to accept an optional `referrerId`.
    const placeDirectOrder = useCallback(async (product: T.Product, variant: T.ProductVariant, quantity: number, referrerId?: string): Promise<{ success: boolean, message: string, orderId?: string }> => {
        if (!currentUser) return { success: false, message: 'Bạn cần đăng nhập để mua hàng.' };

        const totalCost = variant.price * quantity;

        if (currentUser.balance < totalCost) {
            return { success: false, message: 'Số dư không đủ.' };
        }

        let deliveredItemData: string[] | undefined = undefined;
        let itemsToDeliverIds = new Set<string>();

        if (product.deliveryType === T.ProductDeliveryType.INVENTORY) {
            const availableItems = inventory.filter(i => i.productId === product.id && i.variantId === variant.id && i.status === T.InventoryItemStatus.AVAILABLE);
            if (availableItems.length < quantity) {
                return { success: false, message: `Không đủ hàng trong kho. Chỉ còn lại ${availableItems.length}.` };
            }
            const itemsToDeliver = availableItems.slice(0, quantity);
            deliveredItemData = itemsToDeliver.map(i => i.data);
            itemsToDeliverIds = new Set(itemsToDeliver.map(i => i.id));
        }

        const newOrderId = `order-${Date.now()}`;

        setInventory(prev => prev.map(item =>
            itemsToDeliverIds.has(item.id)
                ? { ...item, status: T.InventoryItemStatus.SOLD, orderId: newOrderId }
                : item
        ));

        setProducts(prev => prev.map(p => {
            if (p.id === product.id) {
                return {
                    ...p,
                    variants: p.variants.map(v => v.id === variant.id ? { ...v, stock: v.stock - quantity } : v)
                };
            }
            return p;
        }));

        const seller = users.find(u => u.id === product.sellerId);
        if (!seller) return { success: false, message: 'Lỗi: Không tìm thấy người bán.' };
        
        const platformFee = totalCost * (systemSettings.platformFeePercent / 100);
        const transactionFee = totalCost * (systemSettings.transactionFeePercent / 100);
        const sellerRevenue = totalCost - platformFee - transactionFee;
        const adminRevenue = platformFee + transactionFee;
        const admin = users.find(u => u.role === T.UserRole.ADMIN);

        setUsers(prev => prev.map(u => {
            if (u.id === currentUser.id) return { ...u, balance: u.balance - totalCost };
            if (u.id === seller.id) return { ...u, balance: u.balance + sellerRevenue };
            if (admin && u.id === admin.id) return { ...u, balance: u.balance + adminRevenue };
            return u;
        }));
        setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - totalCost } : null);

        const newTransactions: T.Transaction[] = [
            { id: `txn-${Date.now()}-buy`, userId: currentUser.id, type: T.TransactionType.PURCHASE, amount: -totalCost, description: `Thanh toán đơn hàng ${newOrderId}`, date: new Date(), relatedOrderId: newOrderId },
            { id: `txn-${Date.now()}-sell`, userId: seller.id, type: T.TransactionType.SALE, amount: sellerRevenue, description: `Doanh thu từ đơn hàng ${newOrderId}`, date: new Date(), relatedOrderId: newOrderId }
        ];
        if (admin) {
             newTransactions.push({ id: `txn-${Date.now()}-fee`, userId: admin.id, type: T.TransactionType.FEE, amount: adminRevenue, description: `Phí từ đơn hàng ${newOrderId}`, date: new Date(), relatedOrderId: newOrderId });
        }
        
        // FIX: Added affiliate commission logic.
        if (referrerId && product.affiliateCommissionRate && product.affiliateCommissionRate > 0) {
            const referrer = users.find(u => u.referralCode === referrerId || u.id === referrerId);
            if (referrer && referrer.id !== currentUser.id && referrer.id !== seller.id) {
                const commissionAmount = totalCost * (product.affiliateCommissionRate / 100);
                
                // Update referrer's balance
                setUsers(prev => prev.map(u => {
                    if (u.id === referrer.id) return { ...u, balance: u.balance + commissionAmount };
                    return u;
                }));

                // Add transaction for commission
                newTransactions.push({ 
                    id: `txn-${Date.now()}-aff`, 
                    userId: referrer.id, 
                    type: T.TransactionType.AFFILIATE_COMMISSION, 
                    amount: commissionAmount, 
                    description: `Hoa hồng giới thiệu từ đơn hàng ${newOrderId}`, 
                    date: new Date(), 
                    relatedOrderId: newOrderId,
                    sourceUserId: currentUser.id
                });
            }
        }

        setTransactions(prev => [...prev, ...newTransactions]);

        const newOrder: T.Order = { id: newOrderId, userId: currentUser.id, items: [{ product, variant, quantity, deliveredItemData }], total: totalCost, date: new Date().toISOString(), status: T.OrderStatus.COMPLETED };
        setOrders(prev => [...prev, newOrder]);

        const buyerNotif: T.Notification = { id: `notif-${Date.now()}-b`, userId: currentUser.id, type: T.NotificationType.ORDER_UPDATE, title: 'Đơn hàng đã hoàn thành', message: `Đơn hàng #${newOrderId} đã được giao thành công.`, link: `/order/${newOrderId}`, isRead: false, timestamp: new Date() };
        const sellerNotif: T.Notification = { id: `notif-${Date.now()}-s`, userId: seller.id, type: T.NotificationType.NEW_ORDER_SELLER, title: 'Bạn có đơn hàng mới!', message: `${currentUser.name} đã mua sản phẩm "${product.name}".`, link: `/seller/orders`, isRead: false, timestamp: new Date() };
        setNotifications(prev => [...prev, buyerNotif, sellerNotif]);

        return { success: true, message: 'Thanh toán thành công!', orderId: newOrderId };
    }, [currentUser, inventory, users, systemSettings, setUsers, setCurrentUser, setInventory, setProducts, setOrders, setTransactions, setNotifications]);

    const placePreOrder = useCallback(async (product: T.Product, variant: T.ProductVariant, quantity: number): Promise<{ success: boolean, message: string, orderId?: string }> => {
        if (!currentUser) return { success: false, message: 'Bạn cần đăng nhập để đặt trước.' };

        const totalCost = variant.price * quantity;

        if (currentUser.balance < totalCost) {
            return { success: false, message: 'Số dư không đủ để đặt trước.' };
        }
        
        const newOrderId = `order-${Date.now()}`;

        const seller = users.find(u => u.id === product.sellerId);
        if (!seller) return { success: false, message: 'Lỗi: Không tìm thấy người bán.' };
        
        const platformFee = totalCost * (systemSettings.platformFeePercent / 100);
        const transactionFee = totalCost * (systemSettings.transactionFeePercent / 100);
        const sellerRevenue = totalCost - platformFee - transactionFee;
        const adminRevenue = platformFee + transactionFee;
        const admin = users.find(u => u.role === T.UserRole.ADMIN);

        setUsers(prev => prev.map(u => {
            if (u.id === currentUser.id) return { ...u, balance: u.balance - totalCost };
            if (u.id === seller.id) return { ...u, balance: u.balance + sellerRevenue };
            if (admin && u.id === admin.id) return { ...u, balance: u.balance + adminRevenue };
            return u;
        }));
        setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - totalCost } : null);

        const newTransactions: T.Transaction[] = [
            { id: `txn-${Date.now()}-pre-buy`, userId: currentUser.id, type: T.TransactionType.PURCHASE, amount: -totalCost, description: `Thanh toán đặt trước đơn hàng ${newOrderId}`, date: new Date(), relatedOrderId: newOrderId },
            { id: `txn-${Date.now()}-pre-sell`, userId: seller.id, type: T.TransactionType.SALE, amount: sellerRevenue, description: `Doanh thu từ đặt trước đơn hàng ${newOrderId}`, date: new Date(), relatedOrderId: newOrderId }
        ];
        if (admin) {
             newTransactions.push({ id: `txn-${Date.now()}-pre-fee`, userId: admin.id, type: T.TransactionType.FEE, amount: adminRevenue, description: `Phí từ đặt trước đơn hàng ${newOrderId}`, date: new Date(), relatedOrderId: newOrderId });
        }
        setTransactions(prev => [...prev, ...newTransactions]);

        const newOrder: T.Order = { 
            id: newOrderId, 
            userId: currentUser.id, 
            items: [{ product, variant, quantity }],
            total: totalCost, 
            date: new Date().toISOString(), 
            status: T.OrderStatus.PRE_ORDER 
        };
        setOrders(prev => [...prev, newOrder]);

        const buyerNotif: T.Notification = { id: `notif-${Date.now()}-pre-b`, userId: currentUser.id, type: T.NotificationType.ORDER_UPDATE, title: 'Đặt trước thành công', message: `Bạn đã đặt trước thành công đơn hàng #${newOrderId}.`, link: `/order/${newOrderId}`, isRead: false, timestamp: new Date() };
        const sellerNotif: T.Notification = { id: `notif-${Date.now()}-pre-s`, userId: seller.id, type: T.NotificationType.NEW_ORDER_SELLER, title: 'Bạn có đơn đặt trước mới!', message: `${currentUser.name} đã đặt trước sản phẩm "${product.name}".`, link: `/seller/orders`, isRead: false, timestamp: new Date() };
        setNotifications(prev => [...prev, buyerNotif, sellerNotif]);

        return { success: true, message: 'Đặt trước thành công! Chúng tôi sẽ thông báo khi hàng về.', orderId: newOrderId };
    }, [currentUser, users, systemSettings, setUsers, setCurrentUser, setOrders, setTransactions, setNotifications]);

    const updateOrderStatus = useCallback((orderId: string, status: T.OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }, [setOrders]);
    
    // --- ADMIN ACTIONS ---
    const approveProduct = useCallback((productId: string) => setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: T.ProductStatus.APPROVED } : p)), [setProducts]);
    const rejectProduct = useCallback((productId: string) => setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: T.ProductStatus.REJECTED } : p)), [setProducts]);
    const registerAdmin = useCallback((name: string, email: string, permissions: T.AdminPermissions) => {
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'Email đã tồn tại.' };
        }
        // FIX: Added missing 'referralCode' property to the Admin object.
        const newAdmin: T.User = { id: `user-${Date.now()}`, name, email, avatarUrl: `https://i.pravatar.cc/150?u=${email}`, role: T.UserRole.ADMIN, status: T.UserStatus.ACTIVE, balance: 0, createdAt: new Date(), verificationStatus: T.VerificationStatus.VERIFIED, emailVerified: true, emailVerificationCode: null, lastSeen: new Date(), permissions, referralCode: name.toUpperCase().replace(/\s/g, '') + 'ADMIN' };
        setUsers(prev => [...prev, newAdmin]);
        return { success: true, message: 'Tạo tài khoản Quản trị viên thành công.' };
    }, [users, setUsers]);
    const updateAdminPermissions = useCallback((userId: string, permissions: T.AdminPermissions) => {
        updateUser(userId, { permissions });
    }, [updateUser]);
    const submitVerificationRequest = useCallback((userId: string, documentUrl: string) => {
        updateUser(userId, { verificationStatus: T.VerificationStatus.PENDING, verificationDocumentUrl: documentUrl });
    }, [updateUser]);
    const processVerification = useCallback((userId: string, newStatus: T.VerificationStatus.VERIFIED | T.VerificationStatus.REJECTED) => {
        updateUser(userId, { verificationStatus: newStatus });
    }, [updateUser]);
    const updateComplaintStatus = useCallback((complaintId: string, status: T.ComplaintStatus) => {
        setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status } : c));
    }, [setComplaints]);
    const resolveComplaint = useCallback((complaintId: string, resolution: 'REFUND' | 'REJECT', notes: string) => {
        // Implement refund logic later if needed
        setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: T.ComplaintStatus.RESOLVED, resolutionNotes: `[${resolution}] ${notes}` } : c));
    }, [setComplaints]);
    const sendAdminAnnouncement = useCallback((title: string, message: string, link: string, audience: 'all' | 'sellers' | 'buyers') => {
        let targetUsers = users;
        if (audience === 'sellers') targetUsers = users.filter(u => u.role === T.UserRole.SELLER);
        if (audience === 'buyers') targetUsers = users.filter(u => u.role === T.UserRole.BUYER);
        
        const newNotifs = targetUsers.map(user => ({
            id: `notif-admin-${Date.now()}-${user.id}`,
            userId: user.id,
            type: T.NotificationType.ADMIN_ANNOUNCEMENT,
            title,
            message,
            link,
            isRead: false,
            timestamp: new Date()
        }));
        setNotifications(prev => [...prev, ...newNotifs]);
    }, [users, setNotifications]);
    
    // --- CRUD ---
    const addContentPage = useCallback((data: Omit<T.ContentPage, 'id' | 'lastUpdated'>) => setContentPages(prev => [...prev, { id: `page-${Date.now()}`, ...data, lastUpdated: new Date() }]), [setContentPages]);
    const updateContentPage = useCallback((id: string, data: Omit<T.ContentPage, 'id'| 'lastUpdated'>) => setContentPages(prev => prev.map(p => p.id === id ? { id, ...data, lastUpdated: new Date() } : p)), [setContentPages]);
    const deleteContentPage = useCallback((id: string) => setContentPages(prev => prev.filter(p => p.id !== id)), [setContentPages]);

    const addSiteNotification = useCallback((data: Omit<T.SiteNotification, 'id'>) => setSiteNotifications(prev => [...prev, { id: `sn-${Date.now()}`, ...data }]), [setSiteNotifications]);
    const updateSiteNotification = useCallback((id: string, data: Partial<Omit<T.SiteNotification, 'id'>>) => setSiteNotifications(prev => prev.map(n => n.id === id ? { ...n, ...data } : n)), [setSiteNotifications]);
    const deleteSiteNotification = useCallback((id: string) => setSiteNotifications(prev => prev.filter(n => n.id !== id)), [setSiteNotifications]);

    // FIX: Add blog post CRUD functions.
    const addBlogPost = useCallback((postData: Omit<T.BlogPost, 'id' | 'creatorId' | 'createdAt' | 'updatedAt' | 'status' | 'slug'>) => {
        if (!currentUser) return;
        const slug = postData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const newPost: T.BlogPost = {
            id: `blog-${Date.now()}`,
            slug: `${slug}-${Date.now()}`, // Ensure unique slug
            creatorId: currentUser.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: T.BlogPostStatus.DRAFT,
            ...postData,
        };
        setBlogPosts(prev => [...prev, newPost]);
    }, [currentUser, setBlogPosts]);
    
    const updateBlogPost = useCallback((postId: string, postData: Partial<Omit<T.BlogPost, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>>) => {
        setBlogPosts(prev => prev.map(p => p.id === postId ? { ...p, ...postData, updatedAt: new Date() } : p));
    }, [setBlogPosts]);

    const deleteBlogPost = useCallback((postId: string) => {
        setBlogPosts(prev => prev.filter(p => p.id !== postId));
    }, [setBlogPosts]);

    const approveBlogPostComment = useCallback((commentId: string) => {
        setBlogPostComments(prev => prev.map(c => c.id === commentId ? { ...c, status: T.BlogPostCommentStatus.APPROVED } : c));
    }, [setBlogPostComments]);
    
    const deleteBlogPostComment = useCallback((commentId: string) => {
        setBlogPostComments(prev => prev.filter(c => c.id !== commentId));
    }, [setBlogPostComments]);

    const addBlogPostComment = useCallback((postId: string, content: string): { success: boolean, message: string } => {
        if (!currentUser) return { success: false, message: 'Bạn cần đăng nhập để bình luận.' };

        // Spam check for links
        const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/;
        if (linkRegex.test(content)) {
            return { success: false, message: 'Bình luận không được chứa liên kết.' };
        }

        const newComment: T.BlogPostComment = {
            id: `comment-${Date.now()}`,
            postId,
            userId: currentUser.id,
            content,
            createdAt: new Date(),
            status: T.BlogPostCommentStatus.PENDING, // Default to pending
        };
        setBlogPostComments(prev => [...prev, newComment]);

        // Notify post author
        const post = blogPosts.find(p => p.id === postId);
        if (post && post.creatorId !== currentUser.id) {
            const authorNotification: T.Notification = {
                id: `notif-comment-${Date.now()}`,
                userId: post.creatorId,
                type: T.NotificationType.NEW_MESSAGE, // Re-using for simplicity, could add a new type
                title: 'Bình luận mới cần duyệt',
                message: `${currentUser.name} đã bình luận về bài viết "${post.title}".`,
                link: '/profile#comments', // Link to the new comment management tab
                isRead: false,
                timestamp: new Date(),
            };
            setNotifications(prev => [...prev, authorNotification]);
        }
        
        return { success: true, message: 'Bình luận của bạn đã được gửi và đang chờ duyệt.' };
    }, [currentUser, setBlogPostComments, blogPosts, setNotifications]);

    // --- FINANCIAL ---
    const createFinancialRequest = useCallback((data: { type: T.FinancialRequestType; amount: number; transactionCode?: string; bankName?: string; accountNumber?: string; accountHolder?: string; }) => {
        if (!currentUser) return { success: false, message: 'Lỗi người dùng' };
        const newRequest: T.FinancialRequest = {
            id: `fr-${Date.now()}`,
            userId: currentUser.id,
            status: T.FinancialRequestStatus.PENDING,
            date: new Date(),
            ...data
        };
        setFinancialRequests(prev => [...prev, newRequest]);
        
        // Notify admins
        const admins = users.filter(u => u.role === T.UserRole.ADMIN);
        const newNotifications: T.Notification[] = admins.map(admin => ({
            id: `notif-fr-${Date.now()}-${admin.id}`,
            userId: admin.id,
            type: T.NotificationType.FINANCIAL_REQUEST_PENDING,
            title: `Yêu cầu ${data.type} mới`,
            message: `${currentUser.name} đã gửi yêu cầu ${data.type.toLowerCase()} ${formatCurrency(data.amount)}.`,
            link: '/admin/financial-requests',
            isRead: false,
            timestamp: new Date(),
        }));
        setNotifications(prev => [...prev, ...newNotifications]);

        return { success: true, message: 'Yêu cầu của bạn đã được gửi. Quản trị viên sẽ xử lý trong thời gian sớm nhất.' };
    }, [currentUser, setFinancialRequests, users, setNotifications]);

    const processFinancialRequest = useCallback((id: string, status: T.FinancialRequestStatus.APPROVED | T.FinancialRequestStatus.REJECTED) => {
        setFinancialRequests(prevRequests => {
            const request = prevRequests.find(r => r.id === id && r.status === T.FinancialRequestStatus.PENDING);
            if (!request) {
                console.warn(`Financial request ${id} not found or not in pending state.`);
                return prevRequests;
            }

            if (status === T.FinancialRequestStatus.APPROVED) {
                if (request.type === T.FinancialRequestType.DEPOSIT || request.type === T.FinancialRequestType.WITHDRAWAL) {
                    const amount = request.type === T.FinancialRequestType.DEPOSIT ? request.amount : -request.amount;
                    
                    setUsers(prevUsers => prevUsers.map(u => u.id === request.userId ? { ...u, balance: u.balance + amount } : u));
                    
                    setCurrentUser(prevCurrentUser => {
                        if (prevCurrentUser && prevCurrentUser.id === request.userId) {
                            return { ...prevCurrentUser, balance: prevCurrentUser.balance + amount };
                        }
                        return prevCurrentUser;
                    });
            
                    setTransactions(prevTransactions => [
                        ...prevTransactions, 
                        { 
                            id: `txn-${Date.now()}`, 
                            userId: request.userId, 
                            type: request.type === T.FinancialRequestType.DEPOSIT ? T.TransactionType.DEPOSIT : T.TransactionType.WITHDRAWAL,
                            amount: amount, 
                            description: `Yêu cầu #${request.id} được duyệt`, 
                            date: new Date(), 
                            relatedRequestId: request.id 
                        }
                    ]);
                } else if (request.type === T.FinancialRequestType.EXCHANGE && request.exchangeDetails) {
                    const details = request.exchangeDetails;
                    if (details.direction === 'buy') {
                        // User bought digital currency from platform. Admin confirmed they received VND.
                        // Now, deduct digital currency from platform and "send" to user (simulation).
                        setPlatformBalances(prev => ({
                            ...prev,
                            [details.currency.toLowerCase() as keyof T.PlatformBalances]: prev[details.currency.toLowerCase() as keyof T.PlatformBalances] - details.usdAmount
                        }));
                    } else { // 'sell'
                        // User sold digital currency to platform. Admin confirmed they received digital currency.
                        // Now, send VND to user's bank account (simulation: add to user balance, deduct from platform VND).
                        setUsers(prevUsers => prevUsers.map(u => u.id === request.userId ? { ...u, balance: u.balance + details.vndAmount } : u));
                        setCurrentUser(prevCurrentUser => {
                            if (prevCurrentUser && prevCurrentUser.id === request.userId) {
                                return { ...prevCurrentUser, balance: prevCurrentUser.balance + details.vndAmount };
                            }
                            return prevCurrentUser;
                        });
                        setPlatformBalances(prev => ({ ...prev, vnd: prev.vnd - details.vndAmount }));
                    }
                }
            }
            return prevRequests.map(r => r.id === id ? { ...r, status, processedDate: new Date() } : r);
        });
    }, [setFinancialRequests, setUsers, setTransactions, setCurrentUser, setPlatformBalances]);
    
    const addPlatformBankAccount = useCallback((data: Omit<T.PlatformBankAccount, 'id'>) => setPlatformBankAccounts(prev => [...prev, { id: `ba-${Date.now()}`, ...data }]), [setPlatformBankAccounts]);
    const updatePlatformBankAccount = useCallback((id: string, data: Omit<T.PlatformBankAccount, 'id'>) => setPlatformBankAccounts(prev => prev.map(ba => ba.id === id ? { id, ...data } : ba)), [setPlatformBankAccounts]);
    const deletePlatformBankAccount = useCallback((id: string) => setPlatformBankAccounts(prev => prev.filter(ba => ba.id !== id)), [setPlatformBankAccounts]);
    const updateSystemSettings = useCallback((settings: T.SystemSettings) => setSystemSettings(settings), [setSystemSettings]);

    // --- SELLER / PRODUCT ---
    const addProduct = useCallback((productData: Omit<T.Product, 'id' | 'sellerId' | 'rating' | 'reviews' | 'status' | 'createdAt'>) => {
        if (!currentUser) return;
        const newProduct: T.Product = {
            id: `prod-${Date.now()}`,
            sellerId: currentUser.id,
            rating: 0,
            reviews: [],
            status: T.ProductStatus.PENDING,
            createdAt: new Date(),
            ...productData,
        };
        setProducts(prev => [...prev, newProduct]);
    }, [currentUser, setProducts]);

    const updateProduct = useCallback((productId: string, productData: Partial<T.Product>) => {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...productData, status: T.ProductStatus.PENDING } : p));
    }, [setProducts]);

    const deleteProduct = useCallback((productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        setInventory(prev => prev.filter(i => i.productId !== productId));
    }, [setProducts, setInventory]);
    
    // --- INVENTORY ---
    const uploadInventoryFile = useCallback((data: { productId: string, variantId: string, fileName: string, fileContent: string }) => {
        const lines = data.fileContent.split('\n').map(l => l.trim()).filter(Boolean);
        const existingItems = new Set(inventory.filter(i => i.productId === data.productId && i.variantId === data.variantId).map(i => i.data));
        
        let successCount = 0;
        let errorCount = 0;
        const newItems: T.InventoryItem[] = [];

        lines.forEach(line => {
            if (existingItems.has(line)) {
                errorCount++;
            } else {
                successCount++;
                newItems.push({
                    id: `inv-${Date.now()}-${Math.random()}`,
                    productId: data.productId,
                    variantId: data.variantId,
                    data: line,
                    status: T.InventoryItemStatus.AVAILABLE,
                    addedDate: new Date().toISOString(),
                });
            }
        });
        
        setInventory(prev => [...prev, ...newItems]);
        setProducts(prev => prev.map(p => p.id === data.productId ? { ...p, variants: p.variants.map(v => v.id === data.variantId ? { ...v, stock: v.stock + successCount } : v) } : p));
        setInventoryUploadLogs(prev => [...prev, { id: `log-${Date.now()}`, ...data, uploadDate: new Date().toISOString(), successCount, errorCount }]);

        return { success: true, message: `Tải lên thành công ${successCount} mục, ${errorCount} mục bị bỏ qua (trùng lặp).` };
    }, [inventory, setInventory, setProducts, setInventoryUploadLogs]);

    const deleteAllInventoryForVariant = useCallback((productId: string, variantId: string) => {
        const itemsToDelete = inventory.filter(i => i.productId === productId && i.variantId === variantId && i.status === T.InventoryItemStatus.AVAILABLE);
        const count = itemsToDelete.length;
        setInventory(prev => prev.filter(i => !itemsToDelete.some(d => d.id === i.id)));
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, variants: p.variants.map(v => v.id === variantId ? { ...v, stock: v.stock - count } : v) } : p));
    }, [inventory, setInventory, setProducts]);

    // --- TASKS ---
    const createTask = useCallback((taskData: Omit<T.Task, 'id' | 'creatorId' | 'status' | 'createdAt' | 'assigneeId' | 'completionProof' | 'review'>) => {
        if (!currentUser) return { success: false, message: "Bạn cần đăng nhập." };
        const totalCost = taskData.reward * taskData.quantity;
        if (currentUser.balance < totalCost) return { success: false, message: "Số dư không đủ." };
        
        const newTask: T.Task = { ...taskData, id: `task-${Date.now()}`, creatorId: currentUser.id, status: T.TaskStatus.PENDING_APPROVAL, createdAt: new Date() };
        setTasks(prev => [...prev, newTask]);
        
        // Deduct balance and create transaction
        updateUser(currentUser.id, { balance: currentUser.balance - totalCost });
        setTransactions(prev => [...prev, { id: `txn-${Date.now()}`, userId: currentUser.id, type: T.TransactionType.TASK_CREATION_FEE, amount: -totalCost, description: `Phí tạo nhiệm vụ ${newTask.id}`, date: new Date(), relatedTaskId: newTask.id }]);
        
        return { success: true, message: "Tạo nhiệm vụ thành công, đang chờ quản trị viên duyệt." };
    }, [currentUser, setTasks, updateUser, setTransactions]);

    const approveTask = useCallback((taskId: string) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: T.TaskStatus.ACTIVE } : t)), [setTasks]);
    const rejectTask = useCallback((taskId: string) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: T.TaskStatus.REJECTED } : t)), [setTasks]);
    
    const acceptTask = useCallback((taskId: string) => {
        if (!currentUser) return { success: false, message: "Bạn cần đăng nhập." };
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status !== T.TaskStatus.ACTIVE || task.assigneeId) {
            return { success: false, message: "Nhiệm vụ không hợp lệ hoặc đã có người nhận." };
        }
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: T.TaskStatus.IN_PROGRESS, assigneeId: currentUser.id } : t));
        return { success: true, message: "Bạn đã nhận nhiệm vụ thành công!" };
    }, [currentUser, tasks, setTasks]);

    const submitTaskProof = useCallback((taskId: string, proof: { text?: string, images?: string[] }) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: T.TaskStatus.PENDING_COMPLETION_APPROVAL, completionProof: proof } : t));
        return { success: true, message: "Nộp bằng chứng thành công. Vui lòng chờ người tạo nhiệm vụ duyệt." };
    }, [setTasks]);
    
    const approveTaskCompletion = useCallback((taskId: string) => {
        setTasks(prevTasks => {
            const task = prevTasks.find(t => t.id === taskId && t.status === T.TaskStatus.PENDING_COMPLETION_APPROVAL);
            if (!task || !task.assigneeId) {
                console.warn(`Task ${taskId} not found or not in correct state for approval.`);
                return prevTasks;
            }
    
            const { assigneeId, reward } = task;
    
            setUsers(prevUsers => prevUsers.map(u => u.id === assigneeId ? { ...u, balance: u.balance + reward } : u));
    
            setCurrentUser(prevCurrentUser => {
                if (prevCurrentUser && prevCurrentUser.id === assigneeId) {
                    return { ...prevCurrentUser, balance: prevCurrentUser.balance + reward };
                }
                return prevCurrentUser;
            });
    
            setTransactions(prevTransactions => [...prevTransactions, { 
                id: `txn-${Date.now()}`, 
                userId: assigneeId, 
                type: T.TransactionType.TASK_REWARD, 
                amount: reward, 
                description: `Nhận thưởng từ nhiệm vụ ${taskId}`, 
                date: new Date(), 
                relatedTaskId: taskId 
            }]);
    
            return prevTasks.map(t => t.id === taskId ? { ...t, status: T.TaskStatus.COMPLETED } : t);
        });
    }, [setTasks, setUsers, setTransactions, setCurrentUser]);

    const rejectTaskCompletion = useCallback((taskId: string) => {
         setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: T.TaskStatus.IN_PROGRESS, completionProof: undefined } : t));
    }, [setTasks]);

    const submitTaskReview = useCallback((taskId: string, rating: number, comment: string) => {
        if (!currentUser) return { success: false, message: "Lỗi người dùng" };
        const newReview: T.TaskReview = { id: `tr-${Date.now()}`, taskId, reviewerId: currentUser.id, rating, comment, date: new Date() };
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, review: newReview } : t));
        return { success: true, message: "Gửi đánh giá thành công. Cảm ơn bạn!" };
    }, [currentUser, setTasks]);

    // --- ADVERTISING ---
    const createAdCampaign = useCallback((data: { itemId: string; itemType: 'product' | 'task'; dailyBudget: number; bidAmount: number; }) => {
        if (!currentUser) return { success: false, message: 'Bạn cần đăng nhập.' };
        if (currentUser.balance < data.dailyBudget) return { success: false, message: 'Số dư không đủ để bắt đầu chiến dịch với ngân sách này.' };
        
        const newCampaign: T.AdCampaign = {
            id: `ad-${Date.now()}`,
            sellerId: currentUser.id,
            status: T.AdCampaignStatus.ACTIVE,
            totalSpend: 0,
            clicks: 0,
            createdAt: new Date(),
            ...data
        };

        setAdCampaigns(prev => [...prev, newCampaign]);
        updateUser(currentUser.id, { balance: currentUser.balance - data.dailyBudget });
        setTransactions(prev => [...prev, {
            id: `txn-ad-${Date.now()}`,
            userId: currentUser.id,
            type: T.TransactionType.AD_PAYMENT,
            amount: -data.dailyBudget,
            description: `Thanh toán cho chiến dịch quảng cáo #${newCampaign.id}`,
            date: new Date(),
        }]);

        return { success: true, message: 'Tạo chiến dịch quảng cáo thành công!' };
    }, [currentUser, setAdCampaigns, updateUser, setTransactions]);

    const updateAdCampaign = useCallback((campaignId: string, data: { dailyBudget?: number; bidAmount?: number; }) => {
        const campaign = adCampaigns.find(c => c.id === campaignId);
        if (!campaign || campaign.sellerId !== currentUser?.id) return { success: false, message: 'Chiến dịch không hợp lệ.' };

        setAdCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...data } : c));
        return { success: true, message: 'Cập nhật chiến dịch thành công.' };
    }, [adCampaigns, currentUser, setAdCampaigns]);

    const pauseAdCampaign = useCallback((campaignId: string) => {
        setAdCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: T.AdCampaignStatus.PAUSED } : c));
    }, [setAdCampaigns]);
    
    const resumeAdCampaign = useCallback((campaignId: string) => {
        setAdCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: T.AdCampaignStatus.ACTIVE } : c));
    }, [setAdCampaigns]);
    
    // FIX: Updated getSponsoredItems to accept an optional categoryId for filtering.
    const getSponsoredItems = useCallback((count: number, categoryId?: string) => {
        // Find active campaigns that are within budget
        const eligibleCampaigns = adCampaigns.filter(c => 
            c.status === T.AdCampaignStatus.ACTIVE && c.totalSpend < c.dailyBudget
        );

        // Map campaigns to their full item details and filter by category if provided
        let itemsWithBids = eligibleCampaigns.map(c => {
            const item = c.itemType === 'product'
                ? products.find(p => p.id === c.itemId)
                : tasks.find(t => t.id === c.itemId);
            return { item, campaign: c };
        }).filter(data => {
            if (!data.item) return false;
            if (categoryId) {
                // Check if the item belongs to the specified category
                return (data.item as T.Product | T.Task).categoryId === categoryId;
            }
            return true;
        });

        // Sort by bid amount (highest first)
        itemsWithBids.sort((a, b) => b.campaign.bidAmount - a.campaign.bidAmount);

        // Take the top 'count' items
        const topItemsData = itemsWithBids.slice(0, count);

        // This simulation caused an infinite render loop and has been removed.
        // Ad spend should be handled by a different mechanism (e.g., on click).

        return topItemsData.map(data => data.item!);
    }, [adCampaigns, products, tasks]);

    const generateTwoFactorSecret = useCallback(async (userId: string): Promise<{ success: boolean; message: string; secret?: string; otpauthUrl?: string; }> => {
        const user = users.find(u => u.id === userId);
        if (!user) return { success: false, message: "User not found." };
        const secret = generateSecret();
        const otpauthUrl = `otpauth://totp/DigiMarket:${user.email}?secret=${secret}&issuer=DigiMarket`;
        updateUser(userId, { twoFactorSecret: secret });
        return { success: true, message: "Secret generated.", secret, otpauthUrl };
    }, [users, updateUser]);

    const verifyAndEnableTwoFactor = useCallback(async (userId: string, token: string): Promise<{ success: boolean; message: string; }> => {
        const user = users.find(u => u.id === userId);
        if (!user || !user.twoFactorSecret) return { success: false, message: "User or secret not found." };

        const isValid = await verifyToken(user.twoFactorSecret, token);
        if (isValid) {
            updateUser(userId, { twoFactorEnabled: true });
            return { success: true, message: "Xác thực hai yếu tố đã được bật thành công!" };
        }
        return { success: false, message: "Mã xác thực không hợp lệ." };
    }, [users, updateUser]);

    const disableTwoFactor = useCallback(async (userId: string, token: string): Promise<{ success: boolean; message: string; }> => {
        const user = users.find(u => u.id === userId);
        if (!user || !user.twoFactorSecret) return { success: false, message: "User or secret not found." };
        
        const isValid = await verifyToken(user.twoFactorSecret, token);
        if (isValid) {
            updateUser(userId, { twoFactorEnabled: false, twoFactorSecret: null });
            return { success: true, message: "Xác thực hai yếu tố đã được tắt thành công!" };
        }
        return { success: false, message: "Mã xác thực không hợp lệ." };
    }, [users, updateUser]);
    
    const verifyLoginToken = useCallback(async (userId: string, token: string): Promise<{ success: boolean; message: string; }> => {
        const user = users.find(u => u.id === userId);
        if (!user || !user.twoFactorSecret) return { success: false, message: "User or secret not found." };

        const isValid = await verifyToken(user.twoFactorSecret, token);
        if (isValid) {
            setCurrentUser(user);
            return { success: true, message: "Login successful" };
        }
        return { success: false, message: "Mã xác thực 2FA không hợp lệ." };
    }, [users, setCurrentUser]);
    
    const updateAd = useCallback((adId: string, data: Partial<Omit<T.Ad, 'id'>>) => {
        setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, ...data } : ad));
    }, [setAds]);

    const addCategory = useCallback((categoryData: Omit<T.Category, 'id'>) => {
        const newCategory: T.Category = { id: `cat-${Date.now()}`, ...categoryData };
        setCategories(prev => [...prev, newCategory]);
    }, [setCategories]);

    const updateCategory = useCallback((categoryId: string, categoryData: Omit<T.Category, 'id'>) => {
        setCategories(prev => prev.map(c => c.id === categoryId ? { id: categoryId, ...categoryData } : c));
    }, [setCategories]);

    const deleteCategory = useCallback((categoryId: string) => {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
    }, [setCategories]);
    
    const updateExchangeRates = useCallback((newRates: T.ExchangeRates) => {
        setExchangeRates(newRates);
    }, [setExchangeRates]);

    const updatePlatformBalances = useCallback((newBalances: T.PlatformBalances) => {
        setPlatformBalances(newBalances);
    }, [setPlatformBalances]);

    const createExchangeRequest = useCallback((details: T.ExchangeDetails, transactionCode?: string) => {
        if (!currentUser) return { success: false, message: 'Lỗi người dùng' };
        const newRequest: T.FinancialRequest = {
            id: `ex-${Date.now()}`,
            userId: currentUser.id,
            type: T.FinancialRequestType.EXCHANGE,
            amount: details.vndAmount, // The VND amount is the primary value for tracking
            status: T.FinancialRequestStatus.PENDING,
            date: new Date(),
            exchangeDetails: details,
            transactionCode,
        };
        setFinancialRequests(prev => [...prev, newRequest]);
        
        // Notify admins
        const admins = users.filter(u => u.role === T.UserRole.ADMIN);
        const directionText = details.direction === 'buy' ? 'Mua' : 'Bán';
        const newNotifications: T.Notification[] = admins.map(admin => ({
            id: `notif-ex-${Date.now()}-${admin.id}`,
            userId: admin.id,
            type: T.NotificationType.EXCHANGE_REQUEST_PENDING,
            title: `Yêu cầu Giao dịch mới`,
            message: `${currentUser.name} đã tạo yêu cầu ${directionText} ${details.usdAmount} ${details.currency}.`,
            link: '/admin/financial-requests',
            isRead: false,
            timestamp: new Date(),
        }));
        setNotifications(prev => [...prev, ...newNotifications]);
    
        return { success: true, message: 'Yêu cầu của bạn đã được gửi.' };
    }, [currentUser, setFinancialRequests, users, setNotifications]);
    
    const value = {
        currentUser, users, products, orders, messages, notifications, complaints, inventory, inventoryUploadLogs,
        contentPages, siteNotifications, financialRequests, transactions, platformBankAccounts, systemSettings, tasks, adCampaigns, ads, supportFAQs,
        categories, exchangeRates, platformBalances, blogPosts, blogPostComments,
        addCategory,
        updateCategory,
        deleteCategory,
        login, logout, registerUser, verifyEmail, placeDirectOrder, placePreOrder, markNotificationAsRead, markAllNotificationsAsRead, sendMessage,
        updateOrderStatus, approveProduct, rejectProduct, updateUser, deleteUser, registerAdmin, submitVerificationRequest,
        processVerification, updateComplaintStatus, resolveComplaint, sendAdminAnnouncement, addContentPage, updateContentPage,
        deleteContentPage, addSiteNotification, updateSiteNotification,
        deleteSiteNotification, createFinancialRequest, processFinancialRequest, addPlatformBankAccount, updatePlatformBankAccount,
        deletePlatformBankAccount, updateSystemSettings, becomeSeller, uploadInventoryFile, deleteAllInventoryForVariant,
        addProduct, updateProduct, deleteProduct, createTask, approveTask, rejectTask, acceptTask, submitTaskProof,
        approveTaskCompletion, rejectTaskCompletion, submitTaskReview, updateAdminPermissions,
        createAdCampaign, updateAdCampaign, pauseAdCampaign, resumeAdCampaign, getSponsoredItems,
        generateTwoFactorSecret, verifyAndEnableTwoFactor, disableTwoFactor, verifyLoginToken, updateAd,
        sendAdminSupportNotification,
        updateExchangeRates, updatePlatformBalances, createExchangeRequest, changePassword,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addBlogPostComment,
        approveBlogPostComment,
        deleteBlogPostComment,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};