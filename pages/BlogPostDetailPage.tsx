import React, { useContext, useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { formatDate, formatTimeAgo } from '../utils/formatter.ts';
import { BlogPostStatus, BlogPost, BlogPostCommentStatus } from '../types.ts';
import { Calendar, User, Send } from '../components/icons.tsx';
import { DynamicAd } from '../components/DynamicAd.tsx';

const BlogPostDetailPage: React.FC = () => {
    const { postSlug } = useParams<{ postSlug: string }>();
    const context = useContext(AppContext) as AppContextType;
    const [newComment, setNewComment] = useState('');
    const [commentStatus, setCommentStatus] = useState<{ type: string; text: string } | null>(null);

    if (!context) return <div>Đang tải...</div>;
    const { blogPosts, users, currentUser, blogPostComments, addBlogPostComment } = context;

    const post = useMemo(() =>
        blogPosts.find(p => p.slug === postSlug && p.status === BlogPostStatus.PUBLISHED),
    [blogPosts, postSlug]);

    const author = useMemo(() =>
        post ? users.find(u => u.id === post.creatorId) : null,
    [users, post]);
    
    const suggestedPosts = useMemo(() => 
        post 
            ? blogPosts.filter(p => 
                p.id !== post.id && p.status === BlogPostStatus.PUBLISHED
              ).slice(0, 3) 
            : [], 
    [blogPosts, post]);

    const relatedPosts = useMemo(() =>
        post
            ? blogPosts.filter(p =>
                p.category === post.category &&
                p.id !== post.id &&
                p.status === BlogPostStatus.PUBLISHED
            ).slice(0, 3)
            : [],
    [blogPosts, post]);
    
    const comments = useMemo(() =>
        post
            ? blogPostComments.filter(c => c.postId === post.id && c.status === BlogPostCommentStatus.APPROVED).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            : [],
    [blogPostComments, post]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCommentStatus(null);
        if (!newComment.trim() || !post) return;
        const result = addBlogPostComment(post.id, newComment);
        
        if (result.success) {
            setNewComment('');
            setCommentStatus({ type: 'success', text: result.message });
        } else {
            setCommentStatus({ type: 'error', text: result.message });
        }
    };

    if (!post || !author) {
        return <Navigate to="/blog" replace />;
    }

    return (
        <div className="bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Post Content */}
                    <main className="lg:col-span-2 space-y-8">
                        {/* Top Ad Banner */}
                        <div className="w-full overflow-hidden rounded-lg aspect-video md:aspect-[3/1] bg-gray-800 border border-gray-700">
                           <DynamicAd locationId="blog-post-top-content" />
                        </div>

                        <article className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <img
                                src={post.imageUrl || 'https://source.unsplash.com/random/1200x600/?blog,technology'}
                                alt={post.title}
                                className="w-full h-auto max-h-96 object-cover"
                            />
                            <div className="p-6 md:p-8">
                                <div className="mb-6">
                                    <p className="text-primary-400 font-semibold">{post.category}</p>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2">{post.title}</h1>
                                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User size={14} />
                                            <span>{author.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>{formatDate(post.createdAt.toISOString())}</span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="prose prose-invert prose-lg max-w-none text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            </div>
                        </article>

                        {/* Ad after article */}
                        <div className="w-full overflow-hidden rounded-lg aspect-video md:aspect-[4/1] bg-gray-800">
                           <DynamicAd locationId="blog-post-footer" />
                        </div>
                        
                        {/* Comments Section */}
                        <section className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Bình luận ({comments.length})</h2>
                            
                            <div className="space-y-6">
                                {comments.map(comment => {
                                    const commentAuthor = users.find(u => u.id === comment.userId);
                                    if (!commentAuthor) return null;
                                    return (
                                        <div key={comment.id} className="flex items-start gap-4">
                                            <img src={commentAuthor.avatarUrl} alt={commentAuthor.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                                            <div className="flex-grow bg-gray-700/50 p-3 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-white">{commentAuthor.name}</p>
                                                    <p className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</p>
                                                </div>
                                                <p className="text-gray-300 mt-1 text-sm">{comment.content}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {comments.length === 0 && <p className="text-gray-500 text-center py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>}
                            </div>

                            {currentUser ? (
                                <form onSubmit={handleCommentSubmit} className="mt-8 pt-6 border-t border-gray-700">
                                    <div className="flex items-start gap-4">
                                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                                        <div className="flex-grow">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Viết bình luận của bạn..."
                                                required
                                                rows={3}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                            {commentStatus && (
                                                <p className={`text-sm mt-2 ${commentStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {commentStatus.text}
                                                </p>
                                            )}
                                            <button type="submit" className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
                                                <Send size={16} /> Gửi bình luận
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                                    <p className="text-gray-400"><Link to="/login" className="text-primary-400 font-semibold hover:underline">Đăng nhập</Link> để để lại bình luận.</p>
                                </div>
                            )}
                        </section>

                         {/* Suggested Posts (Moved to bottom) */}
                        {suggestedPosts.length > 0 && (
                            <section className="pt-8">
                                <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Bài viết đề xuất</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {suggestedPosts.map(suggestedPost => (
                                        <Link to={`/blog/post/${suggestedPost.slug}`} key={suggestedPost.id} className="group bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                            <img src={suggestedPost.imageUrl || 'https://source.unsplash.com/random/800x400/?blog,tech'} alt={suggestedPost.title} className="w-full h-32 object-cover"/>
                                            <div className="p-4">
                                                <p className="text-sm text-primary-400 font-semibold">{suggestedPost.category}</p>
                                                <h3 className="text-md font-bold text-white mt-1 group-hover:text-primary-300 transition-colors h-12 line-clamp-2">{suggestedPost.title}</h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:sticky top-24 space-y-6">
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-bold text-white mb-3">Về tác giả</h3>
                            <Link to={`/shop/${author.id}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50">
                                <img src={author.avatarUrl} alt={author.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-semibold text-white">{author.name}</p>
                                    <p className="text-xs text-gray-400">Xem trang cá nhân</p>
                                </div>
                            </Link>
                        </div>

                        {/* Sidebar Ad */}
                        <div className="w-full overflow-hidden rounded-lg aspect-square bg-gray-800 border border-gray-700">
                            <DynamicAd locationId="blog-post-sidebar" />
                        </div>
                        
                        {relatedPosts.length > 0 && (
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <h3 className="font-bold text-white mb-3">Bài viết liên quan</h3>
                                <ul className="space-y-3">
                                    {relatedPosts.map(related => (
                                        <li key={related.id}>
                                            <Link to={`/blog/post/${related.slug}`} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-700/50">
                                                <img src={related.imageUrl} alt={related.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-gray-700" />
                                                <div className="min-w-0">
                                                    <p className="text-sm text-white font-medium break-words leading-tight">{related.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{formatDate(related.createdAt.toISOString())}</p>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogPostDetailPage;