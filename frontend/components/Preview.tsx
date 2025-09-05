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

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!state.artwork) {
      // Light grey background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw border
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 2;
      if (state.roundedCorners) {
        const radius = Math.min(canvasWidth, canvasHeight) * 0.05;
        roundRect(ctx, 1, 1, canvasWidth - 2, canvasHeight - 2, radius);
        ctx.stroke();
      } else {
        ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);
      }
      
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = `${Math.min(canvasWidth, canvasHeight) / 20}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload artwork to begin', canvasWidth / 2, canvasHeight / 2);
      ctx.font = `${Math.min(canvasWidth, canvasHeight) / 30}px system-ui`;
      ctx.fillText(`${state.cardWidth.toFixed(1)}mm × ${state.cardHeight.toFixed(1)}mm`, canvasWidth / 2, canvasHeight / 2 + 30);
      return;
    }

    // Draw artwork
    const img = new Image();
    img.onload = () => {
      // Start with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Only apply clipping if rounded corners are enabled
      if (state.roundedCorners) {
        ctx.save();
        const radius = Math.min(canvasWidth, canvasHeight) * 0.05;
        roundRect(ctx, 0, 0, canvasWidth, canvasHeight, radius);
        ctx.clip();
      }

      // Draw the artwork to fill the card area
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
      
      // Restore from clipping if it was applied
      if (state.roundedCorners) {
        ctx.restore();
      }

      // Draw features on top of artwork (always outside clipping)
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

      // Draw Card Border (always on top)
      ctx.strokeStyle = 'hsl(var(--foreground) / 0.5)';
      ctx.lineWidth = 1;
      if (state.roundedCorners) {
        const radius = Math.min(canvasWidth, canvasHeight) * 0.05;
        roundRect(ctx, 0.5, 0.5, canvasWidth - 1, canvasHeight - 1, radius);
        ctx.stroke();
      } else {
        ctx.strokeRect(0.5, 0.5, canvasWidth - 1, canvasHeight - 1);
      }
    };
    img.src = state.artwork;
  };

  useEffect(() => {
    updatePreview();
  }, [state.artwork, state.cardWidth, state.cardHeight, state.roundedCorners, state.features]);

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

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex justify-center">
        <div ref={containerRef} className="relative inline-block shadow-lg cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDown}>
          <canvas ref={canvasRef} className="block max-w-full h-auto rounded-lg border border-border" />
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        Card: {state.cardWidth.toFixed(1)}mm × {state.cardHeight.toFixed(1)}mm 
        ({(state.cardWidth / 25.4).toFixed(3)}" × {(state.cardHeight / 25.4).toFixed(3)}")
      </div>
    </div>
  );
}
