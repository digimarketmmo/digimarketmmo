import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { BlogPost, BlogPostStatus } from '../types.ts';
import { Upload, X, ArrowLeft } from '../components/icons.tsx';

const CreateEditBlogPostPage: React.FC = () => {
    const { postId } = useParams<{ postId?: string }>();
    const navigate = useNavigate();
    const context = useContext(AppContext) as AppContextType;

    const [post, setPost] = useState<Partial<Omit<BlogPost, 'id'>>>({
        title: '',
        content: '',
        category: 'Hướng dẫn',
        imageUrl: '',
        status: BlogPostStatus.DRAFT,
    });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [imageName, setImageName] = useState('');

    const isEditing = Boolean(postId);

    useEffect(() => {
        if (isEditing && context) {
            const existingPost = context.blogPosts.find(p => p.id === postId);
            if (existingPost) {
                setPost(existingPost);
            } else {
                navigate('/profile#blog'); // Post not found
            }
        }
    }, [postId, isEditing, context]);

    if (!context) return null;

    const { addBlogPost, updateBlogPost, blogPosts, categories } = context;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPost(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setStatusMessage({ type: 'error', text: 'Kích thước ảnh không được vượt quá 5MB.' });
                return;
            }
            setImageName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPost(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (publish: boolean) => {
        setStatusMessage({ type: '', text: '' });
        if (!post.title || !post.content || !post.category) {
            setStatusMessage({ type: 'error', text: 'Vui lòng điền đầy đủ Tiêu đề, Nội dung và Danh mục.' });
            return;
        }

        const newStatus = publish ? BlogPostStatus.PUBLISHED : BlogPostStatus.DRAFT;
        const finalPost = { ...post, status: newStatus };

        try {
            if (isEditing && postId) {
                updateBlogPost(postId, finalPost);
            } else {
                addBlogPost(finalPost as any);
            }
            setStatusMessage({ type: 'success', text: `Bài viết đã được ${publish ? 'xuất bản' : 'lưu nháp'} thành công!` });
            setTimeout(() => navigate('/profile#blog'), 1500);
        } catch (e) {
            setStatusMessage({ type: 'error', text: 'Đã có lỗi xảy ra.' });
        }
    };

    const allCategoryOptions = useMemo(() => {
        const blogSpecificCategories = ['Hướng dẫn', 'Mẹo vặt và Thủ thuật', 'Thông báo'];
        const mainCategoryNames = categories.map(c => c.name);
        const existingBlogCategories = blogPosts.map(p => p.category);
        const combined = [...new Set([...blogSpecificCategories, ...mainCategoryNames, ...existingBlogCategories])];
        return combined.sort((a, b) => a.localeCompare(b));
    }, [categories, blogPosts]);


    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <div className="mb-6">
                <Link to="/profile#blog" className="inline-flex items-center gap-2 text-primary-400 hover:underline">
                    <ArrowLeft size={16} /> Quay lại quản lý bài viết
                </Link>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h1 className="text-2xl font-bold text-white mb-6">{isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tiêu đề *</label>
                        <input name="title" value={post.title} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nội dung (hỗ trợ HTML) *</label>
                        <textarea name="content" value={post.content} onChange={handleChange} required rows={15} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white font-mono text-sm" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Danh mục *</label>
                            <select
                                name="category"
                                value={post.category}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white h-[42px]"
                            >
                                {allCategoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Ảnh bìa (tùy chọn)</label>
                            {post.imageUrl ? (
                                <div className="relative">
                                    <img src={post.imageUrl} alt="Xem trước" className="w-full h-32 object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => setPost(prev => ({...prev, imageUrl: ''}))}
                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-md"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary-500">
                                    <span className="flex items-center space-x-2">
                                        <Upload className="w-6 h-6 text-gray-400" />
                                        <span className="font-medium text-gray-400">
                                            {imageName ? imageName : 'Click để chọn ảnh (max 5MB)'}
                                        </span>
                                    </span>
                                    <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>
                    {statusMessage.text && (
                        <div className={`p-3 rounded-md text-sm text-center ${statusMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {statusMessage.text}
                        </div>
                    )}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                        <button type="button" onClick={() => handleSubmit(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold">Lưu nháp</button>
                        <button type="button" onClick={() => handleSubmit(true)} className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">
                            {isEditing ? 'Cập nhật & Xuất bản' : 'Xuất bản'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEditBlogPostPage;
