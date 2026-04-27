'use client';

import React, { useState } from 'react';
import { AdvancedDropdown, DropdownItem, DropdownSection } from './AdvancedDropdown';
import { ArrowLeft, ArrowRight, ArrowClockwise, Pencil, Star, Cube, Download, Scissors, Copy, Code, CheckCircle, XCircle } from '@phosphor-icons/react';

export const AdvancedDropdownExample: React.FC = () => {
  const [viewOptions, setViewOptions] = useState<Set<string>>(new Set(['show-bookmarks']));

  const sections: DropdownSection[] = [
    {
      items: [
        {
          label: 'Back',
          icon: <ArrowLeft weight="bold" className="h-4 w-4" />,
          onClick: () => console.log('Back clicked'),
        },
        {
          label: 'Forward',
          icon: <ArrowRight weight="bold" className="h-4 w-4" />,
          onClick: () => console.log('Forward clicked'),
        },
        {
          label: 'Reload',
          icon: <ArrowClockwise weight="bold" className="h-4 w-4" />,
          addon: '⌘R',
          onClick: () => console.log('Reload clicked'),
        },
        {
          label: 'Edit page',
          icon: <Pencil weight="bold" className="h-4 w-4" />,
          onClick: () => console.log('Edit page clicked'),
        },
        {
          label: 'Add to favorites',
          icon: <Star weight="bold" className="h-4 w-4" />,
          onClick: () => console.log('Add to favorites clicked'),
        },
      ],
    },
    {
      selectionMode: 'multiple',
      selectedKeys: viewOptions,
      onSelectionChange: setViewOptions,
      items: [
        {
          id: 'show-bookmarks',
          label: 'Show bookmarks',
          onClick: () => console.log('Show bookmarks toggled'),
        },
        {
          id: 'show-urls',
          label: 'Show full URLs',
          onClick: () => console.log('Show URLs toggled'),
        },
      ],
    },
    {
      items: [
        {
          id: 'olivia',
          label: 'Olivia Rhye',
          icon: <CheckCircle weight="bold" className="h-4 w-4 text-green-500" />,
          onClick: () => console.log('Olivia clicked'),
        },
        {
          id: 'sienna',
          label: 'Sienna Hewitt',
          icon: <XCircle weight="bold" className="h-4 w-4 text-gray-400" />,
          onClick: () => console.log('Sienna clicked'),
        },
      ],
    },
    {
      items: [
        {
          label: 'More tools',
          icon: <Cube weight="bold" className="h-4 w-4" />,
          children: [
            {
              label: 'Save as',
              icon: <Download weight="bold" className="h-4 w-4" />,
              children: [
                {
                  label: 'PDF',
                  onClick: () => console.log('PDF clicked'),
                },
                {
                  label: 'HTML',
                  onClick: () => console.log('HTML clicked'),
                },
                {
                  label: 'Markdown',
                  onClick: () => console.log('Markdown clicked'),
                },
              ],
            },
            {
              label: 'Cut',
              icon: <Scissors weight="bold" className="h-4 w-4" />,
              addon: '⌘X',
              onClick: () => console.log('Cut clicked'),
            },
            {
              label: 'Copy',
              icon: <Copy weight="bold" className="h-4 w-4" />,
              addon: '⌘C',
              onClick: () => console.log('Copy clicked'),
            },
            {
              label: 'Developer',
              icon: <Code weight="bold" className="h-4 w-4" />,
              children: [
                {
                  label: 'View source',
                  onClick: () => console.log('View source clicked'),
                },
                {
                  label: 'Developer tools',
                  onClick: () => console.log('Developer tools clicked'),
                },
                {
                  label: 'Inspect elements',
                  onClick: () => console.log('Inspect clicked'),
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="p-8">
      <AdvancedDropdown
        trigger={
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <span>Actions</span>
            <ChevronDown weight="bold" className="h-4 w-4" />
          </button>
        }
        sections={sections}
      />
    </div>
  );
};

export default AdvancedDropdownExample;
