import React from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Options() {
  const { state, dispatch } = useValidart();

  const handleRoundedCornersChange = (checked: boolean) => {
    dispatch({ type: 'SET_ROUNDED_CORNERS', payload: checked });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="rounded-corners"
            checked={state.roundedCorners}
            onCheckedChange={handleRoundedCornersChange}
          />
          <Label htmlFor="rounded-corners">Rounded corners</Label>
        </div>
      </CardContent>
    </Card>
  );
}
