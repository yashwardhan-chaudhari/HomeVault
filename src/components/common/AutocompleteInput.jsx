import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Plus } from 'lucide-react';

export const AutocompleteInput = ({
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = 'Type or select suggestion...',
  required = false,
  id,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion);
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
            icon ? 'pl-9' : ''
          } ${query ? 'pr-9' : ''}`}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1.5 transition-all">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item, index) => {
              const isSelected = item.toLowerCase() === query.toLowerCase();
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{item}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
                </button>
              );
            })
          ) : (
            <div className="px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Press enter to save new entry <strong>"{query}"</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
