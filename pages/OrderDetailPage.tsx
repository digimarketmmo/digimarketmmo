import React, { useContext, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { formatCurrency, formatDate } from '../utils/formatter.ts';
import { Download, Package, Copy, CheckCircle } from '../components/icons.tsx';
import { ProductDeliveryType } from '../types.ts';

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const context = useContext(AppContext) as AppContextType;
    const [isCopied, setIsCopied] = useState(false);

    if (!context || !context.currentUser) return <Navigate to="/login" />;

    const { orders, currentUser, users } = context;

    const order = orders.find(o => o.id === orderId);

    // Security check: Make sure the user owns this order, or is an admin/seller of the product
    const sellerIdsInOrder = new Set(order?.items.map(item => item.product.sellerId));
    const isOwner = order?.userId === currentUser.id;
    const isSellerOfProduct = currentUser.role === 'Seller' && sellerIdsInOrder.has(currentUser.id);
    const isAdmin = currentUser.role === 'Admin';

    if (!order || !(isOwner || isSellerOfProduct || isAdmin)) {
        return (
            <div className="container mx-auto text-center py-20">
                <h2 className="text-2xl font-bold text-white">Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.</h2>
                <Link to="/profile#orders" className="text-primary-400 hover:text-primary-300 mt-4 inline-block">
                    Quay lại Lịch sử mua hàng
                </Link>
            </div>
        );
    }

    const handleDownload = (filename: string, content: string) => {
        const element = document.createElement("a");
        const file = new Blob([content], {type: 'text/plain;charset=utf-8'});
        element.href = URL.createObjectURL(file);
        element.download = `${filename}.txt`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Không thể sao chép. Vui lòng thử lại.');
        });
    };
    
    const buyer = users.find(u => u.id === order.userId);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Chi tiết Đơn hàng: <span className="text-primary-400">{order.id}</span></h1>
            
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-gray-400">Ngày đặt hàng</p>
                        <p className="text-white font-semibold">{formatDate(order.date)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Tổng cộng</p>
                        <p className="text-white font-semibold">{formatCurrency(order.total)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Trạng thái</p>
                        <p className="text-white font-semibold">{order.status}</p>
                    </div>
                     {currentUser.role !== 'Buyer' && buyer && (
                         <div className="md:col-span-3">
                             <p className="text-gray-400">Khách hàng</p>
                             <p className="text-white font-semibold">{buyer.name} ({buyer.email})</p>
                         </div>
                    )}
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Sản phẩm đã mua</h2>
            <div className="space-y-4">
                {order.items.map((item, index) => {
                    const seller = users.find(u => u.id === item.product.sellerId);
                    return (
                        <div key={index} className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col md:flex-row items-start gap-4">
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 rounded-md object-cover flex-shrink-0 bg-gray-700" loading="lazy" decoding="async" />
                            <div className="flex-grow">
                                <Link to={`/products/${item.product.slug}`} className="font-bold text-lg text-white hover:text-primary-400">{item.product.name}</Link>
                                <p className="text-sm text-gray-400">Loại: {item.variant.name}</p>
                                <p className="text-sm text-gray-400">Người bán: {seller?.name || 'N/A'}</p>
                                <p className="text-white mt-1">{item.quantity} x {formatCurrency(item.variant.price)}</p>
                            </div>
                            {item.product.deliveryType === ProductDeliveryType.INVENTORY && item.deliveredItemData && item.deliveredItemData.length > 0 && (
                                <div className="w-full md:w-auto mt-4 md:mt-0 p-4 bg-gray-700/50 rounded-lg flex-shrink-0">
                                    <h3 className="font-semibold text-white flex items-center gap-2"><Package size={18}/>Thông tin nhận hàng</h3>
                                    <div className="mt-2 bg-gray-900 p-3 rounded font-mono text-sm text-gray-300 whitespace-pre-wrap break-all">
                                        {item.deliveredItemData.join('\n')}
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => handleDownload(`don-hang-${order.id}_${item.product.name.replace(/\s+/g, '_')}`, item.deliveredItemData!.join('\n'))}
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                                        >
                                            <Download size={16}/> Tải về
                                        </button>
                                        <button
                                            onClick={() => handleCopy(item.deliveredItemData!.join('\n'))}
                                            className={`flex-1 inline-flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition-colors ${
                                                isCopied 
                                                ? 'bg-green-600 text-white cursor-default' 
                                                : 'bg-primary-600 text-white hover:bg-primary-700'
                                            }`}
                                            disabled={isCopied}
                                        >
                                            {isCopied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                                            {isCopied ? 'Đã sao chép' : 'Sao chép'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default OrderDetailPage;