import React, { useContext, useState, useMemo } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { User, AdminPermissions, UserRole } from '../../types.ts';
import { Crown, Edit, PlusCircle, Shield, Store, Users, Wallet, X } from '../../components/icons.tsx';

const defaultPermissions: AdminPermissions = {
    isSuperAdmin: false,
    canManageShop: false,
    canManageUsers: false,
    canManageFinance: false,
};

const AdminManagementPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [permissions, setPermissions] = useState<AdminPermissions>(defaultPermissions);
    const [error, setError] = useState('');

    if (!context || !context.currentUser) return null;

    const { currentUser, users, registerAdmin, updateAdminPermissions } = context;

    const admins = useMemo(() => users.filter(u => u.role === UserRole.ADMIN), [users]);

    if (!currentUser.permissions?.isSuperAdmin) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-red-500">Truy cập bị từ chối</h2>
                <p className="text-gray-400 mt-2">Bạn không có quyền truy cập vào tính năng này.</p>
            </div>
        );
    }
    
    const handleOpenModal = (user: User | null = null) => {
        setError('');
        if (user) {
            setEditingUser(user);
            setFormData({ name: user.name, email: user.email });
            setPermissions(user.permissions || defaultPermissions);
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '' });
            setPermissions(defaultPermissions);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handlePermissionChange = (perm: keyof AdminPermissions) => {
        setPermissions(prev => ({...prev, [perm]: !prev[perm]}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (editingUser) {
            // Update existing admin
            updateAdminPermissions(editingUser.id, permissions);
        } else {
            // Add new admin
            if (!formData.name || !formData.email) {
                setError('Tên và email là bắt buộc.');
                return;
            }
            const result = registerAdmin(formData.name, formData.email, permissions);
            if (!result.success) {
                setError(result.message);
                return; // Stop execution if registration failed
            }
        }
        handleCloseModal();
    };

    const PermissionIcon: React.FC<{ hasPermission: boolean | undefined; icon: React.ReactNode, title: string }> = ({ hasPermission, icon, title }) => (
        <span title={title} className={`p-1.5 rounded-full ${hasPermission ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
            {icon}
        </span>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Quản lý Quản trị viên</h1>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">
                    <PlusCircle size={18} /> Thêm quản trị viên
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Quyền</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {admins.map(admin => (
                                <tr key={admin.id}>
                                    <td className="px-6 py-4 text-white font-medium">{admin.name}</td>
                                    <td className="px-6 py-4 text-gray-300">{admin.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <PermissionIcon hasPermission={admin.permissions?.isSuperAdmin} icon={<Crown size={16}/>} title="Super Admin"/>
                                            <PermissionIcon hasPermission={admin.permissions?.canManageShop} icon={<Store size={16}/>} title="Quản lý Shop"/>
                                            <PermissionIcon hasPermission={admin.permissions?.canManageUsers} icon={<Users size={16}/>} title="Quản lý Users"/>
                                            <PermissionIcon hasPermission={admin.permissions?.canManageFinance} icon={<Wallet size={16}/>} title="Quản lý Finance"/>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenModal(admin)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                    {admins.map(admin => (
                        <div key={admin.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                            <div>
                                <p className="font-semibold text-white">{admin.name}</p>
                                <p className="text-sm text-gray-400">{admin.email}</p>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600">
                                <div className="flex items-center gap-2">
                                    <PermissionIcon hasPermission={admin.permissions?.isSuperAdmin} icon={<Crown size={16}/>} title="Super Admin"/>
                                    <PermissionIcon hasPermission={admin.permissions?.canManageShop} icon={<Store size={16}/>} title="Quản lý Shop"/>
                                    <PermissionIcon hasPermission={admin.permissions?.canManageUsers} icon={<Users size={16}/>} title="Quản lý Users"/>
                                    <PermissionIcon hasPermission={admin.permissions?.canManageFinance} icon={<Wallet size={16}/>} title="Quản lý Finance"/>
                                </div>
                                <button onClick={() => handleOpenModal(admin)} className="text-primary-400 hover:text-primary-300">
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">{editingUser ? 'Chỉnh sửa' : 'Thêm'} Quản trị viên</h2>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tên</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required disabled={!!editingUser} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-900" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={!!editingUser} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-900" />
                            </div>
                            <div className="pt-4 border-t border-gray-700">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Phân quyền</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" checked={permissions.isSuperAdmin} onChange={() => handlePermissionChange('isSuperAdmin')} disabled={editingUser?.id === currentUser.id} className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-primary-500 focus:ring-primary-500 disabled:opacity-50" />
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
                             {error && <p className="text-sm text-red-400">{error}</p>}
                        </div>
                        <div className="flex justify-end gap-4 p-4 bg-gray-800/50 border-t border-gray-700">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                            <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Lưu</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminManagementPage;