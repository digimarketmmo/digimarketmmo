import React, { useContext, useMemo } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { formatCurrency } from '../../utils/formatter.ts';
import { OrderStatus } from '../../types.ts';

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center gap-4">
        <div className="bg-primary-600/20 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const SellerDashboardPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    
    if (!context || !context.currentUser) return null;

    const { orders, products, currentUser } = context;

    const {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalStock,
    } = useMemo(() => {
        const sellerProducts = products.filter(p => p.sellerId === currentUser.id);
        const sellerProductIds = new Set(sellerProducts.map(p => p.id));
        const sellerOrders = orders.filter(o => o.items.some(i => sellerProductIds.has(i.product.id)));

        const totalRevenue = sellerOrders
            .filter(o => o.status === OrderStatus.COMPLETED)
            .reduce((sum, order) => {
                const sellerTotalInOrder = order.items
                    .filter(item => sellerProductIds.has(item.product.id))
                    .reduce((itemSum, item) => itemSum + item.variant.price * item.quantity, 0);
                return sum + sellerTotalInOrder;
            }, 0);
        
        const totalOrders = sellerOrders.length;
        const totalProducts = sellerProducts.length;
        const totalStock = sellerProducts.reduce((sum, p) => sum + p.variants.reduce((variantSum, v) => variantSum + v.stock, 0), 0);

        return { totalRevenue, totalOrders, totalProducts, totalStock };
    }, [products, orders, currentUser]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Tổng quan Kênh người bán</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Tổng doanh thu"
                    value={formatCurrency(totalRevenue)}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
                />
                <StatCard 
                    title="Tổng đơn hàng"
                    value={totalOrders}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                />
                <StatCard 
                    title="Sản phẩm đang bán"
                    value={totalProducts}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>}
                />
                <StatCard 
                    title="Tổng kho"
                    value={totalStock}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>}
                />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-white">Chào mừng bạn đến với Kênh người bán!</p>
                <p className="text-gray-400 mt-2">
                    Đây là nơi bạn có thể quản lý sản phẩm, theo dõi đơn hàng và xem thống kê doanh thu.
                </p>
            </div>
        </div>
    );
}

export default SellerDashboardPage;