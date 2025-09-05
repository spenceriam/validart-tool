import React, { useRef, useEffect } from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    if (!state.artwork) {
      // Show placeholder
      canvas.width = 400;
      canvas.height = 250;
      
      dispatch({
        type: 'SET_CANVAS_DIMENSIONS',
        payload: { width: 400, height: 250, scale: 1 }
      });

      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
      
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload artwork to preview', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Calculate canvas size
    const maxCanvasSize = Math.min(600, window.innerWidth - 100);
    const aspectRatio = state.cardWidth / state.cardHeight;
    
    let canvasWidth, canvasHeight;
    if (aspectRatio > 1) {
      canvasWidth = Math.min(maxCanvasSize, state.cardWidth * 6);
      canvasHeight = canvasWidth / aspectRatio;
    } else {
      canvasHeight = Math.min(maxCanvasSize, state.cardHeight * 6);
      canvasWidth = canvasHeight * aspectRatio;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const canvasScale = canvasWidth / state.cardWidth;

    dispatch({
      type: 'SET_CANVAS_DIMENSIONS',
      payload: { width: canvasWidth, height: canvasHeight, scale: canvasScale }
    });

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Load and draw artwork
    const img = new Image();
    img.onload = () => {
      const artworkAspect = img.width / img.height;
      const cardAspect = state.cardWidth / state.cardHeight;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (artworkAspect > cardAspect) {
        drawHeight = canvasHeight;
        drawWidth = drawHeight * artworkAspect;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvasWidth;
        drawHeight = drawWidth / artworkAspect;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      }

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

      // Draw punch holes
      state.punchHoles.forEach(hole => {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.r, 0, 2 * Math.PI);
        ctx.fill();
      });
    };
    img.src = state.artwork;
  };

  const checkCollisions = () => {
    if (!state.artwork || state.punchHoles.length === 0) {
      dispatch({ type: 'SET_BANNER', payload: null });
      return;
    }

    const safeZoneInset = (state.safeZonePercent / 100) * Math.min(state.cardWidth, state.cardHeight) * state.canvasScale;
    
    let hasCollision = false;
    
    for (const hole of state.punchHoles) {
      const holeLeft = hole.x - hole.r;
      const holeRight = hole.x + hole.r;
      const holeTop = hole.y - hole.r;
      const holeBottom = hole.y + hole.r;
      
      if (holeRight > safeZoneInset && 
          holeLeft < state.canvasWidth - safeZoneInset &&
          holeBottom > safeZoneInset && 
          holeTop < state.canvasHeight - safeZoneInset) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>6. Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {state.banner && (
          <Alert variant={getBannerVariant()} className="mb-4">
            {getBannerIcon()}
            <AlertDescription>{state.banner.message}</AlertDescription>
          </Alert>
        )}
        
        <div ref={containerRef} className="relative inline-block border rounded-lg overflow-hidden bg-muted max-w-full">
          <canvas
            ref={canvasRef}
            className="block max-w-full h-auto"
          />
          
          {/* Safe zone overlay */}
          {state.artwork && (
            <div
              className="absolute pointer-events-none opacity-40"
              style={{
                top: `${(state.safeZonePercent / 100) * Math.min(state.cardWidth, state.cardHeight) * state.canvasScale / state.canvasHeight * 100}%`,
                left: `${(state.safeZonePercent / 100) * Math.min(state.cardWidth, state.cardHeight) * state.canvasScale / state.canvasWidth * 100}%`,
                right: `${(state.safeZonePercent / 100) * Math.min(state.cardWidth, state.cardHeight) * state.canvasScale / state.canvasWidth * 100}%`,
                bottom: `${(state.safeZonePercent / 100) * Math.min(state.cardWidth, state.cardHeight) * state.canvasScale / state.canvasHeight * 100}%`,
                background: 'repeating-linear-gradient(45deg, #ef4444 0px, #ef4444 8px, transparent 8px, transparent 16px)',
                animation: 'moveStripes 2s linear infinite',
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
