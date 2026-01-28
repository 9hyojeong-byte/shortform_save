
import React from 'react';
import { Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';

interface FilterBarProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-1 px-1">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all border
              ${isActive 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
