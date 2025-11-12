import React, { useState, useContext, useRef } from 'react';
import { Task } from '../types.ts';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { X, Send, Upload } from './icons.tsx';

interface TaskProofModalProps {
    task: Task;
    onClose: () => void;
}

export const TaskProofModal: React.FC<TaskProofModalProps> = ({ task, onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    const [textProof, setTextProof] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!context) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
    
        if (images.length + files.length > 5) {
            setStatusMessage({ type: 'error', text: 'Bạn chỉ có thể tải lên tối đa 5 ảnh.' });
            return;
        }
    
        // FIX: Explicitly type 'file' as File to access its properties.
        Array.from(files).forEach((file: File) => {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit per image
                setStatusMessage({ type: 'error', text: `Ảnh "${file.name}" quá lớn (tối đa 5MB).` });
                return; // Skips this file
            }
    
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        // Clear the input value to allow re-uploading the same file if needed
        e.target.value = '';
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });

        if (!textProof.trim() && images.length === 0) {
            setStatusMessage({ type: 'error', text: 'Vui lòng nhập bằng chứng hoặc tải lên ít nhất một ảnh.' });
            return;
        }

        const result = context.submitTaskProof(task.id, { text: textProof, images });
        if (result.success) {
            setStatusMessage({ type: 'success', text: result.message });
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setStatusMessage({ type: 'error', text: result.message });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Nộp bằng chứng hoàn thành</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <p className="text-sm text-gray-400">Nhiệm vụ:</p>
                        <p className="font-semibold text-white">{task.title}</p>
                    </div>
                    <div>
                        <label htmlFor="proof" className="block text-sm font-medium text-gray-300 mb-1">
                            Bằng chứng hoàn thành (văn bản)
                        </label>
                        <textarea
                            id="proof"
                            value={textProof}
                            onChange={(e) => setTextProof(e.target.value)}
                            rows={4}
                            placeholder="Mô tả chi tiết hoặc dán link chứng minh bạn đã hoàn thành nhiệm vụ..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Ảnh đính kèm (tối đa 5 ảnh, 5MB/ảnh)
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                            {images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img src={image} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded-md border border-gray-700" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-20 flex items-center justify-center bg-gray-700 border-2 border-dashed border-gray-600 rounded-md hover:border-primary-500 transition-colors"
                                    aria-label="Add image"
                                >
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </div>
                    {statusMessage.text && (
                        <div className={`p-3 rounded-md text-sm ${statusMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {statusMessage.text}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-4 p-4 bg-gray-800/50 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                    <button type="submit" className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">
                        <Send size={16} /> Gửi
                    </button>
                </div>
            </form>
        </div>
    );
};