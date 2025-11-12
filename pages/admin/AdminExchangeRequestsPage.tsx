import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { FinancialRequest, FinancialRequestStatus, FinancialRequestType } from '../../types.ts';
import { formatCurrency } from '../../utils/formatter.ts';
import { Check, XCircle, QrCode, X, Copy } from '../../components/icons.tsx';
import { getBankBin } from '../../utils/bankHelper.ts';

const CryptoTransferDetailModal: React.FC<{ request: FinancialRequest, onClose: () => void }> = ({ request, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);
    const { exchangeDetails } = request;
    if (!exchangeDetails || exchangeDetails.direction !== 'buy') return null;

    const { currency, usdAmount, userWalletAddress } = exchangeDetails;
    
    let qrData = userWalletAddress || '';
    if (currency === 'Payeer') {
        qrData = `payeer://${userWalletAddress}?amount=${usdAmount}`;
    }
    
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Chi tiết chuyển khoản Crypto</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="flex flex-col items-center">
                    <img src={qrApiUrl} alt={`${currency} QR Code`} className="w-56 h-56 mx-auto bg-white p-2 rounded-md" />
                </div>
                <div className="mt-4 text-sm space-y-2 text-gray-300 bg-gray-900/50 p-4 rounded-md">
                    <p><strong>Thao tác:</strong> Gửi <strong className="text-primary-400">{usdAmount} {currency}</strong></p>
                    <div className="flex items-center justify-between">
                        <strong>Đến địa chỉ:</strong>
                        <button onClick={() => handleCopy(userWalletAddress || '')} className="text-gray-400 hover:text-white">
                            {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                    <p className="font-mono text-primary-400 break-all bg-gray-700 p-2 rounded">{userWalletAddress}</p>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">Đóng</button>
            </div>
        </div>
    );
};

const VietQRModal: React.FC<{ request: FinancialRequest, onClose: () => void }> = ({ request, onClose }) => {
    const { exchangeDetails } = request;
    if (!exchangeDetails || exchangeDetails.direction !== 'sell') return null;

    const { userBankName, userAccountNumber, userAccountHolder, vndAmount } = exchangeDetails;
    
    const bin = getBankBin(userBankName || '');
    const description = `Thanh toan don hang ${request.id}`.replace(/\s/g, '+');
    const accountName = encodeURIComponent(userAccountHolder || '');
    const qrUrl = bin 
        ? `https://img.vietqr.io/image/${bin}-${userAccountNumber}-compact.png?amount=${vndAmount}&addInfo=${description}&accountName=${accountName}`
        : '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">QR Code Chuyển tiền</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="flex flex-col items-center">
                    {qrUrl ? (
                        <img src={qrUrl} alt="VietQR Code" className="w-64 h-64 mx-auto bg-white p-2 rounded-md" />
                    ) : (
                         <p className="text-yellow-400 text-center bg-gray-700 p-4 rounded-md">Không tìm thấy mã BIN cho ngân hàng "{userBankName}". Vui lòng chuyển khoản thủ công.</p>
                    )}
                </div>
                <div className="mt-4 text-sm space-y-2 text-gray-300 bg-gray-900/50 p-4 rounded-md">
                    <p><strong>Ngân hàng:</strong> {userBankName}</p>
                    <p><strong>Chủ TK:</strong> {userAccountHolder}</p>
                    <p><strong>STK:</strong> {userAccountNumber}</p>
                    <p><strong>Số tiền:</strong> {formatCurrency(vndAmount)}</p>
                    <p><strong>Nội dung:</strong> {`Thanh toan don hang ${request.id}`}</p>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">Đóng</button>
            </div>
        </div>
    );
};


const AdminExchangeRequestsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [filter, setFilter] = useState<FinancialRequestStatus | 'all'>(FinancialRequestStatus.PENDING);
    const [cryptoModalRequest, setCryptoModalRequest] = useState<FinancialRequest | null>(null);
    const [vietQrModalRequest, setVietQrModalRequest] = useState<FinancialRequest | null>(null);


    if (!context) return null;

    const { financialRequests, users, processFinancialRequest } = context;
    
    const filteredRequests = financialRequests
        .filter(r => r.type === FinancialRequestType.EXCHANGE && (filter === 'all' || r.status === filter))
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    const handleProcess = (req: FinancialRequest, status: 'approve' | 'reject') => {
        const action = status === 'approve' ? 'DUYỆT' : 'TỪ CHỐI';
        if (window.confirm(`Bạn có chắc muốn ${action} yêu cầu này?`)) {
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

    return (
        <div>
            {cryptoModalRequest && <CryptoTransferDetailModal request={cryptoModalRequest} onClose={() => setCryptoModalRequest(null)} />}
            {vietQrModalRequest && <VietQRModal request={vietQrModalRequest} onClose={() => setVietQrModalRequest(null)} />}
            <h1 className="text-3xl font-bold text-white mb-6">Yêu cầu Giao dịch Mua/Bán</h1>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Loại GD</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Số tiền (USD)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Số tiền (VND)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Chi tiết</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {filteredRequests.map(req => {
                                const user = users.find(u => u.id === req.userId);
                                const details = req.exchangeDetails;
                                if (!details) return null;

                                return (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 text-white">{user?.name}</td>
                                        <td className={`px-6 py-4 font-semibold ${details.direction === 'buy' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {details.direction === 'buy' ? 'KH Mua' : 'KH Bán'} {details.currency}
                                        </td>
                                        <td className="px-6 py-4 text-white font-semibold">{details.usdAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-primary-400 font-semibold">{formatCurrency(details.vndAmount)}</td>
                                        <td className="px-6 py-4 text-gray-300 text-xs max-w-xs truncate">
                                            {details.direction === 'buy' ? 
                                             `Ví: ${details.userWalletAddress}` :
                                             `Bank: ${details.userBankName} - ${details.userAccountNumber}`
                                            }
                                        </td>
                                        <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(req.status)}`}>{req.status}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {details.direction === 'buy' && req.status === FinancialRequestStatus.PENDING && (details.currency === 'Payeer' || details.currency === 'USDT') && (
                                                    <button onClick={() => setCryptoModalRequest(req)} className="p-2 text-blue-400 hover:text-blue-300" title="Hiển thị QR chuyển khoản Crypto">
                                                        <QrCode size={18} />
                                                    </button>
                                                )}
                                                 {details.direction === 'sell' && req.status === FinancialRequestStatus.PENDING && (
                                                    <button onClick={() => setVietQrModalRequest(req)} className="p-2 text-blue-400 hover:text-blue-300" title="Hiển thị QR chuyển khoản VND">
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
                             {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">Không có yêu cầu nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                     {filteredRequests.map(req => {
                        const user = users.find(u => u.id === req.userId);
                        const details = req.exchangeDetails;
                        if (!details) return null;

                        return (
                            <div key={req.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-white">{user?.name}</p>
                                        <p className={`text-sm font-semibold ${details.direction === 'buy' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {details.direction === 'buy' ? 'KH Mua' : 'KH Bán'} {details.currency}
                                        </p>
                                    </div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(req.status)}`}>{req.status}</span>
                                </div>

                                <div className="my-3 grid grid-cols-2 gap-2 text-center">
                                     <div className="bg-gray-800/50 p-2 rounded">
                                        <p className="text-xs text-gray-400">Số tiền ({details.currency})</p>
                                        <p className="font-bold text-white">{details.usdAmount.toFixed(2)}</p>
                                     </div>
                                     <div className="bg-gray-800/50 p-2 rounded">
                                        <p className="text-xs text-gray-400">Số tiền (VND)</p>
                                        <p className="font-bold text-primary-400">{formatCurrency(details.vndAmount)}</p>
                                     </div>
                                </div>
                                
                                <p className="text-xs text-gray-300 break-words bg-gray-900/50 p-2 rounded">
                                    <strong>Chi tiết: </strong> 
                                    {details.direction === 'buy' ? 
                                     `Ví: ${details.userWalletAddress}` :
                                     `Bank: ${details.userBankName} - ${details.userAccountNumber}`
                                    }
                                </p>

                                {req.status === FinancialRequestStatus.PENDING && (
                                    <div className="flex justify-end items-center gap-2 mt-3 pt-3 border-t border-gray-600">
                                        {details.direction === 'buy' && (details.currency === 'Payeer' || details.currency === 'USDT') && (
                                            <button onClick={() => setCryptoModalRequest(req)} className="p-2 text-blue-400 hover:text-blue-300" title="Hiển thị QR chuyển khoản Crypto">
                                                <QrCode size={18} />
                                            </button>
                                        )}
                                        {details.direction === 'sell' && (
                                            <button onClick={() => setVietQrModalRequest(req)} className="p-2 text-blue-400 hover:text-blue-300" title="Hiển thị QR chuyển khoản VND">
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
                     {filteredRequests.length === 0 && <p className="text-center py-12 text-gray-400">Không có yêu cầu nào.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminExchangeRequestsPage;