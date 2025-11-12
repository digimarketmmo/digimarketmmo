import React, { useContext, useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { UserStatus, VerificationStatus, OrderStatus, User, TransactionType, UserRole } from '../../types.ts';
import { formatCurrency, formatDate } from '../../utils/formatter.ts';
import { ArrowLeft, Lock, Unlock, CheckCircle, XCircle, Eye, Wallet, ListOrdered, Crown, Briefcase, Store } from '../../components/icons.tsx';
import { VerificationDocumentModal } from '../../components/VerificationDocumentModal.tsx';

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-lg">
        <div className="text-primary-400">{icon}</div>
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-bold text-white text-sm">{value}</p>
        </div>
    </div>
);

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
     <div>
        <p className="text-sm text-gray-400">{label}</p>
        <div className="text-white font-semibold break-words">{value}</div>
    </div>
);


const AdminUserDetailPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const context = useContext(AppContext) as AppContextType;
    const [viewingDocument, setViewingDocument] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'orders' | 'transactions'>('orders');

    if (!context) return null;

    const { users, orders, transactions, updateUser, processVerification } = context;

    const user = useMemo(() => users.find(u => u.id === userId), [users, userId]);

    const userStats = useMemo(() => {
        if (!user) return { totalSpent: 0, orderCount: 0 };
        const userOrders = orders.filter(o => o.userId === user.id && o.status === OrderStatus.COMPLETED);
        return {
          totalSpent: userOrders.reduce((sum, order) => sum + order.total, 0),
          orderCount: userOrders.length,
        };
    }, [orders, user]);
      
    const userOrders = useMemo(() => {
        if (!user) return [];
        return orders.filter(o => o.userId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    }, [orders, user]);

    const userTransactions = useMemo(() => {
        if (!user) return [];
        return transactions.filter(t => t.userId === user.id).sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0, 20);
    }, [transactions, user]);

    if (!user) {
        return <Navigate to="/admin/users" replace />;
    }
      
    // Action Handlers
    const handleToggleStatus = () => {
        const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE;
        const actionText = newStatus === UserStatus.BLOCKED ? 'KHÓA' : 'MỞ KHÓA';
        if (window.confirm(`Bạn có chắc muốn ${actionText} tài khoản "${user.name}" không?`)) {
            updateUser(user.id, { status: newStatus });
        }
    };

    const handleProcessVerification = (newStatus: VerificationStatus.VERIFIED | VerificationStatus.REJECTED) => {
        const actionText = newStatus === VerificationStatus.VERIFIED ? 'DUYỆT' : 'TỪ CHỐI';
        if (window.confirm(`Bạn có chắc muốn ${actionText} yêu cầu xác thực của "${user.name}" không?`)) {
            processVerification(user.id, newStatus);
        }
    }

    const getStatusClass = (status: UserStatus) => status === UserStatus.ACTIVE ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300';
    const getVerificationStatusClass = (status: VerificationStatus) => {
        if (status === VerificationStatus.VERIFIED) return 'text-blue-400';
        if (status === VerificationStatus.PENDING) return 'text-yellow-400';
        return 'text-gray-500';
    };

    const TabButton: React.FC<{ tab: 'orders' | 'transactions', label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`py-3 px-4 text-sm font-medium border-b-2 ${activeTab === tab ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
            {label}
        </button>
    );

    return (
        <div>
            {viewingDocument && <VerificationDocumentModal user={viewingDocument} onClose={() => setViewingDocument(null)} />}
            <div className="mb-6">
                <Link to="/admin/users" className="inline-flex items-center gap-2 text-primary-400 hover:underline">
                    <ArrowLeft size={16} /> Quay lại danh sách
                </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg text-center border border-gray-700">
                        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-700" />
                        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            {user.name}
                            {user.role === UserRole.ADMIN && <Crown size={18} className="text-yellow-400" />}
                        </h1>
                        <p className="text-gray-400">{user.email}</p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                           <StatCard label="Số dư" value={formatCurrency(user.balance)} icon={<Wallet size={20}/>} />
                           <StatCard label="Đã chi" value={formatCurrency(userStats.totalSpent)} icon={<Briefcase size={20}/>} />
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg space-y-4 border border-gray-700">
                        <h2 className="text-lg font-bold text-white border-b border-gray-700 pb-2 mb-4">Thông tin chi tiết</h2>
                        <DetailItem label="Vai trò" value={user.role} />
                        <DetailItem label="Trạng thái" value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(user.status)}`}>{user.status}</span>} />
                        <DetailItem label="Xác thực" value={<span className={`font-semibold ${getVerificationStatusClass(user.verificationStatus)}`}>{user.verificationStatus}</span>} />
                        <DetailItem label="Ngày tham gia" value={formatDate(user.createdAt.toISOString())} />
                        {user.role === UserRole.SELLER && <>
                             <DetailItem label="Tên Shop" value={user.brandName || 'Chưa cập nhật'} />
                             <DetailItem label="Mô tả Shop" value={user.brandDescription || 'Chưa cập nhật'} />
                        </>}
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-lg font-bold text-white mb-4">Hành động</h2>
                        <div className="space-y-3">
                             <Link to={`/user/${user.id}`} target="_blank" className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 font-semibold">
                                <Eye size={16} /> Xem trang cá nhân
                            </Link>
                            {user.role === UserRole.SELLER && (
                                <Link to={`/shop/${user.id}`} target="_blank" className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/40 font-semibold">
                                    <Store size={16} /> Xem Shop
                                </Link>
                            )}
                            <button onClick={handleToggleStatus} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/40 font-semibold">
                                {user.status === UserStatus.ACTIVE ? <><Lock size={16}/> Khóa tài khoản</> : <><Unlock size={16}/> Mở khóa tài khoản</>}
                            </button>
                            {user.verificationStatus === VerificationStatus.PENDING && (
                                <div className="pt-3 border-t border-gray-700 space-y-3">
                                    <button onClick={() => setViewingDocument(user)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 font-semibold"><Eye size={16} /> Xem CCCD</button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => handleProcessVerification(VerificationStatus.VERIFIED)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/40 font-semibold"><CheckCircle size={16} /> Duyệt</button>
                                        <button onClick={() => handleProcessVerification(VerificationStatus.REJECTED)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/40 font-semibold"><XCircle size={16} /> Từ chối</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-800 rounded-lg border border-gray-700">
                        <div className="border-b border-gray-700">
                            <nav className="flex space-x-2 px-4">
                                <TabButton tab="orders" label="Đơn hàng gần đây" />
                                <TabButton tab="transactions" label="Giao dịch gần đây" />
                            </nav>
                        </div>
                        <div className="p-4">
                            {activeTab === 'orders' && (
                                <div className="space-y-3">
                                    {userOrders.map(order => (
                                        <Link to={`/order/${order.id}`} key={order.id} className="block bg-gray-900/50 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                                            <div className="flex justify-between items-center text-sm">
                                                <p className="font-semibold text-primary-400">{order.id}</p>
                                                <p className="text-white">{formatCurrency(order.total)}</p>
                                            </div>
                                            <div className="flex justify-between items-center text-xs mt-1">
                                                <p className="text-gray-400">{formatDate(order.date)}</p>
                                                <p className="text-gray-300">{order.status}</p>
                                            </div>
                                        </Link>
                                    ))}
                                    {userOrders.length === 0 && <p className="text-center text-gray-500 py-8">Không có đơn hàng nào.</p>}
                                </div>
                            )}
                            {activeTab === 'transactions' && (
                                <div className="space-y-3">
                                    {userTransactions.map(tx => (
                                         <div key={tx.id} className="bg-gray-900/50 p-3 rounded-lg">
                                            <div className="flex justify-between items-center text-sm">
                                                <p className="font-semibold text-white">{tx.description}</p>
                                                <p className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(tx.amount)}</p>
                                            </div>
                                            <div className="flex justify-between items-center text-xs mt-1">
                                                <p className="text-gray-400">{formatDate(tx.date.toISOString())}</p>
                                                <p className="text-gray-500">{tx.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {userTransactions.length === 0 && <p className="text-center text-gray-500 py-8">Không có giao dịch nào.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;