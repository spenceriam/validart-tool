import React from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function SafeZone() {
  const { state, dispatch } = useValidart();

  const handleSafeZoneChange = (value: number[]) => {
    dispatch({ type: 'SET_SAFE_ZONE', payload: value[0] });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label className="text-xs">Margin size: {state.safeZonePercent.toFixed(1)}%</Label>
          <Slider
            value={[state.safeZonePercent]}
            onValueChange={handleSafeZoneChange}
            min={5}
            max={50}
            step={0.5}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
