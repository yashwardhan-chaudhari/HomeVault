import React, { useState, useRef, useEffect } from 'react';
import { Tag, X, Plus } from 'lucide-react';

export const AutocompleteTagsInput = ({
  label,
  tags = [],
  onChange,
  suggestions = [],
  placeholder = 'Add tags (press Enter)...',
  id
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableSuggestions = suggestions.filter(
    s => !tags.some(t => t.toLowerCase() === s.toLowerCase()) &&
         s.toLowerCase().includes(inputVal.toLowerCase())
  );

  const addTag = (tagToAdd) => {
    const trimmed = tagToAdd.trim().toLowerCase();
    if (!trimmed) return;
    if (!tags.some(t => t.toLowerCase() === trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputVal('');
    setIsOpen(false);
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
        {label}
      </label>

      <div className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm text-slate-900 focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all flex flex-wrap items-center gap-1.5">
        <Tag className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />

        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="hover:text-indigo-900 p-0.5 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          id={id}
          type="text"
          value={inputVal}
          onChange={e => {
            setInputVal(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none py-1 px-1"
        />
      </div>

      {isOpen && availableSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl p-2 flex flex-wrap gap-1.5">
          {availableSuggestions.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addTag(sug)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
              #{sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
