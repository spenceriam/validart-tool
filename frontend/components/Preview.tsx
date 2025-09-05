import React, { useRef, useEffect } from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function Preview() {
  const { state, dispatch } = useValidart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updatePreview();
  }, [state.artwork, state.cardWidth, state.cardHeight, state.roundedCorners, state.punchHoles]);

  useEffect(() => {
    checkCollisions();
  }, [state.punchHoles, state.safeZonePercent, state.canvasWidth, state.canvasHeight]);

  const updatePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate canvas size based on card dimensions with proper scaling
    const maxCanvasSize = Math.min(600, window.innerWidth - 450); // Account for sidebar
    const cardAspectRatio = state.cardWidth / state.cardHeight;
    
    let canvasWidth, canvasHeight;
    let pixelsPerMM;

    // Calculate scale to fit in available space while maintaining aspect ratio
    if (cardAspectRatio > 1) {
      // Landscape card
      canvasWidth = Math.min(maxCanvasSize, 600);
      canvasHeight = canvasWidth / cardAspectRatio;
      pixelsPerMM = canvasWidth / state.cardWidth;
    } else {
      // Portrait card
      canvasHeight = Math.min(maxCanvasSize, 600);
      canvasWidth = canvasHeight * cardAspectRatio;
      pixelsPerMM = canvasHeight / state.cardHeight;
    }

    // Ensure minimum size for usability
    if (canvasWidth < 200) {
      canvasWidth = 200;
      canvasHeight = canvasWidth / cardAspectRatio;
      pixelsPerMM = canvasWidth / state.cardWidth;
    }
    if (canvasHeight < 200) {
      canvasHeight = 200;
      canvasWidth = canvasHeight * cardAspectRatio;
      pixelsPerMM = canvasHeight / state.cardHeight;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    dispatch({
      type: 'SET_CANVAS_DIMENSIONS',
      payload: { width: canvasWidth, height: canvasHeight, scale: pixelsPerMM }
    });

    if (!state.artwork) {
      // Show placeholder with card proportions
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw card border
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);
      
      // Draw text
      ctx.fillStyle = '#6c757d';
      ctx.font = `${Math.min(canvasWidth, canvasHeight) / 20}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload artwork to preview', canvasWidth / 2, canvasHeight / 2);
      
      // Show card dimensions
      ctx.font = `${Math.min(canvasWidth, canvasHeight) / 30}px system-ui`;
      ctx.fillText(`${state.cardWidth.toFixed(1)}mm × ${state.cardHeight.toFixed(1)}mm`, canvasWidth / 2, canvasHeight / 2 + 30);
      return;
    }

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Load and draw artwork
    const img = new Image();
    img.onload = () => {
      // Calculate how to fit artwork within the card area
      const artworkAspect = img.width / img.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      // Fit artwork to cover entire card area (aspect fill)
      if (artworkAspect > cardAspectRatio) {
        // Artwork is wider than card - fit height and crop width
        drawHeight = canvasHeight;
        drawWidth = drawHeight * artworkAspect;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      } else {
        // Artwork is taller than card - fit width and crop height
        drawWidth = canvasWidth;
        drawHeight = drawWidth / artworkAspect;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      }

      // Draw the artwork
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      // Apply rounded corners if enabled
      if (state.roundedCorners) {
        const radius = Math.min(canvasWidth, canvasHeight) * 0.05;
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        roundRect(ctx, 0, 0, canvasWidth, canvasHeight, radius);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw punch holes on top of artwork
      state.punchHoles.forEach(hole => {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.r, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw card border on top
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, canvasWidth - 1, canvasHeight - 1);
    };
    img.src = state.artwork;
  };

  const checkCollisions = () => {
    if (!state.artwork || state.punchHoles.length === 0) {
      dispatch({ type: 'SET_BANNER', payload: null });
      return;
    }

    // Calculate safe zone inset in pixels
    const safeZoneInsetMM = (state.safeZonePercent / 100) * Math.min(state.cardWidth, state.cardHeight);
    const safeZoneInsetPixels = safeZoneInsetMM * state.canvasScale;
    
    let hasCollision = false;
    
    for (const hole of state.punchHoles) {
      const holeLeft = hole.x - hole.r;
      const holeRight = hole.x + hole.r;
      const holeTop = hole.y - hole.r;
      const holeBottom = hole.y + hole.r;
      
      // Check if hole intersects with safe zone (artwork area)
      if (holeRight > safeZoneInsetPixels && 
          holeLeft < state.canvasWidth - safeZoneInsetPixels &&
          holeBottom > safeZoneInsetPixels && 
          holeTop < state.canvasHeight - safeZoneInsetPixels) {
        hasCollision = true;
        break;
      }
    }
    
    if (hasCollision) {
      dispatch({
        type: 'SET_BANNER',
        payload: { message: 'Artwork intersects punch-hole – DO NOT PRINT', type: 'danger' }
      });
    } else {
      dispatch({
        type: 'SET_BANNER',
        payload: { message: 'OK to print', type: 'success' }
      });
    }
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const getBannerIcon = () => {
    if (!state.banner) return null;
    
    switch (state.banner.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'danger':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getBannerVariant = () => {
    if (!state.banner) return 'default';
    return state.banner.type === 'danger' ? 'destructive' : 'default';
  };

  const safeZoneInsetMM = (state.safeZonePercent / 100) * Math.min(state.cardWidth, state.cardHeight);
  const safeZoneInsetPixels = safeZoneInsetMM * state.canvasScale;

  return (
    <div className="w-full max-w-4xl space-y-4">
      {state.banner && (
        <Alert variant={getBannerVariant()} className="max-w-md mx-auto">
          {getBannerIcon()}
          <AlertDescription>{state.banner.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-center">
        <div ref={containerRef} className="relative inline-block border rounded-lg overflow-hidden bg-muted shadow-lg">
          <canvas
            ref={canvasRef}
            className="block max-w-full h-auto"
          />
          
          {/* Safe zone overlay */}
          {state.artwork && (
            <div
              className="absolute pointer-events-none opacity-40"
              style={{
                top: `${safeZoneInsetPixels}px`,
                left: `${safeZoneInsetPixels}px`,
                right: `${safeZoneInsetPixels}px`,
                bottom: `${safeZoneInsetPixels}px`,
                background: 'repeating-linear-gradient(45deg, #ef4444 0px, #ef4444 8px, transparent 8px, transparent 16px)',
                animation: 'moveStripes 2s linear infinite',
              }}
            />
          )}
        </div>
      </div>
      
      {/* Card info */}
      <div className="text-center text-sm text-muted-foreground">
        Card: {state.cardWidth.toFixed(1)}mm × {state.cardHeight.toFixed(1)}mm 
        ({(state.cardWidth / 25.4).toFixed(3)}" × {(state.cardHeight / 25.4).toFixed(3)}")
      </div>
    </div>
  );
}
