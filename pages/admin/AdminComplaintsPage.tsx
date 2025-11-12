import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { formatDate, formatTimeAgo } from '../../utils/formatter.ts';
import { ComplaintStatus, Complaint, UserRole } from '../../types.ts';
import { Pagination } from '../../components/Pagination.tsx';
import { Eye, X, ShieldCheck, DollarSign, Send } from '../../components/icons.tsx';


const AdminComplaintsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [adminMessage, setAdminMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 10;

    if (!context) return null;
    const { complaints, users, orders, messages, updateComplaintStatus, resolveComplaint, sendMessage, currentUser } = context;

    const { paginatedComplaints, totalPages } = useMemo(() => {
        const sortedComplaints = [...complaints].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const total = sortedComplaints.length;
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedComplaints = sortedComplaints.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        return { paginatedComplaints, totalPages };
    }, [complaints, currentPage]);

    const chatMessages = useMemo(() => {
        if (!selectedComplaint) return [];
        return messages
            .filter(m => m.complaintId === selectedComplaint.id)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }, [messages, selectedComplaint]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);
    
    useEffect(() => {
        if (selectedComplaint) {
            setResolutionNotes('');
            setAdminMessage('');
        }
    }, [selectedComplaint]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);
    
    const getStatusClass = (status: ComplaintStatus) => {
        switch (status) {
            case ComplaintStatus.OPEN: return 'bg-blue-900 text-blue-300';
            case ComplaintStatus.IN_PROGRESS: return 'bg-yellow-900 text-yellow-300';
            case ComplaintStatus.RESOLVED: return 'bg-green-900 text-green-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    const handleStartProcessing = () => {
        if (selectedComplaint) {
            updateComplaintStatus(selectedComplaint.id, ComplaintStatus.IN_PROGRESS);
            setSelectedComplaint(prev => prev ? {...prev, status: ComplaintStatus.IN_PROGRESS} : null);
        }
    };
    
    const handleResolve = (resolution: 'REFUND' | 'REJECT') => {
        if (!selectedComplaint) return;
        if (!resolutionNotes.trim()) {
            alert('Vui lòng nhập ghi chú giải quyết.');
            return;
        }
        resolveComplaint(selectedComplaint.id, resolution, resolutionNotes);
        setResolutionNotes('');
        setSelectedComplaint(null);
    };

    const handleAdminSendMessage = () => {
        if (!adminMessage.trim() || !selectedComplaint) return;
        
        const order = orders.find(o => o.id === selectedComplaint.orderId);
        if (!order) return;

        const buyer = users.find(u => u.id === order.userId);
        const seller = users.find(u => u.id === order.items[0]?.product.sellerId);
        
        if (buyer) {
            sendMessage(buyer.id, adminMessage, { complaintId: selectedComplaint.id });
        }
        if (seller) {
            sendMessage(seller.id, adminMessage, { complaintId: selectedComplaint.id });
        }
        setAdminMessage('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Xử lý khiếu nại</h1>
            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mã KN</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Người gửi</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tiêu đề</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ngày</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {paginatedComplaints.map(complaint => {
                                const user = users.find(u => u.id === complaint.userId);
                                return (
                                <tr key={complaint.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-400">{complaint.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white truncate max-w-xs">{complaint.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(complaint.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => setSelectedComplaint(complaint)}
                                            className="text-primary-400 hover:text-primary-300"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {selectedComplaint && (() => {
                const order = orders.find(o => o.id === selectedComplaint.orderId);
                const buyer = users.find(u => u.id === selectedComplaint.userId);
                const seller = order ? users.find(u => u.id === order.items[0]?.product.sellerId) : null;

                return (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-auto relative max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-700 flex-shrink-0 flex justify-between items-center">
                             <h2 className="text-xl font-bold text-white">Xử lý Khiếu nại: {selectedComplaint.id}</h2>
                             <button
                                onClick={() => setSelectedComplaint(null)}
                                className="text-gray-400 hover:text-white transition-colors z-10"
                                aria-label="Đóng"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Complaint Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Người mua (Khiếu nại)</label>
                                    <p className="text-white mt-1">{buyer?.name || 'N/A'}</p>
                                </div>
                                 <div>
                                    <label className="text-sm font-medium text-gray-400">Người bán</label>
                                    <p className="text-white mt-1">{seller?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Đơn hàng liên quan</label>
                                    <p className="text-primary-400 mt-1 hover:underline">
                                        <Link to={`/order/${selectedComplaint.orderId}`}>{selectedComplaint.orderId}</Link>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Ngày gửi</label>
                                    <p className="text-white mt-1">{formatDate(selectedComplaint.date)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Tiêu đề</label>
                                    <p className="text-white font-semibold mt-1">{selectedComplaint.subject}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Nội dung chi tiết</label>
                                    <div className="mt-1 p-3 bg-gray-900/50 rounded-md border border-gray-700 text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {selectedComplaint.description}
                                    </div>
                                </div>
                                {selectedComplaint.status === ComplaintStatus.RESOLVED && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-2">Kết quả Giải quyết</h3>
                                        <div className="mt-1 p-3 bg-gray-900/50 rounded-md border border-gray-700 text-gray-300 whitespace-pre-wrap">
                                            {selectedComplaint.resolutionNotes || "Không có ghi chú."}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Right Column: Chat & Actions */}
                            <div className="flex flex-col h-full">
                                <h3 className="text-lg font-semibold text-white mb-2">Lịch sử trao đổi</h3>
                                <div className="flex-grow bg-gray-900/50 p-3 rounded-lg border border-gray-700 overflow-y-auto space-y-4">
                                    {chatMessages.map(msg => {
                                        const sender = users.find(u => u.id === msg.senderId);
                                        const isAdminMsg = sender?.role === UserRole.ADMIN;
                                        const isBuyerMsg = sender?.id === buyer?.id;

                                        if (!sender) return null;
                                        
                                        return (
                                            <div key={msg.id} className={`flex items-end gap-2 ${isAdminMsg ? 'justify-center' : (isBuyerMsg ? 'justify-start' : 'justify-end')}`}>
                                                {isAdminMsg ? null : <img src={sender.avatarUrl} alt={sender.name} className={`w-6 h-6 rounded-full flex-shrink-0 ${isBuyerMsg ? 'order-1' : 'order-2'}`} />}
                                                <div className={`max-w-xs p-2 rounded-lg ${
                                                        isAdminMsg ? 'bg-gray-600 text-yellow-300 text-center text-xs w-full' :
                                                        isBuyerMsg ? 'bg-gray-700 text-gray-200 rounded-bl-none order-2' : 
                                                        'bg-primary-700 text-white rounded-br-none order-1'
                                                    }`}>
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${isAdminMsg ? 'text-gray-400' : (isBuyerMsg ? 'text-gray-400' : 'text-primary-200')} text-right`}>{formatTimeAgo(msg.timestamp)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {chatMessages.length === 0 && <p className="text-center text-gray-500 text-sm">Chưa có tin nhắn nào.</p>}
                                    <div ref={chatEndRef} />
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Gửi tin nhắn đến các bên..."
                                        value={adminMessage}
                                        onChange={(e) => setAdminMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAdminSendMessage()}
                                        className="flex-grow bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        disabled={selectedComplaint.status === ComplaintStatus.RESOLVED}
                                    />
                                    <button
                                        onClick={handleAdminSendMessage}
                                        className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors disabled:bg-gray-600"
                                        disabled={!adminMessage.trim() || selectedComplaint.status === ComplaintStatus.RESOLVED}
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Resolution Area */}
                        {selectedComplaint.status === ComplaintStatus.IN_PROGRESS && (
                            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                                <h3 className="text-lg font-semibold text-white mb-2">Giải quyết Khiếu nại</h3>
                                <textarea
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Nhập ghi chú và lý do giải quyết..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-primary-500"
                                />
                            </div>
                        )}
                        <div className="flex justify-between items-center gap-4 p-4 bg-gray-900/50 border-t border-gray-700 flex-shrink-0">
                            <div>
                                {selectedComplaint.status === ComplaintStatus.OPEN && (
                                    <button
                                        onClick={handleStartProcessing}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors"
                                    >
                                       <ShieldCheck size={16}/> Bắt đầu xử lý
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedComplaint(null)} 
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                                >
                                    Đóng
                                </button>
                                {selectedComplaint.status === ComplaintStatus.IN_PROGRESS && (
                                   <>
                                    <button
                                        onClick={() => handleResolve('REJECT')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                       <X size={16}/> Từ chối
                                    </button>
                                    <button
                                        onClick={() => handleResolve('REFUND')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <DollarSign size={16}/> Hoàn tiền
                                    </button>
                                   </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                )
            })()}
        </div>
    );
};

export default AdminComplaintsPage;