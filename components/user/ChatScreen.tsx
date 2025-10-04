import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Send, Paperclip, X } from 'lucide-react';
import type { ChatMessage } from '../../types';

const ChatMessageBubble = ({ message, isSender, onImageClick }: { message: ChatMessage; isSender: boolean; onImageClick: (url: string) => void; }) => {
    const bubbleClass = isSender
        ? 'bg-green-600 text-white self-end rounded-l-lg rounded-tr-lg'
        : 'bg-white text-gray-800 self-start rounded-r-lg rounded-tl-lg shadow-sm';

    return (
        <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} max-w-xs md:max-w-md`}>
            <div className={`p-3 ${bubbleClass}`}>
                {message.text && <p className="text-sm break-words">{message.text}</p>}
                {message.imageUrl && (
                    <button onClick={() => onImageClick(message.imageUrl!)} className="mt-2 rounded-lg max-w-full h-auto block overflow-hidden">
                        <img src={message.imageUrl} alt="chat attachment" className="w-full h-auto object-cover" />
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-1 px-1">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    );
};

const ImagePreviewModal = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => (
    <div 
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[60] animate-fade-in"
        onClick={onClose}
    >
        <button 
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors z-10"
            onClick={onClose}
        >
            <X size={24} />
        </button>
        <div className="relative max-w-full max-h-full animate-scale-up" onClick={e => e.stopPropagation()}>
            <img src={imageUrl} alt="Full screen preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        </div>
    </div>
);


const ChatScreen: React.FC = () => {
    const { currentUser, chatSessions, sendChatMessage, markChatAsRead, setCurrentView } = useApp();
    const [messageText, setMessageText] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialUnreadCount = useRef(0);
    const isInitialMount = useRef(true);

    const session = chatSessions.find(s => s.userId === currentUser?.id);
    const messages = session?.messages || [];

    useEffect(() => {
        if (currentUser && session && isInitialMount.current) {
            if (session.userUnreadCount > 0) {
                initialUnreadCount.current = session.userUnreadCount;
            }
            markChatAsRead(currentUser.id);
            isInitialMount.current = false;
        }
    }, [currentUser, session, markChatAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!currentUser) return null;

    const handleSendMessage = async () => {
        if (!messageText.trim() && !image) return;
        
        await sendChatMessage(currentUser.id, { text: messageText, imageUrl: image || undefined });
        
        setMessageText('');
        setImage(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setImage(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {viewingImage && <ImagePreviewModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Customer Service</h1>
            </header>
            
            <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                {messages.map((msg, index) => {
                    const unreadMarkerIndex = messages.length - initialUnreadCount.current;
                    const showUnreadMarker = initialUnreadCount.current > 0 && index === unreadMarkerIndex;
                    
                    return (
                        <React.Fragment key={msg.id}>
                            {showUnreadMarker && (
                                <div className="relative my-4 text-center" role="separator">
                                    <hr className="border-t border-red-300" />
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-gray-100 px-3 text-xs font-bold text-red-500 rounded-full">
                                        New Messages
                                    </span>
                                </div>
                            )}
                            <ChatMessageBubble
                                message={msg}
                                isSender={msg.senderId === currentUser.id}
                                onImageClick={setViewingImage}
                            />
                        </React.Fragment>
                    )
                })}
                <div ref={messagesEndRef} />
                 {messages.length === 0 && (
                    <div className="text-center text-gray-500 my-auto">
                        <p>No messages yet. Say hello!</p>
                    </div>
                )}
            </main>

            <footer className="p-4 bg-white border-t sticky bottom-0 shrink-0">
                {image && (
                    <div className="relative w-24 h-24 mb-2 p-2 bg-gray-100 rounded-lg">
                        <img src={image} alt="preview" className="w-full h-full object-cover rounded-md" />
                        <button onClick={() => setImage(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                            <X size={14} />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-gray-100 border border-transparent rounded-full focus:ring-2 focus:ring-green-500 focus:bg-white"
                    />
                    <button onClick={handleSendMessage} className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:bg-gray-300" disabled={!messageText.trim() && !image}>
                        <Send size={20} />
                    </button>
                </div>
            </footer>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                @keyframes scale-up { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
                .animate-scale-up { animation: scale-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default ChatScreen;