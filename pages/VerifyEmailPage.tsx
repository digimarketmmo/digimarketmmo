import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { MailIcon } from '../components/icons.tsx';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const context = useContext(AppContext) as AppContextType;

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    if (!context) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);
        if (!code.trim() || !email) {
            setStatus({ type: 'error', message: 'Vui lòng nhập mã xác minh.' });
            setIsLoading(false);
            return;
        }

        const result = context.verifyEmail(email, code);
        if (result.success) {
            setStatus({ type: 'success', message: result.message + ' Bạn sẽ được chuyển hướng đến trang đăng nhập...' });
            setTimeout(() => navigate('/login'), 3000);
        } else {
            setStatus({ type: 'error', message: result.message });
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gray-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                       <MailIcon className="h-12 w-12 text-primary-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Xác minh tài khoản của bạn</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Chúng tôi đã gửi mã xác minh gồm 6 chữ số đến <span className="font-bold text-white">{email}</span>.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="verification-code" className="sr-only">Mã xác minh</label>
                        <input
                            id="verification-code"
                            name="code"
                            type="text"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center tracking-[0.5em] text-lg"
                            placeholder="------"
                        />
                    </div>
                    {status && (
                        <p className={`text-sm text-center ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {status.message}
                        </p>
                    )}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 disabled:bg-gray-600"
                        >
                            {isLoading ? 'Đang xác minh...' : 'Xác minh'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center text-gray-400">
                    <p>Không nhận được mã? 
                        <button type="button" className="font-medium text-primary-400 hover:text-primary-300 ml-1">Gửi lại</button> 
                        (tính năng demo)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
