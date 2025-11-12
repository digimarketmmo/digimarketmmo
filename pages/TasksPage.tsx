import React, { useContext, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { Task, TaskStatus } from '../types.ts';
import { formatCurrency } from '../utils/formatter.ts';
import { PlusCircle, Search } from '../components/icons.tsx';

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const context = useContext(AppContext) as AppContextType;
    if (!context) return null;
    const { currentUser, acceptTask } = context;

    const handleAcceptTask = () => {
        const result = acceptTask(task.id);
        alert(result.message);
    };

    const isCreator = currentUser?.id === task.creatorId;
    const isAssignee = currentUser?.id === task.assigneeId;

    return (
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col justify-between border border-gray-700 hover:border-primary-500 transition-colors h-full">
            <div>
                 <Link to={`/tasks/${task.id}`} className="block">
                    <h3 className="text-lg font-bold text-white mb-2 hover:underline">{task.title}</h3>
                </Link>
                <p className="text-sm text-gray-400 mb-4 h-20 overflow-hidden">{task.description}</p>
            </div>
            <div className="flex justify-between items-center mt-auto">
                <span className="text-xl font-bold text-primary-400">{formatCurrency(task.reward)}</span>
                <button 
                    onClick={handleAcceptTask}
                    disabled={isCreator || isAssignee || !currentUser || task.status !== TaskStatus.ACTIVE}
                    className="px-4 py-2 text-sm bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isCreator ? 'Nhiệm vụ của bạn' : (isAssignee ? 'Đã nhận' : 'Nhận nhiệm vụ')}
                </button>
            </div>
        </div>
    );
};

const TasksPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    if (!context) return null;

    const { tasks } = context;

    const filteredTasks = useMemo(() => {
        const lowercasedSearch = searchTerm.trim().toLowerCase();
        return tasks.filter(t => 
            t.status === TaskStatus.ACTIVE &&
            (!lowercasedSearch || 
             t.title.toLowerCase().includes(lowercasedSearch) ||
             t.description.toLowerCase().includes(lowercasedSearch))
        );
    }, [tasks, searchTerm]);

    const searchFromUrl = searchParams.get('search');

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {searchFromUrl ? (
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Kết quả tìm kiếm cho: "{searchFromUrl}"</h1>
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <Link to={`/products?search=${encodeURIComponent(searchFromUrl)}`} className="border-transparent text-gray-400 hover:text-white hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Sản phẩm
                            </Link>
                            <span className="cursor-pointer border-primary-500 text-primary-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Nhiệm vụ / Dịch vụ ({filteredTasks.length})
                            </span>
                        </nav>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-white">Nhiệm vụ & Khảo sát</h1>
                        <Link to="/tasks/create" className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                            <PlusCircle size={18} /> Tạo nhiệm vụ mới
                        </Link>
                    </div>
                    <p className="text-gray-300 mb-8 max-w-2xl">
                        Hoàn thành các nhiệm vụ nhỏ từ cộng đồng để kiếm thêm thu nhập. <br/>
                        Hoặc tạo nhiệm vụ để thuê người khác làm giúp bạn.
                    </p>
                </>
            )}

            <div className="mb-8">
                <div className="relative max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm nhiệm vụ..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-primary-500"
                    />
                </div>
            </div>

            {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-800 rounded-lg shadow-lg">
                    <p className="text-gray-300 max-w-lg mx-auto">
                        Không tìm thấy nhiệm vụ nào khớp với tìm kiếm của bạn.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TasksPage;