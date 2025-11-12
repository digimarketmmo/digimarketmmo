import React, { useContext, useState, useMemo } from 'react';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { formatCurrency, formatDate } from '../../utils/formatter.ts';
import { Pagination } from '../../components/Pagination.tsx';

const AdminTransactionsPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    if (!context) return null;

    const { transactions, users } = context;

    const { paginatedTransactions, totalPages } = useMemo(() => {
        const sorted = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
        const total = sorted.length;
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedTransactions = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        return { paginatedTransactions, totalPages };
    }, [transactions, currentPage]);
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Lịch sử Giao dịch</h1>
             <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700 text-sm">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ngày</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Người dùng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Mô tả</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {paginatedTransactions.map(tx => {
                                const user = users.find(u => u.id === tx.userId);
                                return (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(tx.date.toISOString())}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user?.name || tx.userId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{tx.type}</td>
                                        <td className="px-6 py-4">{tx.description}</td>
                                        <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(tx.amount)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                     {paginatedTransactions.map(tx => {
                        const user = users.find(u => u.id === tx.userId);
                        return (
                            <div key={tx.id} className="bg-gray-700/50 p-3 rounded-lg border border-gray-700 text-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-white">{user?.name || 'N/A'}</p>
                                        <p className="text-xs text-gray-400">{formatDate(tx.date.toISOString())}</p>
                                    </div>
                                    <p className={`font-semibold whitespace-nowrap ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(tx.amount)}</p>
                                </div>
                                <p className="text-xs text-gray-300 mt-2">{tx.description}</p>
                                <p className="text-xs text-gray-500 mt-1">Loại: {tx.type}</p>
                            </div>
                        )
                    })}
                </div>

                 {paginatedTransactions.length === 0 && <p className="text-center py-12 text-gray-400">Không có giao dịch nào.</p>}
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminTransactionsPage;