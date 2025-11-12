import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { BlogPost, BlogPostStatus } from '../types.ts';
import { formatTimeAgo } from '../utils/formatter.ts';
import { Search } from '../components/icons.tsx';
import { Pagination } from '../components/Pagination.tsx';

const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
    const context = useContext(AppContext) as AppContextType;
    if (!context) return null;
    const { users } = context;

    const author = users.find(u => u.id === post.creatorId);

    return (
        <article className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-primary-500/20 transition-all duration-300 group flex flex-col">
            <Link to={`/blog/post/${post.slug}`} className="block">
                <img
                    src={post.imageUrl || 'https://source.unsplash.com/random/800x400/?blog,technology'}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-700"
                    loading="lazy"
                    decoding="async"
                />
            </Link>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-sm text-primary-400 font-semibold mb-1">{post.category}</p>
                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-primary-300 transition-colors flex-grow">
                    <Link to={`/blog/post/${post.slug}`}>{post.title}</Link>
                </h2>
                <div className="mt-4 flex items-center gap-3">
                    <img
                        src={author?.avatarUrl}
                        alt={author?.name}
                        className="w-8 h-8 rounded-full"
                    />
                    <div>
                        <p className="text-sm font-medium text-gray-300">{author?.name || 'Vô danh'}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                </div>
            </div>
        </article>
    );
};


const BlogPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const POSTS_PER_PAGE = 6;

    if (!context) return <div>Đang tải...</div>;
    const { blogPosts, categories: mainCategories } = context;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    const publishedPosts = useMemo(() =>
        blogPosts.filter(p => p.status === BlogPostStatus.PUBLISHED),
    [blogPosts]);

    const categories = useMemo(() => {
        const blogSpecificCategories = ['Hướng dẫn', 'Mẹo vặt và Thủ thuật', 'Thông báo'];
        const mainCategoryNames = mainCategories.map(c => c.name);
        const existingBlogCategories = publishedPosts.map(p => p.category);
        const combined = [...new Set([...blogSpecificCategories, ...mainCategoryNames, ...existingBlogCategories])];
        return ['all', ...combined.sort((a, b) => a.localeCompare(b))];
    }, [publishedPosts, mainCategories]);

    const { paginatedPosts, totalPages } = useMemo(() => {
        const filtered = publishedPosts.filter(post => {
            const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
            const matchesSearch = !searchTerm.trim() || post.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
        const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
        const paginatedPosts = filtered.slice(startIndex, startIndex + POSTS_PER_PAGE);
        
        return { paginatedPosts, totalPages };
    }, [publishedPosts, searchTerm, selectedCategory, currentPage]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">DigiMarket Blog</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
                    Kiến thức, hướng dẫn và cập nhật mới nhất từ cộng đồng DigiMarket.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Sidebar */}
                <aside className="lg:col-span-1 lg:sticky top-24">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4">
                        <div className="relative">
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm bài viết..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2">Danh mục</h3>
                            <ul className="space-y-1">
                                {categories.map(cat => (
                                    <li key={cat}>
                                        <button
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                                                selectedCategory === cat ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                            }`}
                                        >
                                            {cat === 'all' ? 'Tất cả' : cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <main>
                        {paginatedPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {paginatedPosts.map(post => <BlogPostCard key={post.id} post={post} />)}
                            </div>
                        ) : (
                            <div className="text-center bg-gray-800 p-12 rounded-lg border border-gray-700">
                                <h3 className="text-xl font-semibold text-white">Không tìm thấy bài viết nào</h3>
                                <p className="text-gray-400 mt-2">Vui lòng thử lại với từ khóa hoặc danh mục khác.</p>
                            </div>
                        )}
                    </main>

                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;