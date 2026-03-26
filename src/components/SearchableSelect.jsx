import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';

/**
 * SearchableSelect — combobox style.
 *
 * • Closed: shows selected label (or placeholder). Never crops.
 * • Open: the trigger becomes a live search input. Dropdown shows filtered options.
 * • Portal rendering escapes all stacking contexts.
 */
const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  className = '',
  id,
}) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({ opacity: 0, visibility: 'hidden' });

  const wrapperRef = useRef(null);
  const inputRef   = useRef(null);
  const panelRef   = useRef(null);

  // Normalise to flat {value, label} for searching and label lookup
  const normalised = options.flatMap(o => {
    if (o.group && Array.isArray(o.options)) {
      return o.options.map(sub => typeof sub === 'string' ? { value: sub, label: sub } : sub);
    }
    return [typeof o === 'string' ? { value: o, label: o } : o];
  });

  const filtered = query.trim()
    ? normalised.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : normalised;

  const selectedLabel = normalised.find(o => o.value === value)?.label ?? '';

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setDropdownStyle({ opacity: 0, visibility: 'hidden' });
  }, []);

  // Compute fixed panel position under (or above) the trigger
  const updatePosition = useCallback(() => {
    if (!wrapperRef.current) return;
    const r = wrapperRef.current.getBoundingClientRect();
    const panelH = 260;
    const spaceBelow = window.innerHeight - r.bottom;
    const w = r.width;

    const baseStyle = {
      position: 'fixed',
      left: r.left,
      width: w,
      zIndex: 9999,
      opacity: 1,
      visibility: 'visible'
    };

    if (spaceBelow < panelH && r.top > panelH) {
      setDropdownStyle({ 
        ...baseStyle,
        bottom: window.innerHeight - r.top + 2,
      });
    } else {
      setDropdownStyle({ 
        ...baseStyle,
        top: r.bottom + 2,
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        
        // Auto-scroll the focused element to the center of the screen
        // This keeps it above the mobile keypad for better accessibility.
        if (wrapperRef.current) {
          wrapperRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, updatePosition]);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        panelRef.current   && !panelRef.current.contains(e.target)
      ) close();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  const handleSelect = val => {
    onChange(val);
    close();
  };

  const handleClear = e => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!open) setOpen(true);
  };

  // When the input is open and user presses Escape, close
  const handleKeyDown = e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && filtered.length === 1) {
      handleSelect(filtered[0].value);
    }
  };

  const panel = open && (
    <div
      ref={panelRef}
      style={dropdownStyle}
      className="bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-900/15 overflow-hidden transition-opacity duration-150"
    >
      <ul className="max-h-60 overflow-y-auto py-1">
        {/* Placeholder/Clear option */}
        {value && !query && (
          <li className="border-b border-slate-50 mb-1">
            <button
              type="button"
              onPointerDown={e => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect('');
              }}
              className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear Selection
            </button>
          </li>
        )}

        {filtered.length === 0 ? (
          <li className="px-3 py-5 text-center text-xs text-slate-400 font-medium">
            No results{query ? ` for "${query}"` : ''}
          </li>
        ) : (
          (() => {
            // Check if we have groups
            const hasGroups = options.some(o => o.group && Array.isArray(o.options));
            
            if (!hasGroups || query.trim()) {
              // Render flat if no groups OR we are searching
              return filtered.map(o => (
                <li key={o.value}>
                  <button
                    type="button"
                    onPointerDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(o.value);
                    }}
                    className={[
                      'w-full text-left px-3 py-2.5 text-sm transition-colors',
                      value === o.value
                        ? 'bg-primary-50 text-primary-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    ].join(' ')}
                  >
                    {o.label}
                  </button>
                </li>
              ));
            }

            // Render with groups
            return options.map((group, gIdx) => (
              <li key={gIdx} className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  {group.group}
                </div>
                <ul>
                  {group.options.map(o => {
                    const optVal = typeof o === 'string' ? o : o.value;
                    const optLabel = typeof o === 'string' ? o : o.label;
                    const isDisabled = typeof o === 'object' && o.disabled;
                    return (
                      <li key={optVal}>
                        <button
                          type="button"
                          disabled={isDisabled}
                          onPointerDown={e => {
                            if (!isDisabled) {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelect(optVal);
                            }
                          }}
                          className={[
                            'w-full text-left px-4 py-2 text-sm transition-colors',
                            value === optVal
                              ? 'bg-primary-50 text-primary-700 font-bold'
                              : isDisabled ? 'text-slate-300 cursor-not-allowed italic' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                          ].join(' ')}
                        >
                          {optLabel}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ));
          })()
        )}
      </ul>
    </div>
  );

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Trigger / Input wrapper */}
      <div
        onClick={toggleOpen}
        className={[
          'w-full flex items-center gap-1.5 px-3 py-2.5',
          'rounded-xl border text-sm transition-all',
          'bg-slate-50 border-slate-200',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-slate-300',
          open
            ? 'border-primary-400 ring-2 ring-primary-500/20 bg-white'
            : '',
        ].join(' ')}
      >
        {/* Container for label/input perfectly prevents layout shift (vibration) */}
        <div className="flex-1 min-w-0 relative flex items-center overflow-hidden">
          {/* Always render span to dictate height; hide visually when open */}
          <span
            id={id}
            className={`block w-full text-sm font-medium transition-opacity ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${value ? 'text-slate-800' : 'text-slate-400'}`}
            style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.3' }}
          >
            {selectedLabel || placeholder}
          </span>
          
          {/* Render input absolutely so it never alters the box model/height */}
          {open && (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedLabel || placeholder}
              className="absolute inset-0 w-full h-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
            />
          )}
        </div>

        {/* Right side icons */}
        <span className="flex items-center gap-0.5 shrink-0 ml-1 text-slate-400">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onMouseDown={handleClear}
              className="p-0.5 rounded hover:text-red-400 transition-colors"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </div>

      {createPortal(panel, document.body)}
    </div>
  );
};

export default SearchableSelect;
