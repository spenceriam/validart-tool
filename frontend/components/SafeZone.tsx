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
        <CardTitle className="text-sm font-medium">Safe Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label className="text-xs">Safe zone size: {state.safeZonePercent}%</Label>
          <Slider
            value={[state.safeZonePercent]}
            onValueChange={handleSafeZoneChange}
            min={10}
            max={15}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
