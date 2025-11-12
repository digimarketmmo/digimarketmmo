import React from 'react';
import { User } from '../types.ts';
import { X } from './icons.tsx';

interface VerificationDocumentModalProps {
    user: User;
    onClose: () => void;
}

export const VerificationDocumentModal: React.FC<VerificationDocumentModalProps> = ({ user, onClose }) => {
    
    const urls = user.verificationDocumentUrl 
        ? (user.verificationDocumentUrl.includes('|||') ? user.verificationDocumentUrl.split('|||') : [user.verificationDocumentUrl])
        : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Tài liệu xác minh của {user.name}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-6">
                    {urls.length > 0 ? (
                        <div className="flex flex-col md:flex-row gap-4 justify-center items-start">
                            {urls.map((url, index) => (
                                url && <div key={index} className="flex-1">
                                    <h3 className="text-center font-semibold text-gray-300 mb-2">
                                        {urls.length > 1 ? (index === 0 ? 'Mặt trước' : 'Mặt sau') : 'Tài liệu'}
                                    </h3>
                                    <img src={url} alt={`Tài liệu ${index + 1}`} className="max-w-full max-h-[60vh] mx-auto rounded-md border border-gray-600" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400">Không tìm thấy tài liệu.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
