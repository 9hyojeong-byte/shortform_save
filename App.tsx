
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, PlayCircle, Loader2 } from 'lucide-react';
import { Bookmark, Category } from './types';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import BookmarkCard from './components/BookmarkCard';
import AddBookmarkForm from './components/AddBookmarkForm';
import { gasApi } from './api';
import { INITIAL_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('전체');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entriesData, categoriesData] = await Promise.all([
        gasApi.getEntries(),
        gasApi.getCategories()
      ]);
      setBookmarks(entriesData);
      
      // Merge initial categories with ones from server, remove duplicates
      const mergedCats = Array.from(new Set([...INITIAL_CATEGORIES, ...categoriesData]));
      setCategories(mergedCats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let result = bookmarks;
    if (activeCategory !== '전체') {
      result = result.filter(b => Array.isArray(b.category) && b.category.includes(activeCategory));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.memo.toLowerCase().includes(q) ||
        (Array.isArray(b.category) && b.category.some(c => c.toLowerCase().includes(q)))
      );
    }
    setFilteredBookmarks([...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [bookmarks, activeCategory, searchQuery]);

  const handleSaveBookmark = async (bookmark: Bookmark) => {
    try {
      if (editingBookmark) {
        const result = await gasApi.updateEntry(bookmark);
        if (result.success) {
          setBookmarks(prev => prev.map(b => b.id === bookmark.id ? bookmark : b));
        }
      } else {
        const result = await gasApi.addEntry(bookmark);
        if (result.success) {
          setBookmarks(prev => [bookmark, ...prev]);
        }
      }
      setIsFormOpen(false);
      setEditingBookmark(null);
    } catch (error) {
      console.error("Error saving bookmark:", error);
      throw error;
    }
  };

  const handleAddCategory = async (newCat: string) => {
    if (!categories.includes(newCat)) {
      setCategories(prev => [...prev, newCat]);
      await gasApi.addCategory(newCat);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await gasApi.deleteEntry(id);
      if (result.success) {
        setBookmarks(prev => prev.filter(b => b.id !== id));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsFormOpen(true);
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
          categories={categories}
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-medium text-slate-600 tracking-tight">데이터 동기화 중...</p>
          </div>
        ) : filteredBookmarks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard 
                key={bookmark.id} 
                bookmark={bookmark} 
                onDelete={handleDeleteBookmark}
                onEdit={handleEditClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-in fade-in duration-700">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium">콘텐츠가 비어 있습니다.</p>
          </div>
        )}
      </main>

      <button
        onClick={() => { setEditingBookmark(null); setIsFormOpen(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 hover:scale-110 active:scale-90 transition-all z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {isFormOpen && (
        <AddBookmarkForm 
          categories={categories}
          onAddCategory={handleAddCategory}
          editingBookmark={editingBookmark}
          onClose={() => { setIsFormOpen(false); setEditingBookmark(null); }} 
          onSubmit={handleSaveBookmark}
        />
      )}
    </div>
  );
};

export default App;
