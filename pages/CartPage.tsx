import React from 'react';
import { Navigate } from 'react-router-dom';

const CartPage: React.FC = () => {
    // Chức năng giỏ hàng đã được loại bỏ để chuyển sang thanh toán trực tiếp.
    // Chuyển hướng người dùng về trang chủ.
    return <Navigate to="/" replace />;
};

export default CartPage;
