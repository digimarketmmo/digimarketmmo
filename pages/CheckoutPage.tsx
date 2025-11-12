import React, { useContext, useState } from 'react';
import { useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { formatCurrency } from '../utils/formatter.ts';
import { ArrowLeft, CheckCircle } from '../components/icons.tsx';
import { Product, ProductVariant } from '../types.ts';

const CheckoutPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string, orderId?: string } | null>(null);

    const state = location.state as { product: Product; variant: ProductVariant; quantity: number; referrerId?: string };

    if (!context || !context.currentUser) {
        return <Navigate to="/login" replace />;
    }
    
    if (!state || !state.product || !state.variant || !state.quantity) {
        return <Navigate to="/products" replace />;
    }

    const { product, variant, quantity, referrerId } = state;
    const { currentUser, placeDirectOrder } = context;

    const totalCost = variant.price * quantity;

    const handleConfirmPurchase = async () => {
        setIsLoading(true);
        setStatus(null);

        const result = await placeDirectOrder(product, variant, quantity, referrerId);
        
        if (result.success) {
            setStatus({ type: 'success', message: result.message, orderId: result.orderId });
            // Don't navigate immediately, show success message first.
        } else {
            setStatus({ type: 'error', message: result.message });
        }
        setIsLoading(false);
    };

    if (status?.type === 'success' && status.orderId) {
         return (
            <div className="container mx-auto max-w-lg text-center py-20">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white">Thanh toán thành công!</h1>
                <p className="text-gray-300 mt-2">{status.message}</p>
                <Link to={`/order/${status.orderId}`} className="mt-6 inline-block bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors">
                    Xem chi tiết đơn hàng
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <Link to={`/products/${product.id}`} className="inline-flex items-center gap-2 text-primary-400 hover:underline mb-6">
                <ArrowLeft size={16} /> Quay lại sản phẩm
            </Link>
            <h1 className="text-3xl font-bold text-white mb-6">Xác nhận thanh toán</h1>

            <div className="bg-gray-800 rounded-lg shadow-lg">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">Tóm tắt đơn hàng</h2>
                    <div className="flex items-center gap-4">
                        <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-md object-cover" />
                        <div>
                            <p className="font-bold text-white">{product.name}</p>
                            <p className="text-sm text-gray-400">{variant.name}</p>
                            <p className="text-sm text-gray-400">Số lượng: {quantity}</p>
                        </div>
                        <p className="ml-auto font-semibold text-white">{formatCurrency(totalCost)}</p>
                    </div>
                </div>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Thông tin thanh toán</h2>
                     <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Số dư hiện tại:</span>
                            <span className="font-semibold text-white">{formatCurrency(currentUser.balance)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Tổng chi phí:</span>
                            <span className="font-semibold text-red-400">-{formatCurrency(totalCost)}</span>
                        </div>
                         <div className="border-t border-gray-700 my-2"></div>
                         <div className="flex justify-between items-center text-base">
                            <span className="text-gray-300 font-bold">Số dư sau thanh toán:</span>
                            <span className={`font-bold ${currentUser.balance < totalCost ? 'text-red-500' : 'text-green-400'}`}>
                                {formatCurrency(currentUser.balance - totalCost)}
                            </span>
                        </div>
                    </div>

                     {status && (
                        <div className={`mt-4 p-3 rounded-md text-sm text-center ${status.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {status.message}
                        </div>
                    )}
                    
                    <button
                        onClick={handleConfirmPurchase}
                        disabled={isLoading || currentUser.balance < totalCost}
                        className="w-full mt-6 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-primary-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
                    </button>
                    {currentUser.balance < totalCost && (
                        <p className="text-center text-red-400 text-sm mt-2">Số dư không đủ. Vui lòng nạp thêm tiền.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;