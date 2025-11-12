import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { DigiMarketLogo, MessageSquare, Bell, LayoutDashboard, User, ListOrdered, Wallet, Menu, X, ChevronDown, Facebook, Youtube, KeyRound, MailIcon, Video, LifeBuoy, RefreshCcw } from './icons.tsx';
import { UserRole } from '../types.ts';
import { formatTimeAgo } from '../utils/formatter.ts';
import { NotificationType } from '../types.ts';


export const Header: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'text-white bg-gray-700'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;
    
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'text-white bg-primary-600'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  const iconLinkClass = "relative p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors";

  const handleLogout = () => {
    context.logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
   useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);


  if (!context) return null;
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead } = context;

  const userNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case NotificationType.NEW_MESSAGE:
            return <MessageSquare size={16} className="text-blue-400" />;
        case NotificationType.ORDER_UPDATE:
        case NotificationType.NEW_ORDER_SELLER:
            return <ListOrdered size={16} className="text-green-400" />;
        case NotificationType.ADMIN_ANNOUNCEMENT:
            return <Bell size={16} className="text-yellow-400" />;
        case NotificationType.FINANCIAL_REQUEST_PENDING:
            return <Wallet size={16} className="text-purple-400" />;
        case NotificationType.SUPPORT_REQUEST:
            return <LifeBuoy size={16} className="text-cyan-400" />;
        case NotificationType.EXCHANGE_REQUEST_PENDING:
            return <RefreshCcw size={16} className="text-teal-400" />;
        default:
            return <Bell size={16} className="text-gray-400" />;
    }
  };

  return (
    <>
      <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="md:hidden mr-2">
                   <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700">
                      <span className="sr-only">Mở menu</span>
                      <Menu size={24} />
                  </button>
              </div>
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <DigiMarketLogo className="h-8 w-8 text-primary-500" />
                <span className="text-white text-xl font-bold hidden sm:inline">DigiMarket</span>
              </Link>
              <nav className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-2">
                  <NavLink to="/products" className={navLinkClass}>Sản phẩm</NavLink>
                  <NavLink to="/tasks" className={navLinkClass}>Nhiệm vụ</NavLink>
                  <NavLink to="/exchange" className={navLinkClass}>Mua bán PayPal & Payeer</NavLink>
                  <NavLink to="/blog" className={navLinkClass}>Blog</NavLink>
                  
                  {/* New Tools Dropdown */}
                  <div className="relative" ref={toolsRef}>
                    <button
                      onClick={() => setIsToolsOpen(!isToolsOpen)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                        isToolsOpen || location.pathname.startsWith('/tools')
                          ? 'text-white bg-gray-700'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Công Cụ
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isToolsOpen && (
                      <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <Link to="/tools#facebook" onClick={() => setIsToolsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                          <Facebook size={16} /> Check Live Facebook
                        </Link>
                        <Link to="/tools#tiktok" onClick={() => setIsToolsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                          <Youtube size={16} /> Check Live TikTok
                        </Link>
                        <Link to="/tools#2fa" onClick={() => setIsToolsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                          <KeyRound size={16} /> Lấy mã 2FA
                        </Link>
                        <Link to="/tools#mail" onClick={() => setIsToolsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                          <MailIcon size={16} /> Tạo Mail Tạm thời
                        </Link>
                        <Link to="/tools#downloader" onClick={() => setIsToolsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                          <Video size={16} /> Video Downloader
                        </Link>
                      </div>
                    )}
                  </div>

                  <NavLink to="/support" className={navLinkClass}>Hỗ trợ</NavLink>
                  <NavLink to="/become-seller" className={navLinkClass}>Trở thành người bán</NavLink>
                </div>
              </nav>
            </div>
            <div className="flex items-center">
              {currentUser ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="relative" ref={notificationsRef}>
                    <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={iconLinkClass} title="Thông báo">
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-gray-900">{unreadCount > 9 ? '9+' : unreadCount}</span>
                      )}
                    </button>
                    {isNotificationsOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="flex justify-between items-center p-3 border-b border-gray-700">
                              <h3 className="text-sm font-semibold text-white">Thông báo</h3>
                              {unreadCount > 0 && <button onClick={() => markAllNotificationsAsRead(currentUser.id)} className="text-xs text-primary-400 hover:underline">Đánh dấu đã đọc tất cả</button>}
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                              {userNotifications.length > 0 ? (
                                  userNotifications.map(n => (
                                      <Link key={n.id} to={n.link} onClick={() => { markNotificationAsRead(n.id); setIsNotificationsOpen(false); }} className={`flex items-start gap-3 p-3 text-sm hover:bg-gray-700 transition-colors ${!n.isRead ? 'bg-blue-900/20' : ''}`}>
                                          <div className="flex-shrink-0 mt-1 relative">
                                              {getNotificationIcon(n.type)}
                                              {!n.isRead && <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-blue-400 ring-2 ring-gray-800"></span>}
                                          </div>
                                          <div className="flex-grow">
                                              <p className="font-semibold text-white">{n.title}</p>
                                              <p className="text-gray-400 text-xs">{n.message}</p>
                                              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(n.timestamp)}</p>
                                          </div>
                                      </Link>
                                  ))
                              ) : (
                                  <p className="text-center text-gray-400 py-4 text-sm">Bạn không có thông báo nào.</p>
                              )}
                          </div>
                          <div className="p-2 border-t border-gray-700 text-center">
                              <Link to="/notifications" onClick={() => setIsNotificationsOpen(false)} className="text-sm text-primary-400 hover:underline">Xem tất cả thông báo</Link>
                          </div>
                      </div>
                    )}
                  </div>
                  <Link to="/messages" className={iconLinkClass} title="Tin nhắn">
                    <MessageSquare size={20} />
                  </Link>
                  
                  <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Open user menu</span>
                      <img className="h-8 w-8 rounded-full" src={currentUser.avatarUrl} alt={currentUser.name} />
                    </button>
                    {isDropdownOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="px-4 py-3 border-b border-gray-700">
                          <p className="text-sm text-white">Signed in as</p>
                          <p className="text-sm font-medium text-gray-300 truncate">{currentUser.name}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/profile#profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left">
                            <User size={16} /> Trang cá nhân
                          </Link>
                          <Link to="/profile#orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left">
                             <ListOrdered size={16} /> Đơn hàng
                          </Link>
                          <Link to="/profile#wallet" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left">
                             <Wallet size={16} /> Ví tiền
                          </Link>
                           {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SELLER) && (
                              <Link to={currentUser.role === UserRole.ADMIN ? "/admin" : "/seller"} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left border-t border-gray-700 mt-1 pt-2">
                                  <LayoutDashboard size={16} /> Dashboard
                              </Link>
                           )}
                        </div>
                        <div className="py-1 border-t border-gray-700">
                          <button onClick={handleLogout} className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 w-full text-left">
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Đăng nhập</Link>
                  <Link to="/register" className="bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700">Đăng ký</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-50 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/80" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true"></div>
        
        {/* Panel */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className={`relative h-full w-4/5 max-w-xs bg-black shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex-shrink-0 flex items-center gap-2">
                    <DigiMarketLogo className="h-8 w-8 text-primary-500" />
                    <span className="text-white text-xl font-bold">DigiMarket</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-grow p-4 space-y-1">
                <NavLink to="/products" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Sản phẩm</NavLink>
                <NavLink to="/tasks" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Nhiệm vụ</NavLink>
                <NavLink to="/exchange" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Mua bán PayPal & Payeer</NavLink>
                <NavLink to="/blog" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Blog</NavLink>
                <NavLink to="/tools" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Công Cụ</NavLink>
                <NavLink to="/support" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Hỗ trợ</NavLink>
                <NavLink to="/become-seller" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Trở thành người bán</NavLink>
            </nav>
        </div>
      </div>
    </>
  );
};