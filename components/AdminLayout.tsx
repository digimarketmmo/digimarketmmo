import React, { useContext, useState, useMemo } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { UserRole, ProductStatus, TaskStatus, VerificationStatus, ComplaintStatus, FinancialRequestStatus, FinancialRequestType } from '../types.ts';
import { LayoutDashboard, Package, Users, ListOrdered, Shield, Megaphone, Settings, Shapes, FileText, CheckCircle, Wallet, History, Landmark, ClipboardList, Menu, X, Crown, TrendingUp, RefreshCcw } from './icons.tsx';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
    isActive
      ? 'bg-gray-700 text-white'
      : 'text-gray-400 hover:text-white hover:bg-gray-700'
  }`;

const NavBadge: React.FC<{ count: number }> = ({ count }) => {
    if (count === 0) return null;
    return (
        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
            {count > 9 ? '9+' : count}
        </span>
    );
};

const SidebarContent: React.FC<{ onLinkClick: () => void }> = ({ onLinkClick }) => {
    const context = useContext(AppContext) as AppContextType;
    if (!context || !context.currentUser) return null;
    const { 
        currentUser,
        products,
        tasks,
        users,
        complaints,
        financialRequests 
    } = context;
    
    const permissions = currentUser.permissions || {
        isSuperAdmin: false,
        canManageShop: false,
        canManageUsers: false,
        canManageFinance: false,
    };
    
    const pendingProductsCount = useMemo(() => products.filter(p => p.status === ProductStatus.PENDING).length, [products]);
    const pendingTasksCount = useMemo(() => tasks.filter(t => t.status === TaskStatus.PENDING_APPROVAL).length, [tasks]);
    const pendingVerificationsCount = useMemo(() => users.filter(u => u.verificationStatus === VerificationStatus.PENDING).length, [users]);
    const openComplaintsCount = useMemo(() => complaints.filter(c => c.status === ComplaintStatus.OPEN).length, [complaints]);
    const pendingFinancialRequestsCount = useMemo(() => financialRequests.filter(r => r.status === FinancialRequestStatus.PENDING && r.type !== FinancialRequestType.EXCHANGE).length, [financialRequests]);
    const pendingExchangeRequestsCount = useMemo(() => financialRequests.filter(r => r.status === FinancialRequestStatus.PENDING && r.type === FinancialRequestType.EXCHANGE).length, [financialRequests]);

    return (
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b border-gray-700 px-6">
          <h2 className="text-lg font-semibold text-white">Trang quản trị</h2>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium gap-1">
            <NavLink to="/admin/dashboard" className={navLinkClass} onClick={onLinkClick} end>
              <LayoutDashboard className="h-4 w-4" /> Tổng quan
            </NavLink>
            
            {permissions.canManageShop && (
                <>
                    <p className="px-3 mt-4 mb-1 text-xs font-semibold text-gray-500 uppercase">Quản lý cửa hàng</p>
                    <NavLink to="/admin/product-approval" onClick={onLinkClick} className={navLinkClass}><CheckCircle className="h-4 w-4" /> Duyệt sản phẩm <NavBadge count={pendingProductsCount} /></NavLink>
                    <NavLink to="/admin/advertising" onClick={onLinkClick} className={navLinkClass}><TrendingUp className="h-4 w-4" /> Quảng cáo</NavLink>
                    <NavLink to="/admin/task-approval" onClick={onLinkClick} className={navLinkClass}><ClipboardList className="h-4 w-4" /> Duyệt nhiệm vụ <NavBadge count={pendingTasksCount} /></NavLink>
                    <NavLink to="/admin/categories" onClick={onLinkClick} className={navLinkClass}><Shapes className="h-4 w-4" /> Danh mục</NavLink>
                    <NavLink to="/admin/content-pages" onClick={onLinkClick} className={navLinkClass}><FileText className="h-4 w-4" /> Trang nội dung</NavLink>
                    <NavLink to="/admin/site-notifications" onClick={onLinkClick} className={navLinkClass}><Megaphone className="h-4 w-4" /> Thông báo trang chủ</NavLink>
                </>
            )}

            {permissions.canManageUsers && (
                <>
                    <p className="px-3 mt-4 mb-1 text-xs font-semibold text-gray-500 uppercase">Quản lý người dùng</p>
                    <NavLink to="/admin/users" onClick={onLinkClick} className={navLinkClass}><Users className="h-4 w-4" /> Người dùng <NavBadge count={pendingVerificationsCount} /></NavLink>
                    <NavLink to="/admin/orders" onClick={onLinkClick} className={navLinkClass}><ListOrdered className="h-4 w-4" /> Đơn hàng</NavLink>
                    <NavLink to="/admin/complaints" onClick={onLinkClick} className={navLinkClass}><Shield className="h-4 w-4" /> Khiếu nại <NavBadge count={openComplaintsCount} /></NavLink>
                    <NavLink to="/admin/announcements" onClick={onLinkClick} className={navLinkClass}><Megaphone className="h-4 w-4" /> Gửi thông báo</NavLink>
                </>
            )}
            
            {permissions.canManageFinance && (
                 <>
                    <p className="px-3 mt-4 mb-1 text-xs font-semibold text-gray-500 uppercase">Tài chính</p>
                    <NavLink to="/admin/financial-requests" onClick={onLinkClick} className={navLinkClass}><Wallet className="h-4 w-4" /> Yêu cầu nạp/rút <NavBadge count={pendingFinancialRequestsCount} /></NavLink>
                    <NavLink to="/admin/exchange-requests" onClick={onLinkClick} className={navLinkClass}><RefreshCcw className="h-4 w-4" /> Giao dịch Mua/Bán <NavBadge count={pendingExchangeRequestsCount} /></NavLink>
                    <NavLink to="/admin/transactions" onClick={onLinkClick} className={navLinkClass}><History className="h-4 w-4" /> Lịch sử giao dịch</NavLink>
                    <NavLink to="/admin/bank-accounts" onClick={onLinkClick} className={navLinkClass}><Landmark className="h-4 w-4" /> TK Ngân hàng</NavLink>
                </>
            )}

            <p className="px-3 mt-4 mb-1 text-xs font-semibold text-gray-500 uppercase">Hệ thống</p>
            {permissions.isSuperAdmin && (
                 <NavLink to="/admin/management" onClick={onLinkClick} className={navLinkClass}>
                    <Crown className="h-4 w-4" /> Quản lý Quản trị viên
                </NavLink>
            )}
            <NavLink to="/admin/settings" onClick={onLinkClick} className={navLinkClass}>
                <Settings className="h-4 w-4" /> Cài đặt
            </NavLink>
          </nav>
        </div>
      </div>
    );
};

const AdminLayout: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!context) {
    return <div>Đang tải...</div>;
  }
  
  if (!context.currentUser) {
      return <Navigate to="/login" replace />;
  }

  if (context.currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-red-500">Truy cập bị từ chối</h1>
        <p className="text-gray-400 mt-2">Bạn không có quyền truy cập vào khu vực quản trị.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between mb-4 p-2 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-white">Bảng điều khiển</h2>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white">
          <Menu className="h-6 w-6" />
        </button>
      </header>
      
      {/* Mobile Sidebar (Drawer) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <div className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-gray-700 z-50 transform transition-transform md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-2">
            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
            </button>
            <SidebarContent onLinkClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>
      
      {/* Main Layout */}
      <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden border-r border-gray-700 bg-gray-800/40 md:block rounded-lg p-2">
          <SidebarContent onLinkClick={() => {}} />
        </aside>
        
        {/* Main Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;