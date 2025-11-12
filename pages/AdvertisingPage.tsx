import React, { useContext, useState, useMemo } from 'react';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { Product, ProductStatus, Task, TaskStatus, UserRole, AdCampaign, AdCampaignStatus } from '../types.ts';
import { X, TrendingUp, CheckCircle, Package, ClipboardList, PlusCircle, Edit, Play, Pause } from '../components/icons.tsx';
import { formatCurrency } from '../utils/formatter.ts';


const AdvertisingPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
    const [newItem, setNewItem] = useState<{ id: string, type: 'product' | 'task' } | null>(null);
    const [formData, setFormData] = useState({ dailyBudget: 10000, bidAmount: 500 });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState<'products' | 'tasks'>('products');

    if (!context || !context.currentUser) return null;
    const { currentUser, products, tasks, adCampaigns, createAdCampaign, updateAdCampaign, pauseAdCampaign, resumeAdCampaign } = context;

    const sellerProducts = useMemo(() => {
        if (currentUser.role !== UserRole.SELLER && currentUser.role !== UserRole.ADMIN) return [];
        return products.filter(p => p.sellerId === currentUser.id && p.status === ProductStatus.APPROVED);
    }, [products, currentUser]);
    
    const userTasks = useMemo(() => {
        return tasks.filter(t => t.creatorId === currentUser.id && t.status === TaskStatus.ACTIVE);
    }, [tasks, currentUser]);

    // Get all items regardless of status to show eligibility
    const allSellerProducts = useMemo(() => {
        if (currentUser.role !== UserRole.SELLER && currentUser.role !== UserRole.ADMIN) return [];
        return products.filter(p => p.sellerId === currentUser.id);
    }, [products, currentUser]);

    const allUserTasks = useMemo(() => {
        return tasks.filter(t => t.creatorId === currentUser.id);
    }, [tasks, currentUser]);

    const userCampaigns = useMemo(() => adCampaigns.filter(c => c.sellerId === currentUser.id), [adCampaigns, currentUser.id]);

    React.useEffect(() => {
        if (sellerProducts.length > 0) setActiveTab('products');
        else if (userTasks.length > 0) setActiveTab('tasks');
    }, [sellerProducts.length, userTasks.length]);

    const handleOpenModal = (campaign: AdCampaign | null, item?: { id: string, type: 'product' | 'task' }) => {
        setStatusMessage({ type: '', text: '' });
        if (campaign) {
            setEditingCampaign(campaign);
            setNewItem(null);
            setFormData({ dailyBudget: campaign.dailyBudget, bidAmount: campaign.bidAmount });
        } else if (item) {
            setEditingCampaign(null);
            setNewItem(item);
            setFormData({ dailyBudget: 10000, bidAmount: 500 });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let result: { success: boolean; message: string; };
        if (editingCampaign) {
            result = updateAdCampaign(editingCampaign.id, formData);
        } else if (newItem) {
            result = createAdCampaign({ itemId: newItem.id, itemType: newItem.type, ...formData });
        } else {
            return; // Should not happen
        }
        
        setStatusMessage({ type: result.success ? 'success' : 'error', text: result.message });

        if (result.success) {
            setTimeout(handleCloseModal, 1500);
        }
    };

    const getStatusClass = (status: AdCampaignStatus) => ({
        [AdCampaignStatus.ACTIVE]: 'bg-green-500/20 text-green-400',
        [AdCampaignStatus.PAUSED]: 'bg-yellow-500/20 text-yellow-400',
        [AdCampaignStatus.OUT_OF_BUDGET]: 'bg-red-500/20 text-red-400',
        [AdCampaignStatus.ENDED]: 'bg-gray-500/20 text-gray-400',
    }[status]);
    
    const campaignedItemIds = new Set(userCampaigns.map(c => c.itemId));

    const itemsToShowForNewCampaign = (activeTab === 'products' ? allSellerProducts : allUserTasks)
        .filter(item => !campaignedItemIds.has(item.id));

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Bảng điều khiển Quảng cáo</h1>
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
                 <div className="border-b border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('products')} disabled={currentUser.role !== UserRole.SELLER && currentUser.role !== UserRole.ADMIN} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors disabled:cursor-not-allowed disabled:text-gray-500 ${activeTab === 'products' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}><Package size={16}/> Sản phẩm</button>
                        <button onClick={() => setActiveTab('tasks')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'tasks' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}><ClipboardList size={16}/> Nhiệm vụ</button>
                    </nav>
                </div>

                {/* Active Campaigns */}
                <h2 className="text-xl font-semibold text-white mb-4">Chiến dịch đang hoạt động</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase"><tr>
                            <th className="p-2">Sản phẩm/Nhiệm vụ</th><th className="p-2">Trạng thái</th><th className="p-2">Ngân sách/ngày</th><th className="p-2">Giá thầu (CPC)</th><th className="p-2">Đã chi tiêu</th><th className="p-2 text-right">Hành động</th>
                        </tr></thead>
                        <tbody>
                            {userCampaigns.filter(c => c.itemType === (activeTab === 'products' ? 'product' : 'task')).map(c => {
                                const item = c.itemType === 'product' ? products.find(p => p.id === c.itemId) : tasks.find(t => t.id === c.itemId);
                                return (
                                <tr key={c.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    {/* FIX: Use a type guard to safely access `name` or `title` properties on the `item` which is a union type. */}
                                    <td className="p-2 text-white font-medium">{item ? ('name' in item ? item.name : item.title) : 'N/A'}</td>
                                    <td className="p-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(c.status)}`}>{c.status}</span></td>
                                    <td className="p-2 text-gray-300">{formatCurrency(c.dailyBudget)}</td>
                                    <td className="p-2 text-gray-300">{formatCurrency(c.bidAmount)}</td>
                                    <td className="p-2 text-gray-300">{formatCurrency(c.totalSpend)}</td>
                                    <td className="p-2 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {c.status === AdCampaignStatus.ACTIVE ? <button onClick={() => pauseAdCampaign(c.id)} className="p-1.5 text-yellow-400 hover:bg-gray-600 rounded-full" title="Tạm dừng"><Pause size={16}/></button> : <button onClick={() => resumeAdCampaign(c.id)} className="p-1.5 text-green-400 hover:bg-gray-600 rounded-full" title="Tiếp tục"><Play size={16}/></button>}
                                            <button onClick={() => handleOpenModal(c)} className="p-1.5 text-blue-400 hover:bg-gray-600 rounded-full" title="Chỉnh sửa"><Edit size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>

                 {/* Items to advertise */}
                <div className="mt-8">
                     <h2 className="text-xl font-semibold text-white mb-4">Tạo chiến dịch mới</h2>
                     <div className="space-y-3">
                        {itemsToShowForNewCampaign.map(item => {
                            const isProduct = 'sellerId' in item;
                            const isEligible = isProduct 
                                ? (item as Product).status === ProductStatus.APPROVED 
                                : (item as Task).status === TaskStatus.ACTIVE;
                            
                            const reason = !isEligible 
                                ? (isProduct ? `Sản phẩm phải được duyệt (hiện tại: ${item.status})` : `Nhiệm vụ phải đang hoạt động (hiện tại: ${item.status})`)
                                : '';

                            return (
                                <div key={item.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className={`font-medium ${isEligible ? 'text-white' : 'text-gray-500'}`}>{(item as any).name || (item as any).title}</p>
                                        {reason && <p className="text-xs text-yellow-500">{reason}</p>}
                                    </div>
                                    <button 
                                        onClick={() => handleOpenModal(null, {id: item.id, type: activeTab === 'products' ? 'product' : 'task'})} 
                                        disabled={!isEligible}
                                        title={!isEligible ? reason : 'Tạo chiến dịch quảng cáo'}
                                        className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0">
                                        <PlusCircle size={14} className="inline mr-1"/> Tạo chiến dịch
                                    </button>
                                </div>
                            );
                        })}
                        {itemsToShowForNewCampaign.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">
                                Bạn không có {activeTab === 'products' ? 'sản phẩm' : 'nhiệm vụ'} nào để tạo chiến dịch mới.
                            </p>
                        )}
                     </div>
                </div>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">{editingCampaign ? 'Chỉnh sửa' : 'Tạo'} Chiến dịch</h2>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Ngân sách hàng ngày (VND)</label>
                                <input type="number" value={formData.dailyBudget} onChange={e => setFormData({...formData, dailyBudget: Number(e.target.value)})} min="5000" step="1000" required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                                <p className="text-xs text-gray-400 mt-1">Số tiền tối đa bạn muốn chi tiêu mỗi ngày.</p>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Giá thầu CPC (VND)</label>
                                <input type="number" value={formData.bidAmount} onChange={e => setFormData({...formData, bidAmount: Number(e.target.value)})} min="100" step="100" required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                                <p className="text-xs text-gray-400 mt-1">Số tiền tối đa bạn trả cho mỗi lượt click. Giá thầu cao hơn sẽ được ưu tiên hiển thị.</p>
                            </div>
                            {statusMessage.text && (<p className={`mt-2 text-sm text-center ${statusMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{statusMessage.text}</p>)}
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

export default AdvertisingPage;