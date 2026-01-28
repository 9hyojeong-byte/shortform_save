
import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Type as TypeIcon, Image, Upload, Loader2, Sparkles } from 'lucide-react';
import { Bookmark, Category } from '../types';
import { CATEGORIES } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

interface AddBookmarkFormProps {
  editingBookmark: Bookmark | null;
  onClose: () => void;
  onSubmit: (bookmark: Bookmark) => void;
}

const AddBookmarkForm: React.FC<AddBookmarkFormProps> = ({ editingBookmark, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [memo, setMemo] = useState('');
  const [category, setCategory] = useState<Category>('인증샷');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url);
      setMemo(editingBookmark.memo);
      setCategory(editingBookmark.category);
      setThumbnail(editingBookmark.thumbnail);
    }
  }, [editingBookmark]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoThumbnail = async () => {
    if (!url) return alert('URL을 먼저 입력해주세요.');
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I have this short-form video URL: ${url}. Predict what this video might be about and suggest a memo and category (프리다이빙, 여행, 우정릴스, 인증샷, 귀여움, 캠핑팁).`,
        config: {
           responseMimeType: "application/json",
           responseSchema: {
             type: Type.OBJECT,
             properties: {
               memo: { type: Type.STRING },
               category: { type: Type.STRING },
               thumbnailKeyword: { type: Type.STRING }
             },
             required: ["memo", "category", "thumbnailKeyword"]
           }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setMemo(prev => prev || result.memo);
      setCategory(result.category as Category || '인증샷');
      setThumbnail(`https://picsum.photos/seed/${result.thumbnailKeyword || 'video'}/400/600`);
    } catch (error) {
      setThumbnail(`https://picsum.photos/seed/${Math.random()}/400/600`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return alert('URL은 필수입니다.');
    
    const bookmarkData: Bookmark = {
      id: editingBookmark ? editingBookmark.id : Date.now().toString(),
      date: editingBookmark ? editingBookmark.date : new Date().toISOString(),
      url,
      memo,
      category: category === '전체' ? '인증샷' : category,
      thumbnail: thumbnail || `https://picsum.photos/seed/${Math.random()}/400/600`
    };
    
    onSubmit(bookmarkData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {editingBookmark ? '북마크 수정' : '새 북마크 추가'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 ml-1">
              <LinkIcon className="h-3 w-3" /> 영상 URL
            </label>
            <div className="relative">
              <input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              {!editingBookmark && (
                <button
                  type="button"
                  onClick={handleAutoThumbnail}
                  disabled={isProcessing}
                  className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:bg-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  자동 추출
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 ml-1">
              <TypeIcon className="h-3 w-3" /> 메모
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="영상에 대한 짧은 메모..."
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 ml-1">
              <TypeIcon className="h-3 w-3" /> 카테고리
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.filter(c => c !== '전체').map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all
                    ${category === cat 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-500/20' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 ml-1">
              <Image className="h-3 w-3" /> 썸네일
            </label>
            <div className="flex gap-4 items-center">
              <div className="w-20 aspect-[3/4] rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                {thumbnail ? <img src={thumbnail} className="w-full h-full object-cover" alt="Preview" /> : <Image className="h-6 w-6 text-slate-300" />}
              </div>
              <div className="flex-grow">
                <label className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all border-dashed">
                  <Upload className="h-4 w-4" />
                  이미지 업로드
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[1.25rem] font-bold text-sm">취소</button>
            <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-[1.25rem] font-bold text-sm shadow-lg shadow-indigo-200">
              {editingBookmark ? '수정 완료' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookmarkForm;
