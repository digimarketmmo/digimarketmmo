import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { User, Message } from '../types.ts';
import { formatTimeAgo } from '../utils/formatter.ts';
import { Send, ArrowLeft } from '../components/icons.tsx';

const MessagesPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const prefilledUserId = location.state?.prefilledUserId || searchParams.get('user');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [selectedConv, setSelectedConv] = useState<{ otherUser: User | undefined; messages: Message[] } | null>(null);
    const [replyContent, setReplyContent] = useState('');

    if (!context || !context.currentUser) return <div>Đang tải...</div>;

    const { currentUser, messages, users, sendMessage } = context;

    // FIX: Add explicit typing to `useMemo` to help TypeScript correctly infer the array type and resolve a potential `.sort()` method error.
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
        
        if (prefilledUserId && !grouped[prefilledUserId]) {
            const userExists = users.some(u => u.id === prefilledUserId);
            if (userExists) {
                grouped[prefilledUserId] = [];
            }
        }

        return Object.entries(grouped).map(([userId, userMessages]) => ({
            otherUser: users.find(u => u.id === userId),
            messages: userMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
        })).sort((a, b) => {
            const lastMsgA = a.messages[a.messages.length - 1]?.timestamp.getTime() || 0;
            const lastMsgB = b.messages[b.messages.length - 1]?.timestamp.getTime() || 0;
            
            if (prefilledUserId) {
              if (a.otherUser?.id === prefilledUserId && a.messages.length === 0) return -1;
              if (b.otherUser?.id === prefilledUserId && b.messages.length === 0) return 1;
            }

            return lastMsgB - lastMsgA;
        });

    }, [messages, currentUser.id, users, prefilledUserId]);

    useEffect(() => {
        if (conversations.length > 0) {
            const prefilledConv = prefilledUserId 
                ? conversations.find(c => c.otherUser?.id === prefilledUserId) 
                : null;
            
            if (prefilledConv) {
                setSelectedConv(prefilledConv);
            } else if (window.innerWidth >= 768) { // md breakpoint
                setSelectedConv(conversations[0]);
            } else {
                setSelectedConv(null);
            }
            // Clean up the URL query param after using it
            if (searchParams.get('user')) {
                // Using replace to not add to history
                setSearchParams({}, { replace: true });
            }
        } else {
            setSelectedConv(null);
        }
    }, [conversations, prefilledUserId, searchParams, setSearchParams]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConv, messages]);

    const handleSendReply = () => {
        if (!replyContent.trim() || !selectedConv?.otherUser) return;
        sendMessage(selectedConv.otherUser.id, replyContent);
        setReplyContent('');
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Hộp thư đến</h1>
            <div className="flex h-[70vh] border border-gray-700 rounded-lg bg-gray-700 overflow-hidden">
                {/* Left Panel: Conversation List */}
                <div className={`
                    ${selectedConv ? 'hidden md:block' : 'w-full'}
                    md:w-1/3 border-r border-gray-600 overflow-y-auto bg-gray-800 md:rounded-l-lg
                `}>
                    {conversations.map(conv => {
                        if (!conv.otherUser) return null;
                        const lastMsg = conv.messages[conv.messages.length - 1];
                        const isSelected = selectedConv?.otherUser?.id === conv.otherUser.id;
                        return (
                            <button key={conv.otherUser.id} onClick={() => setSelectedConv(conv)} className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${isSelected ? 'bg-primary-600/20' : 'hover:bg-gray-700'}`}>
                                <img src={conv.otherUser.avatarUrl} alt={conv.otherUser.name} className="w-10 h-10 rounded-full" />
                                <div className="flex-grow min-w-0">
                                    <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>{conv.otherUser.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{lastMsg?.content || 'Bắt đầu cuộc trò chuyện'}</p>
                                </div>
                            </button>
                        );
                    })}
                     {conversations.length === 0 && <p className="text-center text-gray-500 p-4 text-sm">Không có cuộc trò chuyện nào.</p>}
                </div>

                {/* Right Panel: Chat Window */}
                <div className={`
                    ${selectedConv ? 'flex' : 'hidden'}
                    w-full md:w-2/3 md:flex flex-col
                `}>
                    {selectedConv?.otherUser ? (
                        <>
                            <div className="p-3 border-b border-gray-600 flex items-center gap-3">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden p-1 rounded-full hover:bg-gray-600 text-gray-300">
                                    <ArrowLeft size={20} />
                                </button>
                                <img src={selectedConv.otherUser.avatarUrl} alt={selectedConv.otherUser.name} className="w-8 h-8 rounded-full" />
                                <h3 className="font-semibold text-white">{selectedConv.otherUser.name}</h3>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {selectedConv.messages.map(msg => (
                                     <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                        {msg.senderId !== currentUser.id && (
                                             <img src={selectedConv.otherUser!.avatarUrl} alt={selectedConv.otherUser!.name} className="w-6 h-6 rounded-full flex-shrink-0" />
                                        )}
                                        <div className={`max-w-md p-3 rounded-lg ${msg.senderId === currentUser.id ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${msg.senderId === currentUser.id ? 'text-primary-200' : 'text-gray-400'} text-right`}>{formatTimeAgo(msg.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-3 border-t border-gray-600">
                                <div className="flex items-center gap-2">
                                    <input type="text" placeholder="Nhập tin nhắn..." value={replyContent} onChange={e => setReplyContent(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendReply()} className="flex-grow bg-gray-800 border border-gray-600 rounded-full py-2 px-4 text-white" />
                                    <button onClick={handleSendReply} className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors"><Send size={20} /></button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="items-center justify-center h-full text-gray-500 hidden md:flex">
                            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;