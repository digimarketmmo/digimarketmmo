import React, { useState, useMemo, useEffect, useContext } from 'react';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { formatCurrency } from '../utils/formatter.ts';
import { DollarSign, RefreshCcw, ArrowRight, Icon, TrendingUp, Star } from '../components/icons.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { ExchangeDetails, Task, Product, OrderStatus, ProductStatus } from '../types.ts';

// --- Reusable Form Input ---
const FormInput = ({ label, name, value, onChange, placeholder, required = false, unit, disabled = false, note, type = 'text' }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-16 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-900 disabled:cursor-not-allowed"
            />
            {unit && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 text-sm">{unit}</span>}
        </div>
        {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
);

type Currency = 'payeer' | 'paypal' | 'usdt';

const fullBankList = [
    "VIETCOMBANK - NH TMCP Ngoai Thuong Viet Nam",
    "TECHCOMBANK - NH TMCP Ky thuong Viet Nam",
    "MB BANK - NH TMCP Quan Doi",
    "A Chau(ACB) - NH TMCP A Chau",
    "VIETINBANK - NH TMCP Cong Thuong Viet Nam",
    "BIDV - NH TMCP Dau tu va Phat trien Viet Nam",
    "VP BANK - NH TMCP Viet Nam Thinh Vuong",
    "TP BANK - NH TMCP Tien Phong",
    "SACOMBANK - NH TMCP Sai Gon Thuong Tin",
    "AGRIBANK - AGRIBANK - NH NN Va PTNT Viet Nam",
    "MSB - NH TMCP Hang Hai Viet Nam",
    "VIB - NH TMCP Quoc te Viet Nam",
    "EXIMBANK - NH TMCP Xuat nhap khau Viet Nam",
    "ABBANK - NH TMCP An Binh",
    "BAC A BANK - NH TMCP Bac A",
    "BAOVIET BANK - NH TMCP Bao Viet",
    "BVBank - NH TMCP Ban Viet",
    "BVBank Timo - NH TMCP Ban Viet Timo",
    "CBB - NH TM TNHH MTV Xay Dung Viet Nam",
    "CIMB - NH TNHH MTV CIMB",
    "CITIVNVN - Citibank Viet Nam",
    "COOPBANK - NH Hop tac xa Viet Nam",
    "Cathay - Cathay United Bank – Chi nhanh Ho Chi Minh",
    "DBS - NH DBS chi nhanh HCM",
    "GPB - NH TM TNHH MTV Dau Khi Toan Cau",
    "HDB - NH TMCP Phat Trien Thanh Pho Ho Chi Minh",
    "HLB - NH TNHH MTV Hongleong Viet Nam",
    "HSBC - Ngan hang TNHH MTV HSBC (Viet Nam)",
    "KLB - NH TMCP Kien Long",
];

// --- CRYPTO ICONS ---
const BitcoinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="#f7931a" height="24px" width="24px" viewBox="0 0 32 32" {...props}>
        <path d="M21.6,15.1c0.4-1,0.5-2,0.4-3c-0.2-1.3-0.8-2.5-1.8-3.5c-1-1-2.2-1.6-3.5-1.8c-1-0.2-2-0.1-3,0.4c-1,0.4-1.9,1.1-2.6,1.9 c-0.7,0.8-1.2,1.8-1.4,2.8c-0.2,1.3,0,2.6,0.5,3.8l-3,1.3l1,2.8l3-1.3c0.4,1.4,1.2,2.6,2.3,3.6L12,23.5l1.4,2.4l1.6-0.9l-1.3-2.3 c0.8-0.5,1.5-1.1,2.1-1.9c1-1.2,1.6-2.8,1.6-4.3c0-0.3,0-0.6-0.1-0.9L21.6,15.1z M17.4,18.5c-0.6,0.7-1.4,1.3-2.3,1.6l1,1.8 l-1.3,0.8l-1-1.8c-0.7,0.2-1.4,0.3-2.1,0.2l1,2.8l-2.3,1.3l-1-2.8l-0.7-0.3c-1-0.4-1.9-1.2-2.5-2.1c-0.7-1-1-2.1-0.9-3.2 c0.1-1.1,0.6-2.1,1.4-2.8c0.8-0.7,1.8-1.2,2.8-1.3c1.1-0.1,2.1,0.2,3,0.7c1,0.5,1.8,1.3,2.3,2.3C18,16.5,18,17.5,17.4,18.5z M16.9,13.2c-0.6-0.6-1.5-1-2.4-0.9c-0.8,0.1-1.6,0.5-2.1,1.2c-0.5,0.7-0.7,1.5-0.6,2.3c0.1,0.8,0.5,1.6,1.2,2.1 c0.6,0.6,1.5,1,2.4,0.9c0.8-0.1,1.6-0.5,2.1-1.2c0.5-0.7,0.7-1.5,0.6-2.3C17.6,14.5,17.5,13.8,16.9,13.2z"/>
    </svg>
);

const EthereumIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2L11.75 2.5V15.5L12 15.75L18.25 12L12 2Z" fill="#8C8C8C"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2L5.75 12L12 15.75V2V2Z" fill="#E6E6E6"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 16.75L11.8 16.9V21.95L12 22L18.25 13L12 16.75Z" fill="#8C8C8C"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 22V16.75L5.75 13L12 22Z" fill="#E6E6E6"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 15.75L18.25 12L12 8.25V15.75Z" fill="#C7C7C7"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M5.75 12L12 15.75V8.25L5.75 12Z" fill="#E6E6E6"/>
    </svg>
);

const mockCryptoData = [
    { name: 'Bitcoin', ticker: 'BTC', price: 68123.45, change: 1.25, icon: <BitcoinIcon /> },
    { name: 'Ethereum', ticker: 'ETH', price: 3545.67, change: -0.52, icon: <EthereumIcon /> },
    { name: 'Tether', ticker: 'USDT', price: 1.00, change: 0.01, icon: <DollarSign size={24} className="text-green-400" /> },
    { name: 'Solana', ticker: 'SOL', price: 150.88, change: 3.14, icon: <DollarSign size={24} className="text-purple-400" /> },
    { name: 'Ripple', ticker: 'XRP', price: 0.48, change: -1.10, icon: <DollarSign size={24} className="text-blue-500" /> },
];

const CryptoPriceSidebar: React.FC = () => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Giá tiền điện tử</h3>
            <div className="space-y-4">
                {mockCryptoData.map(coin => (
                    <div key={coin.ticker} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {coin.icon}
                            <div>
                                <p className="font-semibold text-white text-sm">{coin.name}</p>
                                <p className="text-xs text-gray-400">{coin.ticker}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-white text-sm">${coin.price.toLocaleString()}</p>
                            <p className={`text-xs font-semibold ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">Giá chỉ mang tính tham khảo.</p>
        </div>
    );
};

// --- NEW BEST SELLING PRODUCTS SIDEBAR ---
const ProductItem: React.FC<{ product: Product }> = ({ product }) => {
    const lowestPrice = product.variants.length > 0 ? Math.min(...product.variants.map(v => v.price)) : 0;
    return (
        <Link to={`/products/${product.id}`} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-700/50 transition-colors">
            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-gray-700" />
            <div className="min-w-0">
                <p className="text-sm text-white font-medium break-words leading-tight">{product.name}</p>
                <div className="flex items-center gap-1 text-yellow-400 mt-1">
                    <Star size={14} fill="currentColor" />
                    <span className="text-white font-bold text-xs">{product.rating.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs">({product.reviews.length} đánh giá)</span>
                </div>
                <p className="text-sm text-primary-400 font-semibold mt-1">{formatCurrency(lowestPrice)}</p>
            </div>
        </Link>
    );
};


const BestSellingProductsSidebar: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    if (!context) return null;
    const { products, orders } = context;

    const bestSellingProducts = useMemo(() => {
        const soldCounts = new Map<string, number>();

        orders
            .filter(o => o.status === OrderStatus.COMPLETED)
            .forEach(order => {
                order.items.forEach(item => {
                    const currentCount = soldCounts.get(item.product.id) || 0;
                    soldCounts.set(item.product.id, currentCount + item.quantity);
                });
            });

        const sortedProductIds = Array.from(soldCounts.entries())
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([productId]) => productId);

        const topProducts = sortedProductIds
            .map(id => products.find(p => p.id === id && p.status === ProductStatus.APPROVED))
            .filter((p): p is Product => !!p)
            .slice(0, 5);
        
        return topProducts;
    }, [products, orders]);

    if (bestSellingProducts.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp size={18} />
                Sản phẩm Bán chạy
            </h3>
            <div className="space-y-2">
                {bestSellingProducts.map(product => <ProductItem key={product.id} product={product} />)}
            </div>
        </div>
    );
};


// --- Combined Exchange Form ---
const ExchangeForm: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const navigate = useNavigate();
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [currency, setCurrency] = useState<Currency>('payeer');
    
    const [usdAmount, setUsdAmount] = useState('');
    const [vndAmount, setVndAmount] = useState('');
    
    // Buy form state
    const [buyAccountId, setBuyAccountId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Vietcombank');
    const [usdtNetwork, setUsdtNetwork] = useState<'trc20' | 'bep20'>('trc20');
    
    // Sell form state
    const [sellBank, setSellBank] = useState(fullBankList[0]);
    const [sellAccountNumber, setSellAccountNumber] = useState('');
    const [sellAccountName, setSellAccountName] = useState('');

    // Common fields
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');


    if (!context) return null;
    const { exchangeRates, platformBalances } = context;

    const currencyName = useMemo(() => {
        if (currency === 'payeer') return 'Payeer';
        if (currency === 'paypal') return 'PayPal';
        if (currency === 'usdt') return 'USDT';
        return '';
    }, [currency]);
    
    const rate = useMemo(() => {
        const currentRates = exchangeRates[currency];
        return tradeType === 'buy' ? currentRates.sell : currentRates.buy;
    }, [tradeType, currency, exchangeRates]);

    const ourUsdBalance = useMemo(() => platformBalances[currency], [currency, platformBalances]);
    const ourVndBalance = useMemo(() => platformBalances.vnd, [platformBalances]);

    const isSuspended = useMemo(() => {
        if (tradeType === 'buy' && ourUsdBalance <= 0) return `Tạm dừng giao dịch MUA ${currencyName} do hệ thống đang hết tiền.`;
        if (tradeType === 'sell' && ourVndBalance <= 0) return `Tạm dừng giao dịch BÁN do hệ thống đang hết VNĐ.`;
        return null;
    }, [tradeType, currencyName, ourUsdBalance, ourVndBalance]);
    
    useEffect(() => {
        setUsdAmount('');
        setVndAmount('');
        setBuyAccountId('');
        setUsdtNetwork('trc20');
    }, [tradeType, currency]);
    
    const handleAmountChange = (amount: string, type: 'usd' | 'vnd') => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            setUsdAmount('');
            setVndAmount('');
            return;
        }
        if (type === 'usd') {
            setUsdAmount(amount);
            setVndAmount(Math.round(numAmount * rate).toString());
        } else {
            setVndAmount(amount);
            setUsdAmount((numAmount / rate).toFixed(2));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSuspended) return;
    
        const numUsdAmount = parseFloat(usdAmount);
        const numVndAmount = parseFloat(vndAmount);
        if (!numUsdAmount || !numVndAmount || numUsdAmount <= 0) {
            alert("Vui lòng nhập số tiền hợp lệ.");
            return;
        }
    
        if (tradeType === 'buy') {
            if (!buyAccountId) {
                alert("Vui lòng nhập địa chỉ ví/tài khoản nhận.");
                return;
            }
            const exchangeDetails: ExchangeDetails = {
                currency: currencyName as 'Payeer' | 'PayPal' | 'USDT',
                direction: 'buy',
                usdAmount: numUsdAmount,
                vndAmount: numVndAmount,
                userWalletAddress: buyAccountId,
                usdtNetwork: currency === 'usdt' ? usdtNetwork : undefined,
            };
            navigate('/exchange/checkout', { state: { details: exchangeDetails } });
        } else { // 'sell'
            if (!sellAccountNumber || !sellAccountName) {
                alert("Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.");
                return;
            }
             const exchangeDetails: ExchangeDetails = {
                currency: currencyName as 'Payeer' | 'PayPal' | 'USDT',
                direction: 'sell',
                usdAmount: numUsdAmount,
                vndAmount: numVndAmount,
                userBankName: sellBank,
                userAccountNumber: sellAccountNumber,
                userAccountHolder: sellAccountName,
            };
            navigate('/exchange/confirm', { state: { details: exchangeDetails } });
        }
    };
    
    const tradeTypeTabClass = (type: 'buy' | 'sell') => `flex-1 py-3 text-center font-semibold rounded-t-lg transition-colors text-base ${tradeType === type ? 'bg-gray-800 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`;
    const currencyTabClass = (curr: Currency) => `px-4 py-2 text-sm font-medium rounded-md transition-colors ${currency === curr ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`;

    const getPlaceholder = () => {
        if (currency === 'payeer') return 'Vd: P12345678';
        if (currency === 'paypal') return 'Vd: email@paypal.com';
        return '';
    };

    const getSellNote = () => {
        if (currency === 'payeer') return "Bạn cần có: 0 PE";
        if (currency === 'paypal') return "Bạn cần có: 0 PP";
        if (currency === 'usdt') return "Bạn cần có: 0 USDT";
        return undefined;
    };

    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700">
            {/* Top Tabs: Buy / Sell */}
            <div className="flex">
                <button onClick={() => setTradeType('buy')} className={tradeTypeTabClass('buy')}>Bạn muốn MUA</button>
                <button onClick={() => setTradeType('sell')} className={tradeTypeTabClass('sell')}>Bạn muốn BÁN</button>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-b-lg">
                {isSuspended ? (
                    <div className="text-center p-6 bg-yellow-900/50 text-yellow-300 rounded-md border border-yellow-700/50">
                        <p className="font-semibold">{isSuspended}</p>
                        <p className="text-sm mt-1">Vui lòng quay lại sau. Chúng tôi xin lỗi vì sự bất tiện này.</p>
                    </div>
                ) : (
                <>
                    {/* Sub Tabs: Currency */}
                    <div className="flex justify-center gap-4 mb-6">
                        <button type="button" onClick={() => setCurrency('payeer')} className={currencyTabClass('payeer')}>Payeer</button>
                        <button type="button" onClick={() => setCurrency('paypal')} className={currencyTabClass('paypal')}>PayPal</button>
                        <button type="button" onClick={() => setCurrency('usdt')} className={currencyTabClass('usdt')}>USDT</button>
                    </div>
                
                    {/* Form Content */}
                    <div className="space-y-4">
                        <FormInput label={`Số lượng ${currencyName}`} name="usd_amount" value={usdAmount} onChange={(e: any) => handleAmountChange(e.target.value, 'usd')} required unit={currency === 'usdt' ? 'USDT' : 'USD'} type="number" note={tradeType === 'sell' ? getSellNote() : undefined} />
                        <FormInput label={tradeType === 'buy' ? 'Số tiền sẽ gửi' : 'Số tiền sẽ nhận'} name="vnd_amount" value={vndAmount} onChange={(e: any) => handleAmountChange(e.target.value, 'vnd')} required unit="VND" type="number" />
                        
                        {tradeType === 'buy' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Thanh toán qua</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2"><input type="radio" name="paymentMethod" value="Vietcombank" checked={paymentMethod === 'Vietcombank'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-500 bg-gray-700 border-gray-600"/> Vietcombank</label>
                                        <label className="flex items-center gap-2"><input type="radio" name="paymentMethod" value="TECH" checked={paymentMethod === 'TECH'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-500 bg-gray-700 border-gray-600"/> TECH</label>
                                    </div>
                                </div>
                                
                                {currency !== 'usdt' && (
                                    <FormInput 
                                        label={`Địa chỉ ví ${currencyName} nhận`} 
                                        name="buy_account_id" 
                                        value={buyAccountId} 
                                        onChange={(e: any) => setBuyAccountId(e.target.value)} 
                                        required 
                                        placeholder={getPlaceholder()} 
                                    />
                                )}

                                {currency === 'usdt' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Chọn mạng lưới nhận USDT *</label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2">
                                                    <input type="radio" name="usdtNetwork" value="trc20" checked={usdtNetwork === 'trc20'} onChange={() => setUsdtNetwork('trc20')} className="text-primary-500 bg-gray-700 border-gray-600"/> TRC20
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input type="radio" name="usdtNetwork" value="bep20" checked={usdtNetwork === 'bep20'} onChange={() => setUsdtNetwork('bep20')} className="text-primary-500 bg-gray-700 border-gray-600"/> BEP20 (BNB Smart Chain)
                                                </label>
                                            </div>
                                        </div>
                                        <FormInput 
                                            label={`Địa chỉ ví ${usdtNetwork.toUpperCase()} nhận`}
                                            name="buy_account_id" value={buyAccountId} onChange={(e: any) => setBuyAccountId(e.target.value)} required placeholder={usdtNetwork === 'trc20' ? 'Vd: T...' : 'Vd: 0x...'} 
                                        />
                                    </>
                                )}
                            </>
                        )}
                        
                        {tradeType === 'sell' && (
                            <>
                                <div>
                                    <label htmlFor="sell_bank" className="block text-sm font-medium text-gray-300 mb-1">Nhận tiền qua</label>
                                    <select id="sell_bank" value={sellBank} onChange={e => setSellBank(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                        {fullBankList.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                                    </select>
                                </div>
                                <FormInput label="Số tài khoản nhận" name="sell_account_number" value={sellAccountNumber} onChange={(e:any) => setSellAccountNumber(e.target.value)} required placeholder="Số tài khoản VCB. Vd: 00710030xxxxx" />
                                <FormInput label="Tên tài khoản" name="sell_account_name" value={sellAccountName} onChange={(e:any) => setSellAccountName(e.target.value)} placeholder="Tên chủ tài khoản" required/>
                            </>
                        )}
                        
                        <FormInput label="Email" name="email" value={email} onChange={(e:any) => setEmail(e.target.value)} placeholder="Email của bạn" type="email" />
                        <FormInput label="Điện thoại" name="phone" value={phone} onChange={(e:any) => setPhone(e.target.value)} placeholder="Số điện thoại của bạn" type="tel" />
                        
                        <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md">
                            <span className="text-sm text-gray-400">Chúng tôi còn:</span>
                            {tradeType === 'buy' ? (
                                <span className="font-bold text-white">{ourUsdBalance.toFixed(2)} {currencyName} {currency === 'usdt' ? '' : 'USD'}</span>
                            ) : (
                                <span className="font-bold text-white">{formatCurrency(ourVndBalance)}</span>
                            )}
                        </div>
                        
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Tiếp tục</button>
                    </div>
                </>
                )}
            </form>
        </div>
    );
};

// --- Instructions Section ---
const Instructions: React.FC = () => (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-8">
        <div>
            <h3 className="text-lg font-bold text-white mb-2">Hướng dẫn mua/bán USD</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                <li>Chọn tab "Mua" hoặc "Bán" và loại tiền tệ (Payeer/PayPal/USDT).</li>
                <li>Nhập số lượng USD hoặc VND cần giao dịch.</li>
                <li>Điền đầy đủ thông tin tài khoản nhận/gửi.</li>
                <li>Bấm vào nút "Tiếp tục" và làm theo hướng dẫn.</li>
                <li>Hệ thống sẽ xử lý giao dịch của bạn trong giây lát.</li>
            </ol>
        </div>
         <div>
            <h3 className="text-lg font-bold text-white mb-2">Chú ý</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                <li>Kiểm tra chính xác tài khoản gửi, tài khoản nhận và các thông tin trên đơn hàng.</li>
                <li>Tuyệt đối không đưa link đơn hàng, mã đơn hàng cho người khác.</li>
                <li>Giao dịch sẽ được xử lý từ 5-30 phút.</li>
                <li>Thời gian giao dịch từ 8h - 22h.</li>
            </ol>
        </div>
    </div>
);

// --- Rate Sidebar ---
const ExchangeRateSidebar: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    if (!context) return null;
    const { exchangeRates } = context;

    const rateData = [
        { name: 'PayPal', rates: exchangeRates.paypal, icon: <DollarSign size={16} className="text-blue-400" /> },
        { name: 'Payeer', rates: exchangeRates.payeer, icon: <DollarSign size={16} className="text-sky-400" /> },
        { name: 'USDT (TRC20)', rates: exchangeRates.usdt, icon: <DollarSign size={16} className="text-teal-400" /> },
        { name: 'Perfect Money', rates: exchangeRates.pm, icon: <DollarSign size={16} className="text-red-400" /> },
        { name: 'WebMoney (WMZ)', rates: exchangeRates.wmz, icon: <DollarSign size={16} className="text-yellow-400" /> },
    ];
    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="p-4 text-lg font-bold text-white border-b border-gray-700 flex items-center gap-2">
                <RefreshCcw size={18} /> Tỷ giá Mua/Bán
            </h3>
            <div className="p-4 space-y-4">
                {rateData.map(rate => (
                    <div key={rate.name} className="bg-gray-800 p-3 rounded-lg">
                        <h4 className="font-semibold text-white flex items-center gap-2 mb-2">{rate.icon} {rate.name}</h4>
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Mua vào:</span>
                                <span className="font-semibold text-green-400">{formatCurrency(rate.rates.buy)}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Bán ra:</span>
                                <span className="font-semibold text-red-400">{formatCurrency(rate.rates.sell)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- NEW LEFT SIDEBAR ---
const ServiceItem: React.FC<{ item: Task | Product }> = ({ item }) => {
    const isTask = 'creatorId' in item;
    const link = isTask ? `/tasks/${item.id}` : `/products/${item.id}`;
    const title = isTask ? item.title : item.name;
    const description = item.description.substring(0, 50) + '...';
    const reward = isTask ? item.reward : Math.min(...item.variants.map(v => v.price));

    return (
        <Link to={link} className="block p-3 bg-gray-900/50 rounded-md hover:bg-gray-700/50 transition-colors border border-gray-700/50">
            <p className="text-sm text-white font-semibold truncate">{title}</p>
            <p className="text-xs text-gray-400 mt-1 truncate">{description}</p>
            <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-primary-400 font-bold">{formatCurrency(reward)}</span>
                {isTask && <span className="text-xs text-gray-300 bg-gray-700 px-2 py-0.5 rounded">Nhiệm vụ</span>}
                {!isTask && <span className="text-xs text-gray-300 bg-gray-700 px-2 py-0.5 rounded">Dịch vụ</span>}
            </div>
        </Link>
    );
};

const ServiceCategory: React.FC<{ title: string; iconName: string; items: (Task | Product)[] }> = ({ title, iconName, items }) => {
    if (items.length === 0) return null;
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Icon name={iconName} className="w-5 h-5" />
                {title}
            </h3>
            <div className="space-y-2">
                {items.map(item => <ServiceItem key={item.id} item={item} />)}
            </div>
        </div>
    );
};

const TaskAndServicesSidebar: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    if (!context) return null;
    const { tasks, products } = context;

    const getServices = (categoryId: string, count: number) => {
        const categoryProducts = products.filter(p => p.categoryId === categoryId);
        const categoryTasks = tasks.filter(t => t.categoryId === categoryId);
        return [...categoryProducts, ...categoryTasks]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, count);
    };

    const facebookServices = getServices('cat-facebook', 3);
    const youtubeServices = getServices('cat-youtube', 3);
    const gamingServices = getServices('cat-gaming', 3);
    const makeMoneyTasks = tasks.filter(t => t.categoryId === 'cat-task').slice(0, 3);

    return (
        <div className="space-y-6">
            <ServiceCategory title="Dịch Vụ Facebook" iconName="Facebook" items={facebookServices} />
            <ServiceCategory title="Dịch Vụ YouTube" iconName="Youtube" items={youtubeServices} />
            <ServiceCategory title="Mua bán Tài khoản Game" iconName="Gamepad2" items={gamingServices} />
            <ServiceCategory title="Nhiệm Vụ Kiếm Tiền" iconName="CheckCircle" items={makeMoneyTasks} />
        </div>
    );
};


const ExchangePage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar */}
                <div className="lg:col-span-1">
                     <div className="sticky top-24 space-y-8">
                        <TaskAndServicesSidebar />
                        <BestSellingProductsSidebar />
                    </div>
                </div>

                 {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <ExchangeForm />
                    <Instructions />
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-8">
                        <ExchangeRateSidebar />
                        <CryptoPriceSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExchangePage;
