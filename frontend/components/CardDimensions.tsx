import React, { useState, useEffect } from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CardDimensions() {
  const { state, dispatch } = useValidart();

  const [widthMm, setWidthMm] = useState(state.cardWidth.toString());
  const [heightMm, setHeightMm] = useState(state.cardHeight.toString());
  const [widthIn, setWidthIn] = useState((state.cardWidth / 25.4).toFixed(3));
  const [heightIn, setHeightIn] = useState((state.cardHeight / 25.4).toFixed(3));

  useEffect(() => {
    setWidthMm(state.cardWidth.toString());
    setWidthIn((state.cardWidth / 25.4).toFixed(3));
  }, [state.cardWidth]);

  useEffect(() => {
    setHeightMm(state.cardHeight.toString());
    setHeightIn((state.cardHeight / 25.4).toFixed(3));
  }, [state.cardHeight]);

  const inchesToMm = (inches: number) => inches * 25.4;

  const handleMmChange = (value: string, dimension: 'width' | 'height') => {
    if (dimension === 'width') setWidthMm(value);
    else setHeightMm(value);

    if (value.trim() === '' || value.endsWith('.')) return;

    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      dispatch({
        type: 'SET_CARD_DIMENSIONS',
        payload: {
          width: dimension === 'width' ? parsed : state.cardWidth,
          height: dimension === 'height' ? parsed : state.cardHeight,
        },
      });
    }
  };

  const handleInchesChange = (value: string, dimension: 'width' | 'height') => {
    if (dimension === 'width') setWidthIn(value);
    else setHeightIn(value);

    if (value.trim() === '' || value.endsWith('.')) return;

    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      const mm = inchesToMm(parsed);
      dispatch({
        type: 'SET_CARD_DIMENSIONS',
        payload: {
          width: dimension === 'width' ? mm : state.cardWidth,
          height: dimension === 'height' ? mm : state.cardHeight,
        },
      });
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Card Dimensions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Width */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="width-mm" className="text-xs">Width (mm)</Label>
              <Input
                id="width-mm"
                type="text"
                inputMode="decimal"
                value={widthMm}
                onChange={(e) => handleMmChange(e.target.value, 'width')}
                placeholder="101.6"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="width-in" className="text-xs">Width (in)</Label>
              <Input
                id="width-in"
                type="text"
                inputMode="decimal"
                value={widthIn}
                onChange={(e) => handleInchesChange(e.target.value, 'width')}
                placeholder="4.000"
                className="h-8 text-sm"
              />
            </div>
          </div>
          
          {/* Height */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="height-mm" className="text-xs">Height (mm)</Label>
              <Input
                id="height-mm"
                type="text"
                inputMode="decimal"
                value={heightMm}
                onChange={(e) => handleMmChange(e.target.value, 'height')}
                placeholder="139.7"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="height-in" className="text-xs">Height (in)</Label>
              <Input
                id="height-in"
                type="text"
                inputMode="decimal"
                value={heightIn}
                onChange={(e) => handleInchesChange(e.target.value, 'height')}
                placeholder="5.500"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
