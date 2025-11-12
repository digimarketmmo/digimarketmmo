import React, { useState } from 'react';
import { MessageCircle } from './icons.tsx';
import { LiveSupportChat } from './LiveSupportChat.tsx';

const FloatingActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-primary-500 to-blue-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-400"
        aria-label="Mở khung chat hỗ trợ"
    >
        <MessageCircle size={28} fill="white" stroke="none" />
    </button>
);

export const ChatBubble: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            {!isChatOpen && <FloatingActionButton onClick={() => setIsChatOpen(true)} />}
            <LiveSupportChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
};