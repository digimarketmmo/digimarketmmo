import React, { useContext, useState, useMemo } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { Product, ProductStatus, ProductVariant, ProductDeliveryType } from '../../types.ts';
import { AddProductModal } from '../../components/AddProductModal.tsx';
import { EditProductModal } from '../../components/EditProductModal.tsx';
import { InventoryManagementModal } from '../../components/InventoryManagementModal.tsx';
import { PlusCircle, Edit, Trash2, Package, ChevronDown } from '../../components/icons.tsx';

const SellerStockPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [inventoryModal, setInventoryModal] = useState<{product: Product, variantId: string} | null>(null);
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

    if (!context || !context.currentUser) return null;

    const { products, currentUser, deleteProduct } = context;

    const sellerProducts = useMemo(() => {
        return products
            .filter(p => p.sellerId === currentUser.id)
            .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [products, currentUser.id]);

    const toggleProductExpansion = (productId: string) => {
        setExpandedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };
    
    const handleDelete = (productId: string) => {
        if(window.confirm('Bạn có chắc muốn xóa sản phẩm này? Tất cả kho hàng liên quan cũng sẽ bị xóa.')) {
            deleteProduct(productId);
        }
    }

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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Sản phẩm & Kho hàng</h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <PlusCircle size={18} /> Thêm sản phẩm mới
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Sản phẩm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {sellerProducts.length === 0 && (
                                <tr><td colSpan={3} className="text-center py-12 text-gray-400">Bạn chưa có sản phẩm nào.</td></tr>
                            )}
                            {sellerProducts.map(product => (
                                <React.Fragment key={product.id}>
                                    <tr>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <button onClick={() => toggleProductExpansion(product.id)} className="mr-2 p-1 rounded-full hover:bg-gray-700">
                                                    <ChevronDown size={16} className={`transition-transform ${expandedProducts.has(product.id) ? 'rotate-180' : ''}`} />
                                                </button>
                                                <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.variants.length} biến thể</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(product.status)}`}>
                                                {product.status}
                                            </span>
                                            {product.status === ProductStatus.REJECTED && <p className="text-xs text-red-400 mt-1">Sản phẩm bị từ chối</p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-4">
                                                <button onClick={() => setEditingProduct(product)} className="text-primary-400 hover:text-primary-300" title="Chỉnh sửa"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300" title="Xóa"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedProducts.has(product.id) && (
                                        <tr>
                                            <td colSpan={3} className="p-0">
                                                <div className="bg-gray-900/50 p-4">
                                                    <h4 className="font-semibold text-gray-300 mb-2">Các biến thể:</h4>
                                                    <div className="space-y-2">
                                                        {product.variants.map(variant => (
                                                            <div key={variant.id} className="grid grid-cols-4 gap-4 items-center bg-gray-700/50 p-2 rounded-md text-sm">
                                                                <div className="col-span-2 text-white">{variant.name}</div>
                                                                <div className="text-gray-300">Kho: {variant.stock}</div>
                                                                <div>
                                                                    {product.deliveryType === ProductDeliveryType.INVENTORY && (
                                                                        <button onClick={() => setInventoryModal({product, variantId: variant.id})} className="w-full text-xs flex items-center justify-center gap-1 bg-blue-600/50 text-blue-300 p-2 rounded-md hover:bg-blue-600/70">
                                                                            <Package size={14}/> Quản lý kho
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} />}
            {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
            {inventoryModal && <InventoryManagementModal product={inventoryModal.product} variantId={inventoryModal.variantId} onClose={() => setInventoryModal(null)} />}
        </div>
    );
};

export default SellerStockPage;
