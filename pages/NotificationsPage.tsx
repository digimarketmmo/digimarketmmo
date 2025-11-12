import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { formatTimeAgo, formatDate } from '../utils/formatter.ts';
import { NotificationType } from '../types.ts';
import { Bell, MessageSquare, ListOrdered } from '../components/icons.tsx';

const NotificationsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;

    if (!context || !context.currentUser) return null;
    
    const { currentUser, notifications, markAllNotificationsAsRead } = context;

    const userNotifications = notifications.filter(n => n.userId === currentUser.id);

    const groupedNotifications = useMemo(() => {
        const groups: { [key: string]: typeof userNotifications } = {};
        userNotifications.forEach(n => {
            const dateKey = formatDate(n.timestamp.toISOString());
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(n);
        });
        return Object.entries(groups).sort(([dateA], [dateB]) => {
            // A bit tricky since formatDate is 'dd/mm/yyyy', need to parse it back correctly for sorting
            const partsA = dateA.split('/').map(Number);
            const partsB = dateB.split('/').map(Number);
            return new Date(partsB[2], partsB[1] - 1, partsB[0]).getTime() - new Date(partsA[2], partsA[1] - 1, partsA[0]).getTime();
        });
    }, [userNotifications]);

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.NEW_MESSAGE:
                return <MessageSquare size={20} className="text-blue-400" />;
            case NotificationType.ORDER_UPDATE:
            case NotificationType.NEW_ORDER_SELLER:
                return <ListOrdered size={20} className="text-green-400" />;
            case NotificationType.ADMIN_ANNOUNCEMENT:
                return <Bell size={20} className="text-yellow-400" />;
            default:
                return <Bell size={20} className="text-gray-400" />;
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-white">Lịch sử thông báo</h1>
                 <button 
                    onClick={() => markAllNotificationsAsRead(currentUser.id)}
                    className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                    Đánh dấu đã đọc tất cả
                </button>
            </div>

            {userNotifications.length > 0 ? (
                <div className="space-y-8">
                    {groupedNotifications.map(([date, notificationsInGroup]) => (
                        <div key={date}>
                            <h2 className="text-lg font-semibold text-gray-300 mb-4 pb-2 border-b border-gray-700">{date}</h2>
                            <div className="space-y-4">
                                {notificationsInGroup.map(n => (
                                    <Link key={n.id} to={n.link} className={`block p-4 rounded-lg transition-colors duration-200 ${!n.isRead ? 'bg-gray-800 border border-primary-500/30' : 'bg-gray-800/50'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(n.type)}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-white">{n.title}</p>
                                                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                                                <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(n.timestamp)}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-400 text-lg">Bạn không có thông báo nào.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;