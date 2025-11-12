import React, { useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { MessageSquare } from '../components/icons.tsx';
import { ProductStatus, UserStatus } from '../types.ts';

const ShopPage: React.FC = () => {
    const { sellerId } = useParams<{ sellerId: string }>();
    const context = useContext(AppContext) as AppContextType;

    if (!context) {
        return <div>Đang tải...</div>;
    }

    const { users, products } = context;

    const seller = useMemo(() => {
        return users.find(u => u.id === sellerId);
    }, [users, sellerId]);

    const sellerProducts = useMemo(() => {
        return products.filter(p => p.sellerId === sellerId && p.status === ProductStatus.APPROVED);
    }, [products, sellerId]);
    
    if (!seller) {
        return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-2xl font-bold text-white">Không tìm thấy người bán.</h1>
            </div>
        );
    }
    
    if (seller.status === UserStatus.BLOCKED) {
        return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-2xl font-bold text-white">Cửa hàng này đã bị khóa.</h1>
                <p className="text-gray-400 mt-2">Bạn không thể xem sản phẩm hoặc thực hiện giao dịch.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Seller Info Header */}
            <div className="bg-gray-800 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 mb-8">
                <img src={seller.avatarUrl} alt={seller.name} className="w-24 h-24 rounded-full border-4 border-gray-700" />
                <div className="flex-grow text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white">{seller.brandName || seller.name}</h1>
                    <p className="text-gray-400 mt-1">{seller.brandDescription || 'Người bán uy tín tại DigiMarket.'}</p>
                </div>
                <Link to="/messages" state={{ prefilledUserId: seller.id }} className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                    <MessageSquare size={18} />
                    Nhắn tin
                </Link>
            </div>

            {/* Products */}
            <div>
                 <h2 className="text-2xl font-bold text-white mb-6">Sản phẩm từ {seller.brandName || seller.name}</h2>
                 {sellerProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sellerProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-16 bg-gray-800 rounded-lg">
                        <p className="text-xl text-gray-400">Người bán này chưa có sản phẩm nào được duyệt.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ShopPage;
