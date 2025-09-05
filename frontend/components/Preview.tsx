import React, { useRef, useEffect } from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function Preview() {
  const { state, dispatch } = useValidart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const updatePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxCanvasSize = Math.min(600, window.innerWidth - 450);
    const cardAspectRatio = state.cardWidth / state.cardHeight;
    
    let canvasWidth, canvasHeight, pixelsPerMM;

    if (cardAspectRatio > 1) {
      canvasWidth = Math.min(maxCanvasSize, 600);
      canvasHeight = canvasWidth / cardAspectRatio;
    } else {
      canvasHeight = Math.min(maxCanvasSize, 600);
      canvasWidth = canvasHeight * cardAspectRatio;
    }
    pixelsPerMM = canvasWidth / state.cardWidth;

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
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);
      ctx.fillStyle = '#6c757d';
      ctx.font = `${Math.min(canvasWidth, canvasHeight) / 20}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload artwork to preview', canvasWidth / 2, canvasHeight / 2);
      ctx.font = `${Math.min(canvasWidth, canvasHeight) / 30}px system-ui`;
      ctx.fillText(`${state.cardWidth.toFixed(1)}mm × ${state.cardHeight.toFixed(1)}mm`, canvasWidth / 2, canvasHeight / 2 + 30);
      return;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const img = new Image();
    img.onload = () => {
      const artworkAspect = img.width / img.height;
      let drawWidth, drawHeight, drawX, drawY;
      
      if (artworkAspect > cardAspectRatio) {
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

      if (state.roundedCorners) {
        const radius = Math.min(canvasWidth, canvasHeight) * 0.05;
        ctx.globalCompositeOperation = 'destination-in';
        roundRect(ctx, 0, 0, canvasWidth, canvasHeight, radius);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      state.features.forEach(feature => {
        ctx.fillStyle = '#ef4444';
        if (feature.type === 'circle') {
          ctx.beginPath();
          ctx.arc(feature.x * pixelsPerMM, feature.y * pixelsPerMM, feature.r * pixelsPerMM, 0, 2 * Math.PI);
          ctx.fill();
        } else if (feature.type === 'slot') {
          const { x, y, width, height } = feature;
          const slotX = (x - width / 2) * pixelsPerMM;
          const slotY = (y - height / 2) * pixelsPerMM;
          const slotWidth = width * pixelsPerMM;
          const slotHeight = height * pixelsPerMM;
          const radius = slotHeight / 2;
          roundRect(ctx, slotX, slotY, slotWidth, slotHeight, radius);
          ctx.fill();
        }
      });

      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, canvasWidth - 1, canvasHeight - 1);
    };
    img.src = state.artwork;
  };

  const checkCollisions = () => {
    if (!state.artwork || state.features.length === 0) {
      dispatch({ type: 'SET_BANNER', payload: null });
      return;
    }

    const safeZoneInsetMM = (state.safeZonePercent / 100) * Math.min(state.cardWidth, state.cardHeight);
    let hasCollision = false;
    
    for (const feature of state.features) {
      if (feature.type === 'circle') {
        const { x, y, r } = feature;
        const holeLeft = x - r;
        const holeRight = x + r;
        const holeTop = y - r;
        const holeBottom = y + r;
        
        if (holeRight > safeZoneInsetMM && holeLeft < state.cardWidth - safeZoneInsetMM && holeBottom > safeZoneInsetMM && holeTop < state.cardHeight - safeZoneInsetMM) {
          hasCollision = true;
          break;
        }
      } else if (feature.type === 'slot') {
        const { x, y, width, height } = feature;
        const slotLeft = x - width / 2;
        const slotRight = x + width / 2;
        const slotTop = y - height / 2;
        const slotBottom = y + height / 2;

        if (slotRight > safeZoneInsetMM && slotLeft < state.cardWidth - safeZoneInsetMM && slotBottom > safeZoneInsetMM && slotTop < state.cardHeight - safeZoneInsetMM) {
          hasCollision = true;
          break;
        }
      }
    }
    
    if (hasCollision) {
      dispatch({ type: 'SET_BANNER', payload: { message: 'Artwork intersects with features – DO NOT PRINT', type: 'danger' } });
    } else {
      dispatch({ type: 'SET_BANNER', payload: { message: 'OK to print', type: 'success' } });
    }
  };

  useEffect(() => {
    updatePreview();
  }, [state.artwork, state.cardWidth, state.cardHeight, state.roundedCorners, state.features]);

  useEffect(() => {
    checkCollisions();
  }, [state.features, state.safeZonePercent, state.cardWidth, state.cardHeight, state.canvasScale]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = state.features.length - 1; i >= 0; i--) {
      const feature = state.features[i];
      const featureX = feature.x * state.canvasScale;
      const featureY = feature.y * state.canvasScale;
      let isHit = false;

      if (feature.type === 'circle') {
        const r = feature.r * state.canvasScale;
        const distance = Math.sqrt((x - featureX) ** 2 + (y - featureY) ** 2);
        if (distance <= r) isHit = true;
      } else {
        const width = feature.width * state.canvasScale;
        const height = feature.height * state.canvasScale;
        if (x >= featureX - width / 2 && x <= featureX + width / 2 && y >= featureY - height / 2 && y <= featureY + height / 2) {
          isHit = true;
        }
      }

      if (isHit) {
        dispatch({ type: 'SET_DRAGGING', payload: { isDragging: true, dragTarget: { type: 'feature', id: feature.id } } });
        dispatch({ type: 'SET_LAST_MOUSE_POS', payload: { x, y } });
        return;
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (state.isDragging && state.dragTarget?.type === 'feature') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const deltaX = (x - state.lastMousePos.x) / state.canvasScale;
      const deltaY = (y - state.lastMousePos.y) / state.canvasScale;

      const feature = state.features.find(f => f.id === state.dragTarget.id);
      if (feature) {
        dispatch({
          type: 'UPDATE_FEATURE',
          payload: { id: feature.id, updates: { x: feature.x + deltaX, y: feature.y + deltaY } }
        });
      }
      dispatch({ type: 'SET_LAST_MOUSE_POS', payload: { x, y } });
    }
  };

  const handleMouseUp = () => {
    if (state.isDragging) {
      dispatch({ type: 'SET_DRAGGING', payload: { isDragging: false } });
    }
  };

  useEffect(() => {
    if (state.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state.isDragging, state.lastMousePos, state.canvasScale]);

  const getBannerIcon = () => {
    if (!state.banner) return null;
    switch (state.banner.type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'danger': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getBannerVariant = () => {
    if (!state.banner) return 'default';
    return state.banner.type === 'danger' ? 'destructive' : 'default';
  };

  const safeZoneInsetPixels = (state.safeZonePercent / 100) * Math.min(state.cardWidth, state.cardHeight) * state.canvasScale;

  return (
    <div className="w-full max-w-4xl space-y-4">
      {state.banner && (
        <Alert variant={getBannerVariant()} className="max-w-md mx-auto">
          {getBannerIcon()}
          <AlertDescription>{state.banner.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-center">
        <div ref={containerRef} className="relative inline-block border rounded-lg overflow-hidden bg-muted shadow-lg cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDown}>
          <canvas ref={canvasRef} className="block max-w-full h-auto" />
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
      
      <div className="text-center text-sm text-muted-foreground">
        Card: {state.cardWidth.toFixed(1)}mm × {state.cardHeight.toFixed(1)}mm 
        ({(state.cardWidth / 25.4).toFixed(3)}" × {(state.cardHeight / 25.4).toFixed(3)}")
      </div>
    </div>
  );
}
