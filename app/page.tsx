'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import JSZip from 'jszip';

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
    { id: '3', text: '', backgroundColor: '#cfa9f5', textColor: '#876e9f', textSize: '200', imageSize: '1080x1920' },
    { id: 'end', text: '', backgroundColor: '#cfa9f5', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' }
  ]);
  const [currentCanvasId, setCurrentCanvasId] = useState<string>('1');
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#cfa9f5');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState('200');
  const [imageSize, setImageSize] = useState('1080x1920');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
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
  const [levelName, setLevelName] = useState<string>('');

  // Use ref to track if we're updating from user input to prevent infinite loops
  const isUpdatingFromUserInput = useRef(false);
  // Use ref to track if we're syncing from canvas to state (when switching cards)
  const isSyncingFromCanvas = useRef(false);

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
    
    // Set flag to indicate we're syncing from canvas to state
    isSyncingFromCanvas.current = true;
    
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
    
    // Reset flag after state updates are scheduled
    // Use setTimeout to ensure this runs after state updates
    setTimeout(() => {
      isSyncingFromCanvas.current = false;
    }, 0);
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
    // Skip if we're currently syncing from canvas to state (when switching cards)
    if (isSyncingFromCanvas.current) {
      return;
    }
    
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
    // Insert new canvas before the ending card if it exists
    const endingCardIndex = canvases.findIndex(c => c.id === 'end');
    if (endingCardIndex >= 0) {
      const newCanvases = [...canvases];
      newCanvases.splice(endingCardIndex, 0, newCanvas);
      setCanvases(newCanvases);
    } else {
      setCanvases([...canvases, newCanvas]);
    }
    setCurrentCanvasId(newId);
  };

  const handleSelectCanvas = (id: string) => {
    setCurrentCanvasId(id);
  };

  const handleDeleteCanvas = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't delete card 1, card 2, ending card, or if it would leave less than 3 cards total
    if (id === '1' || id === '2' || id === 'end' || canvases.length <= 3) return;
    
    const newCanvases = canvases.filter(c => c.id !== id);
    setCanvases(newCanvases);
    
    if (id === currentCanvasId) {
      setCurrentCanvasId(newCanvases[0].id);
    }
  };

  const generateCardImage = (canvasData: CanvasData, index: number, levelNameForBadge?: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
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
      // Match CSS behavior: width: 75%, aspectRatio, maxHeight: 60% (slightly shorter)
      // First try width = 75%, then constrain by maxHeight if needed
      let finalCardWidth = width * 0.75;
      let finalCardHeight = finalCardWidth / aspectRatio;
      const cardMaxHeight = height * 0.60;
      
      // If height exceeds maxHeight, constrain by height and recalculate width
      if (finalCardHeight > cardMaxHeight) {
        finalCardHeight = cardMaxHeight;
        finalCardWidth = finalCardHeight * aspectRatio;
      }
      
      const cardX = (width - finalCardWidth) / 2;
      // Position white card slightly higher (move up by 3% of height)
      const cardY = (height - finalCardHeight) / 2 - (height * 0.03);

      // Draw white card for cards 2+ (but not for ending card, which is like card 1)
      if (canvasData.id !== '1' && canvasData.id !== 'end') {
        const radius = 64; // Doubled again from 32 to make corners even more rounded
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
        ctx.lineWidth = 16; // Doubled from 8 to make border thicker
        ctx.stroke();
      }

      // Configure text styling
      const canvasText = canvasData.id === '1' 
        ? canvasData.text || ''
        : (canvasData.id === '2'
          ? card2Texts.filter(t => t.text.trim()).map(t => t.text).join('\n')
          : canvasData.text || '');
      
      if (canvasData.id === '1' || canvasData.id === 'end') {
        // Card 1 and Ending Card: Text directly on background, centered
        ctx.fillStyle = canvasData.textColor || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // More horizontal padding for ending card (smaller maxTextWidth = more padding)
        const maxTextWidth = canvasData.id === 'end' ? width * 0.85 : width * 0.9;
        // Scale font size based on canvas width
        const canvasWidthScale = width / 1080;
        const baseFontSize = parseInt(canvasData.textSize || '200') || 200;
        // Smaller font size for ending card, smaller size for card 1
        const fontSizeDivisor = canvasData.id === 'end' ? 2.8 : (canvasData.id === '1' ? 2.5 : 3);
        let fontSize = (baseFontSize * canvasWidthScale) / fontSizeDivisor;
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        
        const textMetrics = ctx.measureText(canvasText);
        // Skip width constraint for ending card to allow larger text size
        if (textMetrics.width > maxTextWidth && canvasData.id !== 'end') {
          const scaleFactor = 0.9;
          fontSize = (maxTextWidth / textMetrics.width) * fontSize * scaleFactor;
          ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        }

        const lines = wrapText(ctx, canvasText, maxTextWidth);
        const lineHeight = fontSize * 1.4;
        const totalHeight = lines.length * lineHeight;
        
        // Calculate text position first (centered, but moved up for card 1)
        let startY = (height - totalHeight) / 2 + lineHeight / 2;
        // Move card 1 title and badge up by 8% of height
        if (canvasData.id === '1') {
          startY = startY - (height * 0.08);
        }
        
        // If ending card, draw white share icon above text
        let iconSize = 0;
        let iconY = 0;
        if (canvasData.id === 'end') {
          iconSize = fontSize * 1.5;
          const spacing = fontSize * 0.5; // Spacing between icon and text
          const totalContentHeight = iconSize + spacing + totalHeight;
          
          // Center both icon and text together, but move up by 8% of height
          const contentStartY = (height - totalContentHeight) / 2 - (height * 0.08);
          iconY = contentStartY;
          startY = contentStartY + iconSize + spacing + lineHeight / 2;
          
          // Draw sharing icon (network/share icon with three circles and connecting lines) in white
          ctx.save();
          ctx.strokeStyle = '#FFFFFF'; // White color
          ctx.fillStyle = '#FFFFFF'; // White color
          ctx.lineWidth = fontSize * 0.1;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          const iconX = width / 2;
          const circleRadius = iconSize * 0.12;
          const iconSpacing = iconSize * 0.4;
          
          // Calculate positions for three circles in a triangle/network pattern
          const topCircleX = iconX;
          const topCircleY = iconY + iconSize * 0.2;
          const leftCircleX = iconX - iconSpacing;
          const leftCircleY = iconY + iconSize * 0.8;
          const rightCircleX = iconX + iconSpacing;
          const rightCircleY = iconY + iconSize * 0.8;
          
          // Draw connecting lines
          ctx.beginPath();
          ctx.moveTo(topCircleX, topCircleY);
          ctx.lineTo(leftCircleX, leftCircleY);
          ctx.moveTo(topCircleX, topCircleY);
          ctx.lineTo(rightCircleX, rightCircleY);
          ctx.stroke();
          
          // Draw three circles
          ctx.beginPath();
          ctx.arc(topCircleX, topCircleY, circleRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(leftCircleX, leftCircleY, circleRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(rightCircleX, rightCircleY, circleRadius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
        
        // If card 1, draw badge right under the title text
        let badgeY = 0;
        let badgeHeight = 0;
        if (canvasData.id === '1' && levelNameForBadge) {
          const badgeText = `${levelNameForBadge} Edition`;
          // Badge size relative to text
          const badgeFontSize = fontSize * 0.6;
          ctx.font = `bold ${badgeFontSize}px system-ui, sans-serif`;
          const badgeMetrics = ctx.measureText(badgeText);
          const badgePadding = badgeFontSize * 0.8;
          const badgeWidth = badgeMetrics.width + (badgePadding * 2);
          badgeHeight = badgeFontSize * 1.8;
          // Position badge right under the title text
          const textBottom = startY + totalHeight - lineHeight / 2;
          const spacing = fontSize * 0.6; // Spacing between text and badge
          badgeY = textBottom + spacing;
          
          // Draw white background with border
          const badgeX = (width - badgeWidth) / 2;
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = canvasData.backgroundColor || '#cfa9f5';
          ctx.lineWidth = 2 * (width / 1080);
          
          // Draw rounded rectangle
          const badgeRadius = badgeFontSize * 0.3;
          ctx.beginPath();
          ctx.moveTo(badgeX + badgeRadius, badgeY);
          ctx.lineTo(badgeX + badgeWidth - badgeRadius, badgeY);
          ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + badgeRadius);
          ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - badgeRadius);
          ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - badgeRadius, badgeY + badgeHeight);
          ctx.lineTo(badgeX + badgeRadius, badgeY + badgeHeight);
          ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - badgeRadius);
          ctx.lineTo(badgeX, badgeY + badgeRadius);
          ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeRadius, badgeY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Draw badge text
          ctx.fillStyle = canvasData.backgroundColor || '#cfa9f5';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, width / 2, badgeY + badgeHeight / 2);
          
          // Reset font and fillStyle for main text
          ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
          ctx.fillStyle = canvasData.textColor || '#FFFFFF';
        }
        
        // Adjust startY if badge is present (card 1 with badge)
        // When badge exists, center text and badge together vertically, but move up
        if (canvasData.id === '1' && levelNameForBadge && badgeY > 0 && badgeHeight > 0) {
          // Center both text and badge together in the card, but move up by 8% of height
          const totalContentHeight = totalHeight + badgeHeight + (fontSize * 0.6); // text + badge + spacing
          startY = (height - totalContentHeight) / 2 + lineHeight / 2 - (height * 0.08);
          // Recalculate badge position based on new text position
          const textBottom = startY + totalHeight - lineHeight / 2;
          const spacing = fontSize * 0.6;
          badgeY = textBottom + spacing;
        }

        // Ensure fillStyle is set to text color before drawing text
        ctx.fillStyle = canvasData.textColor || '#FFFFFF';
        lines.forEach((line, idx) => {
          ctx.fillText(line, width / 2, startY + idx * lineHeight);
        });
      } else if (canvasData.id === '2') {
        // Card 2: Instructions with numbered items
        // Calculate padding: Scale 16px (1rem) proportionally with canvas width
        // For 1080px canvas width, use 16px as base
        const baseRemSize = 16; // 1rem = 16px at 1080px canvas
        const remSize = baseRemSize * (width / 1080); // Scale with canvas width
        const padding = remSize * 4; // 1rem padding
        const paddingBottom = remSize * 1.25; // 1.25rem
        const textStartY = cardY + finalCardHeight * 0.25; // Start higher (25% instead of 35%)
        const textAreaWidth = finalCardWidth - (padding * 2);
        
        // Debug: Log padding values to verify
        console.log('Card 2 - Canvas:', width, 'x', height, 'Card:', finalCardWidth, 'x', finalCardHeight, 'Padding:', padding);
        
        // Scale font size based on canvas width and card size
        // Cards 2+ are inside a white card that's 75% of canvas width
        // Scale font proportionally: (canvasWidth / 1080) * 0.75, then divide by 3
        const canvasWidthScale = width / 1080;
        const baseFontSize = parseInt(canvasData.textSize || '200') || 200;
        // Scale font for card size (75% of canvas) and canvas dimensions, keep original size
        const fontSize = (baseFontSize * canvasWidthScale * 0.75) / 3.2;
        
        // Draw "Instructions" text at top
        ctx.fillStyle = canvasData.textColor || '#876e9f';
        ctx.textAlign = 'center';
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        const instructionsText = 'Instructions';
        const textMetrics = ctx.measureText(instructionsText);
        // Position text: add more top spacing to match preview (preview has paddingTop + absolute top: 1rem)
        // Using 'top' baseline means Y position is at the top of the text
        ctx.textBaseline = 'top';
        // Use padding (1rem) plus a bit more for better visual spacing from top
        const instructionsY = cardY + padding + (remSize * 2); // 1rem + 0.5rem for better spacing
        const instructionsX = cardX + finalCardWidth / 2;
        // Constrain text width to respect horizontal padding (like preview: calc(100% - 2rem))
        const maxInstructionsWidth = finalCardWidth - (padding * 2);
        ctx.fillText(instructionsText, instructionsX, instructionsY);
        
        // Draw underline - position relative to text, constrained by horizontal padding
        ctx.strokeStyle = canvasData.textColor || '#876e9f';
        // Scale line width with canvas size (4px for 1080px canvas, increased from 2px for thicker underline)
        const lineWidth = 4 * (width / 1080);
        ctx.lineWidth = lineWidth;
        // Underline should be below the text with some offset (textUnderlineOffset: 0.25rem)
        // Since we're using 'top' baseline, add font height for underline position
        const underlineOffset = remSize * 0.25; // 0.25rem offset
        const underlineY = instructionsY + fontSize + underlineOffset;
        // Constrain underline width to respect horizontal padding
        const underlineLeft = Math.max(cardX + padding, instructionsX - textMetrics.width / 2);
        const underlineRight = Math.min(cardX + finalCardWidth - padding, instructionsX + textMetrics.width / 2);
        ctx.beginPath();
        ctx.moveTo(underlineLeft, underlineY);
        ctx.lineTo(underlineRight, underlineY);
        ctx.stroke();
        
        // Draw instruction lines
        const instructionTexts = card2Texts.filter(t => t.text.trim());
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top'; // Use top baseline for consistent positioning
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        
        const circleRadius = fontSize * 0.4;
        const circleX = cardX + padding;
        const textX = circleX + circleRadius + fontSize * 0.5;
        const rightBoundary = cardX + finalCardWidth - padding;
        const maxTextWidth = Math.max(0, rightBoundary - textX);
        const lineHeight = fontSize * 1.4;
        const itemSpacing = fontSize * 1.2; // Space between items (increased for more spacing)
        
        // First pass: calculate all Y positions based on actual text heights
        let currentY = textStartY;
        const itemPositions: Array<{ y: number; textLines: string[] }> = [];
        
        instructionTexts.forEach((textItem, idx) => {
          const textLines = wrapText(ctx, textItem.text, maxTextWidth);
          itemPositions.push({ y: currentY, textLines });
          
          // Calculate actual height of this item based on number of lines
          // For single line: use lineHeight. For multiple lines: use lineHeight * line count
          const itemHeight = textLines.length * lineHeight;
          
          // Move Y down by the height of this item
          currentY += itemHeight;
          
          // Add spacing after this item (but not after the last one)
          if (idx < instructionTexts.length - 1) {
            currentY += itemSpacing;
          }
        });
        
        // Second pass: draw all items at calculated positions
        itemPositions.forEach((itemPos, idx) => {
          const y = itemPos.y;
          const textLines = itemPos.textLines;
          
          // Circle Y should align with text - since we're using 'top' baseline,
          // add half the font size to center the circle vertically with the text
          const circleY = y + (fontSize * 0.5); // Center circle with text
          
          // Draw circle
          ctx.fillStyle = instructionTexts[idx].color || '#876e9f';
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
          ctx.fillStyle = instructionTexts[idx].color || '#876e9f';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top'; // Use top baseline for consistent positioning
          ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
          
          textLines.forEach((line, lineIdx) => {
            ctx.fillText(line, textX, y + (lineIdx * lineHeight));
          });
        });
      } else {
        // Content cards: Text inside white card, left-aligned, starting above middle
        // Calculate padding: Use same padding as instructions card (1rem = 16px * 4 for visibility)
        // For 1080px canvas width, use 16px as base
        const baseRemSize = 16; // Base for rem calculations
        const remSize = baseRemSize * (width / 1080); // Scale with canvas width
        const padding = remSize * 4; // Same padding as instructions card
        const textStartY = cardY + finalCardHeight * 0.35;
        // Calculate max text width: from left padding to right edge minus padding
        const textX = cardX + padding;
        const maxTextWidth = (cardX + finalCardWidth - padding) - textX;
        
        // Debug: Log padding values to verify
        console.log('Content Card - Canvas:', width, 'x', height, 'Card:', finalCardWidth, 'x', finalCardHeight, 'Padding:', padding, 'TextX:', textX);
        
        // Scale font size based on canvas width and card size (same as card 2)
        // Cards 3+ are inside a white card that's 75% of canvas width
        const canvasWidthScale = width / 1080;
        const baseFontSize = parseInt(canvasData.textSize || '200') || 200;
        // Scale font for card size (75% of canvas) and canvas dimensions, slightly larger
        const fontSize = (baseFontSize * canvasWidthScale * 0.75) / 3.0;
        
        ctx.fillStyle = canvasData.textColor || '#876e9f';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        
        const lines = wrapText(ctx, canvasText, maxTextWidth);
        lines.forEach((line, idx) => {
          ctx.fillText(line, textX, textStartY + (idx * fontSize * 1.4));
        });
      }

      // Convert to blob and return it
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    });
  };

  const handleAutoGenerate = async () => {
    setIsAutoGenerating(true);
    try {
      // Fetch random level data from API
      const response = await fetch('/api/levels/random');
      if (!response.ok) {
        throw new Error('Failed to fetch random level');
      }
      
      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error('Invalid response from API');
      }
      
      const { levelName, categoryName, instructions, questions } = result.data;
      
      // Store the level name for the badge
      setLevelName(levelName || '');
      
      // Update the text state for card 1 (title)
      setText(categoryName);
      
      // Update card 2 with instructions (convert instructions array to card2Texts format)
      const instructionsForCard2 = instructions && instructions.length > 0
        ? instructions.map((inst: string) => ({ text: inst, color: '#876e9f' }))
        : [{ text: '', color: '#876e9f' }];
      
      setCard2Texts(instructionsForCard2);
      
      // Create content cards for each question (one question per card)
      const questionCards: CanvasData[] = questions.map((question: string) => ({
        id: String(Date.now() + Math.random()),
        text: question,
        backgroundColor: backgroundColor || '#cfa9f5',
        textColor: '#876e9f',
        textSize: textSize || '200',
        imageSize: imageSize || '1080x1920'
      }));
      
      // Get existing cards and ending card
      const existingCard1 = canvases.find(c => c.id === '1') || canvases[0];
      const existingCard2 = canvases.find(c => c.id === '2') || canvases[1];
      const endingCard = canvases.find(c => c.id === 'end');
      
      // Set ending card text based on level name
      let endingCardText = '';
      if (levelName && levelName.toLowerCase() === 'friends') {
        endingCardText = 'Share it with your friends and see what they say';
      } else if (levelName && levelName.toLowerCase() === 'couples') {
        endingCardText = 'Share it with your boo and see what they say';
      }
      
      // Rebuild canvases: card 1 with categoryName, card 2 with instructions, question cards, ending card
      const newCanvases: CanvasData[] = [
        { ...existingCard1, text: categoryName },
        { ...existingCard2, text: instructionsForCard2.map((t: { text: string; color: string }) => t.text).join('\n') },
        ...questionCards,
        endingCard || { id: 'end', text: endingCardText, backgroundColor: '#cfa9f5', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' }
      ];
      
      // Set ending card text
      const endingCardIndex = newCanvases.findIndex(c => c.id === 'end');
      if (endingCardIndex >= 0) {
        newCanvases[endingCardIndex].text = endingCardText;
      }
      
      setCanvases(newCanvases);
      
      // Switch to card 1 to show the generated category name
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
      // Generate all card images and collect blobs
      const imageBlobs: Array<{ blob: Blob; filename: string }> = [];
      
      for (let i = 0; i < canvases.length; i++) {
        const canvasData = canvases[i];
        const blob = await generateCardImage(canvasData, i, canvasData.id === '1' ? levelName : undefined);
        const cardNumber = i + 1;
        imageBlobs.push({
          blob,
          filename: `tiktok-image-card-${cardNumber}.png`
        });
      }
      
      // Create zip file
      const zip = new JSZip();
      
      // Add all images to zip
      imageBlobs.forEach(({ blob, filename }) => {
        zip.file(filename, blob);
      });
      
      // Generate zip file and download
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
    // Use current canvas's text (not the title input, which only affects card 1)
    const canvasText = currentCanvas.text || text;
    
    if (!canvasText.trim()) {
      alert('Please enter some text');
      return;
    }

    if (!userInfo) {
      alert('Please connect your TikTok account first');
      return;
    }

    setIsPosting(true);
    
    try {
      // Hide dropdown if open
      setShowUserDropdown(false);

      // Generate the card image
      const currentIndex = canvases.findIndex(c => c.id === currentCanvasId);
      const imageBlob = await generateCardImage(
        currentCanvas,
        currentIndex >= 0 ? currentIndex : 0,
        currentCanvas.id === '1' ? levelName : undefined
      );

      // Create FormData to send to API
      const formData = new FormData();
      formData.append('image', imageBlob, 'card.png');
      formData.append('caption', canvasText);
      formData.append('privacy_level', 'SELF_ONLY'); // Keep it private

      // Call the TikTok post API
      const response = await fetch('/api/tiktok/post', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if re-authentication is required
        if (data.requiresReauth) {
          alert('Please reconnect your TikTok account to grant video upload permissions.');
          // Optionally redirect to auth
          window.location.href = '/api/tiktok/auth';
          return;
        }
        throw new Error(data.error || 'Failed to post to TikTok');
      }

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
          <div className="flex flex-col h-full max-h-screen bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden">
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 flex items-start justify-between gap-4 p-4 pb-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-zinc-50 mb-1">
                  Bleamies
                </h1>

              </div>
              {userInfo ? (
                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="relative">
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
                  <button
                    onClick={handleAutoGenerate}
                    disabled={isAutoGenerating}
                    className="w-10 h-10 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate"
                  >
                    {isAutoGenerating ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex-shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => window.location.href = '/api/tiktok/auth'}
                    className="h-10 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    title="Connect TikTok"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                    <span>TikTok</span>
                  </button>
                  <button
                    onClick={handleAutoGenerate}
                    disabled={isAutoGenerating}
                    className="w-10 h-10 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate"
                  >
                    {isAutoGenerating ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 hide-scrollbar">
              <div className="flex flex-col gap-4 py-3">
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
                  .filter(c => c.id !== '1' && c.id !== '2' && c.id !== 'end')
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
                        {canvases.filter(c => c.id !== '1' && c.id !== '2' && c.id !== 'end').length > 1 && canvas.id !== 'end' && (
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

            {/* Ending Card Input */}
            {canvases.find(c => c.id === 'end') && (
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Ending Card <span className="text-xs text-zinc-500 dark:text-zinc-400">(Last card)</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={canvases.find(c => c.id === 'end')?.text || ''}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setCanvases(prev => prev.map(c => 
                        c.id === 'end' 
                          ? { ...c, text: newText }
                          : c
                      ));
                    }}
                    placeholder="Enter ending card text..."
                    className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm"
                  />
                  <input
                    type="color"
                    value={canvases.find(c => c.id === 'end')?.textColor || '#FFFFFF'}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      setCanvases(prev => prev.map(c => 
                        c.id === 'end' 
                          ? { ...c, textColor: newColor }
                          : c
                      ));
                    }}
                    className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0"
                    title="Ending card text color"
                  />
                </div>
              </div>
            )}

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
              </div>
            </div>

            {/* Download and Post Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 flex gap-3 p-4 pt-3 border-t border-zinc-200 dark:border-zinc-700">
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
                const isEndingCard = currentCanvasId === 'end';
                
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
                    {(isFirstCanvas || isEndingCard) ? (
                      // First canvas and ending card - no white card, text directly on background
                      <div className={isEndingCard ? "flex flex-col items-center justify-center" : "flex flex-col items-center justify-center relative w-full h-full"} style={isEndingCard ? { width: '100%', height: '100%' } : { width: '100%', height: '100%' }}>
                        {isEndingCard && (
                          <svg
                            className="flex-shrink-0"
                            style={{
                              width: `${previewFontSize * 1.5}px`,
                              height: `${previewFontSize * 1.5}px`,
                              color: currentCanvas.textColor,
                              marginBottom: `${previewFontSize * 0.8}px`,
                            }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                          </svg>
                        )}
                        <p
                          className="font-bold text-center break-words px-2 overflow-hidden"
                          style={{
                            color: isFirstCanvas ? firstCard.textColor : currentCanvas.textColor,
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
                          {isFirstCanvas ? firstCard.text : currentCanvas.text}
                        </p>
                        {isFirstCanvas && levelName && (
                          <div
                            className="px-3 py-1 rounded-lg font-semibold text-sm mt-3"
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: `2px solid ${backgroundColor}`,
                              color: backgroundColor,
                            }}
                          >
                            {levelName} Edition
                          </div>
                        )}
                      </div>
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
              }, [backgroundColor, imageSize, currentCanvas.textSize, textSize, currentCanvasId, firstCard.textColor, currentCanvas.textColor, currentCanvas.text, card2Texts, levelName])}
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
                      {/* Render card 1 and ending card (no white card, just text) */}
                      {(canvas.id === '1' || canvas.id === 'end') && (
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
                          {/* First and ending canvas - no white card, text directly on background */}
                          <div className={`absolute inset-0 flex items-center justify-center p-1 ${canvas.id === 'end' ? 'flex-col gap-1' : 'flex-col gap-1'}`}>
                            {canvas.id === 'end' && (
                              <svg
                                className="flex-shrink-0"
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  color: canvas.textColor,
                                }}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                              </svg>
                            )}
                            <p
                              className="font-bold text-center text-xs leading-tight"
                              style={{
                                color: canvas.textColor,
                              }}
                            >
                              {canvas.text || '•'}
                            </p>
                            {canvas.id === '1' && levelName && (
                              <div
                                className="px-1.5 py-0.5 rounded text-[8px] font-semibold whitespace-nowrap mt-1"
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  border: `1px solid ${canvas.backgroundColor}`,
                                  color: canvas.backgroundColor,
                                }}
                              >
                                {levelName} Edition
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Render other cards (card 2+ but not ending card) */}
                      {canvas.id !== '1' && canvas.id !== 'end' && (
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
                          {canvases.length > 3 && canvas.id !== '1' && canvas.id !== '2' && canvas.id !== 'end' && (
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
                © {new Date().getFullYear()} Bleamies. All rights reserved.
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
