import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { formatCurrency, formatDate } from '../utils/formatter.ts';
import { Star, User, Clock, CheckCircle, ListOrdered, Eye } from '../components/icons.tsx';

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string | React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-gray-400 mt-1">{icon}</div>
        <div className="min-w-0"> {/* Allow content to shrink and wrap */}
            <p className="text-sm text-gray-400">{label}</p>
            <div className="text-white font-semibold break-words">{value}</div>
        </div>
    </div>
);

const TaskDetailPage: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const context = useContext(AppContext) as AppContextType;

    if (!context) return <div>Đang tải...</div>;
    const { tasks, users } = context;

    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return (
             <div className="container mx-auto text-center py-20">
                <h2 className="text-2xl font-bold text-white">404 - Không tìm thấy nhiệm vụ.</h2>
                <Link to="/tasks" className="text-primary-400 hover:text-primary-300 mt-4 inline-block">
                    Quay lại trang Nhiệm vụ
                </Link>
            </div>
        );
    }
    
    const creator = users.find(u => u.id === task.creatorId);
    const reviewer = task.review ? users.find(u => u.id === task.review!.reviewerId) : null;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg overflow-hidden">
                        <h1 className="text-3xl font-bold text-white break-words">{task.title}</h1>
                        <p className="text-gray-300 mt-4 break-words">{task.description}</p>
                    </div>
                     <div className="bg-gray-800 p-6 rounded-lg overflow-hidden">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CheckCircle size={20} /> Yêu cầu</h2>
                        <div className="text-gray-300 whitespace-pre-wrap break-words">{task.requirements}</div>
                    </div>
                     <div className="bg-gray-800 p-6 rounded-lg overflow-hidden">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ListOrdered size={20} /> Hướng dẫn</h2>
                        <div className="text-gray-300 whitespace-pre-wrap break-words">{task.instructions}</div>
                        {task.instructionImages && task.instructionImages.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-200 mb-2">Hình ảnh hướng dẫn:</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {task.instructionImages.map((img, index) => (
                                        <a href={img} target="_blank" rel="noopener noreferrer" key={index} className="group relative">
                                            <img src={img} alt={`Instruction ${index + 1}`} className="w-full h-28 object-cover rounded-md border border-gray-700 group-hover:opacity-80 transition-opacity" />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye size={24} className="text-white" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {task.review && reviewer && (
                        <div className="bg-gray-800 p-6 rounded-lg overflow-hidden">
                            <h2 className="text-xl font-bold text-white mb-4">Đánh giá từ người làm</h2>
                             <div className="flex items-start gap-4">
                                <img src={reviewer.avatarUrl} alt={reviewer.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-white">{reviewer.name}</p>
                                        <p className="text-xs text-gray-500">{formatDate(task.review.date.toISOString())}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-400 my-1">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < task.review!.rating ? 'currentColor' : 'none'} />)}
                                    </div>
                                    <p className="text-gray-300 text-sm italic break-words">"{task.review.comment}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                         <p className="text-center text-3xl font-bold text-primary-400 mb-4">{formatCurrency(task.reward)}</p>
                         <button className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700">Nhận nhiệm vụ</button>
                    </div>
                     <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-2">Thông tin chi tiết</h3>
                        {creator && (
                            <DetailItem icon={<User size={16} />} label="Người tạo" value={
                                <Link to={`/shop/${creator.id}`} className="hover:underline">{creator.brandName || creator.name}</Link>
                            } />
                        )}
                        <DetailItem icon={<Clock size={16} />} label="Thời gian hoàn thành" value={`${task.timeLimit} phút`} />
                        <DetailItem icon={<User size={16} />} label="Số người có thể nhận" value={`${task.quantity} người`} />
                     </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPage;