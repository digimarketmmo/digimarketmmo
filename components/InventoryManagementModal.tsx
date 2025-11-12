import React, { useState, useContext, useMemo } from 'react';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { Product } from '../types.ts';
import { X, Upload, Trash2 } from './icons.tsx';
import { formatDate } from '../utils/formatter.ts';

interface InventoryManagementModalProps {
    product: Product;
    variantId: string;
    onClose: () => void;
}

export const InventoryManagementModal: React.FC<InventoryManagementModalProps> = ({ product, variantId, onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    const [file, setFile] = useState<File | null>(null);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    if (!context) return null;
    const { inventoryUploadLogs, uploadInventoryFile, deleteAllInventoryForVariant } = context;

    const variant = useMemo(() => product.variants.find(v => v.id === variantId), [product, variantId]);
    const logs = useMemo(() => 
        inventoryUploadLogs.filter(log => log.productId === product.id && log.variantId === variantId)
        .sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()), 
    [inventoryUploadLogs, product.id, variantId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) {
            setStatusMessage({ type: 'error', text: 'Vui lòng chọn một file.' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const result = uploadInventoryFile({
                productId: product.id,
                variantId: variantId,
                fileName: file.name,
                fileContent: content,
            });
            setStatusMessage({ type: result.success ? 'success' : 'error', text: result.message });
            setFile(null);
        };
        reader.readAsText(file);
    };
    
    const handleDeleteAll = () => {
        if (window.confirm(`Bạn có chắc muốn xóa TOÀN BỘ kho hàng cho biến thể "${variant?.name}"? Hành động này sẽ xóa tất cả các mục chưa bán.`)) {
            deleteAllInventoryForVariant(product.id, variantId);
            setStatusMessage({type: 'success', text: 'Đã xóa toàn bộ kho hàng cho biến thể này.'});
        }
    };

    if (!variant) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Quản lý kho: {product.name} - {variant.name}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Số lượng trong kho (chưa bán)</p>
                        <p className="text-2xl font-bold text-white">{variant.stock}</p>
                    </div>
                    
                    <div>
                        <h3 className="text-md font-semibold text-white mb-2">Tải lên kho hàng mới</h3>
                        <div className="flex items-center gap-4">
                            <input type="file" accept=".txt" onChange={handleFileChange} className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600/20 file:text-primary-300 hover:file:bg-primary-600/40" />
                            <button onClick={handleUpload} disabled={!file} className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-600">
                                <Upload size={16} /> Tải lên
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Chọn file .txt, mỗi mục trên một dòng. Các mục trùng lặp sẽ bị bỏ qua.</p>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-md font-semibold text-white mb-2">Lịch sử tải lên</h3>
                        <div className="bg-gray-900/50 rounded-lg max-h-48 overflow-y-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-700 sticky top-0"><tr>
                                    <th className="p-2 text-left">Ngày</th><th className="p-2 text-left">Tên file</th><th className="p-2 text-center">Thành công</th><th className="p-2 text-center">Lỗi</th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-700">
                                    {logs.map(log => (
                                        <tr key={log.id}>
                                            <td className="p-2">{formatDate(log.uploadDate)}</td>
                                            <td className="p-2 truncate max-w-xs">{log.fileName}</td>
                                            <td className="p-2 text-center text-green-400">{log.successCount}</td>
                                            <td className="p-2 text-center text-red-400">{log.errorCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {logs.length === 0 && <p className="p-4 text-center text-gray-500 text-xs">Chưa có lịch sử tải lên.</p>}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <h3 className="text-md font-semibold text-red-400 mb-2">Khu vực nguy hiểm</h3>
                        <button onClick={handleDeleteAll} className="inline-flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 text-sm">
                            <Trash2 size={16} /> Xóa toàn bộ kho của biến thể này
                        </button>
                    </div>

                     {statusMessage.text && (
                        <div className={`mt-4 p-3 rounded-md text-sm ${statusMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {statusMessage.text}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-4 p-4 bg-gray-800/50 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Đóng</button>
                </div>
            </div>
        </div>
    );
};
