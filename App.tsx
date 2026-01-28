
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, PlayCircle, Loader2 } from 'lucide-react';
import { Bookmark, Category } from './types';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import BookmarkCard from './components/BookmarkCard';
import AddBookmarkForm from './components/AddBookmarkForm';
import { gasApi } from './api';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('전체');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await gasApi.getEntries();
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    let result = bookmarks;
    if (activeCategory !== '전체') {
      result = result.filter(b => b.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(b => 
        b.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredBookmarks([...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [bookmarks, activeCategory, searchQuery]);

  const handleAddBookmark = async (newBookmark: Bookmark) => {
    setIsLoading(true);
    const result = await gasApi.addEntry(newBookmark);
    if (result.success) {
      setBookmarks(prev => [newBookmark, ...prev]);
    } else {
      alert('저장 실패: ' + result.message);
    }
    setIsLoading(false);
  };

  const handleDeleteBookmark = (id: string) => {
    // 실제 운영 시에는 gasApi.deleteEntry(id) 구현 필요
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pt-4">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-sm"
            placeholder="동영상 검색 또는 메모 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <FilterBar 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-medium">데이터 불러오는 중...</p>
          </div>
        ) : filteredBookmarks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mt-6">
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard 
                key={bookmark.id} 
                bookmark={bookmark} 
                onDelete={handleDeleteBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">저장된 콘텐츠가 없습니다.</p>
          </div>
        )}
      </main>

      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {isFormOpen && (
        <AddBookmarkForm 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleAddBookmark}
        />
      )}
    </div>
  );
};

export default App;
