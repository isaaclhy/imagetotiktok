'use client';

import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import type { CanvasData } from '@/app/lib/types';
import { generateCardImage as generateCardImageLib } from '@/app/lib/generate-card-image';
import { Sidebar } from '@/app/components/Sidebar';
import { ActionBar } from '@/app/components/ActionBar';
import { InputsCard } from '@/app/components/InputsCard';
import { PreviewPanel } from '@/app/components/PreviewPanel';
import { DownloadModal } from '@/app/components/DownloadModal';
import { Toast } from '@/app/components/Toast';

const INITIAL_CANVASES: CanvasData[] = [
  { id: '1', text: '', backgroundColor: '#000000', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' },
  { id: '2', text: '', backgroundColor: '#000000', textColor: '#876e9f', textSize: '200', imageSize: '1080x1920' },
  { id: '3', text: '', backgroundColor: '#000000', textColor: '#876e9f', textSize: '200', imageSize: '1080x1920' },
  { id: 'end', text: '', backgroundColor: '#000000', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' },
];

export default function Home() {
  const [canvases, setCanvases] = useState<CanvasData[]>(INITIAL_CANVASES);
  const [currentCanvasId, setCurrentCanvasId] = useState<string>('1');
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState('200');
  const [imageSize, setImageSize] = useState('1080x1920');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [userInfo, setUserInfo] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [postStatus, setPostStatus] = useState<'processing' | 'success' | 'failed' | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postPrivacy, setPostPrivacy] = useState<string>('');
  const [allowComment, setAllowComment] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<{
    privacy_level_options?: string[];
    comment_disabled?: boolean;
    duet_disabled?: boolean;
    stitch_disabled?: boolean;
    max_video_post_duration_sec?: number;
  } | null>(null);
  const [musicUsageConsent, setMusicUsageConsent] = useState(false);
  const [contentDisclosureEnabled, setContentDisclosureEnabled] = useState(false);
  const [isYourBrand, setIsYourBrand] = useState(false);
  const [isBrandedContent, setIsBrandedContent] = useState(false);
  const [card2Texts, setCard2Texts] = useState<Array<{ text: string; color: string }>>([{ text: '', color: '#876e9f' }]);
  const [levelName, setLevelName] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [mode, setMode] = useState<'plain' | 'video'>('plain');
  const [contentTab, setContentTab] = useState<'image' | 'video'>('image');
  const [videoBackgroundUrl, setVideoBackgroundUrl] = useState<string | null>(null);
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isUpdatingFromUserInput = useRef(false);
  const isSyncingFromCanvas = useRef(false);

  const currentCanvas = canvases.find((c) => c.id === currentCanvasId) || canvases[0];
  const firstCard = canvases.find((c) => c.id === '1') || canvases[0];
  const firstCardTextValue = canvases.find((c) => c.id === '1')?.text || '';
  const prevFirstCardTextRef = useRef(firstCardTextValue);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mode !== 'video') {
      setVideoBackgroundUrl(null);
      setVideoThumbnailUrl(null);
      return;
    }
    let cancelled = false;
    setVideoLoading(true);
    const page = 1 + Math.floor(Math.random() * 20);
    fetch(`/api/pexels/video?query=${encodeURIComponent(theme || 'couple in nature')}&page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setVideoBackgroundUrl(null);
          setVideoThumbnailUrl(null);
          return;
        }
        setVideoBackgroundUrl(data.videoUrl ?? null);
        setVideoThumbnailUrl(data.thumbnailUrl ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setVideoBackgroundUrl(null);
          setVideoThumbnailUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) setVideoLoading(false);
      });
    return () => { cancelled = true; };
  }, [mode, theme]);

  const handleChangeVideo = async () => {
    if (mode !== 'video') return;
    const page = 1 + Math.floor(Math.random() * 20);
    setVideoLoading(true);
    try {
      const r = await fetch(`/api/pexels/video?query=${encodeURIComponent(theme || 'couple in nature')}&page=${page}`);
      const data = await r.json();
      if (data.error) {
        setVideoBackgroundUrl(null);
        setVideoThumbnailUrl(null);
        return;
      }
      setVideoBackgroundUrl(data.videoUrl ?? null);
      setVideoThumbnailUrl(data.thumbnailUrl ?? null);
    } catch {
      setVideoBackgroundUrl(null);
      setVideoThumbnailUrl(null);
    } finally {
      setVideoLoading(false);
    }
  };

  useEffect(() => {
    if (isUpdatingFromUserInput.current) {
      isUpdatingFromUserInput.current = false;
      prevFirstCardTextRef.current = firstCardTextValue;
      return;
    }
    if (firstCardTextValue !== prevFirstCardTextRef.current && firstCardTextValue !== text) {
      setText(firstCardTextValue);
    }
    prevFirstCardTextRef.current = firstCardTextValue;
  }, [firstCardTextValue]);

  useEffect(() => {
    const canvas = canvases.find((c) => c.id === currentCanvasId) || canvases[0];
    if (!canvas) return;
    isSyncingFromCanvas.current = true;
    if (canvas.backgroundColor !== backgroundColor) setBackgroundColor(canvas.backgroundColor);
    if (canvas.textColor !== textColor) setTextColor(canvas.textColor);
    if (canvas.textSize !== textSize) setTextSize(canvas.textSize);
    if (canvas.imageSize !== imageSize) setImageSize(canvas.imageSize);
    setTimeout(() => { isSyncingFromCanvas.current = false; }, 0);
  }, [currentCanvasId, canvases]);

  useEffect(() => {
    const firstCardInCanvases = canvases.find((c) => c.id === '1');
    if (firstCardInCanvases && firstCardInCanvases.text !== text) {
      isUpdatingFromUserInput.current = true;
      setCanvases((prev) => prev.map((c) => (c.id === '1' ? { ...c, text } : c)));
    }
  }, [text]);

  useEffect(() => {
    if (isSyncingFromCanvas.current) return;
    setCanvases((prev) => {
      const currentCanvasInPrev = prev.find((c) => c.id === currentCanvasId);
      if (!currentCanvasInPrev) return prev;
      const hasChanges =
        currentCanvasInPrev.backgroundColor !== backgroundColor ||
        currentCanvasInPrev.textSize !== textSize ||
        currentCanvasInPrev.imageSize !== imageSize ||
        (currentCanvasId === '1' && currentCanvasInPrev.textColor !== textColor);
      if (!hasChanges) return prev;
      return prev.map((c) =>
        c.id === currentCanvasId
          ? { ...c, backgroundColor, textSize, imageSize, ...(currentCanvasId === '1' ? { textColor } : {}) }
          : c
      );
    });
  }, [backgroundColor, textColor, textSize, imageSize, currentCanvasId]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authCheck = await fetch('/api/tiktok/auth-check');
        const authData = await authCheck.json();
        if (authData.authenticated && authData.user) {
          setUserInfo(authData.user);
          try {
            const creatorInfoRes = await fetch('/api/tiktok/creator-info');
            const creatorInfoData = await creatorInfoRes.json();
            if (creatorInfoRes.ok && creatorInfoData.creator_info) setCreatorInfo(creatorInfoData.creator_info);
          } catch (err) {
            console.error('Failed to fetch creator info:', err);
          }
        } else {
          setUserInfo(null);
          setCreatorInfo(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tiktok_auth') === 'success') {
      checkAuth();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleAddCanvas = () => {
    const newId = String(Date.now());
    const newCanvas: CanvasData = { id: newId, text: text || '', backgroundColor: backgroundColor || '#000000', textColor: textColor || '#876e9f', textSize: textSize || '200', imageSize: imageSize || '1080x1920' };
    const endingCardIndex = canvases.findIndex((c) => c.id === 'end');
    if (endingCardIndex >= 0) {
      const newCanvases = [...canvases];
      newCanvases.splice(endingCardIndex, 0, newCanvas);
      setCanvases(newCanvases);
    } else {
      setCanvases([...canvases, newCanvas]);
    }
    setCurrentCanvasId(newId);
  };

  const handleSelectCanvas = (id: string) => setCurrentCanvasId(id);

  const handleDeleteCanvas = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === '1' || id === '2' || id === 'end' || canvases.length <= 3) return;
    const newCanvases = canvases.filter((c) => c.id !== id);
    setCanvases(newCanvases);
    if (id === currentCanvasId) setCurrentCanvasId(newCanvases[0].id);
  };

  const generateCardImage = async (canvasData: CanvasData): Promise<Blob> =>
    generateCardImageLib({ canvasData, mode, videoThumbnailUrl, card2Texts });

  const handleAutoGenerate = async () => {
    setIsAutoGenerating(true);
    try {
      const response = await fetch('/api/levels/random');
      if (!response.ok) throw new Error('Failed to fetch random level');
      const result = await response.json();
      if (!result.success || !result.data) throw new Error('Invalid response from API');
      const { levelName: ln, categoryName, instructions, questions } = result.data;
      const themeContextParts: string[] = [];
      if (categoryName) themeContextParts.push(`Category: ${categoryName}`);
      const first3 = Array.isArray(questions) ? questions.slice(0, 3) : [];
      if (first3.length) {
        themeContextParts.push('Questions:');
        first3.forEach((q: string) => themeContextParts.push(`- ${q}`));
      }
      const themeContext = themeContextParts.join('\n\n');
      let themeText = 'couple in nature';
      try {
        const themeRes = await fetch('/api/openai/theme', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: themeContext }) });
        const themeData = await themeRes.json();
        if (themeRes.ok && themeData?.theme?.trim()) themeText = themeData.theme.trim();
      } catch {}
      setTheme(themeText);
      setMode('video');
      setLevelName(ln || '');
      const contextParts: string[] = [];
      if (ln) contextParts.push(`Level: ${ln}`);
      if (categoryName) contextParts.push(`Category: ${categoryName}`);
      if (Array.isArray(questions) && questions.length) {
        contextParts.push('Questions:');
        questions.forEach((q: string) => contextParts.push(`- ${q}`));
      }
      const context = contextParts.join('\n\n');
      let titleText = categoryName || '';
      try {
        const titleRes = await fetch('/api/openai/title', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context }) });
        const titleData = await titleRes.json();
        if (titleRes.ok && titleData?.title?.trim()) titleText = titleData.title.trim();
      } catch {}
      setText(titleText);
      const instructionsForCard2 = instructions && instructions.length > 0 ? instructions.map((inst: string) => ({ text: inst, color: '#876e9f' })) : [{ text: '', color: '#876e9f' }];
      setCard2Texts(instructionsForCard2);
      const questionCards: CanvasData[] = (questions || []).map((q: string) => ({
        id: String(Date.now() + Math.random()),
        text: q,
        backgroundColor: backgroundColor || '#000000',
        textColor: '#876e9f',
        textSize: textSize || '200',
        imageSize: imageSize || '1080x1920',
      }));
      const existingCard1 = canvases.find((c) => c.id === '1') || canvases[0];
      const existingCard2 = canvases.find((c) => c.id === '2') || canvases[1];
      const endingCard = canvases.find((c) => c.id === 'end');
      let endingCardText = '';
      if (ln && ln.toLowerCase() === 'friends') endingCardText = 'Share it with your friends and see what they say';
      else if (ln && ln.toLowerCase() === 'couples') endingCardText = 'Share it with your boo and see what they say';
      const newCanvases: CanvasData[] = [
        { ...existingCard1, text: titleText },
        { ...existingCard2, text: instructionsForCard2.map((t: { text: string; color: string }) => t.text).join('\n') },
        ...questionCards,
        endingCard || { id: 'end', text: endingCardText, backgroundColor: '#000000', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' },
      ];
      const endIdx = newCanvases.findIndex((c) => c.id === 'end');
      if (endIdx >= 0) newCanvases[endIdx].text = endingCardText;
      setCanvases(newCanvases);
      setCurrentCanvasId('1');
    } catch (error) {
      console.error('Error auto-generating cards:', error);
      alert('Failed to generate cards. Please try again.');
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const imageBlobs: Array<{ blob: Blob; filename: string }> = [];
      for (let i = 0; i < canvases.length; i++) {
        const blob = await generateCardImage(canvases[i]);
        imageBlobs.push({ blob, filename: `tiktok-image-card-${i + 1}.png` });
      }
      const zip = new JSZip();
      imageBlobs.forEach(({ blob, filename }) => zip.file(filename, blob));
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bleameis-cards.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostToTikTok = async () => {
    const canvasText = currentCanvas.text || text;
    if (!canvasText.trim()) { alert('Please enter some text'); return; }
    if (!userInfo) { alert('Please connect your TikTok account first'); return; }
    if (!postTitle.trim()) { alert('Please enter a title for your post'); return; }
    if (!postPrivacy) { alert('Please select a privacy status for your post'); return; }
    if (!musicUsageConsent) {
      alert(contentDisclosureEnabled && isBrandedContent ? "Please agree to TikTok's Branded Content Policy and Music Usage Confirmation before posting" : "Please agree to TikTok's Music Usage Confirmation before posting");
      return;
    }
    if (contentDisclosureEnabled && !isYourBrand && !isBrandedContent) {
      alert('You need to indicate if your content promotes yourself, a third party, or both.');
      return;
    }
    if (contentDisclosureEnabled && isBrandedContent && postPrivacy === 'SELF_ONLY') {
      alert('Branded content visibility cannot be set to private. Please select public or friends visibility.');
      return;
    }
    setIsPosting(true);
    try {
      setShowUserDropdown(false);
      const currentIndex = canvases.findIndex((c) => c.id === currentCanvasId);
      const imageBlob = await generateCardImage(currentCanvas);
      const formData = new FormData();
      formData.append('image', imageBlob, 'card.png');
      formData.append('caption', postTitle);
      formData.append('privacy_level', postPrivacy);
      formData.append('disable_comment', (!allowComment).toString());
      if (contentDisclosureEnabled) {
        formData.append('brand_organic_toggle', isYourBrand.toString());
        formData.append('brand_content_toggle', isBrandedContent.toString());
      }
      const response = await fetch('/api/tiktok/post-photo', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        if (data.rateLimited || response.status === 429) {
          alert(data.error || 'You cannot make more posts at this moment. Please try again later.');
          return;
        }
        if (data.requiresReauth) {
          alert('Please reconnect your TikTok account to grant photo upload permissions.');
          window.location.href = '/api/tiktok/auth';
          return;
        }
        throw new Error(data.error || 'Failed to post to TikTok');
      }
      const currentPublishId = data.data?.publish_id;
      if (currentPublishId) setPublishId(currentPublishId);
      setPostStatus('processing');
      setToastMessage('Your content is being processed. It may take a few minutes to appear on your profile.');
      setShowToast(true);
      if (currentPublishId) pollPostStatus(currentPublishId);
      else {
        setTimeout(() => { setPostStatus('success'); setToastMessage('Posted successfully! It may take a few minutes to appear on your profile.'); }, 2000);
        setTimeout(() => { setShowToast(false); setPostStatus(null); }, 8000);
      }
    } catch (error: unknown) {
      console.error('Error posting to TikTok:', error);
      alert(error instanceof Error ? error.message : 'Failed to post to TikTok. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const pollPostStatus = async (pubId: string) => {
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 3000;
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/tiktok/post-status?publish_id=${encodeURIComponent(pubId)}`);
        const statusData = await response.json();
        if (response.ok && statusData.status) {
          if (statusData.status === 'PUBLISH_COMPLETE') {
            setPostStatus('success');
            setToastMessage('Posted successfully! Your content is now visible on your profile.');
            setTimeout(() => { setShowToast(false); setPostStatus(null); setPublishId(null); }, 5000);
            return;
          }
          if (statusData.status === 'FAILED') {
            setPostStatus('failed');
            setToastMessage(statusData.fail_reason || 'Post failed. Please try again.');
            setTimeout(() => { setShowToast(false); setPostStatus(null); setPublishId(null); }, 8000);
            return;
          }
          setToastMessage(`Processing... ${statusData.status_msg || 'Your content is being processed.'}`);
        }
        attempts++;
        if (attempts < maxAttempts) setTimeout(checkStatus, pollInterval);
        else {
          setPostStatus('success');
          setToastMessage('Your content has been submitted. It may take a few minutes to appear on your profile.');
          setTimeout(() => { setShowToast(false); setPostStatus(null); setPublishId(null); }, 5000);
        }
      } catch {
        setPostStatus('success');
        setToastMessage('Your content has been submitted. It may take a few minutes to appear on your profile.');
        setTimeout(() => { setShowToast(false); setPostStatus(null); setPublishId(null); }, 5000);
      }
    };
    setTimeout(checkStatus, pollInterval);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/tiktok/logout', { method: 'POST' });
      setUserInfo(null);
      setShowUserDropdown(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const canPost =
    !!currentCanvas.text.trim() &&
    !!userInfo &&
    !!postTitle.trim() &&
    !!postPrivacy &&
    musicUsageConsent &&
    !(contentDisclosureEnabled && !isYourBrand && !isBrandedContent) &&
    !(contentDisclosureEnabled && isBrandedContent && postPrivacy === 'SELF_ONLY');

  return (
    <div className="h-screen overflow-hidden bg-zinc-50 font-sans dark:bg-black flex">
      <Sidebar
        contentTab={contentTab}
        onContentTabChange={setContentTab}
        userInfo={userInfo}
        showUserDropdown={showUserDropdown}
        setShowUserDropdown={setShowUserDropdown}
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen ml-56 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
          <ActionBar
            onAutoGenerate={handleAutoGenerate}
            onDownload={() => setShowDownloadModal(true)}
            onPost={handlePostToTikTok}
            isAutoGenerating={isAutoGenerating}
            isGenerating={isGenerating}
            isPosting={isPosting}
            canDownload={!!currentCanvas.text.trim()}
            canPost={canPost}
            contentDisclosureEnabled={contentDisclosureEnabled}
            isYourBrand={isYourBrand}
            isBrandedContent={isBrandedContent}
            postPrivacy={postPrivacy}
          />
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 flex-1 min-h-0 px-3 pb-3 pt-0 overflow-hidden">
            <InputsCard
              contentTab={contentTab}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              theme={theme}
              setTheme={setTheme}
              mode={mode}
              setMode={setMode}
              videoLoading={videoLoading}
              onChangeVideo={handleChangeVideo}
              text={text}
              setText={setText}
              firstCard={firstCard}
              canvases={canvases}
              setCanvases={setCanvases}
              card2Texts={card2Texts}
              setCard2Texts={setCard2Texts}
              textSize={textSize}
              setTextSize={setTextSize}
              imageSize={imageSize}
              setImageSize={setImageSize}
              onAddCanvas={handleAddCanvas}
              onDeleteCanvas={handleDeleteCanvas}
              userInfo={userInfo}
              postTitle={postTitle}
              setPostTitle={setPostTitle}
              postPrivacy={postPrivacy}
              setPostPrivacy={setPostPrivacy}
              creatorInfo={creatorInfo}
              allowComment={allowComment}
              setAllowComment={setAllowComment}
              contentDisclosureEnabled={contentDisclosureEnabled}
              setContentDisclosureEnabled={setContentDisclosureEnabled}
              isYourBrand={isYourBrand}
              setIsYourBrand={setIsYourBrand}
              isBrandedContent={isBrandedContent}
              setIsBrandedContent={setIsBrandedContent}
              musicUsageConsent={musicUsageConsent}
              setMusicUsageConsent={setMusicUsageConsent}
            />
            <PreviewPanel
              canvases={canvases}
              currentCanvasId={currentCanvasId}
              currentCanvas={currentCanvas}
              firstCard={firstCard}
              onSelectCanvas={handleSelectCanvas}
              onAddCanvas={handleAddCanvas}
              onDeleteCanvas={handleDeleteCanvas}
              backgroundColor={backgroundColor}
              imageSize={imageSize}
              textSize={textSize}
              mode={mode}
              videoBackgroundUrl={videoBackgroundUrl}
              videoThumbnailUrl={videoThumbnailUrl}
              card2Texts={card2Texts}
              mounted={mounted}
            />
          </div>
        </div>
      </div>
      <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} onConfirm={handleGenerate} isGenerating={isGenerating} />
      {showToast && <Toast message={toastMessage} status={postStatus} onClose={() => { setShowToast(false); setPostStatus(null); setPublishId(null); }} />}
    </div>
  );
}
