import React, { useState, useContext, useEffect } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { ExchangeRates, PlatformBalances } from '../../types.ts';
import { formatCurrency } from '../../utils/formatter.ts';

const AdminSettingsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    
    // State for system settings
    const [transactionFee, setTransactionFee] = useState(context?.systemSettings.transactionFeePercent || 0);
    const [platformFee, setPlatformFee] = useState(context?.systemSettings.platformFeePercent || 0);
    const [affiliateF1Rate, setAffiliateF1Rate] = useState(context?.systemSettings.affiliateF1CommissionRate || 0);
    const [affiliateF2Rate, setAffiliateF2Rate] = useState(context?.systemSettings.affiliateF2CommissionRate || 0);
    const [statusMessage, setStatusMessage] = useState('');
    
    // State for exchange rates and balances
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [balances, setBalances] = useState<PlatformBalances | null>(null);

    useEffect(() => {
        if (context) {
            setRates(context.exchangeRates);
            setBalances(context.platformBalances);
        }
    }, [context?.exchangeRates, context?.platformBalances]);


    if (!context || !rates || !balances) return null;

    const { updateSystemSettings, updateExchangeRates, updatePlatformBalances } = context;

    const handleSystemSettingsSave = () => {
        if (transactionFee >= 0 && transactionFee <= 100 && platformFee >= 0 && platformFee <= 100) {
            updateSystemSettings({ 
                transactionFeePercent: transactionFee,
                platformFeePercent: platformFee,
                affiliateF1CommissionRate: affiliateF1Rate,
                affiliateF2CommissionRate: affiliateF2Rate,
            });
            setStatusMessage('Cài đặt hệ thống đã được lưu thành công!');
            setTimeout(() => setStatusMessage(''), 3000);
        } else {
            alert('Các loại phí phải nằm trong khoảng từ 0 đến 100.');
        }
    };
    
    const handleRatesAndBalancesSave = () => {
        updateExchangeRates(rates);
        updatePlatformBalances(balances);
        setStatusMessage('Tỷ giá và số dư đã được cập nhật thành công!');
        setTimeout(() => setStatusMessage(''), 3000);
    };

    const handleRateChange = (currency: keyof ExchangeRates, type: 'buy' | 'sell', value: string) => {
        const numValue = parseFloat(value) || 0;
        setRates(prev => prev ? { ...prev, [currency]: { ...prev[currency], [type]: numValue } } : null);
    };

    const handleBalanceChange = (currency: keyof PlatformBalances, value: string) => {
        const numValue = parseFloat(value) || 0;
        setBalances(prev => prev ? { ...prev, [currency]: numValue } : null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Cài đặt</h1>
            
            {statusMessage && (
                <div className="mb-6 p-3 rounded-md text-sm bg-green-900/50 text-green-300">
                    {statusMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* System Settings */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Cài đặt Hệ thống</h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="transactionFee" className="block text-sm font-medium text-gray-300 mb-1">
                                Phí giao dịch (%)
                            </label>
                            <input
                                type="number"
                                id="transactionFee"
                                value={transactionFee}
                                onChange={(e) => setTransactionFee(Number(e.target.value))}
                                min="0" max="100" step="0.1"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                            />
                            <p className="text-xs text-gray-400 mt-1">Phí liên quan đến cổng thanh toán, sẽ được trừ vào doanh thu của người bán.</p>
                        </div>
                        <div>
                            <label htmlFor="platformFee" className="block text-sm font-medium text-gray-300 mb-1">
                                Phí nền tảng (%)
                            </label>
                            <input
                                type="number"
                                id="platformFee"
                                value={platformFee}
                                onChange={(e) => setPlatformFee(Number(e.target.value))}
                                min="0" max="100" step="0.1"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                            />
                            <p className="text-xs text-gray-400 mt-1">Đây là % hoa hồng sàn sẽ thu trên mỗi giao dịch thành công.</p>
                        </div>

                        <div className="pt-6 border-t border-gray-700">
                            <h3 className="text-lg font-bold text-white mb-2">Cài đặt Affiliate</h3>
                             <div>
                                <label htmlFor="affiliateF1Rate" className="block text-sm font-medium text-gray-300 mb-1">
                                    Hoa hồng cấp 1 (F1) (%)
                                </label>
                                <input
                                    type="number"
                                    id="affiliateF1Rate"
                                    value={affiliateF1Rate}
                                    onChange={(e) => setAffiliateF1Rate(Number(e.target.value))}
                                    min="0" max="100" step="0.1"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                                />
                                <p className="text-xs text-gray-400 mt-1">Phần trăm hoa hồng người giới thiệu (F1) nhận được từ hoa hồng của người được giới thiệu (F0).</p>
                            </div>
                             <div className="mt-4">
                                <label htmlFor="affiliateF2Rate" className="block text-sm font-medium text-gray-300 mb-1">
                                    Hoa hồng cấp 2 (F2) (%)
                                </label>
                                <input
                                    type="number"
                                    id="affiliateF2Rate"
                                    value={affiliateF2Rate}
                                    onChange={(e) => setAffiliateF2Rate(Number(e.target.value))}
                                    min="0" max="100" step="0.1"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                                />
                                <p className="text-xs text-gray-400 mt-1">Phần trăm hoa hồng người giới thiệu (F2) nhận được từ hoa hồng của người được giới thiệu (F1).</p>
                            </div>
                        </div>


                        <div className="flex justify-end">
                            <button
                                onClick={handleSystemSettingsSave}
                                className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700"
                            >
                                Lưu Cài đặt Hệ thống
                            </button>
                        </div>
                    </div>
                </div>

                {/* Exchange Rates & Balances Settings */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                     <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Tỷ giá & Số dư Giao dịch</h2>
                     <div className="space-y-6">
                        {/* Rates */}
                        <div>
                             <h3 className="text-md font-semibold text-gray-200 mb-2">Tỷ giá (so với VND)</h3>
                             {Object.keys(rates).map(key => (
                                <div key={key} className="grid grid-cols-3 gap-2 items-center mb-2">
                                    <label className="text-sm text-gray-300 capitalize col-span-1">{key}</label>
                                    <input type="number" value={rates[key as keyof ExchangeRates].buy} onChange={(e) => handleRateChange(key as keyof ExchangeRates, 'buy', e.target.value)} placeholder="Mua vào" className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm" />
                                    <input type="number" value={rates[key as keyof ExchangeRates].sell} onChange={(e) => handleRateChange(key as keyof ExchangeRates, 'sell', e.target.value)} placeholder="Bán ra" className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm" />
                                </div>
                             ))}
                        </div>
                        {/* Balances */}
                        <div className="pt-6 border-t border-gray-700">
                             <h3 className="text-md font-semibold text-gray-200 mb-2">Số dư hiện có</h3>
                            {Object.keys(balances).map(key => (
                                <div key={key} className="grid grid-cols-2 gap-4 items-center mb-2">
                                    <label className="text-sm text-gray-300 capitalize">{key}</label>
                                    <input type="number" value={balances[key as keyof PlatformBalances]} onChange={(e) => handleBalanceChange(key as keyof PlatformBalances, e.target.value)} placeholder="Số dư" className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm" />
                                </div>
                            ))}
                        </div>
                         <div className="flex justify-end">
                            <button
                                onClick={handleRatesAndBalancesSave}
                                className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700"
                            >
                                Lưu Tỷ giá & Số dư
                            </button>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;