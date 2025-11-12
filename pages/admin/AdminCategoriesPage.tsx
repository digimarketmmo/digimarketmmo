import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { Category } from '../../types.ts';
import { Icon, availableIcons, PlusCircle, Edit, Trash2, X } from '../../components/icons.tsx';

const AdminCategoriesPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<Omit<Category, 'id'>>({ name: '', slug: '', description: '', icon: 'Star', color: 'text-gray-400' });

    if (!context) return null;

    const { categories, addCategory, updateCategory, deleteCategory } = context;

    const handleOpenModal = (category: Category | null = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData(category);
        } else {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '', icon: 'Star', color: 'text-gray-400' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'name' && !editingCategory) {
            const newSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            updateCategory(editingCategory.id, formData);
        } else {
            addCategory(formData);
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
            deleteCategory(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Quản lý Danh mục</h1>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">
                    <PlusCircle size={18} /> Thêm danh mục
                </button>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Icon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Slug</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td className="px-6 py-4"><Icon name={cat.icon} className={`w-5 h-5 ${cat.color}`} /></td>
                                    <td className="px-6 py-4 text-white font-medium">{cat.name}</td>
                                    <td className="px-6 py-4 text-gray-400">{cat.slug}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            <button onClick={() => handleOpenModal(cat)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile Card View */}
                 <div className="md:hidden p-4 space-y-3">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Icon name={cat.icon} className={`w-6 h-6 ${cat.color} flex-shrink-0`} />
                                <div>
                                    <p className="font-semibold text-white">{cat.name}</p>
                                    <p className="text-sm text-gray-400">{cat.slug}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleOpenModal(cat)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">{editingCategory ? 'Chỉnh sửa' : 'Thêm'} Danh mục</h2>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tên danh mục</label>
                                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                                <input type="text" name="slug" value={formData.slug} onChange={handleFormChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả ngắn</label>
                                <input type="text" name="description" value={formData.description} onChange={handleFormChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                                    <select name="icon" value={formData.icon} onChange={handleFormChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white h-[42px]">
                                        {availableIcons.map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Màu sắc (Tailwind class)</label>
                                    <input type="text" name="color" value={formData.color} onChange={handleFormChange} placeholder="e.g., text-green-400" required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                                </div>
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

export default AdminCategoriesPage;