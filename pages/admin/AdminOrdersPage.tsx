import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { OrderStatus, UserRole, Order } from '../../types.ts';
import { formatCurrency, formatDate } from '../../utils/formatter.ts';
import { Pagination } from '../../components/Pagination.tsx';
import { Eye } from '../../components/icons.tsx';

const AdminOrdersPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const ITEMS_PER_PAGE = 10;

    if (!context) return null;
    
    const { orders, users, currentUser, products } = context;

    const { paginatedOrders, totalPages } = useMemo(() => {
        let filtered: Order[] = orders;

        // If the current user is a seller, filter orders to only show theirs
        if (currentUser?.role === UserRole.SELLER) {
            const sellerProductIds = new Set(products.filter(p => p.sellerId === currentUser.id).map(p => p.id));
            filtered = orders.filter(o => o.items.some(i => sellerProductIds.has(i.product.id)));
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(o => o.status === statusFilter);
        }

        const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const total = sorted.length;
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedOrders = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        return { paginatedOrders, totalPages };

    }, [orders, statusFilter, currentPage, currentUser, products]);
    
    const getStatusClass = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.COMPLETED: return 'bg-green-900 text-green-300';
            case OrderStatus.PENDING: return 'bg-yellow-900 text-yellow-300';
            case OrderStatus.CANCELLED: return 'bg-red-900 text-red-300';
            case OrderStatus.PRE_ORDER: return 'bg-purple-900 text-purple-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Quản lý Đơn hàng</h1>

            <div className="mb-4">
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                >
                    <option value="all">Tất cả trạng thái</option>
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mã ĐH</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Khách hàng</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ngày</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tổng tiền</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {paginatedOrders.map(order => {
                                const user = users.find(u => u.id === order.userId);
                                return (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-400">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(order.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-400">{formatCurrency(order.total)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/order/${order.id}`} className="text-primary-400 hover:text-primary-300" title="Xem chi tiết">
                                            <Eye size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                 {paginatedOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Không có đơn hàng nào.
                    </div>
                )}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminOrdersPage;