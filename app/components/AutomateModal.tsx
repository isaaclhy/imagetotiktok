'use client';

import { useState, useEffect } from 'react';
import { getDefaultAutomateCategories } from '@/app/lib/constants';

interface AutomateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categories: string[]) => Promise<void>;
  isGenerating: boolean;
  automateCount: string;
  setAutomateCount: (v: string) => void;
}

export function AutomateModal({ isOpen, onClose, onConfirm, isGenerating, automateCount, setAutomateCount }: AutomateModalProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      setCategoriesLoading(true);
      fetch('/api/levels/categories')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            const list = data.data as string[];
            setCategories(list);
            setSelectedCategories(new Set(getDefaultAutomateCategories(list)));
          }
        })
        .finally(() => setCategoriesLoading(false));
    }
  }, [isOpen]);

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (!isOpen) return null;

  const categoriesToUse =
    selectedCategories.size === categories.length && categories.length > 0
      ? []
      : Array.from(selectedCategories);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => !isGenerating && onClose()} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 max-w-xl w-full mx-4 border border-zinc-200 dark:border-zinc-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">Confirm Automate</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Generate card sets with random categories, AI-generated titles, and themes.</p>
        <div className="mb-4">
          <label htmlFor="automateCount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Number of sets to generate</label>
          <input
            type="number"
            id="automateCount"
            min={1}
            max={20}
            value={automateCount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^\d+$/.test(v)) setAutomateCount(v === '' ? '' : String(Math.min(20, Math.max(1, parseInt(v, 10) || 1))));
            }}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-mono text-sm"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">All sets will be downloaded in one ZIP file (1–20 sets)</p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Categories to include (uncheck to exclude)</label>
          {categoriesLoading ? (
            <p className="text-xs text-zinc-500">Loading categories…</p>
          ) : categories.length === 0 ? (
            <p className="text-xs text-zinc-500">No categories available</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <label key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <input type="checkbox" checked={selectedCategories.has(cat)} onChange={() => toggleCategory(cat)} className="rounded" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{cat}</span>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Uncheck categories you want to exclude</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isGenerating} className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={async () => {
              onClose();
              await onConfirm(categoriesToUse);
            }}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              'Download'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
