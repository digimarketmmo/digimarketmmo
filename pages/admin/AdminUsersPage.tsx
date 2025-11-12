import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { formatCurrency } from '../../utils/formatter.ts';
import { User, UserRole, UserStatus, VerificationStatus, AdminPermissions } from '../../types.ts';
import { Trash2, Lock, Unlock, X, Crown, PlusCircle, Store, Users, Check, Eye, Wallet, User as UserIcon, Download } from '../../components/icons.tsx';
import { VerificationDocumentModal } from '../../components/VerificationDocumentModal.tsx';

const defaultPermissions: AdminPermissions = {
    isSuperAdmin: false,
    canManageShop: false,
    canManageUsers: false,
    canManageFinance: false,
};

const TabButton: React.FC<{
    tab: 'buyers' | 'sellers';
    label: string;
    count: number;
    icon: React.ReactNode;
    activeTab: 'buyers' | 'sellers';
    setActiveTab: (tab: 'buyers' | 'sellers') => void;
}> = ({ tab, label, count, icon, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === tab 
            ? 'border-b-2 border-primary-500 text-primary-400' 
            : 'text-gray-400 hover:text-white border-b-2 border-transparent'
        }`}
    >
        {icon}
        {label}
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-primary-500/20 text-primary-300' : 'bg-gray-700 text-gray-300'}`}>
            {count}
        </span>
    </button>
);

const UserActions: React.FC<{
    user: User;
    currentUser: User | null;
    handleToggleStatus: (user: User) => void;
    setViewingDocument: (user: User | null) => void;
    processVerification: (userId: string, newStatus: VerificationStatus.VERIFIED | VerificationStatus.REJECTED) => void;
    setDeletingUser: (user: User | null) => void;
    setPromotingUser: (user: User | null) => void;
}> = ({ user, currentUser, handleToggleStatus, setViewingDocument, processVerification, setDeletingUser, setPromotingUser }) => {
    const isOtherAdmin = user.role === UserRole.ADMIN && user.id !== currentUser?.id;
    const isSelf = user.id === currentUser?.id;
    const actionsDisabled = isOtherAdmin || isSelf;

    return (
        <div className="flex justify-end items-center gap-2" title={actionsDisabled ? "Không thể thực hiện hành động trên tài khoản Quản trị viên" : ""}>
             {user.role !== UserRole.ADMIN && (
                <button 
                    onClick={() => setPromotingUser(user)} 
                    className="text-purple-400 hover:text-purple-300" 
                    title="Phân quyền Quản trị viên"
                >
                    <Crown size={18} />
                </button>
            )}
             {user.verificationStatus === VerificationStatus.PENDING && (
                <>
                    <button onClick={() => setViewingDocument(user)} className="text-blue-400 hover:text-blue-300" title="Xem CCCD"><Eye size={18} /></button>
                    <button onClick={() => processVerification(user.id, VerificationStatus.VERIFIED)} className="text-green-400 hover:text-green-300" title="Duyệt xác minh"><Check size={18} /></button>
                    <button onClick={() => processVerification(user.id, VerificationStatus.REJECTED)} className="text-yellow-400 hover:text-yellow-300" title="Từ chối xác minh"><X size={18} /></button>
                </>
             )}
            {user.status === UserStatus.ACTIVE ?
                <button onClick={() => handleToggleStatus(user)} className="text-yellow-400 hover:text-yellow-300 disabled:text-gray-600 disabled:cursor-not-allowed" title="Khóa tài khoản" disabled={actionsDisabled}><Lock size={18} /></button> :
                <button onClick={() => handleToggleStatus(user)} className="text-green-400 hover:text-green-300 disabled:text-gray-600 disabled:cursor-not-allowed" title="Mở khóa tài khoản" disabled={actionsDisabled}><Unlock size={18} /></button>
            }
            <button onClick={() => setDeletingUser(user)} className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed" title="Xóa" disabled={actionsDisabled}><Trash2 size={18} /></button>
        </div>
    );
};

const AdminUsersPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    
    const [activeTab, setActiveTab] = useState<'buyers' | 'sellers'>('buyers');
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [promotingUser, setPromotingUser] = useState<User | null>(null);
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [viewingDocument, setViewingDocument] = useState<User | null>(null);
    const [newAdminData, setNewAdminData] = useState({ name: '', email: '' });
    const [adminError, setAdminError] = useState('');
    
    // State for permissions modal
    const [permissions, setPermissions] = useState<AdminPermissions>(defaultPermissions);

    useEffect(() => {
        if (promotingUser) {
            setPermissions(promotingUser.permissions || defaultPermissions);
        }
    }, [promotingUser]);


    if (!context) return null;
    
    const { users, currentUser, deleteUser, updateUser, registerAdmin, processVerification } = context;

    const { buyers, sellers } = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();

        const allBuyers: User[] = [];
        const allSellers: User[] = [];

        for (const user of users) {
            if (user.role === UserRole.ADMIN) continue;

            const matchesSearch = !searchTerm.trim() ||
                user.name.toLowerCase().includes(lowercasedFilter) ||
                user.email.toLowerCase().includes(lowercasedFilter) ||
                (user.brandName && user.brandName.toLowerCase().includes(lowercasedFilter));

            if (matchesSearch) {
                if (user.role === UserRole.BUYER) {
                    allBuyers.push(user);
                } else if (user.role === UserRole.SELLER) {
                    allSellers.push(user);
                }
            }
        }

        return { buyers: allBuyers, sellers: allSellers };
    }, [users, searchTerm]);


    const usersToShow = activeTab === 'buyers' ? buyers : sellers;

    const handleDeleteConfirm = () => {
        if (!deletingUser) return;
        deleteUser(deletingUser.id);
        setDeletingUser(null);
    };

    const handleToggleStatus = (user: User) => {
        const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE;
        const actionText = newStatus === UserStatus.BLOCKED ? 'KHÓA' : 'MỞ KHÓA';
        if (window.confirm(`Bạn có chắc muốn ${actionText} tài khoản "${user.name}" không?`)) {
            updateUser(user.id, { status: newStatus });
        }
    };
    
    const handleAddAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError('');
        if (!newAdminData.name || !newAdminData.email) {
            setAdminError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        const result = registerAdmin(newAdminData.name, newAdminData.email, {
            isSuperAdmin: false,
            canManageShop: false,
            canManageUsers: false,
            canManageFinance: false,
        });
        if (result.success) {
            alert(result.message);
            setIsAddAdminModalOpen(false);
            setNewAdminData({ name: '', email: '' });
        } else {
            setAdminError(result.message);
        }
    };
    
    const handlePromoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!promotingUser) return;
        updateUser(promotingUser.id, { role: UserRole.ADMIN, permissions });
        setPromotingUser(null);
    };
    
    const handlePermissionChange = (perm: keyof AdminPermissions) => {
        setPermissions(prev => ({ ...prev, [perm]: !prev[perm] }));
    };

    const handleExportUsers = () => {
        const headers = [
            'ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 
            'Balance', 'Created At', 'Verification Status', 
            'Brand Name', 'Brand Description'
        ];

        const csvRows = [headers.join(',')];

        for (const user of users) {
            const row = [
                `"${user.id}"`,
                `"${(user.name || '').replace(/"/g, '""')}"`, // Escape double quotes
                `"${user.email}"`,
                `"${user.phone || ''}"`,
                `"${user.role}"`,
                `"${user.status}"`,
                user.balance,
                `"${user.createdAt.toISOString()}"`,
                `"${user.verificationStatus}"`,
                `"${(user.brandName || '').replace(/"/g, '""')}"`,
                `"${(user.brandDescription || '').replace(/"/g, '""')}"`
            ].join(',');
            csvRows.push(row);
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `digimarket_users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getVerificationStatusClass = (status: VerificationStatus) => {
        switch(status) {
            case VerificationStatus.VERIFIED: return 'text-blue-400';
            case VerificationStatus.PENDING: return 'text-yellow-400';
            case VerificationStatus.REJECTED: return 'text-red-400';
            default: return 'text-gray-500';
        }
    }

    const getStatusClass = (status: UserStatus) => {
        switch(status) {
            case UserStatus.ACTIVE: return 'bg-green-900 text-green-300';
            case UserStatus.BLOCKED: return 'bg-yellow-900 text-yellow-300';
            default: return '';
        }
    }

    return (
        <div>
            {viewingDocument && <VerificationDocumentModal user={viewingDocument} onClose={() => setViewingDocument(null)} />}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-white">Quản lý người dùng</h1>
                <div className="flex items-center gap-4">
                     <button 
                        onClick={handleExportUsers}
                        className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download size={18} /> Xuất dữ liệu
                    </button>
                    <button 
                        onClick={() => setIsAddAdminModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <PlusCircle size={18} /> Thêm quản trị viên
                    </button>
                </div>
            </div>
            
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, tên shop..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
            </div>


            <div className="mb-1 border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tab="buyers" label="Người mua (Buyer)" count={buyers.length} icon={<Users size={16}/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton tab="sellers" label="Người bán (Seller)" count={sellers.length} icon={<Store size={16}/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                    {usersToShow.map(user => {
                        const isOnline = (new Date().getTime() - new Date(user.lastSeen).getTime()) < 5 * 60 * 1000;
                        return (
                        <div key={user.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-start gap-4">
                                <div className="relative flex-shrink-0 h-12 w-12">
                                   <img className="h-12 w-12 rounded-full" src={user.avatarUrl} alt={user.name} />
                                   <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-gray-700/50 ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                             <Link to={`/admin/users/${user.id}`} className="block">
                                                <p className="font-semibold text-white flex items-center gap-2 hover:text-primary-400 hover:underline">
                                                    {user.name}
                                                    {user.role === UserRole.ADMIN && <Crown size={14} className="text-yellow-400" />}
                                                </p>
                                            </Link>
                                            <p className="text-sm text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 font-semibold ${getVerificationStatusClass(user.verificationStatus)}`}>
                                        {user.verificationStatus}
                                    </p>
                                    <p className="text-sm text-primary-400 mt-1">Số dư: {formatCurrency(user.balance)}</p>
                                    {activeTab === 'sellers' && <p className="text-sm text-gray-300 mt-1">Shop: {user.brandName || 'N/A'}</p>}
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-600 flex justify-between items-center">
                                 <div className="flex items-center gap-4">
                                    <Link to={`/user/${user.id}`} target="_blank" className="text-blue-400 hover:text-blue-300" title="Xem trang cá nhân">
                                        <UserIcon size={18} />
                                    </Link>
                                    {user.role === UserRole.SELLER && (
                                        <Link to={`/shop/${user.id}`} target="_blank" className="text-green-400 hover:text-green-300" title="Xem shop">
                                            <Store size={18} />
                                        </Link>
                                    )}
                                </div>
                                <UserActions user={user} currentUser={currentUser} handleToggleStatus={handleToggleStatus} setViewingDocument={setViewingDocument} processVerification={processVerification} setDeletingUser={setDeletingUser} setPromotingUser={setPromotingUser} />
                            </div>
                        </div>
                    )})}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Người dùng</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Số dư</th>
                                {activeTab === 'sellers' && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tên Shop</th>}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Xác thực</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {usersToShow.map(user => {
                                const isOnline = (new Date().getTime() - new Date(user.lastSeen).getTime()) < 5 * 60 * 1000;
                                return (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="relative flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-gray-800 ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                                            </div>
                                            <div className="ml-4 min-w-0">
                                                 <Link to={`/admin/users/${user.id}`} className="text-sm font-medium text-white hover:text-primary-400 hover:underline">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate">{user.name}</span>
                                                        {user.role === UserRole.ADMIN && <Crown size={14} className="text-yellow-400 flex-shrink-0" />}
                                                    </div>
                                                </Link>
                                                <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-400">{formatCurrency(user.balance)}</td>
                                    {activeTab === 'sellers' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.brandName || 'N/A'}</td>}
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getVerificationStatusClass(user.verificationStatus)}`}>
                                        {user.verificationStatus}
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-4">
                                            <Link to={`/user/${user.id}`} target="_blank" className="text-blue-400 hover:text-blue-300" title="Xem trang cá nhân">
                                                <UserIcon size={18} />
                                            </Link>
                                            {user.role === UserRole.SELLER && (
                                                <Link to={`/shop/${user.id}`} target="_blank" className="text-green-400 hover:text-green-300" title="Xem shop">
                                                    <Store size={18} />
                                                </Link>
                                            )}
                                            <UserActions user={user} currentUser={currentUser} handleToggleStatus={handleToggleStatus} setViewingDocument={setViewingDocument} processVerification={processVerification} setDeletingUser={setDeletingUser} setPromotingUser={setPromotingUser} />
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>

                {usersToShow.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Không có {activeTab === 'buyers' ? 'người mua' : 'người bán'} nào.
                    </div>
                )}
            </div>

            {/* Modals */}
             {promotingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handlePromoteSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Phân quyền Admin cho {promotingUser.name}</h2>
                            <button type="button" onClick={() => setPromotingUser(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                             <div className="pt-4 border-t border-gray-700">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Phân quyền</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" checked={permissions.isSuperAdmin} onChange={() => handlePermissionChange('isSuperAdmin')} className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-primary-500 focus:ring-primary-500" />
                                        <span className="flex items-center gap-2 text-white"><Crown size={16} className="text-yellow-400"/> Super Admin <span className="text-xs text-gray-400">(Có thể quản lý các admin khác)</span></span>
                                    </label>
                                     <label className="flex items-center gap-3">
                                        <input type="checkbox" checked={permissions.canManageShop} onChange={() => handlePermissionChange('canManageShop')} className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-primary-500 focus:ring-primary-500" />
                                        <span className="flex items-center gap-2 text-white"><Store size={16} className="text-blue-400"/> Quản lý Cửa hàng <span className="text-xs text-gray-400">(Sản phẩm, danh mục, nhiệm vụ...)</span></span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" checked={permissions.canManageUsers} onChange={() => handlePermissionChange('canManageUsers')} className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-primary-500 focus:ring-primary-500" />
                                        <span className="flex items-center gap-2 text-white"><Users size={16} className="text-green-400"/> Quản lý Người dùng <span className="text-xs text-gray-400">(Users, đơn hàng, khiếu nại...)</span></span>
                                    </label>
                                     <label className="flex items-center gap-3">
                                        <input type="checkbox" checked={permissions.canManageFinance} onChange={() => handlePermissionChange('canManageFinance')} className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-primary-500 focus:ring-primary-500" />
                                        <span className="flex items-center gap-2 text-white"><Wallet size={16} className="text-purple-400"/> Quản lý Tài chính <span className="text-xs text-gray-400">(Nạp/rút, giao dịch...)</span></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 p-4 bg-gray-800/50 border-t border-gray-700">
                            <button type="button" onClick={() => setPromotingUser(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                            <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Lưu & Phân quyền</button>
                        </div>
                    </form>
                </div>
            )}
            
            {isAddAdminModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
                    <form onSubmit={handleAddAdminSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Thêm Quản trị viên mới</h2>
                            <button type="button" onClick={() => setIsAddAdminModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Họ tên *</label>
                                <input type="text" value={newAdminData.name} onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                                <input type="email" value={newAdminData.email} onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
                             {adminError && <p className="text-sm text-red-400">{adminError}</p>}
                        </div>
                        <div className="flex justify-end gap-4 p-4 bg-gray-800/50 border-t border-gray-700">
                            <button type="button" onClick={() => setIsAddAdminModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                            <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Tạo tài khoản</button>
                        </div>
                    </form>
                </div>
            )}

            {deletingUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center">
                                    <Trash2 className="text-red-400" size={24} />
                                </div>
                            </div>
                            <h2 className="text-lg font-bold text-white">Xác nhận xóa</h2>
                            <p className="text-sm text-gray-400 mt-2">Bạn có chắc chắn muốn xóa người dùng <span className="font-bold text-white">{deletingUser.name}</span>? Hành động này không thể được hoàn tác.</p>
                        </div>
                        <div className="flex justify-center gap-4 p-4 bg-gray-900/50">
                            <button onClick={() => setDeletingUser(null)} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                            <button onClick={handleDeleteConfirm} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;