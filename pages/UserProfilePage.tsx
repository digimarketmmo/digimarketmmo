import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { Navigate, useLocation, Link, useParams, useNavigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { formatCurrency, formatDate, formatTimeAgo } from '../utils/formatter.ts';
import { TransactionType, FinancialRequestStatus, Task, TaskStatus, User as UserType, VerificationStatus, UserRole, OrderStatus, Product, ProductStatus, Message, BlogPostStatus, BlogPost, BlogPostCommentStatus } from '../types.ts';
import { TaskProofModal } from '../components/TaskProofModal.tsx';
import { TaskReviewModal } from '../components/TaskReviewModal.tsx';
import { AddProductModal } from '../components/AddProductModal.tsx';
import { EditProductModal } from '../components/EditProductModal.tsx';
import { Eye, User, ListOrdered, Wallet, ClipboardList, ShieldCheck, Upload, Edit, Star, Crown, Gem, Package, PlusCircle, Trash2, MessageSquare, Send, X, ArrowLeft, TrendingUp, KeyRound, Copy, Check, DollarSign, Store, CheckCircle, XCircle, Users, FileText } from '../components/icons.tsx';
import { InventoryManagementModal } from '../components/InventoryManagementModal.tsx';
import { Pagination } from '../components/Pagination.tsx';

const getStatusClass = (status: FinancialRequestStatus | TaskStatus | VerificationStatus | ProductStatus | OrderStatus) => {
    switch (status) {
        case FinancialRequestStatus.APPROVED:
        case TaskStatus.COMPLETED:
        case VerificationStatus.VERIFIED:
        case ProductStatus.APPROVED:
        case OrderStatus.COMPLETED:
            return 'bg-green-900 text-green-300';
        case FinancialRequestStatus.PENDING:
        case TaskStatus.PENDING_APPROVAL:
        case TaskStatus.PENDING_COMPLETION_APPROVAL:
        case VerificationStatus.PENDING:
        case ProductStatus.PENDING:
        case OrderStatus.PENDING:
            return 'bg-yellow-900 text-yellow-300';
        case FinancialRequestStatus.REJECTED:
        case TaskStatus.REJECTED:
        case TaskStatus.CANCELLED:
        case VerificationStatus.REJECTED:
        case ProductStatus.REJECTED:
        case OrderStatus.CANCELLED:
             return 'bg-red-900 text-red-300';
        case TaskStatus.IN_PROGRESS:
            return 'bg-blue-900 text-blue-300';
        case OrderStatus.PRE_ORDER:
            return 'bg-purple-900 text-purple-300';
        default:
            return 'bg-gray-700 text-gray-300';
    }
};

const ProfileSidebar: React.FC<{ user: UserType, activeTab: string, onTabClick: (tab: string) => void }> = ({ user, activeTab, onTabClick }) => {
    const navItems = [
        { id: 'profile', label: 'Thông tin cá nhân', icon: <User size={18} /> },
        { id: 'wallet', label: 'Ví tiền', icon: <Wallet size={18} /> },
        { id: 'orders', label: 'Lịch sử mua hàng', icon: <ListOrdered size={18} /> },
        { id: 'tasks', label: 'Quản lý nhiệm vụ', icon: <ClipboardList size={18} /> },
        { id: 'blog', label: 'Bài viết', icon: <FileText size={18} /> },
        { id: 'comments', label: 'Quản lý Bình luận', icon: <MessageSquare size={18} /> },
        { id: 'affiliate', label: 'Affiliate', icon: <TrendingUp size={18} /> },
        { id: 'security', label: 'Bảo mật', icon: <ShieldCheck size={18} /> },
    ];

    const sellerItems = [
        { id: 'shop', label: 'Quản lý Shop', icon: <Store size={18} /> },
    ];

    const navLinkClass = (id: string) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${activeTab === id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`;

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-center mb-4">
                <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-gray-700" />
                <h2 className="font-bold text-lg text-white">{user.name}</h2>
                <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <nav className="space-y-1">
                {navItems.map(item => (
                    <a href={`#/profile#${item.id}`} key={item.id} onClick={(e) => { e.preventDefault(); onTabClick(item.id); }} className={navLinkClass(item.id)}>
                        {item.icon}
                        <span>{item.label}</span>
                    </a>
                ))}
                {(user.role === UserRole.SELLER || user.role === UserRole.ADMIN) && (
                    <>
                        <hr className="border-gray-700 my-2" />
                        {sellerItems.map(item => (
                             <a href={`#/profile#${item.id}`} key={item.id} onClick={(e) => { e.preventDefault(); onTabClick(item.id); }} className={navLinkClass(item.id)}>
                                {item.icon}
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </>
                )}
            </nav>
        </div>
    );
};

const ProfileInfoTab: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        brandName: user.brandName || '',
        brandDescription: user.brandDescription || '',
    });

    if (!context) return null;
    const { updateUser } = context;

    const handleSave = () => {
        updateUser(user.id, {
            name: formData.name,
            brandName: formData.brandName,
            brandDescription: formData.brandDescription,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user.name,
            brandName: user.brandName || '',
            brandDescription: user.brandDescription || '',
        });
        setIsEditing(false);
    };

    const isSeller = user.role === UserRole.SELLER || user.role === UserRole.ADMIN;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Thông tin cá nhân</h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                        <Edit size={16} /> Chỉnh sửa
                    </button>
                )}
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-400">Họ và tên</label>
                    {isEditing ? (
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    ) : (
                        <p className="font-semibold text-white">{user.name}</p>
                    )}
                </div>
                 <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="font-semibold text-gray-300">{user.email} (Không thể thay đổi)</p>
                </div>
                 <div>
                    <label className="text-sm text-gray-400">Số điện thoại</label>
                    <p className="font-semibold text-white">{user.phone || 'Chưa cập nhật'}</p>
                </div>
                {isSeller && (
                    <>
                        <div className="pt-4 border-t border-gray-700">
                             <label className="text-sm text-gray-400">Tên thương hiệu</label>
                            {isEditing ? (
                                <input type="text" value={formData.brandName} onChange={e => setFormData({...formData, brandName: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            ) : (
                                <p className="font-semibold text-white">{user.brandName || 'Chưa có'}</p>
                            )}
                        </div>
                         <div>
                             <label className="text-sm text-gray-400">Mô tả thương hiệu</label>
                            {isEditing ? (
                                <textarea value={formData.brandDescription} onChange={e => setFormData({...formData, brandDescription: e.target.value})} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            ) : (
                                <p className="text-gray-300 whitespace-pre-wrap">{user.brandDescription || 'Chưa có'}</p>
                            )}
                        </div>
                    </>
                )}
                {isEditing && (
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                        <button onClick={handleCancel} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Lưu</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const WalletTab: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'requests'>('transactions');

    if (!context) return null;
    const { transactions, financialRequests } = context;

    const userTransactions = useMemo(() => 
        transactions.filter(t => t.userId === user.id).sort((a,b) => b.date.getTime() - a.date.getTime()), 
    [transactions, user.id]);

    const userRequests = useMemo(() => 
        financialRequests.filter(r => r.userId === user.id).sort((a,b) => b.date.getTime() - a.date.getTime()),
    [financialRequests, user.id]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Ví tiền</h2>
            <div className="bg-gray-700/50 p-4 rounded-lg mb-6 flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-400">Số dư hiện tại</p>
                    <p className="text-3xl font-bold text-primary-400">{formatCurrency(user.balance)}</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/deposit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Nạp tiền</Link>
                    <Link to="/withdraw" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Rút tiền</Link>
                </div>
            </div>
            <div className="border-b border-gray-700 mb-4">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveSubTab('transactions')} className={`py-2 px-1 text-sm font-medium ${activeSubTab === 'transactions' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white'}`}>Lịch sử giao dịch</button>
                    <button onClick={() => setActiveSubTab('requests')} className={`py-2 px-1 text-sm font-medium ${activeSubTab === 'requests' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white'}`}>Yêu cầu Nạp/Rút</button>
                </nav>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {activeSubTab === 'transactions' ? (
                    userTransactions.length > 0 ? (
                        <table className="min-w-full text-sm">
                           <tbody>
                                {userTransactions.map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-700">
                                        <td className="py-2 pr-2">{formatDate(tx.date.toISOString())}</td>
                                        <td className="py-2 pr-2">{tx.description}</td>
                                        <td className={`py-2 pr-2 text-right font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(tx.amount)}</td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    ) : <p className="text-gray-400 text-center p-4">Không có giao dịch nào.</p>
                ) : (
                    userRequests.length > 0 ? (
                         <table className="min-w-full text-sm">
                           <tbody>
                               {userRequests.map(req => (
                                    <tr key={req.id} className="border-b border-gray-700">
                                        <td className="py-2 pr-2">{formatDate(req.date.toISOString())}</td>
                                        <td className="py-2 pr-2">{req.type}</td>
                                        <td className="py-2 pr-2 font-semibold text-primary-400">{formatCurrency(req.amount)}</td>
                                        <td className="py-2 pr-2 text-right">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(req.status)}`}>{req.status}</span>
                                        </td>
                                    </tr>
                               ))}
                           </tbody>
                        </table>
                    ) : <p className="text-gray-400 text-center p-4">Không có yêu cầu nào.</p>
                )}
            </div>
        </div>
    );
};

const OrdersTab: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    if (!context) return null;
    const { orders } = context;
    const userOrders = useMemo(() => 
        orders.filter(o => o.userId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [orders, user.id]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Lịch sử mua hàng</h2>
            <div className="max-h-[500px] overflow-y-auto space-y-3">
                {userOrders.length > 0 ? userOrders.map(order => (
                    <Link to={`/order/${order.id}`} key={order.id} className="block bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                        <div className="flex justify-between items-center text-sm">
                            <p className="font-semibold text-primary-400">{order.id}</p>
                            <p className="font-bold text-white">{formatCurrency(order.total)}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                            <p className="text-gray-400">{formatDate(order.date)}</p>
                            <span className={`px-2 py-0.5 font-semibold rounded-full ${getStatusClass(order.status)}`}>{order.status}</span>
                        </div>
                    </Link>
                )) : (
                    <p className="text-gray-400 text-center p-8">Bạn chưa có đơn hàng nào.</p>
                )}
            </div>
        </div>
    );
};

const TasksTab: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const [activeSubTab, setActiveSubTab] = useState<'created' | 'accepted'>('created');
    const [proofModalTask, setProofModalTask] = useState<Task | null>(null);
    const [reviewModalTask, setReviewModalTask] = useState<Task | null>(null);

    if (!context) return null;
    const { tasks, approveTaskCompletion, rejectTaskCompletion } = context;

    const createdTasks = useMemo(() => tasks.filter(t => t.creatorId === user.id).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()), [tasks, user.id]);
    const acceptedTasks = useMemo(() => tasks.filter(t => t.assigneeId === user.id).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()), [tasks, user.id]);
    
    const handleApprove = (taskId: string) => {
        if(window.confirm('Bạn có chắc muốn duyệt bằng chứng này và trả thưởng?')) approveTaskCompletion(taskId);
    }
    const handleReject = (taskId: string) => {
        if(window.confirm('Bạn có chắc muốn từ chối bằng chứng này? Nhiệm vụ sẽ quay lại trạng thái "Đang thực hiện".')) rejectTaskCompletion(taskId);
    }

    return (
        <div>
            {proofModalTask && <TaskProofModal task={proofModalTask} onClose={() => setProofModalTask(null)} />}
            {reviewModalTask && <TaskReviewModal task={reviewModalTask} onClose={() => setReviewModalTask(null)} />}
            <h2 className="text-2xl font-bold text-white mb-4">Quản lý nhiệm vụ</h2>
             <div className="border-b border-gray-700 mb-4">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveSubTab('created')} className={`py-2 px-1 text-sm font-medium ${activeSubTab === 'created' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white'}`}>Nhiệm vụ đã tạo</button>
                    <button onClick={() => setActiveSubTab('accepted')} className={`py-2 px-1 text-sm font-medium ${activeSubTab === 'accepted' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white'}`}>Nhiệm vụ đã nhận</button>
                </nav>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
                 {(activeSubTab === 'created' ? createdTasks : acceptedTasks).map(task => (
                    <div key={task.id} className="bg-gray-700/50 p-3 rounded-lg">
                        <p className="font-semibold text-white">{task.title}</p>
                        <div className="flex justify-between items-center text-xs mt-1">
                            <span className={`px-2 py-0.5 font-semibold rounded-full ${getStatusClass(task.status)}`}>{task.status}</span>
                            <span className="font-bold text-primary-400">{formatCurrency(task.reward)}</span>
                        </div>
                        {activeSubTab === 'created' && task.status === TaskStatus.PENDING_COMPLETION_APPROVAL && (
                            <div className="mt-2 pt-2 border-t border-gray-600 flex justify-end gap-2">
                                <button onClick={() => handleApprove(task.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Duyệt</button>
                                <button onClick={() => handleReject(task.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Từ chối</button>
                            </div>
                        )}
                        {activeSubTab === 'accepted' && task.status === TaskStatus.IN_PROGRESS && (
                            <div className="mt-2 pt-2 border-t border-gray-600 flex justify-end">
                                <button onClick={() => setProofModalTask(task)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Nộp bằng chứng</button>
                            </div>
                        )}
                        {activeSubTab === 'accepted' && task.status === TaskStatus.COMPLETED && !task.review && (
                             <div className="mt-2 pt-2 border-t border-gray-600 flex justify-end">
                                <button onClick={() => setReviewModalTask(task)} className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Đánh giá</button>
                            </div>
                        )}
                    </div>
                ))}
                 {activeSubTab === 'created' && createdTasks.length === 0 && <p className="text-center text-gray-400 p-4">Bạn chưa tạo nhiệm vụ nào.</p>}
                 {activeSubTab === 'accepted' && acceptedTasks.length === 0 && <p className="text-center text-gray-400 p-4">Bạn chưa nhận nhiệm vụ nào.</p>}
            </div>
        </div>
    );
};

const BlogTab: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const navigate = useNavigate();

    if (!context) return null;
    const { blogPosts, deleteBlogPost } = context;

    const userBlogPosts = useMemo(() =>
        blogPosts.filter(p => p.creatorId === user.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        [blogPosts, user.id]
    );

    const handleDelete = (postId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa bài viết này không?')) {
            deleteBlogPost(postId);
        }
    };

    const getBlogPostStatusClass = (status: BlogPostStatus) => {
        switch (status) {
            case BlogPostStatus.PUBLISHED: return 'bg-green-900 text-green-300';
            case BlogPostStatus.DRAFT: return 'bg-yellow-900 text-yellow-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Bài viết của bạn</h2>
                <button onClick={() => navigate('/blog/create')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold">
                    <PlusCircle size={16} /> Tạo bài viết mới
                </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto space-y-3">
                {userBlogPosts.length > 0 ? userBlogPosts.map(post => (
                    <div key={post.id} className="bg-gray-700/50 p-3 rounded-lg">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <Link to={`/blog/post/${post.slug}`} className="font-semibold text-white hover:text-primary-400 break-words">{post.title}</Link>
                                <div className="text-xs text-gray-400 mt-1">{formatDate(post.createdAt.toISOString())}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getBlogPostStatusClass(post.status)}`}>{post.status}</span>
                                <button onClick={() => navigate(`/blog/edit/${post.id}`)} className="text-primary-400 hover:text-primary-300" title="Chỉnh sửa"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-300" title="Xóa"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-400 p-8">Bạn chưa có bài viết nào.</p>
                )}
            </div>
        </div>
    );
};

const TwoFactorAuthSection: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [isDisabling, setIsDisabling] = useState(false);
    const [setupInfo, setSetupInfo] = useState<{ secret: string; otpauthUrl: string } | null>(null);
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    if (!context) return null;
    const { generateTwoFactorSecret, verifyAndEnableTwoFactor, disableTwoFactor } = context;

    const handleEnableClick = async () => {
        setStatus(null);
        const result = await generateTwoFactorSecret(user.id);
        if (result.success && result.secret && result.otpauthUrl) {
            setSetupInfo({ secret: result.secret, otpauthUrl: result.otpauthUrl });
            setIsSettingUp(true);
        } else {
            setStatus({ type: 'error', text: result.message });
        }
    };
    
    const handleCancelSetup = () => {
        setIsSettingUp(false);
        setSetupInfo(null);
        setToken('');
        setStatus(null);
    };

    const handleVerifyAndEnable = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        if (!token) {
            setStatus({ type: 'error', text: 'Vui lòng nhập mã xác thực.' });
            return;
        }
        const result = await verifyAndEnableTwoFactor(user.id, token);
        setStatus({ type: result.success ? 'success' : 'error', text: result.message });
        if (result.success) {
            setTimeout(() => {
                setIsSettingUp(false);
                setSetupInfo(null);
                setToken('');
            }, 2000);
        }
    };
    
    const handleDisable = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
         if (!token) {
            setStatus({ type: 'error', text: 'Vui lòng nhập mã xác thực.' });
            return;
        }
        const result = await disableTwoFactor(user.id, token);
        setStatus({ type: result.success ? 'success' : 'error', text: result.message });
        if(result.success) {
            setTimeout(() => {
                setIsDisabling(false);
                setToken('');
            }, 2000);
        }
    };

    const handleCopySecret = () => {
        if (!setupInfo) return;
        navigator.clipboard.writeText(setupInfo.secret).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    // Main render logic
    if (user.twoFactorEnabled) {
        // --- 2FA IS ENABLED ---
        return (
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-white">Xác thực hai yếu tố (2FA)</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-green-400">
                    <CheckCircle size={18} />
                    <span>Đang bật</span>
                </div>
                {!isDisabling ? (
                    <button onClick={() => { setIsDisabling(true); setStatus(null); setToken(''); }} className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 text-sm">Tắt 2FA</button>
                ) : (
                    <form onSubmit={handleDisable} className="mt-4 space-y-4 max-w-sm border-t border-gray-600 pt-4">
                        <p className="text-sm text-gray-300">Để tắt 2FA, vui lòng nhập mã xác thực hiện tại của bạn.</p>
                        <div>
                             <label className="block text-sm text-gray-400 mb-1">Mã xác thực</label>
                             <input type="text" value={token} onChange={e => setToken(e.target.value)} maxLength={6} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        {status && <p className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{status.text}</p>}
                        <div className="flex gap-4">
                            <button type="submit" className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Xác nhận & Tắt</button>
                            <button type="button" onClick={() => setIsDisabling(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                        </div>
                    </form>
                )}
            </div>
        );
    }
    
    // --- 2FA IS DISABLED ---
    if (isSettingUp && setupInfo) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupInfo.otpauthUrl)}`;
        return (
             <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Thiết lập Xác thực hai yếu tố (2FA)</h3>
                <p className="text-sm text-gray-300 mb-4">1. Quét mã QR bằng ứng dụng xác thực của bạn (ví dụ: Google Authenticator, Authy).</p>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <img src={qrUrl} alt="2FA QR Code" className="w-48 h-48 bg-white p-2 rounded-md"/>
                    <div>
                        <p className="text-sm text-gray-300 mb-2">2. Hoặc nhập mã này thủ công:</p>
                        <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-md">
                            <span className="font-mono text-primary-400">{setupInfo.secret}</span>
                            <button type="button" onClick={handleCopySecret} className="text-gray-400 hover:text-white">
                                {isCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleVerifyAndEnable} className="mt-4 space-y-4 border-t border-gray-600 pt-4">
                     <p className="text-sm text-gray-300">3. Nhập mã 6 chữ số từ ứng dụng của bạn để hoàn tất.</p>
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Mã xác thực</label>
                        <input type="text" value={token} onChange={e => setToken(e.target.value)} maxLength={6} required className="w-full max-w-xs bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                     {status && <p className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{status.text}</p>}
                    <div className="flex gap-4">
                        <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Xác minh & Bật</button>
                        <button type="button" onClick={handleCancelSetup} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="font-semibold text-white">Xác thực hai yếu tố (2FA)</h3>
            <p className="text-sm text-gray-400 mt-2">Bảo vệ tài khoản của bạn khỏi bị truy cập trái phép bằng cách yêu cầu mã xác minh bổ sung khi đăng nhập.</p>
            {status && <p className={`text-sm mt-2 ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{status.text}</p>}
            <button onClick={handleEnableClick} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 text-sm">Bật 2FA</button>
        </div>
    );
};


const SecurityTab: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!context) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setStatusMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatusMessage({ type: 'error', text: 'Mật khẩu mới không khớp.' });
            return;
        }

        if (newPassword.length < 6) {
            setStatusMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
            return;
        }

        const result = context.changePassword(user.id, currentPassword, newPassword);

        if (result.success) {
            setStatusMessage({ type: 'success', text: result.message });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setStatusMessage(null), 3000);
        } else {
            setStatusMessage({ type: 'error', text: result.message });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Bảo mật</h2>
            <div className="space-y-6">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-4">Đổi mật khẩu</h3>
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Mật khẩu hiện tại</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Mật khẩu mới</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Xác nhận mật khẩu mới</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        {statusMessage && (
                            <p className={`text-sm ${statusMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{statusMessage.text}</p>
                        )}
                        <div className="pt-2">
                            <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Lưu thay đổi</button>
                        </div>
                    </form>
                </div>
                <TwoFactorAuthSection user={user} />
            </div>
        </div>
    )
};

const ShopTab: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [inventoryModal, setInventoryModal] = useState<{ product: Product, variantId: string } | null>(null);

    if (!context) return null;
    const { products, deleteProduct } = context;

    const sellerProducts = useMemo(() => products.filter(p => p.sellerId === user.id).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()), [products, user.id]);

    const handleDelete = (productId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) deleteProduct(productId);
    }

    return (
        <div>
            {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} />}
            {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
            {inventoryModal && <InventoryManagementModal product={inventoryModal.product} variantId={inventoryModal.variantId} onClose={() => setInventoryModal(null)} />}
            
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white">Quản lý Shop</h2>
                 <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold">
                    <PlusCircle size={16} /> Thêm sản phẩm
                </button>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto space-y-3">
                {sellerProducts.map(product => (
                    <div key={product.id} className="bg-gray-700/50 p-3 rounded-lg">
                         <div className="flex justify-between items-start gap-4">
                            <p className="font-semibold text-white flex-grow">{product.name}</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => setEditingProduct(product)} className="text-primary-400 hover:text-primary-300" title="Chỉnh sửa"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300" title="Xóa"><Trash2 size={16} /></button>
                            </div>
                         </div>
                         <div className="flex justify-between items-end text-xs mt-1">
                            <span className={`px-2 py-0.5 font-semibold rounded-full ${getStatusClass(product.status)}`}>{product.status}</span>
                            <div className="text-right">
                                {product.variants.map(v => (
                                    <div key={v.id} className="flex gap-2 justify-end">
                                        <span>{v.name}:</span>
                                        <span className="text-gray-300">Kho {v.stock}</span>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                ))}
                {sellerProducts.length === 0 && <p className="text-center text-gray-400 p-8">Bạn chưa có sản phẩm nào.</p>}
            </div>
        </div>
    )
};

const AffiliateTab: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const [isCodeCopied, setIsCodeCopied] = useState(false);

    if (!context) return null;
    const { users, transactions } = context;

    const affiliateStats = useMemo(() => {
        const referredUsers = users.filter(u => u.referredBy === user.id);
        const affiliateTransactions = transactions.filter(t => t.userId === user.id && t.type === TransactionType.AFFILIATE_COMMISSION);
        const totalCommission = affiliateTransactions.reduce((sum, tx) => sum + tx.amount, 0);

        return {
            referredUsers,
            totalCommission,
            commissionHistory: affiliateTransactions.sort((a,b) => b.date.getTime() - a.date.getTime())
        };
    }, [users, transactions, user.id]);

    const referralLink = `${window.location.origin}/#/register?ref=${user.referralCode}`;

    const handleCopy = (content: string, type: 'link' | 'code') => {
        navigator.clipboard.writeText(content).then(() => {
            if (type === 'link') {
                setIsLinkCopied(true);
                setTimeout(() => setIsLinkCopied(false), 2000);
            } else {
                setIsCodeCopied(true);
                setTimeout(() => setIsCodeCopied(false), 2000);
            }
        });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Bảng điều khiển Affiliate</h2>

            {/* Referral Link & Code */}
            <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Link & Mã giới thiệu của bạn</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm text-gray-400">Link giới thiệu</label>
                        <div className="flex items-center gap-2">
                            <input type="text" readOnly value={referralLink} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-primary-400 text-sm" />
                            <button onClick={() => handleCopy(referralLink, 'link')} className={`flex-shrink-0 px-3 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1 ${isLinkCopied ? 'bg-green-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                                {isLinkCopied ? <Check size={16}/> : <Copy size={16}/>} {isLinkCopied ? 'Đã chép' : 'Chép'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Mã giới thiệu</label>
                         <div className="flex items-center gap-2">
                            <input type="text" readOnly value={user.referralCode} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white font-mono text-sm" />
                             <button onClick={() => handleCopy(user.referralCode, 'code')} className={`flex-shrink-0 px-3 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1 ${isCodeCopied ? 'bg-green-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                                {isCodeCopied ? <Check size={16}/> : <Copy size={16}/>} {isCodeCopied ? 'Đã chép' : 'Chép'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400"><Users size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-400">Tổng số người đã giới thiệu</p>
                        <p className="text-xl font-bold text-white">{affiliateStats.referredUsers.length}</p>
                    </div>
                </div>
                 <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-full text-green-400"><DollarSign size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-400">Tổng hoa hồng đã nhận</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(affiliateStats.totalCommission)}</p>
                    </div>
                </div>
            </div>

            {/* Commission History */}
            <div className="mb-6">
                 <h3 className="text-lg font-semibold text-white mb-3">Lịch sử nhận hoa hồng</h3>
                 <div className="max-h-60 overflow-y-auto bg-gray-900/30 rounded-lg">
                    {affiliateStats.commissionHistory.length > 0 ? (
                        <table className="min-w-full text-sm">
                           <tbody className="divide-y divide-gray-700">
                                {affiliateStats.commissionHistory.map(tx => {
                                    const sourceUser = users.find(u => u.id === tx.sourceUserId);
                                    return (
                                        <tr key={tx.id}>
                                            <td className="p-2">{formatDate(tx.date.toISOString())}</td>
                                            <td className="p-2 text-gray-300">Từ đơn hàng của {sourceUser?.name || 'một người dùng'}</td>
                                            <td className="p-2 text-right font-semibold text-green-400">{formatCurrency(tx.amount)}</td>
                                        </tr>
                                    );
                                })}
                           </tbody>
                        </table>
                    ) : <p className="text-gray-500 text-center p-4">Chưa có lịch sử nhận hoa hồng.</p>}
                 </div>
            </div>

             {/* Referred Users */}
            <div>
                 <h3 className="text-lg font-semibold text-white mb-3">Danh sách người được giới thiệu</h3>
                 <div className="max-h-60 overflow-y-auto bg-gray-900/30 rounded-lg">
                    {affiliateStats.referredUsers.length > 0 ? (
                        <table className="min-w-full text-sm">
                           <tbody className="divide-y divide-gray-700">
                                {affiliateStats.referredUsers.map(refUser => (
                                    <tr key={refUser.id}>
                                        <td className="p-2 flex items-center gap-2">
                                            <img src={refUser.avatarUrl} alt={refUser.name} className="w-6 h-6 rounded-full"/>
                                            <span className="text-white">{refUser.name}</span>
                                        </td>
                                        <td className="p-2 text-right text-gray-400">Tham gia: {formatDate(refUser.createdAt.toISOString())}</td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    ) : <p className="text-gray-500 text-center p-4">Chưa có ai đăng ký qua link của bạn.</p>}
                 </div>
            </div>
        </div>
    );
};

const BlogCommentsTab: React.FC<{ user: UserType }> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved'>('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const COMMENTS_PER_PAGE = 5;

    if (!context) return null;
    const { blogPosts, blogPostComments, users, approveBlogPostComment, deleteBlogPostComment } = context;

    const commentsForUser = useMemo(() => {
        const userPostIds = new Set(blogPosts.filter(p => p.creatorId === user.id).map(p => p.id));
        return blogPostComments
            .filter(c => userPostIds.has(c.postId))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [blogPosts, blogPostComments, user.id]);

    const { paginatedComments, totalPages } = useMemo(() => {
        const filtered = commentsForUser.filter(c => {
            if (activeSubTab === 'pending') return c.status === BlogPostCommentStatus.PENDING;
            if (activeSubTab === 'approved') return c.status === BlogPostCommentStatus.APPROVED;
            return false;
        });

        const totalPages = Math.ceil(filtered.length / COMMENTS_PER_PAGE);
        const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
        return { paginatedComments: filtered.slice(startIndex, startIndex + COMMENTS_PER_PAGE), totalPages };
    }, [commentsForUser, activeSubTab, currentPage]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [activeSubTab]);

    const handleDelete = (commentId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
            deleteBlogPostComment(commentId);
        }
    };
    
    const handleApprove = (commentId: string) => {
        approveBlogPostComment(commentId);
    };

    const pendingCount = useMemo(() => commentsForUser.filter(c => c.status === BlogPostCommentStatus.PENDING).length, [commentsForUser]);
    const approvedCount = useMemo(() => commentsForUser.filter(c => c.status === BlogPostCommentStatus.APPROVED).length, [commentsForUser]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Quản lý Bình luận</h2>
            <div className="border-b border-gray-700 mb-4">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveSubTab('pending')} className={`py-2 px-1 text-sm font-medium flex items-center gap-2 ${activeSubTab === 'pending' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white'}`}>
                        Chờ duyệt
                        {pendingCount > 0 && <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-300">{pendingCount}</span>}
                    </button>
                    <button onClick={() => setActiveSubTab('approved')} className={`py-2 px-1 text-sm font-medium flex items-center gap-2 ${activeSubTab === 'approved' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white'}`}>
                        Đã duyệt
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-600 text-gray-300">{approvedCount}</span>
                    </button>
                </nav>
            </div>
            <div className="space-y-4">
                {paginatedComments.length > 0 ? paginatedComments.map(comment => {
                    const commenter = users.find(u => u.id === comment.userId);
                    const post = blogPosts.find(p => p.id === comment.postId);
                    return (
                        <div key={comment.id} className="bg-gray-700/50 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <img src={commenter?.avatarUrl} alt={commenter?.name} className="w-8 h-8 rounded-full" />
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center text-xs">
                                        <p className="font-semibold text-white">{commenter?.name}</p>
                                        <p className="text-gray-400">{formatTimeAgo(comment.createdAt)}</p>
                                    </div>
                                    <p className="text-sm text-gray-300 my-2">{comment.content}</p>
                                    <p className="text-xs text-gray-500">
                                        Trên bài viết: <Link to={`/blog/post/${post?.slug}`} className="text-primary-400 hover:underline">{post?.title}</Link>
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-600">
                                {activeSubTab === 'pending' && (
                                    <button onClick={() => handleApprove(comment.id)} className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                                        <CheckCircle size={14} /> Duyệt
                                    </button>
                                )}
                                <button onClick={() => handleDelete(comment.id)} className="flex items-center gap-1 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
                                    <Trash2 size={14} /> Xóa
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <p className="text-center text-gray-400 p-8">Không có bình luận nào trong mục này.</p>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
};


const ProfileContent: React.FC<{ activeTab: string, user: UserType }> = ({ activeTab, user }) => {
    switch (activeTab) {
        case 'profile':
            return <ProfileInfoTab user={user} />;
        case 'wallet':
            return <WalletTab user={user} />;
        case 'orders':
            return <OrdersTab user={user} />;
        case 'tasks':
            return <TasksTab user={user} />;
        case 'blog':
            return <BlogTab user={user} />;
        case 'comments':
            return <BlogCommentsTab user={user} />;
        case 'affiliate':
            return <AffiliateTab user={user} />;
        case 'security':
            return <SecurityTab user={user} />;
        case 'shop':
             if (user.role === UserRole.SELLER || user.role === UserRole.ADMIN) {
                return <ShopTab user={user} />;
            }
            return <Navigate to="/profile#profile" replace />;
        default:
            return <ProfileInfoTab user={user} />;
    }
};

const UserProfilePage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const location = useLocation();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash) {
            setActiveTab(hash);
        } else {
            setActiveTab('profile');
        }
    }, [location.hash]);

    if (!context) return <Navigate to="/login" replace />;

    const { currentUser } = context;
    const userToShow = userId ? context.users.find(u => u.id === userId) : currentUser;

    if (!userToShow) {
        return <Navigate to="/" replace />;
    }

    const isOwnProfile = userToShow.id === currentUser?.id;

    if (!isOwnProfile) {
        // Public view of another user's profile
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-800 p-6 rounded-lg text-center border border-gray-700 max-w-md mx-auto">
                    <img src={userToShow.avatarUrl} alt={userToShow.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-700" />
                    <h1 className="text-2xl font-bold text-white">{userToShow.name}</h1>
                    <p className="text-gray-400">Tham gia từ {formatDate(userToShow.createdAt.toISOString())}</p>
                    {userToShow.role === UserRole.SELLER && (
                        <Link to={`/shop/${userToShow.id}`} className="mt-4 inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">
                            <Store size={18} /> Xem Shop
                        </Link>
                    )}
                </div>
            </div>
        );
    }
    
    // Logged-in user's own profile dashboard
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <ProfileSidebar user={userToShow} activeTab={activeTab} onTabClick={setActiveTab} />
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 min-h-[60vh]">
                        <ProfileContent activeTab={activeTab} user={userToShow} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;