import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { Product, ProductStatus, UserRole } from '../../types.ts';
import { formatCurrency } from '../../utils/formatter.ts';
import { ExternalLink, Edit, Trash2 } from '../../components/icons.tsx';
import { Pagination } from '../../components/Pagination.tsx';

const AdminProductsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sellerFilter, setSellerFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    if (!context) return null;
    
    const { products, users } = context;

    const sellers = useMemo(() => {
        return users.filter(u => u.role === UserRole.SELLER || u.role === UserRole.ADMIN);
    }, [users]);

    const { paginatedProducts, totalPages } = useMemo(() => {
        let filtered = products;

        if (searchTerm.trim()) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }
        if (sellerFilter !== 'all') {
            filtered = filtered.filter(p => p.sellerId === sellerFilter);
        }
        
        const sorted = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const total = sorted.length;
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedProducts = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        return { paginatedProducts, totalPages };
    }, [products, searchTerm, statusFilter, sellerFilter, currentPage]);
    
    const getStatusClass = (status: ProductStatus) => {
        switch (status) {
            case ProductStatus.APPROVED: return 'bg-green-900 text-green-300';
            case ProductStatus.PENDING: return 'bg-yellow-900 text-yellow-300';
            case ProductStatus.REJECTED: return 'bg-red-900 text-red-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Quản lý Sản phẩm</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="md:col-span-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {Object.values(ProductStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <select
                        value={sellerFilter}
                        onChange={(e) => setSellerFilter(e.target.value)}
                        className="w-full h-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">Tất cả người bán</option>
                        {sellers.map(s => <option key={s.id} value={s.id}>{s.brandName || s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sản phẩm</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Người bán</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Giá</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tổng kho</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {paginatedProducts.map(product => {
                                const seller = users.find(u => u.id === product.sellerId);
                                return (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">{product.name}</div>
                                                <div className="text-sm text-gray-500">{context.categories.find(c => c.id === product.categoryId)?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{seller?.brandName || seller?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(product.status)}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-400">
                                        {formatCurrency(Math.min(...product.variants.map(v => v.price)))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-4">
                                            <Link to={`/products/${product.slug}`} target="_blank" className="text-green-400 hover:text-green-300" title="Xem sản phẩm"><ExternalLink size={18} /></Link>
                                            <button className="text-primary-400 hover:text-primary-300" title="Chỉnh sửa"><Edit size={18} /></button>
                                            <button className="text-red-400 hover:text-red-300" title="Xóa"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                             {paginatedProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">
                                        Không tìm thấy sản phẩm nào khớp với bộ lọc.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminProductsPage;