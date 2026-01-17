'use client';

import { useState, useEffect } from 'react';

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
    { id: '1', text: '', backgroundColor: '#3B82F6', textColor: '#FFFFFF', textSize: '80', imageSize: '1080x1920' }
  ]);
  const [currentCanvasId, setCurrentCanvasId] = useState<string>('1');
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#3B82F6');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState('80');
  const [imageSize, setImageSize] = useState('1080x1920');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Get current canvas
  const currentCanvas = canvases.find(c => c.id === currentCanvasId) || canvases[0];

  // Update inputs when canvas changes
  useEffect(() => {
    setText(currentCanvas.text);
    setBackgroundColor(currentCanvas.backgroundColor);
    setTextColor(currentCanvas.textColor);
    setTextSize(currentCanvas.textSize);
    setImageSize(currentCanvas.imageSize);
  }, [currentCanvasId]);

  // Save current canvas data when inputs change
  useEffect(() => {
    setCanvases(prev => prev.map(c => 
      c.id === currentCanvasId 
        ? { ...c, text, backgroundColor, textColor, textSize, imageSize }
        : c
    ));
  }, [text, backgroundColor, textColor, textSize, imageSize, currentCanvasId]);

  const handleAddCanvas = () => {
    const newId = String(Date.now());
    const newCanvas: CanvasData = {
      id: newId,
      text: text || '',
      backgroundColor: backgroundColor || '#3B82F6',
      textColor: textColor || '#FFFFFF',
      textSize: textSize || '80',
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
    if (canvases.length === 1) return; // Don't delete the last canvas
    
    const newCanvases = canvases.filter(c => c.id !== id);
    setCanvases(newCanvases);
    
    if (id === currentCanvasId) {
      setCurrentCanvasId(newCanvases[0].id);
    }
  };

  const handleGenerate = () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    setIsGenerating(true);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      alert('Canvas not supported');
      setIsGenerating(false);
      return;
    }

    // Parse image size
    const [widthStr, heightStr] = (imageSize || '1080x1920').split('x').map(s => s.trim());
    const width = parseInt(widthStr) || 1080;
    const height = parseInt(heightStr) || 1920;
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = backgroundColor || '#3B82F6';
    ctx.fillRect(0, 0, width, height);

    // Configure text styling
    ctx.fillStyle = textColor || '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Get font size from input
    const maxTextWidth = width * 0.9;
    let fontSize = parseInt(textSize) || 80;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    
    // Adjust font size if text is too long
    const textMetrics = ctx.measureText(text);
    if (textMetrics.width > maxTextWidth) {
      fontSize = (maxTextWidth / textMetrics.width) * fontSize * 0.9;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    }

    // Wrap text
    const lines = wrapText(ctx, text, maxTextWidth);
    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    const startY = (height - totalHeight) / 2 + lineHeight / 2;

    // Draw each line
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        alert('Failed to generate image');
        setIsGenerating(false);
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tiktok-image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsGenerating(false);
    }, 'image/png');
  };

  const handlePostToTikTok = async () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    setIsPosting(true);
    
    try {
      // First, check if user is authenticated
      const authCheck = await fetch('/api/tiktok/auth-check');
      const authData = await authCheck.json();
      
      if (!authData.authenticated) {
        // Redirect to TikTok OAuth
        window.location.href = '/api/tiktok/auth';
        return;
      }

      // Generate the image first (reuse handleGenerate logic but get blob)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        alert('Canvas not supported');
        setIsPosting(false);
        return;
      }

      const [widthStr, heightStr] = (imageSize || '1080x1920').split('x').map(s => s.trim());
      const width = parseInt(widthStr) || 1080;
      const height = parseInt(heightStr) || 1920;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = backgroundColor || '#3B82F6';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = textColor || '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const maxTextWidth = width * 0.9;
      let fontSize = parseInt(textSize) || 80;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      
      const textMetrics = ctx.measureText(text);
      if (textMetrics.width > maxTextWidth) {
        fontSize = (maxTextWidth / textMetrics.width) * fontSize * 0.9;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      }

      const lines = wrapText(ctx, text, maxTextWidth);
      const lineHeight = fontSize * 1.4;
      const totalHeight = lines.length * lineHeight;
      const startY = (height - totalHeight) / 2 + lineHeight / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (!blob) {
        alert('Failed to generate image');
        setIsPosting(false);
        return;
      }

      // Upload to TikTok
      const formData = new FormData();
      formData.append('image', blob, 'tiktok-image.png');
      formData.append('caption', text);

      const response = await fetch('/api/tiktok/post', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post to TikTok');
      }

      alert('Successfully posted to TikTok!');
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
      <div className="max-w-7xl mx-auto w-full flex flex-col p-3 flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 mb-6">
          {/* Left Side - Inputs */}
          <div className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg min-h-0">
            {/* Header */}
            <div className="flex-shrink-0 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-zinc-50 mb-1">
                  Build in public
                </h1>

              </div>
              <button
                onClick={handlePostToTikTok}
                disabled={isPosting || !text.trim()}
                className="flex-shrink-0 h-10 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title="Post to TikTok"
              >
                {isPosting ? (
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
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                    <span>TikTok</span>
                  </>
                )}
              </button>
            </div>

            {/* Text Input */}
            <div className="flex-shrink-0">
              <label
                htmlFor="text"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none text-sm"
                rows={4}
              />
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

            {/* Text Color Picker */}
            <div className="flex-shrink-0">
              <label
                htmlFor="textColor"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Text Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  id="textColor"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm"
                />
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
                placeholder="80"
                min="10"
                max="500"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Font size in pixels (default: 80)
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

            {/* Generate Button */}
            <div className="mt-auto flex-shrink-0">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full h-12 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  'Post to my private'
                )}
              </button>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="flex flex-col p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg min-h-0">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex-shrink-0">
              Preview
            </label>
            <div className="flex-1 flex items-center justify-center min-h-0 mb-3 p-2 w-full">
              {(() => {
                const [widthStr, heightStr] = (imageSize || '1080x1920').split('x').map(s => s.trim());
                const width = parseInt(widthStr) || 1080;
                const height = parseInt(heightStr) || 1920;
                const fontSize = parseInt(textSize) || 80;
                // Scale font size for preview - use a fixed scale factor so changes are visible
                // This makes the preview roughly 8% of actual size, so 80px → ~6.4px, 800px → ~64px
                const previewFontSize = fontSize * 0.08;
                
                return (
                  <div
                    className="rounded-lg border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-3 relative overflow-hidden"
                    style={{ 
                      backgroundColor,
                      aspectRatio: `${width} / ${height}`,
                      height: '100%',
                      width: 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  >
                    <p
                      className="font-bold text-center break-words"
                      style={{
                        color: textColor,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        width: '100%',
                        maxWidth: '95%',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        fontSize: `${previewFontSize}px`
                      }}
                    >
                      {text || 'Your text will appear here'}
                    </p>
                  </div>
                );
              })()}
            </div>
            
            {/* Carousel */}
            <div className="flex-shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                {canvases.map((canvas) => (
                  <div
                    key={canvas.id}
                    onClick={() => handleSelectCanvas(canvas.id)}
                    className={`relative flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 cursor-pointer transition-all ${
                      canvas.id === currentCanvasId
                        ? 'border-[#3B82F6] ring-2 ring-[#3B82F6] ring-opacity-50'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                    style={{ backgroundColor: canvas.backgroundColor }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-1">
                      <p
                        className="font-bold text-center text-xs leading-tight"
                        style={{
                          color: canvas.textColor,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        }}
                      >
                        {canvas.text || '•'}
                      </p>
                    </div>
                    {canvases.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteCanvas(canvas.id, e)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                        title="Delete canvas"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
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
        
        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-800 mt-6 pt-8 pb-6">
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
      </div>
    </div>
  );
}
