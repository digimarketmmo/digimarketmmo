import React, { useContext, useState } from 'react';
import { useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { Copy, Check, ArrowLeft, RefreshCcw } from '../components/icons.tsx';
import { formatCurrency } from '../utils/formatter.ts';
import { ExchangeDetails } from '../types.ts';

const platformWallets = {
    payeer: 'P1018144962',
    paypal: 'manhdongvtc@gmail.com',
    usdt: '0xe34A73B6c28EC66D91B7a111e8e77c9305d3D1D5',
};

const InfoRow: React.FC<{ label: string; value: string, showCopy?: boolean }> = ({ label, value, showCopy = false }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    return (
        <div className="flex justify-between items-center text-sm py-2 border-b border-gray-700">
            <span className="text-gray-400">{label}:</span>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-primary-400 break-all">{value}</span>
                {showCopy && (
                    <button onClick={handleCopy} className="text-gray-400 hover:text-white">
                        {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
};

const ExchangeConfirmationPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const state = location.state as { details: ExchangeDetails };

    if (!context || !context.currentUser) return <Navigate to="/login" replace />;
    if (!state || !state.details || state.details.direction !== 'sell') return <Navigate to="/exchange" replace />;
    
    const { createExchangeRequest } = context;
    const { details } = state;

    const handleCreateRequest = () => {
        setIsLoading(true);
        setStatus(null);
        
        const result = createExchangeRequest(details);

        if (result.success) {
            setStatus({ type: 'success', message: `${result.message} Quản trị viên sẽ kiểm tra và chuyển tiền cho bạn. Bạn sẽ được chuyển hướng sau giây lát...` });
            setTimeout(() => navigate('/profile#wallet'), 3000);
        } else {
            setStatus({ type: 'error', message: result.message });
            setIsLoading(false);
        }
    };
    
    const walletAddress = platformWallets[details.currency.toLowerCase() as keyof typeof platformWallets];
    const showQr = details.currency === 'Payeer' || details.currency === 'USDT';
    const qrData = details.currency === 'Payeer' ? `payeer://${walletAddress}` : walletAddress;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
            <Link to="/exchange" className="inline-flex items-center gap-2 text-primary-400 hover:underline mb-6">
                <ArrowLeft size={16} /> Quay lại
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Xác nhận Giao dịch Bán</h1>
            <p className="text-gray-400 mb-6">Vui lòng chuyển chính xác <strong className="text-white">{details.usdAmount} {details.currency}</strong> đến địa chỉ ví của chúng tôi.</p>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <RefreshCcw size={20}/> Thông tin Giao dịch
                </h2>
                <div className="space-y-2 mb-6">
                    <InfoRow label="Bạn bán" value={`${details.usdAmount} ${details.currency}`} />
                    <InfoRow label="Bạn sẽ nhận" value={formatCurrency(details.vndAmount)} />
                    <InfoRow label="Vào tài khoản" value={`${details.userBankName} - ${details.userAccountNumber}`} />
                </div>

                <h2 className="text-xl font-bold text-white mb-4">Thông tin ví nhận của DigiMarket</h2>
                
                {showQr && (
                    <div className="flex justify-center mb-4">
                        <img src={qrApiUrl} alt={`QR Code for ${details.currency}`} className="bg-white p-2 rounded-lg"/>
                    </div>
                )}
                
                <div className="space-y-2">
                    <InfoRow label={`Địa chỉ ${details.currency}`} value={walletAddress} showCopy={true} />
                </div>
                 <div className="mt-6 space-y-2 text-center text-xs text-yellow-300 bg-yellow-900/40 p-3 rounded-md border border-yellow-800">
                    <p><strong>QUAN TRỌNG:</strong> Hãy chắc chắn bạn gửi đúng loại tiền tệ và mạng lưới (nếu có). Sai sót có thể dẫn đến mất tiền.</p>
                </div>

                {status && (
                    <div className={`mt-4 p-3 rounded-md text-sm text-center ${status.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                        {status.message}
                    </div>
                )}
                
                <button 
                    onClick={handleCreateRequest}
                    disabled={isLoading}
                    className="w-full mt-6 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-primary-700 transition-colors disabled:bg-gray-600"
                >
                    {isLoading ? 'Đang xử lý...' : 'Tôi đã chuyển tiền, tạo yêu cầu'}
                </button>
            </div>
        </div>
    );
};

export default ExchangeConfirmationPage;
