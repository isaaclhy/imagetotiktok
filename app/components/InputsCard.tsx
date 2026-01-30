'use client';

import type { CanvasData, CreatorInfo } from '@/app/lib/types';

interface InputsCardProps {
  contentTab: 'image' | 'video';
  // Image form state
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
  theme: string;
  setTheme: (v: string) => void;
  mode: 'plain' | 'video';
  setMode: (v: 'plain' | 'video') => void;
  videoLoading: boolean;
  onChangeVideo: () => void;
  text: string;
  setText: (v: string) => void;
  firstCard: CanvasData;
  canvases: CanvasData[];
  setCanvases: React.Dispatch<React.SetStateAction<CanvasData[]>>;
  card2Texts: Array<{ text: string; color: string }>;
  setCard2Texts: React.Dispatch<React.SetStateAction<Array<{ text: string; color: string }>>>;
  textSize: string;
  setTextSize: (v: string) => void;
  onAddCanvas: () => void;
  onDeleteCanvas: (id: string, e: React.MouseEvent) => void;
  // Post settings
  userInfo: { display_name?: string; avatar_url?: string } | null;
  postTitle: string;
  setPostTitle: (v: string) => void;
  postPrivacy: string;
  setPostPrivacy: (v: string) => void;
  creatorInfo: CreatorInfo | null;
  allowComment: boolean;
  setAllowComment: (v: boolean) => void;
  contentDisclosureEnabled: boolean;
  setContentDisclosureEnabled: (v: boolean) => void;
  isYourBrand: boolean;
  setIsYourBrand: (v: boolean) => void;
  isBrandedContent: boolean;
  setIsBrandedContent: (v: boolean) => void;
  musicUsageConsent: boolean;
  setMusicUsageConsent: (v: boolean) => void;
}

export function InputsCard(props: InputsCardProps) {
  const {
    contentTab,
    backgroundColor,
    setBackgroundColor,
    theme,
    setTheme,
    mode,
    setMode,
    videoLoading,
    onChangeVideo,
    text,
    setText,
    firstCard,
    canvases,
    setCanvases,
    card2Texts,
    setCard2Texts,
    textSize,
    setTextSize,
    onAddCanvas,
    onDeleteCanvas,
    userInfo,
    postTitle,
    setPostTitle,
    postPrivacy,
    setPostPrivacy,
    creatorInfo,
    allowComment,
    setAllowComment,
    contentDisclosureEnabled,
    setContentDisclosureEnabled,
    isYourBrand,
    setIsYourBrand,
    isBrandedContent,
    setIsBrandedContent,
    musicUsageConsent,
    setMusicUsageConsent,
  } = props;

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 hide-scrollbar">
        <div className="flex flex-col gap-4 py-3">
          {contentTab === 'video' && (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Video mode coming soon</p>
            </div>
          )}

          {contentTab === 'image' && (
            <>
              {/* General settings */}
              <div className="flex-shrink-0 space-y-3">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">General</h3>
                <div className="flex items-center gap-3">
                  <label htmlFor="color" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Background Color</label>
                  <div className="flex gap-2 items-center flex-1 min-w-0">
                    <input type="color" id="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0" />
                    <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} placeholder="#3B82F6" className="flex-1 min-w-0 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="textSize" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Text Size</label>
                  <input type="number" id="textSize" value={textSize} onChange={(e) => setTextSize(e.target.value)} placeholder="200" min={10} max={500} className="flex-1 min-w-0 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm" />
                </div>
              </div>

              {/* First Card section */}
              <div className="flex-shrink-0 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">First Card</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Mode</span>
                  <div className="flex rounded-full bg-zinc-200 dark:bg-zinc-700 p-0.5">
                    <button
                      type="button"
                      onClick={() => setMode('plain')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        mode === 'plain'
                          ? 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
                      }`}
                    >
                      Plain
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('video')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        mode === 'video'
                          ? 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
                      }`}
                    >
                      Image
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="theme" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Theme</label>
                  <input type="text" id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. cinematic, nature, city" disabled={mode === 'plain'} className="flex-1 min-w-0 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Title</label>
                  <div className="flex gap-2 items-center flex-1 min-w-0">
                    <input type="text" id="title" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter title for the first card..." className="flex-1 min-w-0 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm" />
                    <input type="color" id="titleTextColor" value={firstCard.textColor} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === '1' ? { ...c, textColor: e.target.value } : c)))} className="w-10 h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0" title="Title text color" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Change Image</span>
                  <button type="button" onClick={onChangeVideo} disabled={mode === 'plain' || videoLoading || !theme.trim()} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-zinc-900">
                    {videoLoading ? 'Loading…' : 'Change Image'}
                  </button>
                </div>
              </div>

              {/* Second Card section */}
              {canvases.find((c) => c.id === '2') && (
                <div className="flex-shrink-0 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Second Card</h3>
                  <div className="space-y-3">
                    {card2Texts.map((textItem, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input type="text" value={textItem.text} onChange={(e) => { const newTexts = [...card2Texts]; newTexts[index].text = e.target.value; setCard2Texts(newTexts); const allTexts = newTexts.map((t) => t.text).filter((t) => t.trim()).join('\n'); setCanvases((prev) => prev.map((c) => (c.id === '2' ? { ...c, text: allTexts } : c))); }} placeholder={`Text line ${index + 1}...`} className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm" />
                        <input type="color" value={textItem.color} onChange={(e) => { const newTexts = [...card2Texts]; newTexts[index].color = e.target.value; setCard2Texts(newTexts); }} className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0" title={`Text line ${index + 1} color`} />
                        {card2Texts.length > 1 && (
                          <button onClick={() => { const newTexts = card2Texts.filter((_, i) => i !== index); setCard2Texts(newTexts); const allTexts = newTexts.map((t) => t.text).filter((t) => t.trim()).join('\n'); setCanvases((prev) => prev.map((c) => (c.id === '2' ? { ...c, text: allTexts } : c))); }} className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors flex-shrink-0" title="Remove text line">×</button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setCard2Texts([...card2Texts, { text: '', color: '#000000' }])} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 border-dashed rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm transition-colors">+ Add Text Line</button>
                  </div>
                </div>
              )}

              {/* Content Cards section */}
              <div className="flex-shrink-0 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Content Cards</h3>
                <div className="space-y-3">
                  {canvases.filter((c) => c.id !== '1' && c.id !== '2' && c.id !== 'end').map((canvas, index) => {
                    const cardNumber = index + 3;
                    return (
                      <div key={canvas.id} className="flex gap-3 items-center">
                        <input type="text" value={canvas.text} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === canvas.id ? { ...c, text: e.target.value } : c)))} placeholder={`Card ${cardNumber} text...`} className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm" />
                        <input type="color" value={canvas.textColor} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === canvas.id ? { ...c, textColor: e.target.value } : c)))} className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0" title={`Card ${cardNumber} text color`} />
                        {canvases.filter((c) => c.id !== '1' && c.id !== '2' && c.id !== 'end').length > 1 && (
                          <button onClick={(e) => onDeleteCanvas(canvas.id, e)} className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors flex-shrink-0" title="Remove card">×</button>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={onAddCanvas} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 border-dashed rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm transition-colors">+ Add Card</button>
                </div>
              </div>

              {/* Ending Card section */}
              {canvases.find((c) => c.id === 'end') && (
                <div className="flex-shrink-0 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Ending Card</h3>
                  <div className="flex gap-3 items-center">
                    <input type="text" value={canvases.find((c) => c.id === 'end')?.text || ''} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === 'end' ? { ...c, text: e.target.value } : c)))} placeholder="Enter ending card text..." className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm" />
                    <input type="color" value={canvases.find((c) => c.id === 'end')?.textColor || '#FFFFFF'} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === 'end' ? { ...c, textColor: e.target.value } : c)))} className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0" title="Ending card text color" />
                  </div>
                </div>
              )}
            </>
          )}

          {userInfo && (
            <>
              <div className="space-y-3 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Post Settings (Required for TikTok)</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                    <input type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Enter post title" maxLength={90} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-sm" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{postTitle.length}/90 characters</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Privacy Status <span className="text-red-500">*</span></label>
                    <select value={postPrivacy} onChange={(e) => setPostPrivacy(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-sm">
                      <option value="">Select privacy status</option>
                      {(creatorInfo?.privacy_level_options || ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY']).map((option) => {
                        const isPrivate = option === 'SELF_ONLY';
                        const isDisabled = isPrivate && contentDisclosureEnabled && isBrandedContent;
                        const labelMap: Record<string, string> = { 'PUBLIC_TO_EVERYONE': 'Public', 'MUTUAL_FOLLOW_FRIENDS': 'Friends', 'FOLLOWER_OF_CREATOR': 'Followers', 'SELF_ONLY': 'Only Me (Private)' };
                        const label = labelMap[option] || option.replace(/_/g, ' ');
                        return <option key={option} value={option} disabled={isDisabled}>{label}{isDisabled ? ' (not available for branded content)' : ''}</option>;
                      })}
                    </select>
                    {contentDisclosureEnabled && isBrandedContent && postPrivacy === 'SELF_ONLY' && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Branded content visibility cannot be set to private. Please select a different privacy setting.</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Interaction Settings</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={allowComment} onChange={(e) => setAllowComment(e.target.checked)} disabled={creatorInfo?.comment_disabled === true} className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-[#3B82F6] focus:ring-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed" />
                        <span className={`text-sm ${creatorInfo?.comment_disabled === true ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300'}`}>Allow Comment{creatorInfo?.comment_disabled === true && <span className="ml-1 text-xs">(disabled in your TikTok settings)</span>}</span>
                      </label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">Note: Duet and Stitch are not available for photo posts</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Content Disclosure</label>
                      <button type="button" onClick={() => { setContentDisclosureEnabled(!contentDisclosureEnabled); if (contentDisclosureEnabled) { setIsYourBrand(false); setIsBrandedContent(false); } }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${contentDisclosureEnabled ? 'bg-[#3B82F6]' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${contentDisclosureEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Indicate if this content promotes yourself, a brand, product or service</p>
                    {contentDisclosureEnabled && (
                      <div className="space-y-2 pl-1 border-l-2 border-zinc-200 dark:border-zinc-700 ml-1">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" checked={isYourBrand} onChange={(e) => setIsYourBrand(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-[#3B82F6] focus:ring-[#3B82F6]" />
                          <div><span className="text-sm text-zinc-700 dark:text-zinc-300">Your brand</span><p className="text-xs text-zinc-500 dark:text-zinc-400">You are promoting yourself or your own business</p></div>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" checked={isBrandedContent} onChange={(e) => { const isChecked = e.target.checked; setIsBrandedContent(isChecked); if (isChecked && postPrivacy === 'SELF_ONLY') setPostPrivacy(''); }} className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-[#3B82F6] focus:ring-[#3B82F6]" />
                          <div><span className="text-sm text-zinc-700 dark:text-zinc-300">Branded content</span><p className="text-xs text-zinc-500 dark:text-zinc-400">You are promoting another brand or a third party</p>{isBrandedContent && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 italic">Note: Branded content can only be set to public or friends visibility</p>}</div>
                        </label>
                        {(isYourBrand || isBrandedContent) && <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md"><p className="text-xs text-zinc-600 dark:text-zinc-400">{isBrandedContent ? "Your photo/video will be labeled as 'Paid partnership'" : "Your photo/video will be labeled as 'Promotional content'"}</p></div>}
                        {!isYourBrand && !isBrandedContent && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Please select at least one option to proceed with publishing</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Posting to TikTok as:</span>
                  <span className="font-semibold text-black dark:text-zinc-50">{userInfo.display_name || 'User'}</span>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={musicUsageConsent} onChange={(e) => setMusicUsageConsent(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-[#3B82F6] focus:ring-[#3B82F6]" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {contentDisclosureEnabled && isBrandedContent ? (
                      <>By posting, you agree to TikTok&apos;s <a href="https://www.tiktok.com/legal/branded-content-policy" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">Branded Content Policy</a> and <a href="https://www.tiktok.com/legal/music-usage-confirmation" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">Music Usage Confirmation</a></>
                    ) : (
                      <>By posting, you agree to TikTok&apos;s <a href="https://www.tiktok.com/legal/music-usage-confirmation" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">Music Usage Confirmation</a></>
                    )}
                  </span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
