import React, { useState, useContext } from 'react';
import { Task } from '../types.ts';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { X, Send, Star } from './icons.tsx';

interface TaskReviewModalProps {
    task: Task;
    onClose: () => void;
}

export const TaskReviewModal: React.FC<TaskReviewModalProps> = ({ task, onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    if (!context) return null;

    const { submitTaskReview } = context;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });

        if (rating === 0) {
            setStatusMessage({ type: 'error', text: 'Vui lòng chọn số sao đánh giá.' });
            return;
        }
        if (!comment.trim()) {
            setStatusMessage({ type: 'error', text: 'Vui lòng nhập nhận xét của bạn.' });
            return;
        }

        const result = submitTaskReview(task.id, rating, comment);
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
                    <h2 className="text-lg font-bold text-white">Đánh giá nhiệm vụ</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-400">Nhiệm vụ:</p>
                        <p className="font-semibold text-white">{task.title}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-center text-gray-300 mb-2">
                            Bạn đánh giá trải nghiệm này thế nào? *
                        </label>
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={32}
                                    className={`cursor-pointer transition-colors ${
                                        (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-600'
                                    }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">
                            Nhận xét của bạn *
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows={4}
                            placeholder="Chia sẻ cảm nhận của bạn về nhiệm vụ này..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-primary-500"
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
                        <Send size={16} /> Gửi đánh giá
                    </button>
                </div>
            </form>
        </div>
    );
};
