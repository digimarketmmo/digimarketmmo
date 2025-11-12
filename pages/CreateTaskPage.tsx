import React, { useState, useContext, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { formatCurrency } from '../utils/formatter.ts';
import { Upload, X } from '../components/icons.tsx';
import { Task } from '../types.ts';

const FormSection: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700/50">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-gray-400 mb-6">{subtitle}</p>
        <div className="space-y-4">{children}</div>
    </div>
);

const Label: React.FC<{ htmlFor?: string; children: React.ReactNode; required?: boolean }> = ({ htmlFor, children, required }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1">
        {children} {required && <span className="text-red-400">*</span>}
    </label>
);

const CreateTaskPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const navigate = useNavigate();
    
    const instructionFileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [taskType, setTaskType] = useState('Khảo sát');
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageName, setImageName] = useState('');
    const [reward, setReward] = useState<number>(5000);
    const [quantity, setQuantity] = useState<number>(10);
    const [timeLimit, setTimeLimit] = useState<number>(5);
    const [expiryDate, setExpiryDate] = useState('');
    const [requirements, setRequirements] = useState('');
    const [instructions, setInstructions] = useState('');
    const [instructionImages, setInstructionImages] = useState<string[]>([]);
    
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!context || !context.currentUser) {
        navigate('/login');
        return null;
    }
    const { currentUser, categories, createTask } = context;

    const totalCost = useMemo(() => reward * quantity, [reward, quantity]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setStatus({ type: 'error', message: 'Kích thước ảnh không được vượt quá 5MB.' });
                return;
            }
            setImageName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleInstructionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
    
        if (instructionImages.length + files.length > 5) {
            setStatus({ type: 'error', message: 'Bạn chỉ có thể tải lên tối đa 5 ảnh hướng dẫn.' });
            return;
        }
    
        Array.from(files).forEach((file: File) => {
            if (file.size > 5 * 1024 * 1024) { 
                setStatus({ type: 'error', message: `Ảnh "${file.name}" quá lớn (tối đa 5MB).` });
                return;
            }
    
            const reader = new FileReader();
            reader.onloadend = () => {
                setInstructionImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const handleRemoveInstructionImage = (index: number) => {
        setInstructionImages(prev => prev.filter((_, i) => i !== index));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        // Basic validation
        if (!title || !description || !taskType || reward <= 0 || quantity <= 0 || timeLimit <= 0 || !requirements || !instructions) {
            setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
            setIsLoading(false);
            return;
        }

        const taskData: Omit<Task, 'id' | 'creatorId' | 'status' | 'createdAt' | 'assigneeId' | 'completionProof' | 'review'> = {
            title,
            description,
            taskType,
            categoryId: categoryId || undefined,
            imageUrl: imageUrl || undefined,
            reward,
            quantity,
            timeLimit,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            requirements,
            instructions,
            instructionImages: instructionImages.length > 0 ? instructionImages : undefined,
        };

        const result = createTask(taskData);
        if (result.success) {
            setStatus({ type: 'success', message: result.message });
            setTimeout(() => navigate('/tasks'), 2000);
        } else {
            setStatus({ type: 'error', message: result.message });
            setIsLoading(false);
        }
    };

    const taskTypeOptions = ["Khảo sát", "Đánh giá app", "Tải app", "Social Media", "Dịch thuật", "Nhập liệu", "Khác"];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold text-center text-white mb-8">Tạo nhiệm vụ mới</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormSection title="Thông tin nhiệm vụ" subtitle="Mô tả chi tiết nhiệm vụ bạn muốn đăng">
                    <div>
                        <Label htmlFor="title" required>Tiêu đề nhiệm vụ</Label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="VD: Đánh giá 5 sao app trên Google Play" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                    <div>
                        <Label htmlFor="description" required>Mô tả nhiệm vụ</Label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder="Mô tả chi tiết về nhiệm vụ, những gì người làm cần biết..." className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="taskType" required>Loại nhiệm vụ</Label>
                            <select id="taskType" value={taskType} onChange={e => setTaskType(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white h-[42px]">
                                {taskTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="category">Danh mục (tùy chọn)</Label>
                             <select id="category" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white h-[42px]">
                                <option value="">Chọn danh mục</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="image">Ảnh minh họa (tùy chọn)</Label>
                        <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary-500">
                            <span className="flex items-center space-x-2">
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="font-medium text-gray-400">
                                    {imageName ? imageName : 'Click để chọn ảnh (max 5MB)'}
                                </span>
                            </span>
                            <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                </FormSection>

                <FormSection title="Phần thưởng & Số lượng" subtitle="Xác định phần thưởng cho mỗi người hoàn thành">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="reward" required>Phần thưởng (VND)</Label>
                            <input id="reward" type="number" value={reward} onChange={e => setReward(Math.max(0, parseInt(e.target.value)))} required min="1000" step="1000" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div>
                            <Label htmlFor="quantity" required>Số lượng người</Label>
                            <input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value)))} required min="1" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div>
                           <Label htmlFor="timeLimit" required>Thời gian (phút)</Label>
                            <input id="timeLimit" type="number" value={timeLimit} onChange={e => setTimeLimit(Math.max(1, parseInt(e.target.value)))} required min="1" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                    </div>
                    <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg text-center">
                        <p className="text-sm text-blue-200">Tổng chi phí:</p>
                        <p className="text-3xl font-bold text-white my-1">{formatCurrency(totalCost)}</p>
                        <p className="text-xs text-gray-400">Số tiền này sẽ bị trừ ngay từ ví của bạn và giữ cho đến khi nhiệm vụ hoàn thành</p>
                        <p className="text-xs text-gray-200 mt-1">Số dư hiện tại: {formatCurrency(currentUser.balance)}</p>
                    </div>
                     <div>
                        <Label htmlFor="expiryDate">Ngày hết hạn (tùy chọn)</Label>
                        <input id="expiryDate" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                </FormSection>

                <FormSection title="Yêu cầu & Hướng dẫn" subtitle="Chi tiết cách thực hiện nhiệm vụ">
                    <div>
                        <Label htmlFor="requirements" required>Yêu cầu</Label>
                        <textarea id="requirements" value={requirements} onChange={e => setRequirements(e.target.value)} required rows={3} placeholder="VD: Tài khoản Google từ 6 tháng trở lên, chưa từng đánh giá app này..." className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <Label htmlFor="instructions" required>Hướng dẫn thực hiện</Label>
                        <textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} required rows={5} placeholder="Bước 1: Tải app từ link...&#10;Bước 2: Đăng ký tài khoản...&#10;Bước 3: Chụp màn hình..." className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <Label>Ảnh hướng dẫn (tùy chọn, tối đa 5)</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                            {instructionImages.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img src={image} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded-md border border-gray-700" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveInstructionImage(index)}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {instructionImages.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => instructionFileInputRef.current?.click()}
                                    className="w-full h-20 flex items-center justify-center bg-gray-700 border-2 border-dashed border-gray-600 rounded-md hover:border-primary-500 transition-colors"
                                    aria-label="Add image"
                                >
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </button>
                            )}
                        </div>
                        <input
                            ref={instructionFileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleInstructionImageUpload}
                        />
                    </div>
                </FormSection>

                {status && (
                    <div className={`p-4 rounded-md text-sm text-center ${status.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                        {status.message}
                    </div>
                )}

                <div className="flex justify-end">
                     <button type="submit" disabled={isLoading} className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? 'Đang xử lý...' : 'Tạo nhiệm vụ'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTaskPage;