import React, { useContext, useMemo } from 'react';
import { Megaphone } from './icons.tsx';
import { AppContext, AppContextType } from '../context/AppContext.tsx';

const NotificationTicker: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;

    if (!context) return null;

    const { siteNotifications } = context;
    const activeNotifications = useMemo(() => siteNotifications.filter(n => n.isActive), [siteNotifications]);
    
    const tickerText = useMemo(() => {
        if (activeNotifications.length === 0) return '';
        // Thêm dấu • để phân tách các thông báo
        return activeNotifications.map(n => n.message).join('   •   ');
    }, [activeNotifications]);
    
    if (activeNotifications.length === 0) return null;

    // Tự động điều chỉnh thời gian animation dựa trên độ dài văn bản để tốc độ cuộn nhất quán.
    // Tốc độ: 5 ký tự mỗi giây, thời gian tối thiểu là 30 giây.
    const animationDuration = Math.max(30, tickerText.length / 5);

    return (
        <div className="bg-primary-600/20 text-primary-300 text-sm">
            <style>
              {`
                @keyframes marqueeAnimation {
                  from { transform: translateX(0); }
                  to { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marqueeAnimation ${animationDuration}s linear infinite;
                    will-change: transform; /* Tối ưu hóa hiệu suất animation */
                }
              `}
            </style>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 py-2">
                <Megaphone size={16} className="flex-shrink-0" />
                <div className="flex-grow overflow-hidden whitespace-nowrap">
                    <div className="flex animate-marquee">
                        {/* Nhân đôi nội dung để tạo hiệu ứng lặp lại liền mạch */}
                        <span className="px-6">{tickerText}</span>
                        <span className="px-6">{tickerText}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationTicker;
