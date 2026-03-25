
import React, { useState } from 'react';
import { ExternalLink, Trash2, Calendar, Edit3, Copy, Check, X, Star, Maximize2 } from 'lucide-react';
import { Bookmark } from '../types';
import { getCategoryColor } from '../constants';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onToggleFavorite: (bookmark: Bookmark) => void;
  onImageView: (imageUrl: string) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onDelete, onEdit, onToggleFavorite, onImageView }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isFavorite = Array.isArray(bookmark.category) && bookmark.category.includes('즐겨찾기');
  const displayCategories = Array.isArray(bookmark.category) ? bookmark.category.filter(c => c !== '즐겨찾기') : [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(bookmark.url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col h-full">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={bookmark.thumbnail} 
          alt="Thumbnail" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 right-10 flex flex-wrap gap-1">
          {displayCategories.map(cat => (
            <span key={cat} className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border shadow-sm ${getCategoryColor(cat)}`}>
              {cat}
            </span>
          ))}
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(bookmark); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors z-10"
        >
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-500' : 'text-slate-400'}`} />
        </button>
        {bookmark.url ? (
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]"
          >
            <div className="bg-white/90 p-3 rounded-full shadow-lg">
              <ExternalLink className="h-5 w-5 text-indigo-600" />
            </div>
          </a>
        ) : (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onImageView(bookmark.thumbnail); }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px] w-full h-full"
          >
            <div className="bg-white/90 p-3 rounded-full shadow-lg">
              <Maximize2 className="h-5 w-5 text-indigo-600" />
            </div>
          </button>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-2 min-h-[40px]">
          {bookmark.memo || '메모가 없습니다.'}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <Calendar className="h-3 w-3" />
            {formatDate(bookmark.date)}
          </div>
          <div className="flex gap-1">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1 animate-in fade-in zoom-in duration-200">
                <span className="text-[10px] text-red-600 font-medium mr-1">삭제할까요?</span>
                <button 
                  onClick={() => onDelete(bookmark.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="확인"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors"
                  title="취소"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                {bookmark.url && (
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
                    title="URL 복사"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button 
                  onClick={() => onEdit(bookmark)}
                  className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
                  title="수정"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
