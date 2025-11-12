import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { ContentPage } from '../../types.ts';
import { PlusCircle, Edit, Trash2, X } from '../../components/icons.tsx';

const AdminContentPagesPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
    const [formData, setFormData] = useState<Omit<ContentPage, 'id' | 'lastUpdated'>>({ title: '', slug: '', content: '' });

    if (!context) return null;

    const { contentPages, addContentPage, updateContentPage, deleteContentPage } = context;

    const handleOpenModal = (page: ContentPage | null = null) => {
        if (page) {
            setEditingPage(page);
            setFormData({ title: page.title, slug: page.slug, content: page.content });
        } else {
            setEditingPage(null);
            setFormData({ title: '', slug: '', content: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPage(null);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'title' && !editingPage) {
            const newSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPage) {
            updateContentPage(editingPage.id, formData);
        } else {
            addContentPage(formData);
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa trang này không?')) {
            deleteContentPage(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Quản lý Trang nội dung</h1>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">
                    <PlusCircle size={18} /> Thêm trang
                </button>
            </div>
             <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tiêu đề</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Slug</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {contentPages.map(page => (
                                <tr key={page.id}>
                                    <td className="px-6 py-4 text-white font-medium">{page.title}</td>
                                    <td className="px-6 py-4 text-gray-400">/content/{page.slug}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            <button onClick={() => handleOpenModal(page)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(page.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                    {contentPages.map(page => (
                        <div key={page.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-white">{page.title}</p>
                                <p className="text-sm text-gray-400">/content/{page.slug}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleOpenModal(page)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(page.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">{editingPage ? 'Chỉnh sửa' : 'Thêm'} Trang</h2>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tiêu đề</label>
                                <input type="text" name="title" value={formData.title} onChange={handleFormChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                                <input type="text" name="slug" value={formData.slug} onChange={handleFormChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nội dung (HTML)</label>
                                <textarea name="content" value={formData.content} onChange={handleFormChange} required rows={15} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white font-mono" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 p-4 bg-gray-800/50 border-t border-gray-700">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                            <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Lưu</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminContentPagesPage;