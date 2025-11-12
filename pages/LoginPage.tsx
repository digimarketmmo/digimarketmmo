import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { DigiMarketLogo, GoogleIcon, KeyRound } from '../components/icons.tsx';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState<React.ReactNode>('');
    const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);
    const context = useContext(AppContext) as AppContextType;
    const navigate = useNavigate();

    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Vui lòng nhập email và mật khẩu.');
            return;
        }
        const result = context.login(email, password);
        if (result.success && !result.twoFactorRequired) {
            navigate('/');
        } else if (result.twoFactorRequired && result.userId) {
            setPendingUserId(result.userId);
            setIsTwoFactorStep(true);
        } else {
            if (result.needsVerification) {
                setError(<>
                    {result.message} <Link to={`/verify-email?email=${result.email}`} className="font-medium text-primary-400 hover:text-primary-300">Xác minh ngay</Link>
                </>);
            } else {
                setError(result.message);
            }
        }
    };
    
    const handleTokenSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!token || !pendingUserId) {
            setError('Vui lòng nhập mã xác thực.');
            return;
        }
        const result = await context.verifyLoginToken(pendingUserId, token);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    const handleGoogleLogin = () => {
        // Trong một ứng dụng thực tế, điều này sẽ kích hoạt luồng OAuth của Google.
        // Đối với bản mô phỏng này, chúng tôi sẽ đăng nhập với tư cách người dùng quản trị để dễ dàng kiểm tra.
        const result = context.login('digimarket.admin@gmail.com', 'adminpassword');
        if (result.success) {
            navigate('/');
        } else {
            setError('Đã xảy ra lỗi khi đăng nhập bằng Google.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gray-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                {isTwoFactorStep ? (
                    <>
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                               <KeyRound className="h-12 w-12 text-primary-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Xác thực hai yếu tố</h2>
                            <p className="mt-2 text-sm text-gray-400">
                                Mở ứng dụng xác thực của bạn và nhập mã.
                            </p>
                        </div>
                         <form className="space-y-6" onSubmit={handleTokenSubmit}>
                            <div>
                                <label htmlFor="token" className="sr-only">Mã xác thực</label>
                                <input
                                    id="token"
                                    name="token"
                                    type="text"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    required
                                    value={token}
                                    onChange={(e) => { setToken(e.target.value.replace(/[^0-9]/g, '')); setError(''); }}
                                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center tracking-[0.5em] text-lg"
                                    placeholder="------"
                                />
                            </div>
                            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                            <div>
                                <button
                                    type="submit"
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500"
                                >
                                    Xác minh
                                </button>
                            </div>
                        </form>
                        <button onClick={() => {setIsTwoFactorStep(false); setPendingUserId(null)}} className="w-full text-center text-sm text-gray-400 hover:underline">Quay lại</button>
                    </>
                ) : (
                    <>
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                               <DigiMarketLogo className="h-12 w-12 text-primary-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Đăng nhập vào DigiMarket</h2>
                            <p className="mt-2 text-sm text-gray-400">
                                Chưa có tài khoản?{' '}
                                <Link to="/register" className="font-medium text-primary-400 hover:text-primary-300">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                             <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-600 rounded-md text-white bg-gray-700 hover:bg-gray-600 transition-colors"
                            >
                                <GoogleIcon />
                                <span>Tiếp tục với Google</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2">
                            <div className="flex-grow border-t border-gray-600"></div>
                            <span className="text-gray-400 text-sm">HOẶC ĐĂNG NHẬP BẰNG EMAIL</span>
                            <div className="flex-grow border-t border-gray-600"></div>
                        </div>

                        <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
                            <div className="rounded-md shadow-sm space-y-4">
                                <div>
                                    <label htmlFor="email-address" className="sr-only">Email</label>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                        placeholder="Email (ví dụ: alice@example.com)"
                                    />
                                </div>
                                 <div>
                                    <label htmlFor="password" className="sr-only">Mật khẩu</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                        placeholder="Mật khẩu"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                            <div>
                                <button
                                    type="submit"
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500"
                                >
                                    Đăng nhập
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;