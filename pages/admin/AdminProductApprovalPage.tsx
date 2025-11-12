import React, { useContext, useMemo } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { ProductStatus } from '../../types.ts';
import { formatCurrency } from '../../utils/formatter.ts';
import { Check, XCircle, ExternalLink } from '../../components/icons.tsx';

const AdminProductApprovalPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;

    if (!context) return null;

    const { products, users, approveProduct, rejectProduct } = context;

    const pendingProducts = useMemo(() => {
        return products.filter(p => p.status === ProductStatus.PENDING);
    }, [products]);

    const handlePreview = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const baseUrl = window.location.href.split('#')[0];
        const url = `${baseUrl}#/products/${product.slug}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Duyệt sản phẩm</h1>
            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                         <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Sản phẩm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Người bán</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {pendingProducts.map(product => {
                                const seller = users.find(u => u.id === product.sellerId);
                                return (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">{product.name}</div>
                                                    <div className="text-sm text-gray-400">
                                                        Giá từ: {formatCurrency(Math.min(...product.variants.map(v => v.price)))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{seller?.brandName || seller?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end items-center gap-4">
                                                <button onClick={() => handlePreview(product.id)} className="text-blue-400 hover:text-blue-300" title="Xem trước"><ExternalLink size={18} /></button>
                                                <button onClick={() => approveProduct(product.id)} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40" title="Duyệt"><Check size={18} /></button>
                                                <button onClick={() => rejectProduct(product.id)} className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/40" title="Từ chối"><XCircle size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                    {pendingProducts.map(product => {
                        const seller = users.find(u => u.id === product.sellerId);
                        return (
                            <div key={product.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-start gap-4">
                                    <img className="h-12 w-12 rounded-md object-cover mt-1" src={product.imageUrl} alt={product.name} />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{product.name}</p>
                                        <p className="text-sm text-gray-400">Người bán: {seller?.brandName || seller?.name || 'N/A'}</p>
                                        <p className="text-sm text-primary-400">
                                            Giá từ: {formatCurrency(Math.min(...product.variants.map(v => v.price)))}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end items-center gap-4 mt-3 pt-3 border-t border-gray-600">
                                    <button onClick={() => handlePreview(product.id)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm" title="Xem trước">
                                        <ExternalLink size={16} /> Xem
                                    </button>
                                    <button onClick={() => approveProduct(product.id)} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40" title="Duyệt"><Check size={18} /></button>
                                    <button onClick={() => rejectProduct(product.id)} className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/40" title="Từ chối"><XCircle size={18} /></button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {pendingProducts.length === 0 && <p className="text-center py-12 text-gray-400">Không có sản phẩm nào chờ duyệt.</p>}
            </div>
        </div>
    );
};

export default AdminProductApprovalPage;