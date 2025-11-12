import React, { useState, useRef, useEffect, useContext } from 'react';
import { X, Send, ImagePlus, Shield } from './icons.tsx';
import { SupportMessage, SupportSender, SupportMessageType } from '../types.ts';
import { formatTimeAgo } from '../utils/formatter.ts';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import type { Part } from "@google/genai";
import { AppContext, AppContextType } from '../context/AppContext.tsx';


interface LiveSupportChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialMessages: SupportMessage[] = [
    {
        id: 'welcome-1',
        sender: SupportSender.AGENT,
        type: SupportMessageType.TEXT,
        content: 'Chào bạn! DigiMarket có thể giúp gì cho bạn hôm nay?',
        timestamp: new Date(),
    }
];

// Helper to extract base64 data and mime type from data URL
const extractBase64 = (dataUrl: string): { mimeType: string | undefined; base64Data: string | undefined } => {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return { mimeType: undefined, base64Data: undefined };
    const mimeType = parts[0].match(/:(.*?);/)?.[1];
    const base64Data = parts[1];
    return { mimeType, base64Data };
};


export const LiveSupportChat: React.FC<LiveSupportChatProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    const [messages, setMessages] = useState<SupportMessage[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAgentTyping, setIsAgentTyping] = useState(false);
    const [handoffActive, setHandoffActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const hasShownOffHoursMessage = useRef(false);

    if (!context) return null;
    const { currentUser, sendAdminSupportNotification } = context;

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const currentHour = now.getHours();
            const isOffHours = currentHour < 8 || currentHour >= 23;

            if (isOffHours && !hasShownOffHoursMessage.current) {
                const offHoursMessage: SupportMessage = {
                    id: `agent-offhours-${Date.now()}`,
                    sender: SupportSender.AGENT,
                    type: SupportMessageType.TEXT,
                    content: 'Cảm ơn bạn đã liên hệ. Hiện tại đã ngoài giờ hành chính (8h - 23h). Admin sẽ phản hồi bạn vào đầu giờ làm việc tiếp theo.',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, offHoursMessage]);
                hasShownOffHoursMessage.current = true;
            } else if (!isOffHours) {
                hasShownOffHoursMessage.current = false;
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (handoffActive) {
            timeoutRef.current = window.setTimeout(() => {
                const timeoutMessage: SupportMessage = {
                    id: `agent-timeout-${Date.now()}`,
                    sender: SupportSender.AGENT,
                    type: SupportMessageType.TEXT,
                    content: 'Có vẻ như các quản trị viên đang bận. Vui lòng liên hệ hỗ trợ trực tiếp qua Telegram tại @digimarketsupport để được hỗ trợ nhanh nhất.',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, timeoutMessage]);
                setHandoffActive(false); // Kết thúc chế độ chờ, cho phép bot phản hồi lại
            }, 120000); // 2 phút
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [handoffActive]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAgentTyping]);

    const handleSendMessage = async () => {
        if (!inputText.trim() && !imagePreview) return;

        // 1. Chuẩn bị tin nhắn của người dùng để hiển thị
        const newMessages: SupportMessage[] = [];
        if (imagePreview) {
            newMessages.push({
                id: `user-img-${Date.now()}`,
                sender: SupportSender.USER,
                type: SupportMessageType.IMAGE,
                content: imagePreview,
                timestamp: new Date(),
            });
        }
        if (inputText.trim()) {
            newMessages.push({
                id: `user-text-${Date.now()}`,
                sender: SupportSender.USER,
                type: SupportMessageType.TEXT,
                content: inputText.trim(),
                timestamp: new Date(),
            });
        }
        
        // Lưu lại nội dung hiện tại trước khi xóa
        const currentInputText = inputText.trim();
        const currentImagePreview = imagePreview;

        // 2. Xóa input và cập nhật UI
        setInputText('');
        setImagePreview(null);
        if(newMessages.length > 0) {
            setMessages(prev => [...prev, ...newMessages]);
        } else {
            return; // Không có gì để gửi
        }

        // 3. Nếu đang trong quá trình chuyển giao, không gọi bot
        if (handoffActive) {
            return;
        }

        // 4. Chuẩn bị dữ liệu cho Gemini API
        const geminiParts: Part[] = [];
        if (currentImagePreview) {
            const { mimeType, base64Data } = extractBase64(currentImagePreview);
            if (mimeType && base64Data) {
                geminiParts.push({ inlineData: { mimeType, data: base64Data } });
            }
        }
        if (currentInputText) {
            geminiParts.push({ text: currentInputText });
        }

        // 5. Gọi Gemini API
        setIsAgentTyping(true);
        
        const chuyenHuongHoTroNapTien: FunctionDeclaration = {
          name: 'chuyenHuongHoTroNapTien',
          description: 'Sử dụng công cụ này khi người dùng báo cáo sự cố nạp tiền, tải tiền, giao dịch nạp tiền không thành công, hoặc các vấn đề tương tự.',
          parameters: { type: Type.OBJECT, properties: {} },
        };

        // Khởi tạo chat nếu chưa có
        if (!chatRef.current) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: 'Bạn là một trợ lý ảo tên Admin của DigiMarket. Hãy trả lời các câu hỏi của người dùng một cách ngắn gọn và chuyên nghiệp bằng tiếng Việt. Nếu vấn đề của người dùng liên quan đến "tải tiền bị lỗi", "nạp tiền bị lỗi", "lỗi nạp tiền", hoặc các vấn đề tương tự về việc nạp/tải tiền không thành công, hãy sử dụng công cụ \'chuyenHuongHoTroNapTien\'. Đối với bất kỳ vấn đề nào khác mà bạn không thể quyết định được, hãy hướng dẫn họ liên hệ hỗ trợ qua Telegram tại @digimarketsupport.',
                        tools: [{ functionDeclarations: [chuyenHuongHoTroNapTien] }],
                    },
                    history: [
                        { role: 'model', parts: [{ text: initialMessages[0].content }] }
                    ]
                });
            } catch (e) {
                console.error("Failed to initialize Gemini Chat", e);
                const errorMessage: SupportMessage = {
                    id: `agent-error-${Date.now()}`,
                    sender: SupportSender.AGENT,
                    type: SupportMessageType.TEXT,
                    content: 'Xin lỗi, chatbot đang gặp sự cố. Vui lòng thử lại sau.',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
                setIsAgentTyping(false);
                return;
            }
        }
        
        const agentMessageId = `agent-${Date.now()}`;
        const newAgentMessage: SupportMessage = {
            id: agentMessageId,
            sender: SupportSender.AGENT,
            type: SupportMessageType.TEXT,
            content: '',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newAgentMessage]);
        
        try {
            const stream = await chatRef.current.sendMessageStream({ message: geminiParts });

            let fullResponse = '';
            let functionCalled = false;
            for await (const chunk of stream) {
                if (chunk.functionCalls && chunk.functionCalls.some(fc => fc.name === 'chuyenHuongHoTroNapTien')) {
                    functionCalled = true;
                    break;
                }

                const chunkText = chunk.text;
                fullResponse += chunkText;
                setMessages(prev => prev.map(msg => 
                    msg.id === agentMessageId ? { ...msg, content: fullResponse } : msg
                ));
            }
            
            if (functionCalled) {
                setMessages(prev => prev.filter(msg => msg.id !== agentMessageId));
                
                const transferMessage: SupportMessage = {
                    id: `agent-transfer-${Date.now()}`,
                    sender: SupportSender.AGENT,
                    type: SupportMessageType.TEXT,
                    content: 'Đã hiểu. Chúng tôi đang kết nối bạn với quản trị viên để xử lý vấn đề nạp tiền. Vui lòng chờ trong giây lát.',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, transferMessage]);

                if (currentUser) {
                    sendAdminSupportNotification(`Người dùng ${currentUser.name} cần hỗ trợ nạp tiền qua Live Chat.`);
                }
                setHandoffActive(true);
            }

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessageContent = error instanceof Error ? error.message : "Có lỗi không xác định";
            setMessages(prev => prev.map(msg => 
                msg.id === agentMessageId ? { ...msg, content: `Xin lỗi, đã có lỗi xảy ra. ${errorMessageContent}` } : msg
            ));
        } finally {
            setIsAgentTyping(false);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Kích thước ảnh không được vượt quá 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePreview = () => {
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div 
            className={`fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-sm h-[70vh] max-h-[600px] bg-gray-800 rounded-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            role="dialog"
            aria-modal="true"
            aria-hidden={!isOpen}
        >
            {/* Header */}
            <div className="flex-shrink-0 p-3 bg-gray-900/50 rounded-t-lg flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Shield size={20} className="text-primary-400" />
                    <h2 className="font-bold text-white">Admin</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === SupportSender.USER ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === SupportSender.AGENT && <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0"><Shield size={14} className="text-white"/></div>}
                        <div className={`max-w-xs p-2 rounded-lg ${msg.sender === SupportSender.USER ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                            {msg.type === SupportMessageType.TEXT ? (
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            ) : (
                                <img src={msg.content} alt="User upload" className="max-w-full h-auto rounded-md" />
                            )}
                            <p className={`text-xs mt-1 ${msg.sender === SupportSender.USER ? 'text-primary-200' : 'text-gray-400'} text-right`}>{formatTimeAgo(msg.timestamp)}</p>
                        </div>
                    </div>
                ))}
                {isAgentTyping && (
                     <div className="flex items-end gap-2 justify-start">
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0"><Shield size={14} className="text-white"/></div>
                        <div className="max-w-xs p-2 rounded-lg bg-gray-700 text-gray-200 rounded-bl-none">
                           <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="flex-shrink-0 p-3 border-t border-gray-700 bg-gray-800/80 rounded-b-lg">
                {imagePreview && (
                    <div className="relative w-20 h-20 mb-2 p-1 border border-gray-600 rounded-md">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                        <button onClick={handleRemovePreview} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5"><X size={14}/></button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 p-2 hover:bg-gray-700 rounded-full">
                        <ImagePlus size={20} />
                    </button>
                    <input 
                        type="text" 
                        placeholder="Nhập tin nhắn..." 
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white" 
                    />
                    <button onClick={handleSendMessage} className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};