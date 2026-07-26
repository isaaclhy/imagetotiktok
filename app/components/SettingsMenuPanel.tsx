'use client';

import { useEffect, useState } from 'react';
import { AutomateDriveUpload } from '@/app/components/AutomateDriveUpload';

export type SettingsTab = 'drive' | 'legal';

type SettingsMenuPanelProps = {
  onClose: () => void;
  initialTab?: SettingsTab;
};

function readSettingsFromUrl(): {
  tab: SettingsTab;
  driveError: string | null;
  driveConnected: boolean;
} {
  if (typeof window === 'undefined') {
    return { tab: 'drive', driveError: null, driveConnected: false };
  }
  const params = new URLSearchParams(window.location.search);
  const tab: SettingsTab = params.get('settings_tab') === 'legal' ? 'legal' : 'drive';
  const driveAuth = params.get('drive_auth');
  const driveError =
    driveAuth === 'error' ? params.get('drive_error') || 'Connection failed' : null;
  const driveConnected = driveAuth === 'success';

  if (params.get('settings') === '1' || driveAuth) {
    params.delete('settings');
    params.delete('settings_tab');
    params.delete('drive_auth');
    params.delete('drive_error');
    const next = params.toString();
    const path = window.location.pathname + (next ? `?${next}` : '');
    window.history.replaceState({}, '', path);
  }

  return { tab, driveError, driveConnected };
}

export function SettingsMenuPanel({ onClose, initialTab = 'drive' }: SettingsMenuPanelProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [driveNotice, setDriveNotice] = useState<string | null>(null);
  const [driveJustConnected, setDriveJustConnected] = useState(false);

  useEffect(() => {
    const fromUrl = readSettingsFromUrl();
    if (fromUrl.tab) setTab(fromUrl.tab);
    if (fromUrl.driveError) setDriveNotice(fromUrl.driveError);
    if (fromUrl.driveConnected) setDriveJustConnected(true);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div
        className="fixed z-50 inset-x-3 top-16 bottom-3 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[min(340px,calc(100vw-2rem))] lg:absolute lg:inset-auto lg:left-full lg:bottom-0 lg:top-auto lg:translate-x-0 lg:translate-y-0 lg:ml-2 lg:w-[min(340px,calc(100vw-15rem))] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden flex flex-col max-h-[min(85vh,640px)]"
        role="dialog"
        aria-label="Settings"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-zinc-200 dark:border-zinc-700 shrink-0">
          <button
            type="button"
            onClick={() => setTab('drive')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === 'drive'
                ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Google Drive
          </button>
          <button
            type="button"
            onClick={() => setTab('legal')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === 'legal'
                ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Legal
          </button>
        </div>

        <div className="overflow-y-auto min-h-0 flex-1">
          {tab === 'drive' ? (
            <AutomateDriveUpload
              embedded
              initialError={driveNotice}
              connectionJustSucceeded={driveJustConnected}
              onClearError={() => setDriveNotice(null)}
              onClearConnectionNotice={() => setDriveJustConnected(false)}
            />
          ) : (
            <div className="p-4 flex flex-col gap-1">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Privacy
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
