import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { FinancialRequest, FinancialRequestStatus, FinancialRequestType } from '../../types.ts';
import { formatCurrency, formatDate } from '../../utils/formatter.ts';
import { Check, XCircle, QrCode, X } from '../../components/icons.tsx';
import { getBankBin } from '../../utils/bankHelper.ts';


const AdminFinancialRequestsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [filter, setFilter] = useState<FinancialRequestStatus | 'all'>(FinancialRequestStatus.PENDING);
    const [qrModalRequest, setQrModalRequest] = useState<FinancialRequest | null>(null);

    if (!context) return null;

    const { financialRequests, users, processFinancialRequest } = context;
    
    const filteredRequests = financialRequests.filter(r => 
        (filter === 'all' || r.status === filter) && r.type !== FinancialRequestType.EXCHANGE
    ).sort((a,b) => b.date.getTime() - a.date.getTime());

    const handleProcess = (req: FinancialRequest, status: 'approve' | 'reject') => {
        const action = status === 'approve' ? 'DUYỆT' : 'TỪ CHỐI';
        if (window.confirm(`Bạn có chắc muốn ${action} yêu cầu ${req.type.toLowerCase()} ${formatCurrency(req.amount)} của ${users.find(u => u.id === req.userId)?.name}?`)) {
            processFinancialRequest(req.id, status === 'approve' ? FinancialRequestStatus.APPROVED : FinancialRequestStatus.REJECTED);
        }
    };
    
    const getStatusClass = (status: FinancialRequestStatus) => {
        switch (status) {
            case FinancialRequestStatus.APPROVED: return 'bg-green-900 text-green-300';
            case FinancialRequestStatus.PENDING: return 'bg-yellow-900 text-yellow-300';
            case FinancialRequestStatus.REJECTED: return 'bg-red-900 text-red-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    const renderRequestDetails = (req: FinancialRequest) => {
        return req.transactionCode || `${req.bankName} - ${req.accountNumber} - ${req.accountHolder}`;
    };

    const renderRequestType = (req: FinancialRequest) => {
        return req.type;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Yêu cầu Nạp/Rút</h1>
            <div className="mb-4">
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
                    <option value="all">Tất cả</option>
                    {Object.values(FinancialRequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Người dùng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Số tiền</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Chi tiết</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {filteredRequests.map(req => {
                                const user = users.find(u => u.id === req.userId);
                                return (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 text-white">{user?.name}</td>
                                        <td className="px-6 py-4 text-white">{renderRequestType(req)}</td>
                                        <td className="px-6 py-4 text-primary-400 font-semibold">{formatCurrency(req.amount)}</td>
                                        <td className="px-6 py-4 text-gray-300 text-xs">{renderRequestDetails(req)}</td>
                                        <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(req.status)}`}>{req.status}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {req.type === FinancialRequestType.WITHDRAWAL && req.status === FinancialRequestStatus.PENDING && (
                                                    <button onClick={() => setQrModalRequest(req)} className="p-2 text-blue-400 hover:text-blue-300" title="Hiển thị QR rút tiền">
                                                        <QrCode size={18} />
                                                    </button>
                                                )}
                                                {req.status === FinancialRequestStatus.PENDING && (
                                                    <>
                                                        <button onClick={() => handleProcess(req, 'approve')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40" title="Duyệt"><Check size={18} /></button>
                                                        <button onClick={() => handleProcess(req, 'reject')} className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/40" title="Từ chối"><XCircle size={18} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                     {filteredRequests.map(req => {
                        const user = users.find(u => u.id === req.userId);
                        return (
                            <div key={req.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-white">{user?.name}</p>
                                        <p className="text-sm text-gray-400">{renderRequestType(req)}</p>
                                    </div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(req.status)}`}>{req.status}</span>
                                </div>
                                <p className="text-xl font-bold text-primary-400 my-2">{formatCurrency(req.amount)}</p>
                                <p className="text-xs text-gray-300 break-words">Chi tiết: {renderRequestDetails(req)}</p>

                                {req.status === FinancialRequestStatus.PENDING && (
                                    <div className="flex justify-end items-center gap-2 mt-3 pt-3 border-t border-gray-600">
                                         {req.type === FinancialRequestType.WITHDRAWAL && (
                                            <button onClick={() => setQrModalRequest(req)} className="p-2 text-blue-400 hover:text-blue-300" title="Hiển thị QR rút tiền">
                                                <QrCode size={18} />
                                            </button>
                                        )}
                                        <button onClick={() => handleProcess(req, 'approve')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40" title="Duyệt"><Check size={18} /></button>
                                        <button onClick={() => handleProcess(req, 'reject')} className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/40" title="Từ chối"><XCircle size={18} /></button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {filteredRequests.length === 0 && <p className="text-center py-12 text-gray-400">Không có yêu cầu nào.</p>}
            </div>

            {qrModalRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setQrModalRequest(null)}>
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">QR Code Rút Tiền</h3>
                            <button onClick={() => setQrModalRequest(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                        </div>
                        <div className="flex flex-col items-center">
                            {(() => {
                                const bin = getBankBin(qrModalRequest.bankName || '');
                                if (!bin) {
                                    return <p className="text-yellow-400 text-center">Không tìm thấy mã BIN cho ngân hàng "{qrModalRequest.bankName}". Vui lòng chuyển khoản thủ công.</p>;
                                }
                                const description = `Rut tien ${qrModalRequest.id}`.replace(/\s/g, '+');
                                const accountName = encodeURIComponent(qrModalRequest.accountHolder || '');
                                const qrUrl = `https://img.vietqr.io/image/${bin}-${qrModalRequest.accountNumber}-compact.png?amount=${qrModalRequest.amount}&addInfo=${description}&accountName=${accountName}`;

                                return <img src={qrUrl} alt="VietQR Code" className="w-64 h-64 mx-auto bg-white p-2 rounded-md" />;
                            })()}
                        </div>
                        <div className="mt-4 text-sm space-y-2 text-gray-300 bg-gray-900/50 p-4 rounded-md">
                            <p><strong>Ngân hàng:</strong> {qrModalRequest.bankName}</p>
                            <p><strong>Chủ TK:</strong> {qrModalRequest.accountHolder}</p>
                            <p><strong>STK:</strong> {qrModalRequest.accountNumber}</p>
                            <p><strong>Số tiền:</strong> {formatCurrency(qrModalRequest.amount)}</p>
                            <p><strong>Nội dung:</strong> Rut tien {qrModalRequest.id}</p>
                        </div>
                        <button onClick={() => setQrModalRequest(null)} className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFinancialRequestsPage;