import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import BottomNav from './BottomNav';
import { ArrowLeft, X, Plus, Smile, Image as ImageIcon } from 'lucide-react';
import type { Comment } from '../../types';

// Helper for relative time
const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays <= 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const RulesModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white text-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-up">
            <header className="p-4 flex justify-between items-center border-b shrink-0">
                <h2 className="text-xl font-bold">Comment Rules</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
            </header>
            <div className="p-6 overflow-y-auto space-y-2 text-sm text-gray-700">
                <p>1. Be respectful to other users.</p>
                <p>2. Do not post any offensive or inappropriate content.</p>
                <p>3. Sharing your success and experience is encouraged.</p>
                <p>4. Do not share personal information that could compromise your security.</p>
                <p>5. Violations may result in comments being deleted or account suspension.</p>
            </div>
        </div>
    </div>
);

// NEW: Image Preview Modal
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


const NewCommentModal = ({ onClose }: { onClose: () => void }) => {
    const { addComment } = useApp();
    const [text, setText] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_CHARS = 280;

    const handleAddImage = () => {
        if (images.length < 2) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result && images.length < 2) {
                    setImages(prev => [...prev, event.target.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handlePost = async () => {
        if (!text.trim() || text.length > MAX_CHARS) return;
        setIsPosting(true);
        await addComment({ text, images });
        setIsPosting(false);
        onClose();
    };
    
    const charCountColor = text.length > MAX_CHARS 
        ? 'text-red-500' 
        : (text.length > MAX_CHARS * 0.9 ? 'text-orange-500' : 'text-gray-500');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-up">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                />
                <header className="p-4 flex justify-between items-center border-b">
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">Cancel</button>
                    <h2 className="font-semibold">New Comment</h2>
                    <button onClick={handlePost} disabled={!text.trim() || isPosting || text.length > MAX_CHARS} className="px-4 py-1.5 bg-green-500 text-white rounded-full font-semibold disabled:bg-gray-300">
                        {isPosting ? 'Posting...' : 'Post'}
                    </button>
                </header>
                <div className="p-4">
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                     <div className={`text-right text-xs mt-1 ${charCountColor}`}>
                        {text.length} / {MAX_CHARS}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {images.map((img, index) => (
                            <div key={index} className="relative group">
                                <img src={img} alt="preview" className="w-20 h-20 object-cover rounded-md" />
                                <button
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {images.length < 2 && (
                            <button onClick={handleAddImage} className="w-20 h-20 bg-gray-100 rounded-md flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                <ImageIcon size={24} />
                                <span className="text-xs mt-1">Add Photo</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const CommentCard = ({ comment, onImageClick }: { comment: Comment; onImageClick: (url: string) => void; }) => (
    <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
            <img src={comment.userAvatar} alt={comment.userName} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-gray-800">{comment.userName}</p>
                        <p className="text-xs text-gray-500">{comment.maskedPhone}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-green-500">
                        <Smile size={20} />
                    </button>
                </div>
                <p className="my-2 text-gray-700">{comment.text}</p>
                {comment.images.length > 0 && (
                    <div className={`grid ${comment.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mt-2`}>
                        {comment.images.map((img, index) => (
                             <button key={index} onClick={() => onImageClick(img)} className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden transition-transform transform hover:scale-105">
                                <img src={img} alt={`comment image ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
                <p className="text-xs text-gray-400 mt-3">{formatTimeAgo(comment.timestamp)}</p>
            </div>
        </div>
    </div>
);

const CommentScreen: React.FC = () => {
    const { comments } = useApp();
    const [showRules, setShowRules] = useState(false);
    const [showNewComment, setShowNewComment] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
            {showRules && <RulesModal onClose={() => setShowRules(false)} />}
            {showNewComment && <NewCommentModal onClose={() => setShowNewComment(false)} />}
            {viewingImage && <ImagePreviewModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}

            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800">Comment</h1>
                <button onClick={() => setShowRules(true)} className="absolute right-4 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                    Rules
                </button>
            </header>
            
            <main className="flex-1 overflow-y-auto">
                {comments.length > 0 ? (
                    comments.map(comment => <CommentCard key={comment.id} comment={comment} onImageClick={setViewingImage} />)
                ) : (
                    <div className="text-center text-gray-500 py-20">
                        <p>No comments yet. Be the first to share!</p>
                    </div>
                )}
            </main>

            <button
                onClick={() => setShowNewComment(true)}
                className="fixed bottom-24 right-6 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-green-600 transition-transform transform active:scale-95"
                aria-label="Add new comment"
            >
                <Plus size={28} />
            </button>
            
            <BottomNav active="comment" />

            <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                @keyframes scale-up { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
                .animate-scale-up { animation: scale-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default CommentScreen;
