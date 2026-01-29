
import React from 'react';
import { ExternalLink, Trash2, Calendar, Edit3 } from 'lucide-react';
import { Bookmark } from '../types';
import { getCategoryColor } from '../constants';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onDelete, onEdit }) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col h-full">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={bookmark.thumbnail} 
          alt="Thumbnail" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1">
          {Array.isArray(bookmark.category) && bookmark.category.map(cat => (
            <span key={cat} className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border shadow-sm ${getCategoryColor(cat)}`}>
              {cat}
            </span>
          ))}
        </div>
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
            <button 
              onClick={() => onEdit(bookmark)}
              className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => {
                if (confirm('삭제하시겠습니까?')) onDelete(bookmark.id);
              }}
              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
