import React from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CardDimensions() {
  const { state, dispatch } = useValidart();

  const mmToInches = (mm: number) => mm / 25.4;
  const inchesToMm = (inches: number) => inches * 25.4;

  const handleWidthMmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string, decimal point, or valid numbers
    if (value === '' || value === '.') {
      return;
    }
    
    const width = parseFloat(value);
    if (!isNaN(width) && width > 0) {
      dispatch({ type: 'SET_CARD_DIMENSIONS', payload: { width, height: state.cardHeight } });
    }
  };

  const handleHeightMmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string, decimal point, or valid numbers
    if (value === '' || value === '.') {
      return;
    }
    
    const height = parseFloat(value);
    if (!isNaN(height) && height > 0) {
      dispatch({ type: 'SET_CARD_DIMENSIONS', payload: { width: state.cardWidth, height } });
    }
  };

  const handleWidthInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string, decimal point, or valid numbers
    if (value === '' || value === '.') {
      return;
    }
    
    const inches = parseFloat(value);
    if (!isNaN(inches) && inches > 0) {
      const width = inchesToMm(inches);
      dispatch({ type: 'SET_CARD_DIMENSIONS', payload: { width, height: state.cardHeight } });
    }
  };

  const handleHeightInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string, decimal point, or valid numbers
    if (value === '' || value === '.') {
      return;
    }
    
    const inches = parseFloat(value);
    if (!isNaN(inches) && inches > 0) {
      const height = inchesToMm(inches);
      dispatch({ type: 'SET_CARD_DIMENSIONS', payload: { width: state.cardWidth, height } });
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
                value={state.cardWidth.toString()}
                onChange={handleWidthMmChange}
                placeholder="85.6"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="width-in" className="text-xs">Width (in)</Label>
              <Input
                id="width-in"
                type="text"
                inputMode="decimal"
                value={mmToInches(state.cardWidth).toFixed(3)}
                onChange={handleWidthInchesChange}
                placeholder="3.370"
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
                value={state.cardHeight.toString()}
                onChange={handleHeightMmChange}
                placeholder="53.98"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="height-in" className="text-xs">Height (in)</Label>
              <Input
                id="height-in"
                type="text"
                inputMode="decimal"
                value={mmToInches(state.cardHeight).toFixed(3)}
                onChange={handleHeightInchesChange}
                placeholder="2.125"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
