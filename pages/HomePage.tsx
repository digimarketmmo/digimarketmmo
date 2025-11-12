import React, { useContext, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Search, Briefcase, Icon, ArrowLeft, ArrowRight, TrendingUp, ArrowRight as ArrowRightIcon, Gem
} from '../components/icons.tsx';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { ProductStatus, Task, TaskStatus } from '../types.ts';
import { formatCurrency } from '../utils/formatter.ts';

const TaskCard: React.FC<{ task: Task, isSponsored?: boolean }> = ({ task, isSponsored }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-primary-500/20 transition-all duration-300 group flex flex-col h-full">
        <div className="p-4 flex flex-col flex-grow">
            <div className="relative">
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">Nhiệm vụ</span>
                {isSponsored && (
                     <div className="absolute top-0 left-0 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
                        <Gem size={12} />
                        <span>Tài trợ</span>
                    </div>
                )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 mt-8 group-hover:text-primary-400 transition-colors break-words">
              <Link to={`/tasks/${task.id}`}>{task.title}</Link>
            </h3>
            <p className="text-gray-400 text-sm mb-4 flex-grow break-words">{task.description.substring(0, 40)}...</p>
            <div className="mt-auto flex justify-between items-center">
                <p className="text-xl font-bold text-primary-400">
                    {formatCurrency(task.reward)}
                </p>
                <Link to={`/tasks/${task.id}`} className="text-sm font-semibold text-white bg-primary-600 px-3 py-1.5 rounded-md hover:bg-primary-700">
                    Xem
                </Link>
            </div>
        </div>
    </div>
);


const HomePage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [categoryPage, setCategoryPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const CATEGORIES_PER_PAGE = 10;
    
    if (!context) return null;
    const { categories, products, getSponsoredItems } = context;
    
    const popularSearches = ['Logo Design', 'WordPress', 'Facebook Ads', 'Video Editing'];

    const sponsoredItems = useMemo(() => {
        return getSponsoredItems(8); // Get top 8 sponsored items for homepage carousel
    }, [products, context.tasks, context.adCampaigns]);


    const featuredProducts = useMemo(() => {
        return products
            .filter(p => p.status === ProductStatus.APPROVED)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);
    }, [products]);

    const totalCategoryPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);
    const paginatedCategories = useMemo(() => {
        const startIndex = (categoryPage - 1) * CATEGORIES_PER_PAGE;
        return categories.slice(startIndex, startIndex + CATEGORIES_PER_PAGE);
    }, [categories, categoryPage]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-24">
                <div className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-xs font-medium text-gray-300 mb-4">
                    <Briefcase size={14} />
                    <span>Marketplace sản phẩm số & dịch vụ chuyên nghiệp</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
                    Mua bán <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">dịch vụ</span> làm nhiệm vụ kiếm tiền
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-gray-300 mb-8">
                    Kết nối với hàng ngàn freelancer tài năng. Mua bán dịch vụ thiết kế, lập trình, marketing, template và nhiều hơn nữa với thanh toán an toàn.
                </p>
                
                {/* Search Bar */}
                <div className="max-w-xl mx-auto">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="search"
                            name="search"
                            id="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-11 pr-32 py-4 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Tìm kiếm dịch vụ, sản phẩm..."
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                             <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </form>
                </div>

                {/* Popular Searches */}
                <div className="mt-6 flex justify-center items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-400">Phổ biến:</span>
                    {popularSearches.map(term => (
                        <button key={term} className="px-3 py-1 text-sm text-gray-300 border border-gray-600 rounded-full hover:bg-gray-700 transition-colors">
                            {term}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sponsored Items Section */}
            {sponsoredItems.length > 0 && (
                 <div className="mb-24">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-8 h-8 text-yellow-400"/>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                           sản phẩm top 1
                        </h2>
                    </div>
                    <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {sponsoredItems.map(item => (
                            <div key={item.id} className="flex-shrink-0 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem*3/4)]">
                                {'sellerId' in item ? <ProductCard product={item} isSponsored={true}/> : <TaskCard task={item as Task} isSponsored={true} />}
                            </div>
                        ))}
                    </div>
                    <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                </div>
            )}

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
                 <div className="mb-24">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            Sản phẩm nổi bật
                        </h2>
                        <Link to="/products" className="text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-2">
                           Xem tất cả <ArrowRightIcon size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}


            {/* Categories Section */}
            <div className="text-center max-w-4xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Khám phá theo danh mục
                </h2>
                <p className="text-lg text-gray-400">
                    Tìm dịch vụ và sản phẩm số phù hợp với nhu cầu của bạn
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
                {paginatedCategories.map((cat) => {
                    const linkTo = cat.id === 'cat-survey' ? '/surveys' : `/products?category=${cat.slug}`;
                    return (
                        <Link to={linkTo} key={cat.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700/50 hover:border-primary-500 hover:-translate-y-1 transition-all duration-300 group">
                            <div className="mb-4">
                                <Icon name={cat.icon} className={`w-6 h-6 ${cat.color}`} />
                            </div>
                            <h3 className="font-bold text-white text-lg mb-1 group-hover:text-primary-400 transition-colors">{cat.name}</h3>
                            <p className="text-sm text-gray-400">{cat.description}</p>
                        </Link>
                    );
                })}
            </div>
             {/* Category Pagination */}
            {totalCategoryPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() => setCategoryPage(p => Math.max(1, p - 1))}
                        disabled={categoryPage === 1}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                        aria-label="Trang trước"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Trang trước</span>
                    </button>
                    <span className="text-gray-400 text-sm sm:text-base">Trang {categoryPage} / {totalCategoryPages}</span>
                    <button
                        onClick={() => setCategoryPage(p => Math.min(totalCategoryPages, p + 1))}
                        disabled={categoryPage === totalCategoryPages}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                        aria-label="Trang sau"
                    >
                        <span className="hidden sm:inline">Trang sau</span>
                        <ArrowRightIcon size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePage;