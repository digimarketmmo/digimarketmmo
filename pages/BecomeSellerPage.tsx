import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { UserRole } from '../types.ts';
import { DollarSign, Users, ShieldCheck, TrendingUp, CheckCircle } from '../components/icons.tsx';

const BecomeSellerPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const navigate = useNavigate();
    const [brandName, setBrandName] = useState('');
    const [brandDescription, setBrandDescription] = useState('');

    if (!context) return null;

    const { currentUser, becomeSeller } = context;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandName.trim()) {
            alert('Vui lòng nhập tên thương hiệu.');
            return;
        }
        becomeSeller(brandName, brandDescription);
        alert('Chúc mừng! Bạn đã trở thành người bán. Bạn sẽ được chuyển hướng đến trang quản lý.');
        navigate('/seller');
    };
    
    if (!currentUser) {
         return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-2xl font-bold text-white">Bạn cần đăng nhập</h1>
                <p className="text-gray-400 mt-2">Vui lòng đăng nhập để có thể đăng ký trở thành người bán.</p>
            </div>
        );
    }
    
    if (currentUser.role === UserRole.SELLER || currentUser.role === UserRole.ADMIN) {
        return (
             <div className="container mx-auto text-center py-20">
                <h1 className="text-2xl font-bold text-white">Bạn đã là Người bán!</h1>
                <p className="text-gray-400 mt-2">Bạn có thể truy cập trang quản lý của mình để bắt đầu.</p>
            </div>
        )
    }

    const benefits = [
        { icon: DollarSign, title: "Thu nhập không giới hạn", description: "Kiếm tiền từ kỹ năng và sản phẩm của bạn" },
        { icon: Users, title: "Tiếp cận hàng nghìn khách hàng", description: "Kết nối với khách hàng trên toàn quốc" },
        { icon: ShieldCheck, title: "Thanh toán an toàn", description: "Hệ thống escrow bảo vệ cả người mua và người bán" },
        { icon: TrendingUp, title: "Dễ dàng quản lý", description: "Dashboard trực quan, dễ sử dụng" },
        { icon: CheckCircle, title: "Miễn phí đăng ký", description: "Chúng tôi chỉ thu phí khi bạn có doanh thu. Không có phí ẩn, không có cam kết dài hạn." }
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Trở thành <span className="text-primary-400">người bán</span> trên DigiMarket
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
                    Bắt đầu kiếm tiền từ kỹ năng và sản phẩm số của bạn ngay hôm nay. Tham gia cùng hàng nghìn người bán thành công.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Benefits Column */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Lợi ích khi trở thành người bán</h2>
                    <div className="space-y-4">
                        {benefits.map((item, index) => (
                            <div key={index} className={`flex items-start gap-4 p-4 rounded-lg bg-gray-800 border border-gray-700 ${index === benefits.length - 1 ? 'border-primary-500/50' : ''}`}>
                                <div className="flex-shrink-0 bg-gray-700 p-3 rounded-lg">
                                    <item.icon className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Registration Form Column */}
                <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6">Đăng ký ngay</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="brandName" className="block text-sm font-medium text-gray-300 mb-2">Tên doanh nghiệp / Tên thương hiệu *</label>
                            <input
                                id="brandName"
                                type="text"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                required
                                placeholder="VD: Creative Studio"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">Tên sẽ hiển thị trên trang sản phẩm của bạn.</p>
                        </div>
                        <div>
                            <label htmlFor="brandDescription" className="block text-sm font-medium text-gray-300 mb-2">Giới thiệu về bạn (tùy chọn)</label>
                            <textarea
                                id="brandDescription"
                                value={brandDescription}
                                onChange={(e) => setBrandDescription(e.target.value)}
                                rows={4}
                                placeholder="Giới thiệu về kỹ năng, kinh nghiệm của bạn..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            ></textarea>
                             <p className="text-xs text-gray-400 mt-1">Giúp khách hàng hiểu rõ hơn về bạn.</p>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-primary-700 transition-colors"
                            >
                                Trở thành người bán
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BecomeSellerPage;