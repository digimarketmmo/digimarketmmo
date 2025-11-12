import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { ProductStatus, OrderStatus, VerificationStatus, UserRole, Product, AdCampaignStatus } from '../types.ts';
import { formatCurrency, formatTimeAgo } from '../utils/formatter.ts';
import { Star, Heart, ShieldCheck, RefreshCcw, Search, Gem, Copy, Check } from '../components/icons.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

const ProductDetailPage: React.FC = () => {
    const { productSlug } = useParams<{ productSlug: string }>();
    const [searchParams] = useSearchParams();
    const referrerId = searchParams.get('ref');
    const context = useContext(AppContext) as AppContextType;
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('description');
    const [isAffiliateLinkCopied, setIsAffiliateLinkCopied] = useState(false);

    if (!context) return <div className="bg-gray-900 text-center py-20">Đang tải...</div>;

    const { products, users, placePreOrder, currentUser, getSponsoredItems, adCampaigns } = context;

    const product = useMemo(() => products.find(p => p.slug === productSlug), [products, productSlug]);
    
    const seller = useMemo(() => product ? users.find(u => u.id === product.sellerId) : null, [product, users]);

    // SEO Optimization Effect
    useEffect(() => {
        if (!product || !seller) return;

        const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
            let element = document.head.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement | null;
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, key);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
            return element;
        };
        
        const setScriptTag = (id: string, content: string) => {
            let element = document.head.querySelector(`#${id}`) as HTMLScriptElement | null;
            if (!element) {
                element = document.createElement('script');
                element.id = id;
                element.type = "application/ld+json";
                document.head.appendChild(element);
            }
            element.innerHTML = content;
            return element;
        };
        
        const lowestPrice = Math.min(...product.variants.map(v => v.price));
        const highestPrice = Math.max(...product.variants.map(v => v.price));
        const stockStatus = product.variants.some(v => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
        
        const pageTitle = `${product.name} | DigiMarket`;
        const pageDescription = product.description.substring(0, 160);
        const pageUrl = window.location.href;

        // 1. Title
        document.title = pageTitle;

        // 2. Meta Tags
        const metaTags = [
            setMetaTag('name', 'description', pageDescription),
            setMetaTag('property', 'og:title', pageTitle),
            setMetaTag('property', 'og:description', pageDescription),
            setMetaTag('property', 'og:image', product.imageUrl),
            setMetaTag('property', 'og:url', pageUrl),
            setMetaTag('property', 'og:type', 'product'),
        ];
        
        // 3. JSON-LD Structured Data
        const structuredData = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.imageUrl,
            "description": product.description,
            "sku": product.id,
            "mpn": product.id,
            "brand": {
                "@type": "Brand",
                "name": seller.brandName || seller.name
            },
            "review": product.reviews.map(review => ({
                "@type": "Review",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": review.rating
                },
                "author": {
                    "@type": "Person",
                    "name": users.find(u => u.id === review.userId)?.name || "Anonymous"
                },
                "reviewBody": review.comment,
                "datePublished": review.date
            })),
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.reviews.length
            },
            "offers": {
                "@type": "AggregateOffer",
                "lowPrice": lowestPrice,
                "highPrice": highestPrice,
                "priceCurrency": "VND",
                "offerCount": product.variants.length,
                "availability": stockStatus
            }
        };

        const scriptTag = setScriptTag('product-json-ld', JSON.stringify(structuredData));

        return () => {
            // Cleanup on unmount
            document.title = "DigiMarket";
            metaTags.forEach(tag => tag.remove());
            scriptTag.remove();
        };

    }, [product, seller, users]);

    const [quantity, setQuantity] = useState(1);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

     React.useEffect(() => {
        if (product && product.variants.length > 0) {
            setSelectedVariantId(product.variants[0].id);
        }
        setQuantity(1); 
    }, [product]);

    useEffect(() => {
        setQuantity(1);
    }, [selectedVariantId]);
    
    const selectedVariant = useMemo(() => {
        return product?.variants.find(v => v.id === selectedVariantId);
    }, [product, selectedVariantId]);

    const isPromoted = useMemo(() => {
        return adCampaigns.some(c => c.itemId === product?.id && c.status === AdCampaignStatus.ACTIVE && c.totalSpend < c.dailyBudget);
    }, [adCampaigns, product]);

    const relatedSponsoredProducts = useMemo(() => {
        if (!product) return [];
        const items = getSponsoredItems(4, product.categoryId);
        return items.filter(item => 'sellerId' in item && item.id !== product.id) as Product[];
    }, [product, adCampaigns]);
    
    const stock = selectedVariant?.stock ?? 0;

    const soldCount = useMemo(() => {
        if (!product) return 0;
        const productVariantIds = new Set(product.variants.map(v => v.id));
        return context.orders.reduce((total, order) => {
            if (order.status !== OrderStatus.COMPLETED) return total;
            const relevantItems = order.items.filter(item => productVariantIds.has(item.variant.id));
            return total + relevantItems.reduce((itemTotal, item) => itemTotal + item.quantity, 0);
        }, 0);
    }, [product, context.orders]);

    const isSellerOnline = useMemo(() => {
        if (!seller) return false;
        return (new Date().getTime() - new Date(seller.lastSeen).getTime()) < 5 * 60 * 1000;
    }, [seller]);

    if (!product || !seller) {
        return <Navigate to="/products" replace />;
    }
    
    const isOwner = currentUser?.id === product.sellerId;
    const isAdmin = currentUser?.role === UserRole.ADMIN;
    const isApproved = product.status === ProductStatus.APPROVED;

    if (!isApproved && !isAdmin && !isOwner) {
        return (
             <div className="bg-gray-900 text-gray-200">
                <div className="container mx-auto text-center py-20">
                    <h1 className="text-2xl font-bold">Sản phẩm này không tồn tại hoặc đang chờ duyệt.</h1>
                    <Link to="/products" className="text-primary-400 hover:text-primary-300 mt-4 inline-block">
                        Quay lại trang sản phẩm
                    </Link>
                </div>
            </div>
        )
    }

    const StatusBanner = () => {
        if (isApproved) return null;

        const statusInfo = {
            [ProductStatus.PENDING]: { text: 'Chờ duyệt', class: 'bg-yellow-900/50 border-yellow-700 text-yellow-300' },
            [ProductStatus.REJECTED]: { text: 'Bị từ chối', class: 'bg-red-900/50 border-red-700 text-red-300' },
        };
        
        const info = statusInfo[product.status];
        if (!info) return null;
        
        return (
            <div className={`p-4 rounded-lg border mb-6 text-center ${info.class}`}>
                <p className="font-bold">Trạng thái: {info.text}</p>
                <p className="text-sm">Sản phẩm này chưa được hiển thị công khai.</p>
            </div>
        );
    }

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 1) {
            value = 1;
        }
        
        if (stock > 0) {
            value = Math.min(value, stock);
        }
        
        setQuantity(value);
    };

    const handleIncrement = () => {
        setQuantity(q => {
            const nextVal = q + 1;
            if (stock > 0) {
                return Math.min(nextVal, stock);
            }
            return nextVal;
        });
    };
    
    const handleDecrement = () => {
        setQuantity(q => Math.max(1, q - 1));
    };

    const handleBuyNow = () => {
        if (product && selectedVariant) {
            navigate('/checkout', { 
                state: { 
                    product: product, 
                    variant: selectedVariant, 
                    quantity: quantity,
                    referrerId: referrerId,
                } 
            });
        }
    };
    
    const handlePreOrder = async () => {
        if (!product || !selectedVariant) return;

        if (window.confirm(`Bạn có chắc chắn muốn đặt trước ${quantity} sản phẩm "${selectedVariant.name}" với giá ${formatCurrency(selectedVariant.price * quantity)}? Số tiền sẽ được trừ vào ví của bạn ngay lập tức.`)) {
            const result = await placePreOrder(product, selectedVariant, quantity);
            alert(result.message);
            if (result.success && result.orderId) {
                navigate(`/order/${result.orderId}`);
            }
        }
    };

    const handleCopyAffiliateLink = () => {
        if (!currentUser) return;
        const url = `${window.location.origin}${window.location.pathname}#${location.pathname}?ref=${currentUser.referralCode}`;
        navigator.clipboard.writeText(url).then(() => {
            setIsAffiliateLinkCopied(true);
            setTimeout(() => setIsAffiliateLinkCopied(false), 2000);
        });
    };

    const tabClass = (tabName: string) => `font-semibold py-4 px-1 text-sm border-b-2 transition-colors whitespace-nowrap ${
        activeTab === tabName 
        ? 'border-green-600 text-green-500' 
        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
    }`;

    return (
        <div className="bg-gray-900 text-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {(isAdmin || isOwner) && <StatusBanner />}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column: Image */}
                    <div className="lg:col-span-2">
                        <div className="relative bg-gray-800 border border-gray-700 rounded-lg overflow-hidden group shadow-md">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover" />
                            <button className="absolute top-2 right-2 bg-gray-700 p-2 rounded-full shadow-md">
                                <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Info & Purchase */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">Sản phẩm</span>
                            {isPromoted && (
                                <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                    <Gem size={12} />
                                    <span>Được tài trợ</span>
                                </span>
                            )}
                            <h1 className="text-2xl lg:text-3xl font-bold text-white break-words">{product.name}</h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mb-4 border-b border-gray-700 pb-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" />)}
                                <span className="text-gray-300 font-semibold ml-1">{product.reviews.length} Reviews</span>
                            </div>
                            <span>|</span>
                            <span>Đã bán: <span className="font-semibold text-gray-300">{soldCount}</span></span>
                            <span>|</span>
                            <span>Khiếu nại: <span className="font-semibold text-gray-300">0.0%</span></span>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-4">
                            <p className="font-semibold text-white break-words">{product.name}</p>
                            <div className="flex items-center gap-2">
                                <span>Người bán: <Link to={`/shop/${seller.id}`} className="font-semibold text-primary-400 break-words">{seller.brandName || seller.name}</Link></span>
                                {isSellerOnline ? (
                                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Online</span>
                                ) : (
                                    <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">Offline</span>
                                )}
                                {seller.verificationStatus === VerificationStatus.VERIFIED ? (
                                    <span className="flex items-center gap-1 text-blue-400 font-semibold text-xs"><ShieldCheck className="w-4 h-4"/> Đã xác thực</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-gray-400 font-semibold text-xs"><ShieldCheck className="w-4 h-4"/> Chưa xác thực</span>
                                )}
                            </div>
                            <p>Sản phẩm: <span className="font-semibold text-gray-300">{context.categories.find(c => c.id === product.categoryId)?.name || 'N/A'}</span></p>
                            <p>Kho: <span className="font-semibold text-gray-300">{product.variants.reduce((acc, v) => acc + v.stock, 0)}</span></p>
                        </div>

                        <p className="text-3xl font-bold text-white mb-4">{formatCurrency(selectedVariant?.price || 0)}</p>

                        <div className="mb-4">
                            <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Sản phẩm</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map(variant => (
                                    <button 
                                        key={variant.id}
                                        onClick={() => setSelectedVariantId(variant.id)}
                                        className={`px-3 py-2 text-sm border rounded-md ${selectedVariantId === variant.id ? 'bg-green-600 text-white border-green-600' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`}
                                    >
                                        {variant.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                             <div className="flex-shrink-0">
                                <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">Số lượng</label>
                                <div className="flex items-center border border-gray-600 rounded-md bg-gray-800">
                                    <button onClick={handleDecrement} className="px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-l-md">-</button>
                                    <input 
                                        type="number" 
                                        value={quantity} 
                                        onChange={handleQuantityChange}
                                        className="w-16 text-center border-l border-r border-gray-600 bg-transparent" 
                                        min="1"
                                    />
                                    <button onClick={handleIncrement} className="px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-r-md">+</button>
                                </div>
                             </div>
                            <div className="relative flex-grow">
                                <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">&nbsp;</label>
                                <input type="text" placeholder="Nhập mã giảm giá" className="w-full border border-gray-600 bg-gray-700 rounded-md py-2.5 pl-3 pr-10" />
                                <button className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
                                    <Search className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={handleBuyNow} 
                                disabled={stock === 0}
                                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 min-w-[120px] disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                Mua hàng
                            </button>
                            <button 
                                onClick={handlePreOrder} 
                                disabled={stock > 0}
                                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 min-w-[120px] disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                Đặt trước
                            </button>
                            <button onClick={() => navigate('/messages', { state: { prefilledUserId: seller.id } })} className="flex-1 border border-gray-600 font-bold py-3 rounded-md hover:bg-gray-700 bg-gray-800 min-w-[120px]">Nhắn tin</button>
                            <button className="border border-gray-600 font-bold p-3 rounded-md flex justify-center items-center hover:bg-gray-700 bg-gray-800">
                                <RefreshCcw className="w-5 h-5"/>
                            </button>
                        </div>
                        {currentUser && product.affiliateCommissionRate && product.affiliateCommissionRate > 0 && (
                             <button onClick={handleCopyAffiliateLink} className={`w-full mt-4 text-sm font-semibold py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${isAffiliateLinkCopied ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                                {isAffiliateLinkCopied ? <><Check size={16} /> Đã sao chép link!</> : <><Copy size={16} /> Sao chép link Affiliate ({product.affiliateCommissionRate}%)</>}
                            </button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-5 mt-12">
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                            <button onClick={() => setActiveTab('description')} className={tabClass('description')}>Mô tả</button>
                            <button onClick={() => setActiveTab('reviews')} className={tabClass('reviews')}>Reviews</button>
                            <button onClick={() => setActiveTab('api')} className={tabClass('api')}>API</button>
                        </nav>
                    </div>
                    <div className="py-6 bg-gray-800 rounded-b-lg px-4">
                        {activeTab === 'description' && (
                            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                               <p>{product.description}</p>
                               <p className="text-red-500 font-semibold">
                                    Gmail USA: Gmail|Pass|Mail Recovery <br/>
                                    Gmail 2fa : Gmail|Pass|2fa <br/>
                                    Gmail Random : Gmail|Pass|Mail Recovery <br/>
                                    Gmail Random 2FA : Gmail|Pass|2fa
                                </p>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                            {product.reviews.length > 0 ? product.reviews.map(review => {
                                const reviewUser = users.find(u => u.id === review.userId);
                                return (
                                    <div key={review.id} className="flex items-start gap-4 border-b border-gray-700 pb-4 last:border-b-0 last:pb-0">
                                        <img src={reviewUser?.avatarUrl} alt={reviewUser?.name} className="w-10 h-10 rounded-full" />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-white">{reviewUser?.name}</p>
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'}/>)}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400">{formatTimeAgo(new Date(review.date))}</p>
                                            <p className="text-gray-300 mt-2 break-words">{review.comment}</p>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <p className="text-gray-400 text-center pt-8">Chưa có đánh giá nào cho sản phẩm này.</p>
                            )}
                        </div>
                        )}
                         {activeTab === 'api' && (
                            <p className="text-gray-400">Thông tin API sẽ sớm được cập nhật tại đây.</p>
                        )}
                    </div>
                </div>

                {relatedSponsoredProducts.length > 0 && (
                    <div className="lg:col-span-5 mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6">Sản phẩm được tài trợ khác</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedSponsoredProducts.map(p => <ProductCard key={p.id} product={p} isSponsored={true}/>)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;