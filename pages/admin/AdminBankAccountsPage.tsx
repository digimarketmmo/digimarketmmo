import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { PlatformBankAccount } from '../../types.ts';
import { PlusCircle, Edit, Trash2, X, QrCode } from '../../components/icons.tsx';

const AdminBankAccountsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<PlatformBankAccount | null>(null);
    const [formData, setFormData] = useState<Omit<PlatformBankAccount, 'id'>>({ bankName: '', accountNumber: '', accountHolder: '', branch: '', qrCodeUrl: '' });

    if (!context) return null;

    const { platformBankAccounts, addPlatformBankAccount, updatePlatformBankAccount, deletePlatformBankAccount } = context;

    const handleOpenModal = (account: PlatformBankAccount | null = null) => {
        if (account) {
            setEditingAccount(account);
            setFormData(account);
        } else {
            setEditingAccount(null);
            setFormData({ bankName: '', accountNumber: '', accountHolder: '', branch: '', qrCodeUrl: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAccount(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAccount) {
            updatePlatformBankAccount(editingAccount.id, formData);
        } else {
            addPlatformBankAccount(formData);
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này không?')) {
            deletePlatformBankAccount(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Tài khoản Ngân hàng</h1>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">
                    <PlusCircle size={18} /> Thêm tài khoản
                </button>
            </div>
             <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ngân hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Chủ tài khoản</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">STK</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {platformBankAccounts.map(acc => (
                                <tr key={acc.id}>
                                    <td className="px-6 py-4 text-white font-medium">{acc.bankName}</td>
                                    <td className="px-6 py-4 text-gray-300">{acc.accountHolder}</td>
                                    <td className="px-6 py-4 text-gray-300">{acc.accountNumber}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            {acc.qrCodeUrl && <QrCode size={18} className="text-green-400" />}
                                            <button onClick={() => handleOpenModal(acc)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(acc.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                    {platformBankAccounts.map(acc => (
                        <div key={acc.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-white">{acc.bankName}</p>
                                    <p className="text-sm text-gray-300">{acc.accountHolder}</p>
                                    <p className="text-sm text-gray-400">{acc.accountNumber}</p>
                                </div>
                                 <div className="flex flex-col items-center gap-4">
                                    <button onClick={() => handleOpenModal(acc)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(acc.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

             {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">{editingAccount ? 'Chỉnh sửa' : 'Thêm'} Tài khoản</h2>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input name="bankName" value={formData.bankName} onChange={handleFormChange} placeholder="Tên ngân hàng" required className="w-full bg-gray-700 rounded-md py-2 px-3 text-white" />
                            <input name="accountHolder" value={formData.accountHolder} onChange={handleFormChange} placeholder="Tên chủ tài khoản" required className="w-full bg-gray-700 rounded-md py-2 px-3 text-white" />
                            <input name="accountNumber" value={formData.accountNumber} onChange={handleFormChange} placeholder="Số tài khoản" required className="w-full bg-gray-700 rounded-md py-2 px-3 text-white" />
                            <input name="branch" value={formData.branch || ''} onChange={handleFormChange} placeholder="Chi nhánh (tùy chọn)" className="w-full bg-gray-700 rounded-md py-2 px-3 text-white" />
                            <input name="qrCodeUrl" value={formData.qrCodeUrl || ''} onChange={handleFormChange} placeholder="URL mã QR VietQR (tùy chọn)" className="w-full bg-gray-700 rounded-md py-2 px-3 text-white" />
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

export default AdminBankAccountsPage;