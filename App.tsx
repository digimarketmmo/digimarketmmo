import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { ChatBubble } from './components/ChatBubble.tsx';
import NotificationTicker from './components/NotificationTicker.tsx';

// Page Imports
import HomePage from './pages/HomePage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx'; // Import new page
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import VerifyEmailPage from './pages/VerifyEmailPage.tsx';
import UserProfilePage from './pages/UserProfilePage.tsx';
import OrderDetailPage from './pages/OrderDetailPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import MessagesPage from './pages/MessagesPage.tsx';
import TasksPage from './pages/TasksPage.tsx';
import SupportPage from './pages/SupportPage.tsx';
import BecomeSellerPage from './pages/BecomeSellerPage.tsx';
import ShopPage from './pages/ShopPage.tsx';
import ContentPage from './pages/ContentPage.tsx';
import DepositPage from './pages/DepositPage.tsx';
import WithdrawPage from './pages/WithdrawPage.tsx';
import CreateTaskPage from './pages/CreateTaskPage.tsx';
import TaskDetailPage from './pages/TaskDetailPage.tsx';
import SurveysPage from './pages/SurveysPage.tsx';
import AdvertisingPage from './pages/AdvertisingPage.tsx';
import ToolsPage from './pages/ToolsPage.tsx';
import DownloadSimulationPage from './pages/DownloadSimulationPage.tsx';
import ExchangePage from './pages/ExchangePage.tsx';
import ExchangeCheckoutPage from './pages/ExchangeCheckoutPage.tsx';
import ExchangeConfirmationPage from './pages/ExchangeConfirmationPage.tsx';
import BlogPage from './pages/BlogPage.tsx';
import BlogPostDetailPage from './pages/BlogPostDetailPage.tsx';
import CreateEditBlogPostPage from './pages/CreateEditBlogPostPage.tsx';


// Layouts
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminLayout from './components/AdminLayout.tsx';
import SellerLayout from './components/SellerLayout.tsx';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage.tsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.tsx';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage.tsx';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage.tsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.tsx';
import AdminContentPagesPage from './pages/admin/AdminContentPagesPage.tsx';
import AdminSiteNotificationsPage from './pages/admin/AdminSiteNotificationsPage.tsx';
import AdminProductApprovalPage from './pages/admin/AdminProductApprovalPage.tsx';
import AdminFinancialRequestsPage from './pages/admin/AdminFinancialRequestsPage.tsx';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage.tsx';
import AdminBankAccountsPage from './pages/admin/AdminBankAccountsPage.tsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.tsx';
import AdminTaskApprovalPage from './pages/admin/AdminTaskApprovalPage.tsx';
import AdminManagementPage from './pages/admin/AdminManagementPage.tsx';
import AdminAdvertisingPage from './pages/admin/AdminAdvertisingPage.tsx';
import AdminExchangeRequestsPage from './pages/admin/AdminExchangeRequestsPage.tsx';

// Seller Pages
import SellerDashboardPage from './pages/seller/SellerDashboardPage.tsx';
import SellerStockPage from './pages/seller/SellerStockPage.tsx';
import SellerMessagesPage from './pages/seller/SellerMessagesPage.tsx';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
          <NotificationTicker />
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productSlug" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/become-seller" element={<BecomeSellerPage />} />
              <Route path="/shop/:sellerId" element={<ShopPage />} />
              <Route path="/content/:slug" element={<ContentPage />} />
              <Route path="/exchange" element={<ExchangePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/post/:postSlug" element={<BlogPostDetailPage />} />


              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/exchange/checkout" element={<ExchangeCheckoutPage />} />
                <Route path="/exchange/confirm" element={<ExchangeConfirmationPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/user/:userId" element={<UserProfilePage />} />
                <Route path="/order/:orderId" element={<OrderDetailPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/deposit" element={<DepositPage />} />
                <Route path="/withdraw" element={<WithdrawPage />} />
                <Route path="/tasks/create" element={<CreateTaskPage />} />
                <Route path="/surveys" element={<SurveysPage />} />
                <Route path="/advertising" element={<AdvertisingPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/download-simulation" element={<DownloadSimulationPage />} />
                <Route path="/blog/create" element={<CreateEditBlogPostPage />} />
                <Route path="/blog/edit/:postId" element={<CreateEditBlogPostPage />} />


                {/* Seller Routes */}
                <Route path="/seller" element={<SellerLayout />}>
                    <Route index element={<SellerDashboardPage />} />
                    <Route path="dashboard" element={<SellerDashboardPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} /> {/* Re-using admin component for seller */}
                    <Route path="stock" element={<SellerStockPage />} />
                    <Route path="messages" element={<SellerMessagesPage />} />
                </Route>
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="users/:userId" element={<AdminUserDetailPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="complaints" element={<AdminComplaintsPage />} />
                  <Route path="announcements" element={<AdminAnnouncementsPage />} />
                  
                  {/* New Admin Routes */}
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="content-pages" element={<AdminContentPagesPage />} />
                  <Route path="site-notifications" element={<AdminSiteNotificationsPage />} />
                  <Route path="product-approval" element={<AdminProductApprovalPage />} />
                  <Route path="task-approval" element={<AdminTaskApprovalPage />} />
                  <Route path="financial-requests" element={<AdminFinancialRequestsPage />} />
                  <Route path="exchange-requests" element={<AdminExchangeRequestsPage />} />
                  <Route path="transactions" element={<AdminTransactionsPage />} />
                  <Route path="bank-accounts" element={<AdminBankAccountsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="management" element={<AdminManagementPage />} />
                  <Route path="advertising" element={<AdminAdvertisingPage />} />
                </Route>
              </Route>
            </Routes>
          </main>
          <ChatBubble />
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;