
import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Type as TypeIcon, Image, Upload, Loader2, Sparkles, CheckCircle2, Plus, Tag } from 'lucide-react';
import { Bookmark, Category } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface AddBookmarkFormProps {
  categories: Category[];
  onAddCategory: (cat: string) => void;
  editingBookmark: Bookmark | null;
  onClose: () => void;
  onSubmit: (bookmark: Bookmark) => Promise<void>;
}

const AddBookmarkForm: React.FC<AddBookmarkFormProps> = ({ categories, onAddCategory, editingBookmark, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['인증샷']);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url);
      setMemo(editingBookmark.memo);
      setSelectedCategories(Array.isArray(editingBookmark.category) ? editingBookmark.category : [editingBookmark.category as any]);
      setThumbnail(editingBookmark.thumbnail);
    }
  }, [editingBookmark]);

  // Aggressive compression for Google Sheets compatibility (Target < 37KB / 50,000 chars)
  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 320; // Reduced from 400
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // 0.4 quality is sufficient for small thumbnails and significantly reduces string size
          const compressed = canvas.toDataURL('image/jpeg', 0.4);
          resolve(compressed);
        } else {
          resolve(base64Str);
        }
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressedBase64 = await compressImage(base64);
        setThumbnail(compressedBase64);
        setIsProcessing(false);
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
        contents: `I have this short-form video URL: ${url}. Predict what this video might be about and suggest a memo and multiple categories from: ${categories.filter(c => c !== '전체').join(', ')}.`,
        config: {
           responseMimeType: "application/json",
           responseSchema: {
             type: Type.OBJECT,
             properties: {
               memo: { type: Type.STRING },
               categories: { 
                 type: Type.ARRAY,
                 items: { type: Type.STRING }
               },
               thumbnailKeyword: { type: Type.STRING }
             },
             required: ["memo", "categories", "thumbnailKeyword"]
           }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setMemo(prev => prev || result.memo);
      if (result.categories && Array.isArray(result.categories)) {
        setSelectedCategories(result.categories.filter((c: string) => categories.includes(c)) as Category[]);
      }
      setThumbnail(`https://picsum.photos/seed/${result.thumbnailKeyword || 'video'}/320/480`);
    } catch (error) {
      setThumbnail(`https://picsum.photos/seed/${Math.random()}/320/480`);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCategory = (cat: Category) => {
    if (isSaving) return;
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat]
    );
  };

  const handleAddNewCategory = () => {
    const trimmed = newCatName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      onAddCategory(trimmed);
      setSelectedCategories(prev => [...prev, trimmed]);
      setNewCatName('');
      setShowAddCat(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return alert('URL은 필수입니다.');
    if (selectedCategories.length === 0) return alert('카테고리를 최소 하나 이상 선택해주세요.');
    
    setIsSaving(true);
    
    const finalThumbnail = thumbnail || `https://picsum.photos/seed/${Math.random()}/320/480`;
    
    const bookmarkData: Bookmark = {
      id: editingBookmark ? editingBookmark.id : Date.now().toString(),
      date: editingBookmark ? editingBookmark.date : new Date().toISOString(),
      url,
      memo,
      category: selectedCategories,
      thumbnail: finalThumbnail
    };
    
    try {
      await onSubmit(bookmarkData);
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 relative">
        
        {isSaving && (
          <div className="absolute inset-0 z-[60] bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative">
              <div className="h-20 w-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-slate-800 font-bold text-lg">데이터를 안전하게 저장 중...</p>
            <p className="mt-1 text-slate-500 text-sm">썸네일 용량이 큰 경우 시간이 걸릴 수 있습니다</p>
          </div>
        )}

        <div className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {editingBookmark ? '북마크 수정' : '새 북마크 추가'}
          </h2>
          <button onClick={onClose} disabled={isSaving} className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className={`space-y-1.5 transition-opacity ${isSaving ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 ml-1">
              <LinkIcon className="h-3 w-3" /> 영상 URL
            </label>
            <div className="relative">
              <input
                required
                type="url"
                disabled={isSaving}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              {!editingBookmark && (
                <button
                  type="button"
                  onClick={handleAutoThumbnail}
                  disabled={isProcessing || isSaving}
                  className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:bg-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  AI 분석
                </button>
              )}
            </div>
          </div>

          <div className={`space-y-1.5 transition-opacity ${isSaving ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 ml-1">
              <TypeIcon className="h-3 w-3" /> 메모
            </label>
            <textarea
              disabled={isSaving}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="영상에 대한 짧은 메모..."
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div className={`space-y-1.5 transition-opacity ${isSaving ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center justify-between ml-1 mb-1">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> 카테고리 (중복 가능)
              </label>
              <button 
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 hover:underline"
              >
                <Plus className="h-2.5 w-2.5" /> 새 카테고리
              </button>
            </div>

            {showAddCat && (
              <div className="flex gap-2 mb-3 animate-in slide-in-from-top-2 duration-200">
                <input 
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="카테고리명..."
                  className="flex-grow px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewCategory())}
                />
                <button 
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  추가
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {categories.filter(c => c !== '전체').map(cat => (
                <button
                  key={cat}
                  type="button"
                  disabled={isSaving}
                  onClick={() => toggleCategory(cat)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all
                    ${selectedCategories.includes(cat) 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={`space-y-1.5 transition-opacity ${isSaving ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 ml-1">
              <Image className="h-3 w-3" /> 스크린샷 썸네일
            </label>
            <div className="flex gap-4 items-center">
              <div className="w-20 aspect-[3/4] rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                {thumbnail ? (
                  <img src={thumbnail} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <Image className="h-6 w-6 text-slate-300" />
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <label className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all border-dashed">
                  <Upload className="h-4 w-4" />
                  {editingBookmark ? '썸네일 교체' : '이미지 업로드'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isProcessing || isSaving} />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[1.25rem] font-bold text-sm disabled:opacity-50">취소</button>
            <button 
              type="submit" 
              disabled={isProcessing || isSaving}
              className={`flex-[2] py-4 rounded-[1.25rem] font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2
                ${isSaving ? 'bg-indigo-400 text-white shadow-none cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98]'}`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  {editingBookmark ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingBookmark ? '수정 완료' : '북마크 저장'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookmarkForm;
