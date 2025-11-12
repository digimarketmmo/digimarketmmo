import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { FinancialRequestType, UserRole } from '../types.ts';
import { formatCurrency } from '../utils/formatter.ts';
import { ArrowLeft } from '../components/icons.tsx';

const WithdrawPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const navigate = useNavigate();
    const [amount, setAmount] = useState<number>(0);
    const [bankName, setBankName] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    if (!context || !context.currentUser) return null;

    const { currentUser, createFinancialRequest, systemSettings } = context;

    const minWithdrawal = currentUser.role === UserRole.SELLER || currentUser.role === UserRole.ADMIN
        ? 500000
        : 50000;
        
    const withdrawalFeePercent = systemSettings.transactionFeePercent;
    const feeAmount = (amount * withdrawalFeePercent) / 100;
    const amountToReceive = amount - feeAmount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        if (amount <= 0 || !bankName.trim() || !accountHolder.trim() || !accountNumber.trim()) {
            setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin.' });
            return;
        }
         if (amount < minWithdrawal) {
            setStatus({ type: 'error', message: `Số tiền rút tối thiểu là ${formatCurrency(minWithdrawal)}.` });
            return;
        }
        if (amount > currentUser.balance) {
            setStatus({ type: 'error', message: 'Số tiền rút không được lớn hơn số dư hiện tại.' });
            return;
        }

        const result = createFinancialRequest({
            type: FinancialRequestType.WITHDRAWAL,
            amount,
            bankName,
            accountHolder,
            accountNumber,
        });

        if (result.success) {
            setStatus({ type: 'success', message: result.message });
            setTimeout(() => navigate('/profile#wallet'), 2000);
        } else {
            setStatus({ type: 'error', message: result.message });
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
            <Link to="/profile#wallet" className="inline-flex items-center gap-2 text-primary-400 hover:underline mb-6">
                <ArrowLeft size={16} /> Quay lại Ví
            </Link>
            <h1 className="text-3xl font-bold text-white mb-6">Yêu cầu Rút tiền</h1>
            <div className="bg-gray-800 p-6 rounded-lg">
                <div className="mb-6 bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-400">Số dư khả dụng</p>
                    <p className="text-2xl font-bold text-primary-400">{formatCurrency(currentUser.balance)}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Số tiền muốn rút *</label>
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
                     {amount > 0 && (
                        <div className="bg-gray-900/50 p-3 rounded-md text-sm border border-gray-700">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Phí rút tiền ({withdrawalFeePercent}%):</span>
                                <span className="text-red-400 font-semibold">-{formatCurrency(feeAmount)}</span>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-gray-700">
                                <span className="text-gray-300 font-bold">Số tiền thực nhận:</span>
                                <span className="text-green-400 font-bold">{formatCurrency(amountToReceive)}</span>
                            </div>
                        </div>
                    )}
                     <div>
                        <label htmlFor="bankName" className="block text-sm font-medium text-gray-300 mb-1">Tên ngân hàng *</label>
                        <input
                            type="text"
                            id="bankName"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="VD: Vietcombank"
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300 mb-1">Số tài khoản *</label>
                        <input
                            type="text"
                            id="accountNumber"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Nhập số tài khoản của bạn"
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                        />
                    </div>
                     <div>
                        <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-300 mb-1">Tên chủ tài khoản *</label>
                        <input
                            type="text"
                            id="accountHolder"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            placeholder="Tên trên thẻ/tài khoản"
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
                            Tạo yêu cầu rút tiền
                        </button>
                    </div>
                </form>
                 <div className="mt-6 text-center text-xs text-yellow-300 bg-yellow-900/40 p-3 rounded-md border border-yellow-800 space-y-1">
                    <p><strong>Lưu ý:</strong> Số tiền rút tối thiểu cho bạn là <strong>{formatCurrency(minWithdrawal)}</strong>.</p>
                    <p>Phí giao dịch rút tiền là <strong>{withdrawalFeePercent}%</strong> trên tổng số tiền rút.</p>
                </div>
            </div>
        </div>
    );
};

export default WithdrawPage;