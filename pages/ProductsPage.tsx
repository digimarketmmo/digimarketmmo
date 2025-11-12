
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { AdBanner } from '../components/AdBanner.tsx';
import { ProductStatus, Product } from '../types.ts';

const ProductsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    
    if (!context) return <div>Đang tải...</div>;
    
    const { products, categories, getSponsoredItems, adCampaigns } = context;
    
    const getInitialCategory = () => {
        const categorySlug = searchParams.get('category');
        if (!categorySlug) return 'all';
        const category = categories.find(c => c.slug === categorySlug);
        return category ? category.id : 'all';
    };

    const [categoryFilter, setCategoryFilter] = useState(getInitialCategory);
    const [sortOption, setSortOption] = useState('default');

    useEffect(() => {
        const categorySlug = searchParams.get('category');
        if (categorySlug) {
            const category = categories.find(c => c.slug === categorySlug);
            setCategoryFilter(category ? category.id : 'all');
        } else {
            setCategoryFilter('all');
        }
    }, [searchParams, categories]);

    const categoryOptions = useMemo(() => {
        return [{id: 'all', name: 'Tất cả danh mục'}, ...categories];
    }, [categories]);

    const { finalProducts, sponsoredProductIds } = useMemo(() => {
        const sponsored = getSponsoredItems(4, categoryFilter !== 'all' ? categoryFilter : undefined)
            .filter(item => 'sellerId' in item) as Product[];
        const sponsoredIds = new Set(sponsored.map(p => p.id));

        let filtered = products.filter(product => {
            if (sponsoredIds.has(product.id)) return false; // Exclude sponsored items from organic results

            const isApproved = product.status === ProductStatus.APPROVED;
            const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
            const matchesSearch = !searchTerm.trim() || product.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
            return isApproved && matchesCategory && matchesSearch;
        });

        const getLowestPrice = (p: Product): number => {
            if (!p.variants || p.variants.length === 0) return Infinity;
            return Math.min(...p.variants.map(v => v.price));
        };

        switch (sortOption) {
            case 'price-asc':
                filtered.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
                break;
            case 'price-desc':
                filtered.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
                break;
            case 'rating-desc':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'default':
            default:
                filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                break;
        }
        
        return { finalProducts: [...sponsored, ...filtered], sponsoredProductIds: sponsoredIds };
    }, [products, searchTerm, categoryFilter, sortOption, adCampaigns]);

    const searchFromUrl = searchParams.get('search');

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {searchFromUrl ? (
                 <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Kết quả tìm kiếm cho: "{searchFromUrl}"</h1>
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <span className="cursor-pointer border-primary-500 text-primary-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Sản phẩm ({finalProducts.length})
                            </span>
                            <Link to={`/tasks?search=${encodeURIComponent(searchFromUrl)}`} className="border-transparent text-gray-400 hover:text-white hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Nhiệm vụ / Dịch vụ
                            </Link>
                        </nav>
                    </div>
                </div>
            ) : (
                <h1 className="text-3xl font-bold text-white mb-6">Tất cả sản phẩm</h1>
            )}


            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-800 rounded-lg">
                <div className="md:col-span-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                         className="w-full h-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        {categoryOptions.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                         className="w-full h-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="default">Sắp xếp theo: Mới nhất</option>
                        <option value="price-asc">Giá: Thấp đến cao</option>
                        <option value="price-desc">Giá: Cao đến thấp</option>
                        <option value="rating-desc">Xếp hạng: Cao đến thấp</option>
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            {finalProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {finalProducts.map(product => (
                        <ProductCard key={product.id} product={product} isSponsored={sponsoredProductIds.has(product.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-800 rounded-lg">
                    <p className="text-xl text-gray-400">Không tìm thấy sản phẩm nào.</p>
                </div>
            )}
            
            <AdBanner />
        </div>
    );
};

export default ProductsPage;