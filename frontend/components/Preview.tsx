import React, { useRef, useEffect, useCallback } from 'react';
import { useValidart } from '../contexts/ValidartContext';

export default function Preview() {
  const { state, dispatch } = useValidart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  const drawDashedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, dashLength: number = 5) => {
    ctx.save();
    ctx.setLineDash([dashLength, dashLength]);
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
  };

  const updatePreview = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const cardAspectRatio = state.cardWidth / state.cardHeight;
    
    let canvasWidth, canvasHeight;

    // Calculate canvas size to fit within container while maintaining aspect ratio
    // Leave some padding (20px on each side)
    const maxWidth = containerWidth - 40;
    const maxHeight = containerHeight - 40;

    if (maxWidth / maxHeight > cardAspectRatio) {
      // Container is wider, limit by height
      canvasHeight = maxHeight;
      canvasWidth = canvasHeight * cardAspectRatio;
    } else {
      // Container is taller, limit by width
      canvasWidth = maxWidth;
      canvasHeight = canvasWidth / cardAspectRatio;
    }

    // Ensure minimum size for usability
    const minSize = 200;
    if (canvasWidth < minSize) {
      canvasWidth = minSize;
      canvasHeight = canvasWidth / cardAspectRatio;
    }
    if (canvasHeight < minSize) {
      canvasHeight = minSize;
      canvasWidth = canvasHeight * cardAspectRatio;
    }

    const pixelsPerMM = canvasWidth / state.cardWidth;

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
      
      // Draw trim line (blue)
      if (state.trimDistance > 0) {
        const trimInset = state.trimDistance * pixelsPerMM;
        ctx.strokeStyle = '#3b82f6'; // blue-500
        ctx.lineWidth = 1;
        drawDashedRect(ctx, trimInset, trimInset, canvasWidth - 2 * trimInset, canvasHeight - 2 * trimInset);
      }

      // Draw bleed line (red)
      if (state.bleedDistance > 0) {
        const bleedInset = state.bleedDistance * pixelsPerMM;
        ctx.strokeStyle = '#ef4444'; // red-500
        ctx.lineWidth = 1;
        drawDashedRect(ctx, bleedInset, bleedInset, canvasWidth - 2 * bleedInset, canvasHeight - 2 * bleedInset);
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

      // Draw trim line (blue) - always on top
      if (state.trimDistance > 0) {
        const trimInset = state.trimDistance * pixelsPerMM;
        ctx.strokeStyle = '#3b82f6'; // blue-500
        ctx.lineWidth = 1;
        drawDashedRect(ctx, trimInset, trimInset, canvasWidth - 2 * trimInset, canvasHeight - 2 * trimInset);
      }

      // Draw bleed line (red) - always on top
      if (state.bleedDistance > 0) {
        const bleedInset = state.bleedDistance * pixelsPerMM;
        ctx.strokeStyle = '#ef4444'; // red-500
        ctx.lineWidth = 1;
        drawDashedRect(ctx, bleedInset, bleedInset, canvasWidth - 2 * bleedInset, canvasHeight - 2 * bleedInset);
      }

      // Draw Card Border (always on top)
      ctx.strokeStyle = 'hsl(var(--foreground) / 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]); // Reset to solid line
      if (state.roundedCorners) {
        const radius = Math.min(canvasWidth, canvasHeight) * 0.05;
        roundRect(ctx, 0.5, 0.5, canvasWidth - 1, canvasHeight - 1, radius);
        ctx.stroke();
      } else {
        ctx.strokeRect(0.5, 0.5, canvasWidth - 1, canvasHeight - 1);
      }
    };
    img.src = state.artwork;
  }, [state.artwork, state.cardWidth, state.cardHeight, state.roundedCorners, state.features, state.trimDistance, state.bleedDistance, dispatch]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Schedule update on next frame to prevent flashing
      animationFrameRef.current = requestAnimationFrame(updatePreview);
    });
    
    resizeObserver.observe(container);
    
    // Initial update
    updatePreview();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updatePreview]);

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
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
        // Use animation frame to throttle updates and prevent flashing
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          dispatch({
            type: 'UPDATE_FEATURE',
            payload: { id: feature.id, updates: { x: feature.x + deltaX, y: feature.y + deltaY } }
          });
          dispatch({ type: 'SET_LAST_MOUSE_POS', payload: { x, y } });
        });
      }
    }
  }, [state.isDragging, state.dragTarget, state.lastMousePos, state.canvasScale, state.features, dispatch]);

  const handleMouseUp = useCallback(() => {
    if (state.isDragging) {
      dispatch({ type: 'SET_DRAGGING', payload: { isDragging: false } });
    }
  }, [state.isDragging, dispatch]);

  useEffect(() => {
    if (state.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state.isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div ref={canvasContainerRef} className="flex-1 flex items-center justify-center relative">
        <div className="relative inline-block shadow-lg cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDown}>
          <canvas ref={canvasRef} className="block max-w-full max-h-full rounded-lg border border-border" />
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground pt-4">
        Card: {state.cardWidth.toFixed(1)}mm × {state.cardHeight.toFixed(1)}mm 
        ({(state.cardWidth / 25.4).toFixed(3)}" × {(state.cardHeight / 25.4).toFixed(3)}")
      </div>
    </div>
  );
}
