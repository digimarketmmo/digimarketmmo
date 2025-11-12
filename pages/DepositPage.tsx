import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { Copy, Check, Landmark, ArrowLeft } from '../components/icons.tsx';
import { FinancialRequestType } from '../types.ts';
import { formatCurrency } from '../utils/formatter.ts';

const DepositPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const navigate = useNavigate();
    const [amount, setAmount] = useState<number>(0);
    const [transactionCode, setTransactionCode] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    if (!context || !context.currentUser) return null;

    const { platformBankAccounts, createFinancialRequest, currentUser } = context;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        if (amount < 20000) {
            setStatus({ type: 'error', message: `Số tiền nạp tối thiểu là ${formatCurrency(20000)}.` });
            return;
        }
        if (!transactionCode.trim()) {
            setStatus({ type: 'error', message: 'Vui lòng nhập mã giao dịch hợp lệ.' });
            return;
        }

        const result = createFinancialRequest({
            type: FinancialRequestType.DEPOSIT,
            amount,
            transactionCode,
        });

        if (result.success) {
            setStatus({ type: 'success', message: result.message });
            setTimeout(() => navigate('/profile#wallet'), 2000);
        } else {
            setStatus({ type: 'error', message: result.message });
        }
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    const account = platformBankAccounts[0]; // Assuming there's at least one account
    if (!account) return <div>Hệ thống chưa cấu hình tài khoản ngân hàng.</div>;
    
    const qrCodeUrl = `${account.qrCodeUrl}?amount=${amount}&addInfo=Nap tien ${currentUser.id}`;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
             <Link to="/profile#wallet" className="inline-flex items-center gap-2 text-primary-400 hover:underline mb-6">
                <ArrowLeft size={16} /> Quay lại Ví
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Nạp tiền vào tài khoản</h1>
            <p className="text-gray-400 mb-6">Để nạp tiền, vui lòng chuyển khoản chính xác đến thông tin bên dưới và tạo lệnh xác nhận.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bank Info */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Landmark size={20} /> Thông tin chuyển khoản</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Ngân hàng:</span>
                            <span className="font-semibold text-white">{account.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Chủ tài khoản:</span>
                            <span className="font-semibold text-white">{account.accountHolder}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-400">Số tài khoản:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-primary-400">{account.accountNumber}</span>
                                <button onClick={() => handleCopy(account.accountNumber)} className="text-gray-400 hover:text-white">
                                     {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                         <div className="pt-4 border-t border-gray-700">
                            <p className="text-gray-400">Nội dung chuyển khoản:</p>
                            <p className="font-semibold text-white bg-gray-700 p-2 rounded-md mt-1 text-center">Nap tien {currentUser.id}</p>
                        </div>
                    </div>
                     {account.qrCodeUrl && (
                        <div className="mt-6 text-center">
                            <h3 className="text-white font-semibold">Hoặc quét mã VietQR</h3>
                            <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto mt-2 rounded-lg bg-white p-2" />
                            <p className="text-xs text-gray-400 mt-2">Mã QR đã bao gồm số tiền và nội dung chuyển khoản.</p>
                        </div>
                    )}
                </div>
                
                {/* Confirmation Form */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Xác nhận giao dịch</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Số tiền đã chuyển *</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount || ''}
                                onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                                placeholder="0"
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="transactionCode" className="block text-sm font-medium text-gray-300 mb-1">Mã giao dịch *</label>
                            <input
                                type="text"
                                id="transactionCode"
                                value={transactionCode}
                                onChange={(e) => setTransactionCode(e.target.value)}
                                placeholder="Sao chép mã giao dịch từ biên lai"
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                            />
                        </div>
                         {status && (
                            <div className={`p-3 rounded-md text-sm ${status.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                {status.message}
                            </div>
                        )}
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-primary-700 transition-colors"
                            >
                                Tạo yêu cầu nạp tiền
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 space-y-2 text-center text-xs text-yellow-300 bg-yellow-900/40 p-3 rounded-md border border-yellow-800">
                        <p><strong>Lưu ý:</strong> Nạp tối thiểu <strong>{formatCurrency(20000)}</strong>.</p>
                        <p>Tính năng nạp tiền tạm dừng từ 23h - 6h (giờ VN). Vui lòng quay lại sau 6h sáng. Digimarket trân trọng cám ơn.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositPage;