import React, { useState, useContext } from 'react';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { Product, ProductDeliveryType, ProductVariant } from '../types.ts';
import { X, PlusCircle, Trash2, Upload } from './icons.tsx';

interface EditProductModalProps {
    product: Product;
    onClose: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        deliveryType: product.deliveryType,
    });
    const [imageDataUrl, setImageDataUrl] = useState<string>(product.imageUrl);
    const [variants, setVariants] = useState<ProductVariant[]>(product.variants);
    const [commissionRate, setCommissionRate] = useState(product.affiliateCommissionRate || 0);
    const [error, setError] = useState('');

    if (!context) return null;
    const { categories, updateProduct } = context;
    
    const lastUpdated = product.affiliateCommissionLastUpdated;
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const canEditCommission = !lastUpdated || (new Date().getTime() - new Date(lastUpdated).getTime()) > twoWeeksInMs;


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Kích thước ảnh không được vượt quá 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageDataUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
        const newVariants = [...variants];
        const variant = newVariants[index];
        (variant[field] as any) = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { id: `new-v-${Date.now()}`, name: '', price: 0, stock: 0 }]);
    };

    const removeVariant = (index: number) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.description || !formData.categoryId || !imageDataUrl || variants.some(v => !v.name || v.price < 0)) {
            setError('Vui lòng điền đầy đủ và chính xác tất cả các trường bắt buộc.');
            return;
        }

        const updatedProductData = {
            ...formData,
            imageUrl: imageDataUrl,
            variants: variants.map(v => ({
                ...v,
                stock: v.stock 
            })),
            affiliateCommissionRate: commissionRate,
        };
        
        updateProduct(product.id, updatedProductData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Chỉnh sửa sản phẩm</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tên sản phẩm *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả *</label>
                        <textarea name="description" value={formData.description} onChange={handleFormChange} required rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Danh mục *</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleFormChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white h-[42px]">
                                <option value="">Chọn danh mục</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">Hình ảnh sản phẩm *</label>
                            <div className="relative">
                                <img src={imageDataUrl} alt="Xem trước" className="w-full h-32 object-cover rounded-md" />
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                    <Upload size={24} />
                                    <span className="ml-2">Thay đổi ảnh</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phương thức giao hàng *</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2"><input type="radio" name="deliveryType" value={ProductDeliveryType.INVENTORY} checked={formData.deliveryType === ProductDeliveryType.INVENTORY} onChange={handleFormChange} className="text-primary-500 bg-gray-700 border-gray-600" /> Tự động (Kho)</label>
                            <label className="flex items-center gap-2"><input type="radio" name="deliveryType" value={ProductDeliveryType.MANUAL} checked={formData.deliveryType === ProductDeliveryType.MANUAL} onChange={handleFormChange} className="text-primary-500 bg-gray-700 border-gray-600" /> Thủ công</label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <h3 className="text-md font-semibold text-white mb-2">Biến thể sản phẩm *</h3>
                        {variants.map((variant, index) => (
                            <div key={variant.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-2 bg-gray-700/50 rounded">
                                <input type="text" placeholder="Tên biến thể" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} required className="md:col-span-2 w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm" />
                                <input type="number" placeholder="Giá" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', parseInt(e.target.value) || 0)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm" />
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder="Kho" value={variant.stock} disabled={product.deliveryType === ProductDeliveryType.INVENTORY} onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm disabled:bg-gray-800" />
                                    <button type="button" onClick={() => removeVariant(index)} disabled={variants.length <= 1} className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-gray-400">Lưu ý: Số lượng kho cho sản phẩm giao hàng tự động được quản lý trong 'Quản lý kho'.</p>
                        <button type="button" onClick={addVariant} className="text-sm flex items-center gap-1 text-primary-400 hover:underline mt-2">
                            <PlusCircle size={16} /> Thêm biến thể
                        </button>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <h3 className="text-md font-semibold text-white mb-2">Cài đặt Affiliate</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Tỷ lệ hoa hồng (%)</label>
                            <input 
                                type="number" 
                                value={commissionRate} 
                                onChange={e => setCommissionRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                                disabled={!canEditCommission}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-900 disabled:cursor-not-allowed"
                            />
                            {!canEditCommission ? (
                                <p className="text-xs text-yellow-400 mt-1">Bạn chỉ có thể thay đổi tỷ lệ hoa hồng sau 2 tuần. Lần cuối thay đổi: {lastUpdated ? new Date(lastUpdated).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-1">Phần trăm hoa hồng mà người giới thiệu sẽ nhận được. Đặt là 0 để tắt.</p>
                            )}
                        </div>
                    </div>


                     {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
                <div className="flex justify-end gap-4 p-4 bg-gray-800/50 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                    <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Lưu thay đổi</button>
                </div>
            </form>
        </div>
    );
};