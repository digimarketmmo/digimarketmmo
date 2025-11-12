import React, { useContext, useMemo, useState } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { Product, Task, AdCampaignStatus, Ad, AdType } from '../../types.ts';
import { formatCurrency } from '../../utils/formatter.ts';
import { XCircle, ExternalLink, Package, ClipboardList, Pause, Play, Image, Edit } from '../../components/icons.tsx';
import { Link } from 'react-router-dom';
import { AdminAdEditModal } from '../../components/AdminAdEditModal.tsx';

const AdminAdvertisingPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [mainTab, setMainTab] = useState<'campaigns' | 'banners'>('campaigns');
    const [campaignsSubTab, setCampaignsSubTab] = useState<'products' | 'tasks'>('products');
    const [editingAd, setEditingAd] = useState<Ad | null>(null);

    if (!context) return null;

    const { products, tasks, users, adCampaigns, pauseAdCampaign, resumeAdCampaign, ads } = context;

    const allCampaigns = useMemo(() => {
        return [...adCampaigns].sort((a,b) => b.bidAmount - a.bidAmount);
    }, [adCampaigns]);

    const productCampaigns = allCampaigns.filter(c => c.itemType === 'product');
    const taskCampaigns = allCampaigns.filter(c => c.itemType === 'task');
    
    const handleToggleStatus = (campaignId: string, currentStatus: AdCampaignStatus) => {
        if (currentStatus === AdCampaignStatus.PAUSED) {
            resumeAdCampaign(campaignId);
        } else {
            pauseAdCampaign(campaignId);
        }
    }
    
    const getStatusClass = (status: AdCampaignStatus) => ({
        [AdCampaignStatus.ACTIVE]: 'bg-green-500/20 text-green-400',
        [AdCampaignStatus.PAUSED]: 'bg-yellow-500/20 text-yellow-400',
        [AdCampaignStatus.OUT_OF_BUDGET]: 'bg-red-500/20 text-red-400',
        [AdCampaignStatus.ENDED]: 'bg-gray-500/20 text-gray-400',
    }[status]);

    const MainTabButton: React.FC<{ tabId: 'campaigns' | 'banners', icon: React.ReactNode, label: string, count: number }> = ({ tabId, icon, label, count }) => (
        <button onClick={() => setMainTab(tabId)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${mainTab === tabId ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>
            {icon}
            {label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${mainTab === tabId ? 'bg-primary-500/20 text-primary-300' : 'bg-gray-700 text-gray-300'}`}>{count}</span>
        </button>
    );
    
    const CampaignsSubTabButton: React.FC<{ tabId: 'products' | 'tasks', icon: React.ReactNode, label: string, count: number }> = ({ tabId, icon, label, count }) => (
        <button onClick={() => setCampaignsSubTab(tabId)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${campaignsSubTab === tabId ? 'border-b-2 border-secondary-500 text-secondary-400' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>
            {icon}
            {label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${campaignsSubTab === tabId ? 'bg-secondary-500/20 text-secondary-300' : 'bg-gray-600 text-gray-300'}`}>{count}</span>
        </button>
    );

    const renderCampaignsTable = (campaigns: typeof allCampaigns, type: 'product' | 'task') => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700"><tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">{type === 'product' ? 'Sản phẩm' : 'Nhiệm vụ'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Người tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                    {campaigns.map(c => {
                        const item = type === 'product' ? products.find(p => p.id === c.itemId) : tasks.find(t => t.id === c.itemId);
                        const user = users.find(u => u.id === c.sellerId);
                        if (!item || !user) return null;
                        
                        return (
                            <tr key={c.id}>
                                <td className="px-6 py-4 text-sm font-medium text-white">{'name' in item ? item.name : item.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{user.name}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(c.status)}`}>{c.status}</span></td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-4">
                                        <Link to={`/${type}s/${item.id}`} target="_blank" className="text-blue-400 hover:text-blue-300" title="Xem"><ExternalLink size={18} /></Link>
                                        <button onClick={() => handleToggleStatus(c.id, c.status)} className="p-2 rounded-full hover:bg-gray-600" title={c.status === AdCampaignStatus.PAUSED ? 'Tiếp tục' : 'Tạm dừng'}>
                                            {c.status === AdCampaignStatus.PAUSED ? <Play size={18} className="text-green-400" /> : <Pause size={18} className="text-yellow-400" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                     {campaigns.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-gray-400">Không có chiến dịch nào.</td></tr>}
                </tbody>
            </table>
        </div>
    );

     const renderBannersTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Vị trí</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Loại</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                    {ads.map(ad => (
                        <tr key={ad.id}>
                            <td className="px-6 py-4 text-sm font-medium text-white">{ad.locationId}</td>
                            <td className="px-6 py-4 text-sm text-gray-300 capitalize">{ad.type}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ad.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {ad.isActive ? 'Hoạt động' : 'Tắt'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => setEditingAd(ad)} className="text-primary-400 hover:text-primary-300" title="Chỉnh sửa"><Edit size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Quản lý Quảng cáo</h1>
            <div className="border-b border-gray-700 mb-1">
                <nav className="-mb-px flex space-x-6">
                    <MainTabButton tabId="campaigns" icon={<Package size={16}/>} label="Chiến dịch" count={allCampaigns.length} />
                    <MainTabButton tabId="banners" icon={<Image size={16}/>} label="Banner Quảng cáo" count={ads.length} />
                </nav>
            </div>
            
            {mainTab === 'campaigns' && (
                <div className="bg-gray-800 rounded-b-lg shadow-md overflow-hidden p-4">
                    <div className="border-b border-gray-700">
                       <nav className="-mb-px flex space-x-4">
                            <CampaignsSubTabButton tabId="products" icon={<Package size={14}/>} label="Sản phẩm" count={productCampaigns.length} />
                            <CampaignsSubTabButton tabId="tasks" icon={<ClipboardList size={14}/>} label="Nhiệm vụ" count={taskCampaigns.length} />
                        </nav>
                    </div>
                    <div className="pt-4">
                        {campaignsSubTab === 'products' ? renderCampaignsTable(productCampaigns, 'product') : renderCampaignsTable(taskCampaigns, 'task')}
                    </div>
                </div>
            )}

            {mainTab === 'banners' && (
                <div className="bg-gray-800 rounded-b-lg shadow-md overflow-hidden">
                    {renderBannersTable()}
                </div>
            )}
             {editingAd && <AdminAdEditModal ad={editingAd} onClose={() => setEditingAd(null)} />}
        </div>
    );
};

export default AdminAdvertisingPage;