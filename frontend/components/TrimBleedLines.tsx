import React from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TrimBleedLines() {
  const { state, dispatch } = useValidart();

  const handleTrimDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value === '.') {
      return; // Allow empty or just decimal point while typing
    }
    const distance = parseFloat(value);
    if (!isNaN(distance) && distance >= 0) {
      dispatch({
        type: 'SET_TRIM_DISTANCE',
        payload: distance
      });
    }
  };

  const handleBleedDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value === '.') {
      return; // Allow empty or just decimal point while typing
    }
    const distance = parseFloat(value);
    if (!isNaN(distance) && distance >= 0) {
      dispatch({
        type: 'SET_BLEED_DISTANCE',
        payload: distance
      });
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Trim & Bleed Lines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trim-distance" className="text-xs">Trim distance from edge (mm)</Label>
            <Input
              id="trim-distance"
              type="text"
              inputMode="decimal"
              value={state.trimDistance.toString()}
              onChange={handleTrimDistanceChange}
              placeholder="0.5"
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bleed-distance" className="text-xs">Bleed distance from edge (mm)</Label>
            <Input
              id="bleed-distance"
              type="text"
              inputMode="decimal"
              value={state.bleedDistance.toString()}
              onChange={handleBleedDistanceChange}
              placeholder="2.0"
              className="h-8 text-sm"
            />
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-border">
            <h4 className="text-xs font-medium mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span className="text-xs text-muted-foreground">Trim line</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500"></div>
                <span className="text-xs text-muted-foreground">Bleed line</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
