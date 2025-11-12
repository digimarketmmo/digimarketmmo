import React, { useContext, useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { UserRole } from '../types.ts';
import { MessageSquare, ListOrdered, Package, LayoutDashboard, Menu, X, Megaphone, TrendingUp } from './icons.tsx';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
    isActive
      ? 'bg-gray-700 text-white'
      : 'text-gray-400 hover:text-white hover:bg-gray-700'
  }`;

const SidebarContent: React.FC<{ onLinkClick: () => void }> = ({ onLinkClick }) => (
  <div className="flex h-full max-h-screen flex-col gap-2">
    <div className="flex h-[60px] items-center border-b border-gray-700 px-6">
      <h2 className="text-lg font-semibold text-white">Kênh Người Bán</h2>
    </div>
    <div className="flex-1 overflow-auto py-2">
      <nav className="grid items-start px-4 text-sm font-medium gap-1">
        <NavLink to="/seller/dashboard" className={navLinkClass} onClick={onLinkClick} end>
          <LayoutDashboard className="h-4 w-4" />
          Tổng quan
        </NavLink>
        <NavLink to="/seller/orders" className={navLinkClass} onClick={onLinkClick}>
          <ListOrdered className="h-4 w-4" />
          Đơn hàng
        </NavLink>
        <NavLink to="/seller/stock" className={navLinkClass} onClick={onLinkClick}>
          <Package className="h-4 w-4" />
          Quản lý kho
        </NavLink>
        <NavLink to="/advertising" className={navLinkClass} onClick={onLinkClick}>
          <TrendingUp className="h-4 w-4" />
          Quảng cáo
        </NavLink>
        <NavLink to="/seller/messages" className={navLinkClass} onClick={onLinkClick}>
          <MessageSquare className="h-4 w-4" />
          Hộp thư
        </NavLink>
      </nav>
    </div>
  </div>
);

const SellerLayout: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!context) {
    return <div>Đang tải...</div>;
  }
  
  if (!context.currentUser || (context.currentUser.role !== UserRole.SELLER && context.currentUser.role !== UserRole.ADMIN)) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-red-500">Truy cập bị từ chối</h1>
        <p className="text-gray-400 mt-2">Bạn không có quyền truy cập vào khu vực này.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between mb-4 p-2 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-white">Kênh Người Bán</h2>
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
        <div className="p-2 relative h-full">
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

export default SellerLayout;