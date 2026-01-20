'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

interface CanvasData {
  id: string;
  text: string;
  backgroundColor: string;
  textColor: string;
  textSize: string;
  imageSize: string;
}

export default function Home() {
  const [canvases, setCanvases] = useState<CanvasData[]>([
    { id: '1', text: '', backgroundColor: '#cfa9f5', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' },
    { id: '2', text: '', backgroundColor: '#cfa9f5', textColor: '#876e9f', textSize: '200', imageSize: '1080x1920' },
    { id: '3', text: '', backgroundColor: '#cfa9f5', textColor: '#876e9f', textSize: '200', imageSize: '1080x1920' }
  ]);
  const [currentCanvasId, setCurrentCanvasId] = useState<string>('1');
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#cfa9f5');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState('200');
  const [imageSize, setImageSize] = useState('1080x1920');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [userInfo, setUserInfo] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [instructions, setInstructions] = useState<Array<{ text: string; color: string }>>([
    { text: '', color: '#876e9f' }
  ]);
  const [card2Instructions, setCard2Instructions] = useState<Array<{ text: string; color: string }>>([
    { text: '', color: '#876e9f' }
  ]);
  const [card2Texts, setCard2Texts] = useState<Array<{ text: string; color: string }>>([
    { text: '', color: '#876e9f' }
  ]);

  // Use ref to track if we're updating from user input to prevent infinite loops
  const isUpdatingFromUserInput = useRef(false);

  // Get current canvas
  const currentCanvas = canvases.find(c => c.id === currentCanvasId) || canvases[0];
  
  // Get first card
  const firstCard = canvases.find(c => c.id === '1') || canvases[0];

  // Update text input to always show first card's text (Title)
  // Only sync when first card's text changes externally (not from user typing)
  const firstCardTextValue = canvases.find(c => c.id === '1')?.text || '';
  const prevFirstCardTextRef = useRef(firstCardTextValue);
  
  useEffect(() => {
    // Skip if we just updated from user input
    if (isUpdatingFromUserInput.current) {
      isUpdatingFromUserInput.current = false;
      prevFirstCardTextRef.current = firstCardTextValue;
      return;
    }
    // Only sync if the canvas text actually changed (from external source)
    if (firstCardTextValue !== prevFirstCardTextRef.current && firstCardTextValue !== text) {
      setText(firstCardTextValue);
    }
    prevFirstCardTextRef.current = firstCardTextValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstCardTextValue]);

  // Update other inputs when canvas changes (except text, which always shows first card)
  useEffect(() => {
    const canvas = canvases.find(c => c.id === currentCanvasId) || canvases[0];
    if (!canvas) return;
    
    // Only update if values actually changed to prevent infinite loops
    if (canvas.backgroundColor !== backgroundColor) {
      setBackgroundColor(canvas.backgroundColor);
    }
    // For card 1, sync textColor state with card 1's textColor (title color)
    // For other cards, sync textColor state with current card's textColor
    if (canvas.textColor !== textColor) {
      setTextColor(canvas.textColor);
    }
    if (canvas.textSize !== textSize) {
      setTextSize(canvas.textSize);
    }
    if (canvas.imageSize !== imageSize) {
      setImageSize(canvas.imageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCanvasId, canvases]);

  // Save title to first card when text changes
  useEffect(() => {
    const firstCardInCanvases = canvases.find(c => c.id === '1');
    // Only update if text actually changed to prevent unnecessary updates
    if (firstCardInCanvases && firstCardInCanvases.text !== text) {
      isUpdatingFromUserInput.current = true;
      setCanvases(prev => prev.map(c => 
        c.id === '1' 
          ? { ...c, text }
          : c
      ));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Save other inputs to current canvas when they change
  useEffect(() => {
    setCanvases(prev => {
      const currentCanvasInPrev = prev.find(c => c.id === currentCanvasId);
      if (!currentCanvasInPrev) return prev;
      
      // Only update if values actually changed to prevent infinite loops
      const hasChanges = 
        currentCanvasInPrev.backgroundColor !== backgroundColor ||
        currentCanvasInPrev.textSize !== textSize ||
        currentCanvasInPrev.imageSize !== imageSize ||
        (currentCanvasId === '1' && currentCanvasInPrev.textColor !== textColor);
      
      if (!hasChanges) return prev;
      
      return prev.map(c => 
        c.id === currentCanvasId 
          ? { 
              ...c, 
              backgroundColor, 
              textSize, 
              imageSize,
              // Only update textColor if it's the first card (managed by title color picker)
              ...(currentCanvasId === '1' ? { textColor } : {})
            }
          : c
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundColor, textColor, textSize, imageSize, currentCanvasId]);

  // Check authentication status on mount and after auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authCheck = await fetch('/api/tiktok/auth-check');
        const authData = await authCheck.json();
        
        if (authData.authenticated && authData.user) {
          setUserInfo(authData.user);
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();

    // Check URL params for auth success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tiktok_auth') === 'success') {
      checkAuth();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleAddCanvas = () => {
    const newId = String(Date.now());
    const newCanvas: CanvasData = {
      id: newId,
      text: text || '',
      backgroundColor: backgroundColor || '#cfa9f5',
      textColor: textColor || '#876e9f',
      textSize: textSize || '200',
      imageSize: imageSize || '1080x1920'
    };
    setCanvases([...canvases, newCanvas]);
    setCurrentCanvasId(newId);
  };

  const handleSelectCanvas = (id: string) => {
    setCurrentCanvasId(id);
  };

  const handleDeleteCanvas = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't delete card 1, card 2, or if it would leave less than 3 cards total
    if (id === '1' || id === '2' || canvases.length <= 3) return;
    
    const newCanvases = canvases.filter(c => c.id !== id);
    setCanvases(newCanvases);
    
    if (id === currentCanvasId) {
      setCurrentCanvasId(newCanvases[0].id);
    }
  };

  const generateCardImage = (canvasData: CanvasData, index: number): Promise<void> => {
    return new Promise((resolve) => {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve();
        return;
      }

      // Parse image size
      const [widthStr, heightStr] = (canvasData.imageSize || '1080x1920').split('x').map(s => s.trim());
      const width = parseInt(widthStr) || 1080;
      const height = parseInt(heightStr) || 1920;
      canvas.width = width;
      canvas.height = height;

      // Fill background
      ctx.fillStyle = canvasData.backgroundColor || '#cfa9f5';
      ctx.fillRect(0, 0, width, height);

      const aspectRatio = width / height;
      // Match CSS behavior: width: 75%, aspectRatio, maxHeight: 65%
      // First try width = 75%, then constrain by maxHeight if needed
      let finalCardWidth = width * 0.75;
      let finalCardHeight = finalCardWidth / aspectRatio;
      const cardMaxHeight = height * 0.65;
      
      // If height exceeds maxHeight, constrain by height and recalculate width
      if (finalCardHeight > cardMaxHeight) {
        finalCardHeight = cardMaxHeight;
        finalCardWidth = finalCardHeight * aspectRatio;
      }
      
      const cardX = (width - finalCardWidth) / 2;
      const cardY = (height - finalCardHeight) / 2;

      // Draw white card for cards 2+
      if (canvasData.id !== '1') {
        const radius = 16;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(cardX + radius, cardY);
        ctx.lineTo(cardX + finalCardWidth - radius, cardY);
        ctx.quadraticCurveTo(cardX + finalCardWidth, cardY, cardX + finalCardWidth, cardY + radius);
        ctx.lineTo(cardX + finalCardWidth, cardY + finalCardHeight - radius);
        ctx.quadraticCurveTo(cardX + finalCardWidth, cardY + finalCardHeight, cardX + finalCardWidth - radius, cardY + finalCardHeight);
        ctx.lineTo(cardX + radius, cardY + finalCardHeight);
        ctx.quadraticCurveTo(cardX, cardY + finalCardHeight, cardX, cardY + finalCardHeight - radius);
        ctx.lineTo(cardX, cardY + radius);
        ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
        ctx.closePath();
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Configure text styling
      const canvasText = canvasData.id === '1' 
        ? canvasData.text || ''
        : (canvasData.id === '2'
          ? card2Texts.filter(t => t.text.trim()).map(t => t.text).join('\n')
          : canvasData.text || '');
      
      if (canvasData.id === '1') {
        // Card 1: Text directly on background, centered
        ctx.fillStyle = canvasData.textColor || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const maxTextWidth = width * 0.9;
        // Scale font size based on canvas width
        const canvasWidthScale = width / 1080;
        const baseFontSize = parseInt(canvasData.textSize || '200') || 200;
        let fontSize = (baseFontSize * canvasWidthScale) / 3;
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        
        const textMetrics = ctx.measureText(canvasText);
        if (textMetrics.width > maxTextWidth) {
          fontSize = (maxTextWidth / textMetrics.width) * fontSize * 0.9;
          ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        }

        const lines = wrapText(ctx, canvasText, maxTextWidth);
        const lineHeight = fontSize * 1.4;
        const totalHeight = lines.length * lineHeight;
        const startY = (height - totalHeight) / 2 + lineHeight / 2;

        lines.forEach((line, idx) => {
          ctx.fillText(line, width / 2, startY + idx * lineHeight);
        });
      } else if (canvasData.id === '2') {
        // Card 2: Instructions with numbered items
        // Calculate padding: 1rem = 16px, scale with canvas size
        // For 1080px canvas, 1rem = 16px, so scale factor = width / 1080
        const remSize = 16 * (width / 1080);
        const padding = remSize; // 1rem
        const paddingBottom = remSize * 1.25; // 1.25rem
        const textStartY = cardY + finalCardHeight * 0.35;
        const textAreaWidth = finalCardWidth - (padding * 2);
        
        // Scale font size based on canvas width and card size
        // Cards 2+ are inside a white card that's 75% of canvas width
        // Scale font proportionally: (canvasWidth / 1080) * 0.75, then divide by 3
        const canvasWidthScale = width / 1080;
        const baseFontSize = parseInt(canvasData.textSize || '200') || 200;
        // Scale font for card size (75% of canvas) and canvas dimensions, then make 3x smaller
        const fontSize = (baseFontSize * canvasWidthScale * 0.75) / 3;
        
        // Draw "Instructions" text at top
        ctx.fillStyle = canvasData.textColor || '#876e9f';
        ctx.textAlign = 'center';
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        const instructionsText = 'Instructions';
        const textMetrics = ctx.measureText(instructionsText);
        // Position text: top padding + font ascent to match preview (top: 1rem)
        // Using 'top' baseline means Y position is at the top of the text
        ctx.textBaseline = 'top';
        const instructionsY = cardY + padding; // Match paddingTop: '1rem'
        const instructionsX = cardX + finalCardWidth / 2;
        ctx.fillText(instructionsText, instructionsX, instructionsY);
        
        // Draw underline - position relative to text
        ctx.strokeStyle = canvasData.textColor || '#876e9f';
        // Scale line width with canvas size (2px for 1080px canvas)
        const lineWidth = 2 * (width / 1080);
        ctx.lineWidth = lineWidth;
        // Underline should be below the text with some offset (textUnderlineOffset: 0.25rem)
        // Since we're using 'top' baseline, add font height for underline position
        const underlineOffset = remSize * 0.25; // 0.25rem offset
        const underlineY = instructionsY + fontSize + underlineOffset;
        ctx.beginPath();
        ctx.moveTo(instructionsX - textMetrics.width / 2, underlineY);
        ctx.lineTo(instructionsX + textMetrics.width / 2, underlineY);
        ctx.stroke();
        
        // Draw instruction lines
        const instructionTexts = card2Texts.filter(t => t.text.trim());
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top'; // Use top baseline for consistent positioning
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        
        instructionTexts.forEach((textItem, idx) => {
          // textStartY is positioned at 35% from top of card
          const y = textStartY + (idx * fontSize * 1.6);
          const circleRadius = fontSize * 0.4;
          const circleX = cardX + padding;
          // Circle Y should align with text - since we're using 'top' baseline,
          // add half the font size to center the circle vertically with the text
          const circleY = y + (fontSize * 0.5); // Center circle with text
          
          // Draw circle
          ctx.fillStyle = textItem.color || '#876e9f';
          ctx.beginPath();
          ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw number
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${fontSize * 0.6}px system-ui, sans-serif`;
          ctx.fillText(String(idx + 1), circleX, circleY);
          
          // Draw text
          ctx.fillStyle = textItem.color || '#876e9f';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top'; // Use top baseline for consistent positioning
          ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
          const textX = circleX + circleRadius + fontSize * 0.5;
          const textLines = wrapText(ctx, textItem.text, textAreaWidth - (circleRadius * 2 + fontSize * 0.5));
          textLines.forEach((line, lineIdx) => {
            ctx.fillText(line, textX, y + (lineIdx * fontSize * 1.4));
          });
        });
      } else {
        // Content cards: Text inside white card, left-aligned, starting above middle
        // Calculate padding: 0.5rem = 8px, scale with canvas size
        const remSize = 16 * (width / 1080);
        const padding = remSize * 0.5; // 0.5rem
        const textStartY = cardY + finalCardHeight * 0.35;
        const textAreaWidth = finalCardWidth - (padding * 2);
        
        // Scale font size based on canvas width and card size (same as card 2)
        // Cards 3+ are inside a white card that's 75% of canvas width
        const canvasWidthScale = width / 1080;
        const baseFontSize = parseInt(canvasData.textSize || '200') || 200;
        // Scale font for card size (75% of canvas) and canvas dimensions
        const fontSize = baseFontSize * canvasWidthScale * 0.75;
        
        ctx.fillStyle = canvasData.textColor || '#876e9f';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        
        const lines = wrapText(ctx, canvasText, textAreaWidth);
        lines.forEach((line, idx) => {
          ctx.fillText(line, cardX + padding, textStartY + (idx * fontSize * 1.4));
        });
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const cardNumber = index + 1;
          a.download = `tiktok-image-card-${cardNumber}.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        resolve();
      }, 'image/png');
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Generate and download all cards sequentially
    for (let i = 0; i < canvases.length; i++) {
      const canvasData = canvases[i];
      await generateCardImage(canvasData, i);
      // Small delay between downloads to avoid browser blocking multiple downloads
      if (i < canvases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    setIsGenerating(false);
  };

  const handlePostToTikTok = async () => {
    // Use current canvas's text (not the title input, which only affects card 1)
    const canvasText = currentCanvas.text || text;
    
    if (!canvasText.trim()) {
      alert('Please enter some text');
      return;
    }

    setIsPosting(true);
    
    try {
      // Hide dropdown if open
      setShowUserDropdown(false);

      // Dummy version - just show toast without actually posting
      // Simulate a small delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Show success toast
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error posting to TikTok:', error);
      alert(error.message || 'Failed to post to TikTok. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-screen max-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 h-full max-h-screen p-3 overflow-hidden">
          {/* Left Side - Inputs */}
          <div className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg h-full max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex-shrink-0 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-zinc-50 mb-1">
                  Bleamies
                </h1>

              </div>
              {userInfo ? (
                <div className="flex-shrink-0 relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    {userInfo.avatar_url && (
                      <img
                        src={userInfo.avatar_url}
                        alt={userInfo.display_name || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-black dark:text-zinc-50">
                      {userInfo.display_name || 'User'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-black dark:text-zinc-50 transition-transform ${
                        showUserDropdown ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserDropdown(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden">
                        <button
                          onClick={async () => {
                            try {
                              await fetch('/api/tiktok/logout', { method: 'POST' });
                              setUserInfo(null);
                              setShowUserDropdown(false);
                            } catch (error) {
                              console.error('Logout error:', error);
                            }
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => window.location.href = '/api/tiktok/auth'}
                  className="flex-shrink-0 h-10 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  title="Connect TikTok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  <span>TikTok</span>
                </button>
              )}
            </div>

            {/* Color Picker */}
            <div className="flex-shrink-0">
              <label
                htmlFor="color"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Background Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  id="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>

            {/* Title Input (only for first card) */}
            <div className="flex-shrink-0">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Title <span className="text-xs text-zinc-500 dark:text-zinc-400">(First card only)</span>
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  id="title"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter title for the first card..."
                  className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm"
                />
                <input
                  type="color"
                  id="titleTextColor"
                  value={firstCard.textColor}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setCanvases(prev => prev.map(c => 
                      c.id === '1' 
                        ? { ...c, textColor: newColor }
                        : c
                    ));
                  }}
                  className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0"
                  title="Title text color"
                />
              </div>
            </div>

            {/* Second Card Input (Card 2) */}
            {canvases.find(c => c.id === '2') && (
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Second Card
                </label>
                <div className="space-y-3">
                  {card2Texts.map((textItem, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={textItem.text}
                        onChange={(e) => {
                          const newTexts = [...card2Texts];
                          newTexts[index].text = e.target.value;
                          setCard2Texts(newTexts);
                          // Update card 2's text to be all texts joined
                          const allTexts = newTexts.map(t => t.text).filter(t => t.trim()).join('\n');
                          setCanvases(prev => prev.map(c => 
                            c.id === '2' 
                              ? { ...c, text: allTexts }
                              : c
                          ));
                        }}
                        placeholder={`Text line ${index + 1}...`}
                        className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm"
                      />
                      <input
                        type="color"
                        value={textItem.color}
                        onChange={(e) => {
                          const newTexts = [...card2Texts];
                          newTexts[index].color = e.target.value;
                          setCard2Texts(newTexts);
                        }}
                        className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0"
                        title={`Text line ${index + 1} color`}
                      />
                      {card2Texts.length > 1 && (
                        <button
                          onClick={() => {
                            const newTexts = card2Texts.filter((_, i) => i !== index);
                            setCard2Texts(newTexts);
                            // Update card 2's text to be all texts joined
                            const allTexts = newTexts.map(t => t.text).filter(t => t.trim()).join('\n');
                            setCanvases(prev => prev.map(c => 
                              c.id === '2' 
                                ? { ...c, text: allTexts }
                                : c
                            ));
                          }}
                          className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
                          title="Remove text line"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newTexts = [...card2Texts, { text: '', color: '#876e9f' }];
                      setCard2Texts(newTexts);
                    }}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 border-dashed rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm transition-colors"
                  >
                    + Add Text Line
                  </button>
                </div>
              </div>
            )}

            {/* Card Text Rows (for cards 3+) */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Card Content
              </label>
              <div className="space-y-3">
                {canvases
                  .filter(c => c.id !== '1' && c.id !== '2')
                  .map((canvas, index) => {
                    // Calculate card number (starting from 3, since card 1 is title and card 2 is separate)
                    const cardNumber = index + 3;
                    return (
                      <div key={canvas.id} className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={canvas.text}
                          onChange={(e) => {
                            const newText = e.target.value;
                            setCanvases(prev => prev.map(c => 
                              c.id === canvas.id 
                                ? { ...c, text: newText }
                                : c
                            ));
                          }}
                          placeholder={`Card ${cardNumber} text...`}
                          className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm"
                        />
                        <input
                          type="color"
                          value={canvas.textColor}
                          onChange={(e) => {
                            const newColor = e.target.value;
                            setCanvases(prev => prev.map(c => 
                              c.id === canvas.id 
                                ? { ...c, textColor: newColor }
                                : c
                            ));
                          }}
                          className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0"
                          title={`Card ${cardNumber} text color`}
                        />
                        {canvases.length > 3 && (
                          <button
                            onClick={(e) => handleDeleteCanvas(canvas.id, e)}
                            className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
                            title="Remove card"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                <button
                  onClick={handleAddCanvas}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 border-dashed rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm transition-colors"
                >
                  + Add Card
                </button>
              </div>
            </div>

            {/* Text Size */}
            <div className="flex-shrink-0">
              <label
                htmlFor="textSize"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Text Size
              </label>
              <input
                type="number"
                id="textSize"
                value={textSize}
                onChange={(e) => setTextSize(e.target.value)}
                placeholder="200"
                min="10"
                max="500"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Font size in pixels (default: 200)
              </p>
            </div>

            {/* Image Size */}
            <div className="flex-shrink-0">
              <label
                htmlFor="imageSize"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Image Size (Width x Height)
              </label>
              <input
                type="text"
                id="imageSize"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                placeholder="1080x1920"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Format: width x height (e.g., 1080x1920)
              </p>
            </div>

            {/* Download and Post Buttons */}
            <div className="mt-auto flex-shrink-0 flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !currentCanvas.text.trim()}
                className="flex-1 h-12 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </>
                )}
              </button>
              <button
                onClick={handlePostToTikTok}
                disabled={isPosting || !currentCanvas.text.trim() || !userInfo}
                className="flex-1 h-12 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPosting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Posting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                    Post
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="flex flex-col p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg h-full max-h-screen overflow-hidden">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex-shrink-0">
              Preview
            </label>
            <div className="flex-1 flex items-center justify-center min-h-0 mb-3 p-2 w-full overflow-hidden" style={{ position: 'relative', contain: 'layout style paint' }}>
              {useMemo(() => {
                const [widthStr, heightStr] = (imageSize || '1080x1920').split('x').map(s => s.trim());
                const width = parseInt(widthStr) || 1080;
                const height = parseInt(heightStr) || 1920;
                // Use current canvas's textSize, not the state variable
                const fontSize = parseInt(currentCanvas.textSize || textSize) || 200;
                // Scale font size for preview - use a fixed scale factor so changes are visible
                // This makes the preview roughly 8% of actual size, so 80px → ~6.4px, 800px → ~64px
                const previewFontSize = fontSize * 0.08;
                
                const aspectRatio = width / height;
                const isFirstCanvas = currentCanvasId === '1';
                
                return (
                  <div
                    className="rounded-lg border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-3 relative overflow-hidden"
                    style={{ 
                      backgroundColor,
                      aspectRatio: `${width} / ${height}`,
                      height: '100%',
                      width: 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      contain: 'layout style paint',
                      willChange: 'contents'
                    }}
                  >
                    {isFirstCanvas ? (
                      // First canvas - no white card, text directly on background
                      <p
                        className="font-bold text-center break-words px-2 overflow-hidden"
                        style={{
                          color: firstCard.textColor,
                          width: '100%',
                          maxWidth: '95%',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          fontSize: `${previewFontSize}px`,
                          lineHeight: '1.4',
                          minHeight: '1em',
                          maxHeight: '100%',
                          contain: 'layout style paint',
                          willChange: 'auto'
                        }}
                      >
                        {currentCanvas.text || 'Your text will appear here'}
                      </p>
                    ) : (
                      // Subsequent canvases - white card in the middle
                      <div 
                        className="absolute inset-0 flex items-center justify-center p-4"
                        style={{ pointerEvents: 'none', contain: 'layout style paint' }}
                      >
                        <div
                          className="bg-white rounded-2xl border-4 border-gray-300 shadow-lg flex flex-col items-start justify-start overflow-hidden relative"
                          style={{
                            width: '75%',
                            aspectRatio: aspectRatio,
                            maxHeight: '65%',
                            pointerEvents: 'auto',
                            contain: 'layout style paint',
                            paddingTop: currentCanvasId === '2' ? '1rem' : '35%',
                            paddingLeft: currentCanvasId === '2' ? '1rem' : '0.5rem',
                            paddingRight: currentCanvasId === '2' ? '1rem' : '0.5rem',
                            paddingBottom: currentCanvasId === '2' ? '1.25rem' : '1rem'
                          }}
                        >
                          {currentCanvasId === '2' ? (
                            <>
                              <p
                                className="font-bold text-center"
                                style={{
                                  color: currentCanvas.textColor || '#876e9f',
                                  fontSize: `${previewFontSize}px`,
                                  lineHeight: '1.4',
                                  position: 'absolute',
                                  top: '1rem',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  width: 'calc(100% - 2rem)',
                                  textAlign: 'center',
                                  textDecoration: 'underline',
                                  textDecorationThickness: '2px',
                                  textUnderlineOffset: '0.25rem',
                                }}
                              >
                                Instructions
                              </p>
                              {card2Texts.filter(t => t.text.trim()).length > 0 && (
                                <div className="flex flex-col gap-2 w-full" style={{ marginTop: '35%' }}>
                                  {card2Texts.filter(t => t.text.trim()).map((textItem, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2"
                                      style={{
                                        width: '100%',
                                        maxWidth: '95%',
                                      }}
                                    >
                                      <span
                                        className="flex-shrink-0 flex items-center justify-center font-bold rounded-full"
                                        style={{
                                          backgroundColor: textItem.color || '#876e9f',
                                          color: '#FFFFFF',
                                          width: `${previewFontSize * 0.8}px`,
                                          height: `${previewFontSize * 0.8}px`,
                                          fontSize: `${previewFontSize * 0.6}px`,
                                          minWidth: `${previewFontSize * 0.8}px`,
                                          lineHeight: '1',
                                        }}
                                      >
                                        {idx + 1}
                                      </span>
                                      <p
                                        className="font-bold text-left break-words overflow-hidden flex-1"
                                        style={{
                                          color: textItem.color,
                                          wordWrap: 'break-word',
                                          overflowWrap: 'break-word',
                                          fontSize: `${previewFontSize}px`,
                                          lineHeight: '1.4',
                                          minHeight: '1em',
                                          contain: 'layout style paint',
                                          willChange: 'auto',
                                          margin: 0,
                                          padding: 0,
                                        }}
                                      >
                                        {textItem.text}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <p
                              className="font-bold text-left break-words px-2 overflow-hidden"
                              style={{
                                color: currentCanvas.textColor,
                                width: '100%',
                                maxWidth: '95%',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                fontSize: `${previewFontSize}px`,
                                lineHeight: '1.4',
                                minHeight: '1em',
                                maxHeight: '100%',
                                contain: 'layout style paint',
                                willChange: 'auto'
                              }}
                            >
                              {currentCanvas.text || 'Your text will appear here'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }, [backgroundColor, imageSize, currentCanvas.textSize, textSize, currentCanvasId, firstCard.textColor, currentCanvas.textColor, currentCanvas.text])}
            </div>
            
            {/* Carousel */}
            <div className="flex-shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                {canvases.map((canvas, canvasIndex) => {
                  // Parse image size to get aspect ratio
                  const [widthStr, heightStr] = (canvas.imageSize || '1080x1920').split('x').map(s => s.trim());
                  const width = parseInt(widthStr) || 1080;
                  const height = parseInt(heightStr) || 1920;
                  const aspectRatio = width / height;
                  const isFirstCanvas = canvas.id === '1';
                  
                  return (
                    <div key={canvas.id} className="contents">
                      {/* Render card 1 */}
                      {canvas.id === '1' && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCanvas(canvas.id);
                          }}
                          className={`relative flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
                            canvas.id === currentCanvasId
                              ? 'border-[#3B82F6] ring-2 ring-[#3B82F6] ring-opacity-50'
                              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                          }`}
                          style={{ backgroundColor: canvas.backgroundColor }}
                        >
                          {/* First canvas - no white card, text directly on background */}
                          <div className="absolute inset-0 flex items-center justify-center p-1">
                            <p
                              className="font-bold text-center text-xs leading-tight"
                              style={{
                                color: canvas.textColor,
                              }}
                            >
                              {canvas.text || '•'}
                            </p>
                          </div>
                          {canvases.length > 3 && canvas.id !== '1' && canvas.id !== '2' && (
                            <button
                              onClick={(e) => handleDeleteCanvas(canvas.id, e)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors z-10"
                              title="Delete canvas"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Render other cards (card 2+) */}
                      {canvas.id !== '1' && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCanvas(canvas.id);
                          }}
                          className={`relative flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
                            canvas.id === currentCanvasId
                              ? 'border-[#3B82F6] ring-2 ring-[#3B82F6] ring-opacity-50'
                              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                          } z-10`}
                          style={{ backgroundColor: canvas.backgroundColor }}
                        >
                          {/* Subsequent canvases - white card in the middle */}
                          <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
                            <div
                              className="bg-white rounded-lg border-4 border-gray-300 shadow-lg flex flex-col items-start justify-start pointer-events-none relative overflow-hidden"
                              style={{
                                width: '75%',
                                aspectRatio: aspectRatio,
                                maxHeight: '65%',
                                paddingTop: canvas.id === '2' ? '0.5rem' : '35%',
                                paddingLeft: canvas.id === '2' ? '0.5rem' : '0.25rem',
                                paddingRight: canvas.id === '2' ? '0.5rem' : '0.25rem',
                                paddingBottom: canvas.id === '2' ? '0.75rem' : '0.5rem',
                              }}
                            >
                            </div>
                          </div>
                          {canvases.length > 3 && canvas.id !== '1' && canvas.id !== '2' && (
                            <button
                              onClick={(e) => handleDeleteCanvas(canvas.id, e)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors z-10"
                              title="Delete canvas"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={handleAddCanvas}
                  className="flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#3B82F6] dark:hover:border-[#3B82F6] flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-[#3B82F6] transition-colors bg-zinc-50 dark:bg-zinc-800"
                  title="Add new canvas"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-800 pt-8 pb-6 bg-zinc-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Company Section */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-black dark:text-zinc-50 mb-2">
                  Company
                </h3>
                <a
                  href="/about"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  About
                </a>
                <a
                  href="/blog"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Blog
                </a>
                <a
                  href="/careers"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Careers
                </a>
                <a
                  href="/contact"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Contact
                </a>
              </div>

              {/* Product Section */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-black dark:text-zinc-50 mb-2">
                  Product
                </h3>
                <a
                  href="/features"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Features
                </a>
                <a
                  href="/pricing"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="/documentation"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="/api"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  API
                </a>
              </div>

              {/* Resources Section */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-black dark:text-zinc-50 mb-2">
                  Resources
                </h3>
                <a
                  href="/help"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Help Center
                </a>
                <a
                  href="/community"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Community
                </a>
                <a
                  href="/tutorials"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Tutorials
                </a>
                <a
                  href="/guides"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Guides
                </a>
              </div>

              {/* Legal Section */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-black dark:text-zinc-50 mb-2">
                  Legal
                </h3>
                <a
                  href="/privacy"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="/cookie-policy"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Cookie Policy
                </a>
                <a
                  href="/dmca"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                >
                  DMCA
                </a>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                © {new Date().getFullYear()} TikTok Style Image Generator. All rights reserved.
              </div>
              <div className="flex gap-6">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
          </a>
          <a
                  href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 px-6 py-4 rounded-lg shadow-lg bg-zinc-800 dark:bg-zinc-700 text-white font-medium text-sm flex items-center gap-3 animate-slide-up">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Posted successfully</span>
        </div>
      )}
    </div>
  );
}
