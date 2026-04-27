'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, CaretRight } from '@phosphor-icons/react';

export interface DropdownItem {
  id?: string;
  label: string;
  icon?: React.ReactNode;
  addon?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: DropdownItem[];
}

export interface DropdownSection {
  title?: string;
  items: DropdownItem[];
  selectionMode?: 'single' | 'multiple' | 'none';
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
}

interface AdvancedDropdownProps {
  trigger: React.ReactNode;
  sections: DropdownSection[];
  className?: string;
  align?: 'left' | 'right';
}

export const AdvancedDropdown: React.FC<AdvancedDropdownProps> = ({
  trigger,
  sections,
  className,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setOpenSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    if (item.onClick) {
      item.onClick();
    }
    if (!item.children) {
      setIsOpen(false);
    }
  };

  const handleSubmenuToggle = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenSubmenu(openSubmenu === itemId ? null : itemId);
  };

  const isItemSelected = (item: DropdownItem, section: DropdownSection) => {
    if (!item.id || !section.selectedKeys) return false;
    return section.selectedKeys.has(item.id);
  };

  const toggleSelection = (item: DropdownItem, section: DropdownSection) => {
    if (!item.id || !section.onSelectionChange || section.selectionMode === 'none') return;
    
    const newKeys = new Set(section.selectedKeys);
    if (section.selectionMode === 'single') {
      newKeys.clear();
      newKeys.add(item.id);
    } else {
      if (newKeys.has(item.id)) {
        newKeys.delete(item.id);
      } else {
        newKeys.add(item.id);
      }
    }
    section.onSelectionChange(newKeys);
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-56 max-w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden',
            align === 'right' ? 'right-0' : 'left-0',
            'mt-2'
          )}
        >
          <div className="py-1">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                )}
                
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="relative">
                    <div
                      onClick={() => {
                        if (section.selectionMode && section.selectionMode !== 'none') {
                          toggleSelection(item, section);
                        }
                        handleItemClick(item);
                      }}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors',
                        item.disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                        isItemSelected(item, section) && 'bg-gray-100 dark:bg-gray-700/70'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {item.icon && (
                          <span className="shrink-0 text-gray-500 dark:text-gray-400">
                            {item.icon}
                          </span>
                        )}
                        <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                          {item.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {item.addon && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {item.addon}
                          </span>
                        )}
                        {section.selectionMode && section.selectionMode !== 'none' && item.id && isItemSelected(item, section) && (
                          <Check className="h-4 w-4 text-primary-500 dark:text-primary-400" weight="bold" />
                        )}
                        {item.children && item.children.length > 0 && (
                          <CaretRight
                            onClick={(e) => handleSubmenuToggle(item.id || `${sectionIndex}-${itemIndex}`, e)}
                            className={cn(
                              'h-4 w-4 text-gray-400 transition-transform',
                              openSubmenu === (item.id || `${sectionIndex}-${itemIndex}`) && 'rotate-90'
                            )}
                            weight="bold"
                          />
                        )}
                      </div>
                    </div>

                    {item.children && item.children.length > 0 && openSubmenu === (item.id || `${sectionIndex}-${itemIndex}`) && (
                      <div className="absolute left-full top-0 ml-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                        <div className="py-1">
                          {item.children.map((child, childIndex) => (
                            <div
                              key={childIndex}
                              onClick={() => {
                                if (child.onClick) {
                                  child.onClick();
                                }
                                setIsOpen(false);
                                setOpenSubmenu(null);
                              }}
                              className={cn(
                                'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors',
                                child.disabled
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              )}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {child.icon && (
                                  <span className="shrink-0 text-gray-500 dark:text-gray-400">
                                    {child.icon}
                                  </span>
                                )}
                                <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                                  {child.label}
                                </span>
                              </div>
                              {child.addon && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {child.addon}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {sectionIndex < sections.length - 1 && (
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDropdown;
