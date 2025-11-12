import React, { useState, useContext } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { Send } from '../../components/icons.tsx';

const AdminAnnouncementsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [targetAudience, setTargetAudience] = useState<'all' | 'sellers' | 'buyers'>('all');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    if (!context) return null;
    
    const { sendAdminAnnouncement } = context;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });

        if (!title.trim() || !message.trim()) {
            setStatusMessage({ type: 'error', text: 'Tiêu đề và Nội dung không được để trống.' });
            return;
        }

        try {
            sendAdminAnnouncement(title, message, link || '/notifications', targetAudience);
            setStatusMessage({ type: 'success', text: `Thông báo đã được gửi thành công!` });
            // Reset form
            setTitle('');
            setMessage('');
            setLink('');
            setTargetAudience('all');
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Đã xảy ra lỗi khi gửi thông báo.' });
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Gửi thông báo</h1>
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                            Tiêu đề *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                            Nội dung *
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows={5}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-1">
                            Đường dẫn (Tùy chọn)
                        </label>
                        <input
                            type="text"
                            id="link"
                            value={link}
                            placeholder="VD: /support"
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-300 mb-1">
                            Người nhận
                        </label>
                        <select
                            id="targetAudience"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value as 'all' | 'sellers' | 'buyers')}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">Gửi cho tất cả người dùng</option>
                            <option value="sellers">Chỉ người bán (Sellers)</option>
                            <option value="buyers">Chỉ người mua (Buyers)</option>
                        </select>
                         <p className="text-xs text-gray-400 mt-1">Thông báo sẽ được gửi đến nhóm người dùng đã chọn.</p>
                    </div>
                    {statusMessage.text && (
                        <div className={`p-3 rounded-md text-sm ${statusMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {statusMessage.text}
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Send size={18} /> Gửi thông báo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminAnnouncementsPage;