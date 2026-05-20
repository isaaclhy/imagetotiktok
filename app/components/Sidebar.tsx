'use client';

interface SidebarProps {
  contentTab: 'image' | 'video' | 'prompt' | 'automate';
  onContentTabChange: (tab: 'image' | 'video' | 'prompt' | 'automate') => void;
  userInfo: { display_name?: string; avatar_url?: string } | null;
  showUserDropdown: boolean;
  setShowUserDropdown: (v: boolean) => void;
  showSettingsMenu: boolean;
  setShowSettingsMenu: (v: boolean) => void;
  onLogout: () => Promise<void>;
}

export function Sidebar({
  contentTab,
  onContentTabChange,
  userInfo,
  showUserDropdown,
  setShowUserDropdown,
  showSettingsMenu,
  setShowSettingsMenu,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex-shrink-0 flex flex-col p-3 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-10">
      <h1 className="text-xl font-bold text-black dark:text-zinc-50 px-4 py-3 flex-shrink-0">
        Bleamies
      </h1>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={() => onContentTabChange('image')}
          className={`w-full py-3 px-4 flex items-center gap-3 rounded-lg transition-colors text-left ${
            contentTab === 'image'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50'
              : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">Image</span>
        </button>
        <button
          onClick={() => onContentTabChange('video')}
          className={`w-full py-3 px-4 flex items-center gap-3 rounded-lg transition-colors text-left ${
            contentTab === 'video'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50'
              : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">Video</span>
        </button>
        <button
          onClick={() => onContentTabChange('prompt')}
          className={`w-full py-3 px-4 flex items-center gap-3 rounded-lg transition-colors text-left ${
            contentTab === 'prompt'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50'
              : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium">Prompt</span>
        </button>
        <button
          onClick={() => onContentTabChange('automate')}
          className={`w-full py-3 px-4 flex items-center gap-3 rounded-lg transition-colors text-left ${
            contentTab === 'automate'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50'
              : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-sm font-medium">Automate</span>
        </button>
      </div>
      <div className="flex-1 min-h-4" />
      <div className="flex-shrink-0 pt-3 border-t border-zinc-200 dark:border-zinc-700 flex flex-col gap-2 relative">
        {userInfo ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative min-w-0 flex-1">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowSettingsMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer min-w-0"
              >
                {userInfo.avatar_url && (
                  <img src={userInfo.avatar_url} alt={userInfo.display_name || 'User'} className="w-6 h-6 rounded-full flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-black dark:text-zinc-50 truncate min-w-0 flex-1">{userInfo.display_name || 'User'}</span>
                <svg className={`w-4 h-4 flex-shrink-0 text-black dark:text-zinc-50 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                  <div className="absolute bottom-full left-0 right-0 mb-2 w-full bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden">
                    <button onClick={onLogout} className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => { setShowSettingsMenu(!showSettingsMenu); setShowUserDropdown(false); }} className={`flex-shrink-0 p-2.5 rounded-lg transition-colors ${showSettingsMenu ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300'}`} title="Settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => (window.location.href = '/api/tiktok/auth')} className="flex-1 h-10 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2" title="Connect TikTok">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              <span>TikTok</span>
            </button>
            <button onClick={() => { setShowSettingsMenu(!showSettingsMenu); setShowUserDropdown(false); }} className={`flex-shrink-0 p-2.5 rounded-lg transition-colors ${showSettingsMenu ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300'}`} title="Settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        )}
        {showSettingsMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSettingsMenu(false)} />
            <div className="absolute left-0 right-0 bottom-full mb-2 w-full bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden">
              <a href="/terms" target="_blank" rel="noopener noreferrer" onClick={() => setShowSettingsMenu(false)} className="block w-full px-4 py-3 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">Terms of Service</a>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" onClick={() => setShowSettingsMenu(false)} className="block w-full px-4 py-3 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border-t border-zinc-200 dark:border-zinc-700">Privacy</a>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
