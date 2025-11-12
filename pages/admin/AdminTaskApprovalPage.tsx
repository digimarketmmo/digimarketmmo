import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
import { TaskStatus } from '../../types.ts';
import { formatCurrency } from '../../utils/formatter.ts';
import { Check, XCircle, ExternalLink } from '../../components/icons.tsx';

const AdminTaskApprovalPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;

    if (!context) return null;

    const { tasks, users, approveTask, rejectTask } = context;

    const pendingTasks = useMemo(() => {
        return tasks.filter(t => t.status === TaskStatus.PENDING_APPROVAL);
    }, [tasks]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Duyệt nhiệm vụ</h1>
            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                         <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nhiệm vụ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Người tạo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Thưởng</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {pendingTasks.map(task => {
                                const creator = users.find(u => u.id === task.creatorId);
                                return (
                                    <tr key={task.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">{task.title}</div>
                                            <div className="text-sm text-gray-400">{task.taskType}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{creator?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-400 font-semibold">{formatCurrency(task.reward)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end items-center gap-4">
                                                <Link to={`/tasks/${task.id}`} target="_blank" className="text-blue-400 hover:text-blue-300" title="Xem chi tiết"><ExternalLink size={18} /></Link>
                                                <button onClick={() => approveTask(task.id)} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40" title="Duyệt"><Check size={18} /></button>
                                                <button onClick={() => rejectTask(task.id)} className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/40" title="Từ chối"><XCircle size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                    {pendingTasks.map(task => {
                        const creator = users.find(u => u.id === task.creatorId);
                        return (
                            <div key={task.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                                <p className="font-semibold text-white">{task.title}</p>
                                <p className="text-sm text-gray-400">Người tạo: {creator?.name || 'N/A'}</p>
                                <p className="text-sm text-primary-400">Thưởng: {formatCurrency(task.reward)}</p>
                                
                                <div className="flex justify-end items-center gap-4 mt-3 pt-3 border-t border-gray-600">
                                    <Link to={`/tasks/${task.id}`} target="_blank" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm" title="Xem chi tiết">
                                        <ExternalLink size={16} /> Xem
                                    </Link>
                                    <button onClick={() => approveTask(task.id)} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40" title="Duyệt"><Check size={18} /></button>
                                    <button onClick={() => rejectTask(task.id)} className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/40" title="Từ chối"><XCircle size={18} /></button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {pendingTasks.length === 0 && <p className="text-center py-12 text-gray-400">Không có nhiệm vụ nào chờ duyệt.</p>}
            </div>
        </div>
    );
};

export default AdminTaskApprovalPage;