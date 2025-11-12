import React, { useState, useContext } from 'react';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { Ad, AdType } from '../types.ts';
import { X, Upload } from './icons.tsx';

interface AdminAdEditModalProps {
    ad: Ad;
    onClose: () => void;
}

export const AdminAdEditModal: React.FC<AdminAdEditModalProps> = ({ ad, onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    const [type, setType] = useState<AdType>(ad.type);
    const [content, setContent] = useState(ad.content);
    const [link, setLink] = useState(ad.link || '');
    const [isActive, setIsActive] = useState(ad.isActive);
    const [error, setError] = useState('');

    if (!context) return null;
    const { updateAd } = context;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Kích thước ảnh không được vượt quá 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setContent(reader.result as string);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!content) {
            setError('Nội dung quảng cáo không được để trống.');
            return;
        }

        updateAd(ad.id, {
            type,
            content,
            link: type === AdType.IMAGE ? link : undefined,
            isActive
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Chỉnh sửa Quảng cáo: {ad.locationId}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Loại quảng cáo</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2"><input type="radio" name="type" value={AdType.IMAGE} checked={type === AdType.IMAGE} onChange={() => setType(AdType.IMAGE)} className="text-primary-500 bg-gray-700 border-gray-600" /> Hình ảnh</label>
                            <label className="flex items-center gap-2"><input type="radio" name="type" value={AdType.SCRIPT} checked={type === AdType.SCRIPT} onChange={() => setType(AdType.SCRIPT)} className="text-primary-500 bg-gray-700 border-gray-600" /> Script</label>
                        </div>
                    </div>

                    {type === AdType.IMAGE && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tải lên ảnh mới</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary-500">
                                    {content ? <img src={content} alt="Preview" className="max-h-full max-w-full" /> : <Upload className="w-8 h-8 text-gray-400" />}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Link khi click vào ảnh</label>
                                <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://example.com" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
                        </>
                    )}

                    {type === AdType.SCRIPT && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Mã Script</label>
                            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white font-mono text-sm" />
                        </div>
                    )}
                    
                     <div>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-primary-500 focus:ring-primary-500" />
                            <span className="text-white">Kích hoạt quảng cáo</span>
                        </label>
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
                <div className="flex justify-end gap-4 p-4 bg-gray-800/50 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                    <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Lưu</button>
                </div>
            </form>
        </div>
    );
};