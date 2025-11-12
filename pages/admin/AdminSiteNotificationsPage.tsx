import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { SiteNotification } from '../../types.ts';
import { PlusCircle, Edit, Trash2, X, ToggleLeft, ToggleRight } from '../../components/icons.tsx';

const AdminSiteNotificationsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<SiteNotification | null>(null);
    const [formData, setFormData] = useState<Omit<SiteNotification, 'id'>>({ message: '', isActive: true });

    if (!context) return null;

    // FIX: Destructure the missing functions from context.
    const { siteNotifications, addSiteNotification, updateSiteNotification, deleteSiteNotification } = context;

    const handleOpenModal = (notification: SiteNotification | null = null) => {
        if (notification) {
            setEditingNotification(notification);
            setFormData({ message: notification.message, isActive: notification.isActive });
        } else {
            setEditingNotification(null);
            setFormData({ message: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingNotification(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingNotification) {
            updateSiteNotification(editingNotification.id, formData);
        } else {
            addSiteNotification(formData);
        }
        handleCloseModal();
    };
    
    const handleToggleActive = (notification: SiteNotification) => {
        updateSiteNotification(notification.id, { isActive: !notification.isActive });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) {
            deleteSiteNotification(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Thông báo trang chủ</h1>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">
                    <PlusCircle size={18} /> Thêm thông báo
                </button>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nội dung</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {siteNotifications.map(notif => (
                                <tr key={notif.id}>
                                    <td className="px-6 py-4 text-white">{notif.message}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleToggleActive(notif)} className={`flex items-center gap-2 ${notif.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                            {notif.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                            <span className="text-sm">{notif.isActive ? 'Đang hoạt động' : 'Tắt'}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            <button onClick={() => handleOpenModal(notif)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(notif.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                    {siteNotifications.map(notif => (
                        <div key={notif.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                            <p className="text-white mb-3">{notif.message}</p>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                                <button onClick={() => handleToggleActive(notif)} className={`flex items-center gap-2 ${notif.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                    {notif.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    <span className="text-sm">{notif.isActive ? 'Hoạt động' : 'Tắt'}</span>
                                </button>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleOpenModal(notif)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(notif.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">{editingNotification ? 'Chỉnh sửa' : 'Thêm'} Thông báo</h2>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nội dung</label>
                                <textarea name="message" value={formData.message} onChange={handleFormChange} required rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
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

export default AdminSiteNotificationsPage;