import React from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CardDimensions() {
  const { state, dispatch } = useValidart();

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseFloat(e.target.value) || 85;
    dispatch({
      type: 'SET_CARD_DIMENSIONS',
      payload: { width, height: state.cardHeight }
    });
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = parseFloat(e.target.value) || 55;
    dispatch({
      type: 'SET_CARD_DIMENSIONS',
      payload: { width: state.cardWidth, height }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Card Dimensions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width (mm)</Label>
            <Input
              id="width"
              type="number"
              value={state.cardWidth}
              onChange={handleWidthChange}
              min="10"
              max="500"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (mm)</Label>
            <Input
              id="height"
              type="number"
              value={state.cardHeight}
              onChange={handleHeightChange}
              min="10"
              max="500"
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
