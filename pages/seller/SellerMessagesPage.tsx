


import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
// FIX: Added .tsx extension to the import path.
import { AppContext, AppContextType } from '../../context/AppContext.tsx';
// FIX: Added .ts extension to the import path.
import { User, Message } from '../../types.ts';
// FIX: Added .ts extension to the import path.
import { formatTimeAgo } from '../../utils/formatter.ts';
// FIX: Added .tsx extension to the import path.
import { Send } from '../../components/icons.tsx';

const SellerMessagesPage: React.FC = () => {
    // FIX: Cast context to AppContextType to resolve property access errors.
    const context = useContext(AppContext) as AppContextType;
    const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [context?.messages]);

    if (!context || !context.currentUser) return <div>Đang tải...</div>;

    const { currentUser, messages, users, sendMessage } = context;

    // FIX: Add explicit typing to resolve 'sort' property error on unknown type
    const conversations = useMemo<Array<{ otherUser: User | undefined; messages: Message[] }>>(() => {
        const userMessages = messages.filter(
            m => m.senderId === currentUser.id || m.receiverId === currentUser.id
        );

        const grouped = userMessages.reduce((acc, msg) => {
            const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
            if (!acc[otherUserId]) {
                acc[otherUserId] = [];
            }
            acc[otherUserId].push(msg);
            return acc;
        }, {} as Record<string, Message[]>);

        return Object.entries(grouped).map(([userId, userMessages]) => ({
            otherUser: users.find(u => u.id === userId),
            messages: userMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
        })).sort((a, b) => {
            const lastMsgA = a.messages[a.messages.length - 1]?.timestamp.getTime() || 0;
            const lastMsgB = b.messages[b.messages.length - 1]?.timestamp.getTime() || 0;
            return lastMsgB - lastMsgA;
        });

    }, [messages, currentUser.id, users]);

    const handleReplyChange = (userId: string, content: string) => {
        setReplyContent(prev => ({ ...prev, [userId]: content }));
    };

    const handleSendReply = (userId: string) => {
        const content = replyContent[userId];
        if (!content || !content.trim()) return;
        sendMessage(userId, content);
        handleReplyChange(userId, '');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Hộp thư</h1>
             <div className="space-y-8">
                {conversations.length > 0 ? conversations.map(({ otherUser, messages }) => {
                    if (!otherUser) return null;
                    return (
                        <div key={otherUser.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 bg-gray-700/50 flex items-center gap-4 border-b border-gray-700">
                                <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-10 h-10 rounded-full" />
                                <h2 className="text-xl font-semibold text-white">Trò chuyện với {otherUser.name}</h2>
                            </div>
                            <div className="p-4 h-96 overflow-y-auto flex flex-col gap-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                        {msg.senderId !== currentUser.id && (
                                             <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                        )}
                                        <div className={`max-w-md p-3 rounded-lg ${msg.senderId === currentUser.id ? 'bg-green-700 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${msg.senderId === currentUser.id ? 'text-green-200' : 'text-gray-400'} text-right`}>{formatTimeAgo(msg.timestamp)}</p>
                                        </div>
                                         {msg.senderId === currentUser.id && (
                                             <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t border-gray-700">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Trả lời ${otherUser.name}...`}
                                        value={replyContent[otherUser.id] || ''}
                                        onChange={(e) => handleReplyChange(otherUser.id, e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendReply(otherUser.id)}
                                        className="flex-grow bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <button
                                        onClick={() => handleSendReply(otherUser.id)}
                                        className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        disabled={!replyContent[otherUser.id]?.trim()}
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }) : (
                     <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <p className="text-gray-400 text-lg">Bạn chưa có tin nhắn nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerMessagesPage;