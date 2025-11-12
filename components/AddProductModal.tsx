import React, { useState, useContext } from 'react';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { ProductDeliveryType, ProductVariant } from '../types.ts';
import { X, PlusCircle, Trash2, Upload } from './icons.tsx';

interface AddProductModalProps {
    onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [imageName, setImageName] = useState('');
    const [deliveryType, setDeliveryType] = useState<ProductDeliveryType>(ProductDeliveryType.INVENTORY);
    const [variants, setVariants] = useState<Omit<ProductVariant, 'id'>[]>([{ name: 'Mặc định', price: 0, stock: 0 }]);
    const [error, setError] = useState('');

    if (!context) return null;
    const { categories, addProduct } = context;

    const handleVariantChange = (index: number, field: keyof Omit<ProductVariant, 'id'>, value: string | number) => {
        const newVariants = [...variants];
        const variant = newVariants[index];
        (variant[field] as any) = value; // Type assertion to assign value
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { name: '', price: 0, stock: 0 }]);
    };

    const removeVariant = (index: number) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Kích thước ảnh không được vượt quá 5MB.');
                return;
            }
            setImageName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageDataUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !description || !categoryId || !imageDataUrl || variants.some(v => !v.name || v.price < 0 || v.stock < 0)) {
            setError('Vui lòng điền đầy đủ và chính xác tất cả các trường bắt buộc.');
            return;
        }

        // FIX: Add slug generation to satisfy the Product interface.
        const slug = `${name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}-${Date.now()}`;

        const productData = {
            slug,
            name,
            description,
            categoryId,
            imageUrl: imageDataUrl,
            deliveryType,
            variants: variants.map(v => ({...v, id: `v-${Date.now()}-${Math.random()}`})),
        };
        
        addProduct(productData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Thêm sản phẩm mới</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tên sản phẩm *</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả *</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Danh mục *</label>
                            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white h-[42px]">
                                <option value="">Chọn danh mục</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Hình ảnh sản phẩm *</label>
                            {imageDataUrl ? (
                                <div className="relative">
                                    <img src={imageDataUrl} alt="Xem trước" className="w-full h-32 object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageDataUrl(null);
                                            setImageName('');
                                        }}
                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-md"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary-500">
                                    <span className="flex items-center space-x-2">
                                        <Upload className="w-6 h-6 text-gray-400" />
                                        <span className="font-medium text-gray-400">
                                            {imageName ? imageName : 'Click để chọn ảnh (max 5MB)'}
                                        </span>
                                    </span>
                                    <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phương thức giao hàng *</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2"><input type="radio" name="deliveryType" value={ProductDeliveryType.INVENTORY} checked={deliveryType === ProductDeliveryType.INVENTORY} onChange={() => setDeliveryType(ProductDeliveryType.INVENTORY)} className="text-primary-500 bg-gray-700 border-gray-600" /> Tự động (Kho)</label>
                            <label className="flex items-center gap-2"><input type="radio" name="deliveryType" value={ProductDeliveryType.MANUAL} checked={deliveryType === ProductDeliveryType.MANUAL} onChange={() => setDeliveryType(ProductDeliveryType.MANUAL)} className="text-primary-500 bg-gray-700 border-gray-600" /> Thủ công</label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <h3 className="text-md font-semibold text-white mb-2">Biến thể sản phẩm *</h3>
                        {variants.map((variant, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-2 bg-gray-700/50 rounded">
                                <input type="text" placeholder="Tên biến thể" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} required className="md:col-span-2 w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm" />
                                <input type="number" placeholder="Giá" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', parseInt(e.target.value) || 0)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm" />
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder="Kho" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm" />
                                    <button type="button" onClick={() => removeVariant(index)} disabled={variants.length <= 1} className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addVariant} className="text-sm flex items-center gap-1 text-primary-400 hover:underline mt-2">
                            <PlusCircle size={16} /> Thêm biến thể
                        </button>
                    </div>

                     {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
                <div className="flex justify-end gap-4 p-4 bg-gray-800/50 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                    <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Thêm sản phẩm</button>
                </div>
            </form>
        </div>
    );
};