import React, { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { DigiMarketLogo, GoogleIcon, MailIcon } from '../components/icons.tsx';

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const context = useContext(AppContext) as AppContextType;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const refCode = searchParams.get('ref');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !phone || !password) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const referredByUser = context.users.find(u => u.referralCode === refCode || u.id === refCode);
        const referredById = referredByUser ? referredByUser.id : undefined;

        const newUser = context.registerUser({ name, email, phone, password, referredBy: referredById });
        if (newUser) {
            navigate(`/verify-email?email=${email}`);
        } else {
            setError('Email này đã tồn tại. Vui lòng sử dụng email khác hoặc đăng nhập.');
        }
    };

    const handleGoogleRegister = () => {
        // Trong một ứng dụng thực tế, điều này sẽ kích hoạt luồng OAuth của Google.
        // Đối với bản mô phỏng này, chúng tôi sẽ đăng nhập với tư cách là một người mua hiện có để mô phỏng một luồng người dùng mới.
        const result = context.login('alice@example.com', 'password123');
        if (result.success) {
            navigate('/');
        } else {
            setError('Đã xảy ra lỗi khi đăng nhập bằng Google.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gray-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                       <DigiMarketLogo className="h-12 w-12 text-primary-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Tạo tài khoản DigiMarket</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300">
                            Đăng nhập
                        </Link>
                    </p>
                </div>

                <div className="space-y-4">
                     <button
                        type="button"
                        onClick={handleGoogleRegister}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-600 rounded-md text-white bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                        <GoogleIcon />
                        <span>Tiếp tục với Google</span>
                    </button>
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="text-gray-400 text-sm">HOẶC ĐĂNG KÝ BẰNG EMAIL</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Họ và tên</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Họ và tên"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="sr-only">Số điện thoại</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Số điện thoại"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mật khẩu</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Mật khẩu"
                            />
                        </div>
                    </div>
                     <div className="flex items-center">
                        <input
                            id="terms-and-conditions"
                            name="terms"
                            type="checkbox"
                            required
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-500 rounded bg-gray-700"
                        />
                        <label htmlFor="terms-and-conditions" className="ml-2 block text-sm text-gray-400">
                            Tôi đồng ý với{' '}
                            <a href="#" className="font-medium text-primary-400 hover:text-primary-300">
                                Điều khoản và Điều kiện
                            </a>
                        </label>
                    </div>
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500"
                        >
                            Đăng ký
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;