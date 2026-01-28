
import React from 'react';
import { BookmarkCheck } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <BookmarkCheck className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
            Shorts Favs
          </h1>
        </div>
        <div className="flex gap-2">
           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-400">ME</span>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
