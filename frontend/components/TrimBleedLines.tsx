import React, { useState, useEffect } from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TrimBleedLines() {
  const { state, dispatch } = useValidart();

  const [trimMm, setTrimMm] = useState(state.trimDistance.toString());
  const [bleedMm, setBleedMm] = useState(state.bleedDistance.toString());
  const [trimIn, setTrimIn] = useState((state.trimDistance / 25.4).toFixed(3));
  const [bleedIn, setBleedIn] = useState((state.bleedDistance / 25.4).toFixed(3));

  useEffect(() => {
    setTrimMm(state.trimDistance.toString());
    setTrimIn((state.trimDistance / 25.4).toFixed(3));
  }, [state.trimDistance]);

  useEffect(() => {
    setBleedMm(state.bleedDistance.toString());
    setBleedIn((state.bleedDistance / 25.4).toFixed(3));
  }, [state.bleedDistance]);

  const inchesToMm = (inches: number) => inches * 25.4;

  const handleMmChange = (value: string, type: 'trim' | 'bleed') => {
    if (type === 'trim') setTrimMm(value);
    else setBleedMm(value);

    if (value.trim() === '' || value.endsWith('.')) return;

    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      if (type === 'trim') {
        dispatch({ type: 'SET_TRIM_DISTANCE', payload: parsed });
      } else {
        dispatch({ type: 'SET_BLEED_DISTANCE', payload: parsed });
      }
    }
  };

  const handleInchesChange = (value: string, type: 'trim' | 'bleed') => {
    if (type === 'trim') setTrimIn(value);
    else setBleedIn(value);

    if (value.trim() === '' || value.endsWith('.')) return;

    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      const mm = inchesToMm(parsed);
      if (type === 'trim') {
        dispatch({ type: 'SET_TRIM_DISTANCE', payload: mm });
      } else {
        dispatch({ type: 'SET_BLEED_DISTANCE', payload: mm });
      }
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Trim & Bleed Lines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trim Distance */}
          <div className="space-y-2">
            <Label className="text-xs">Trim distance from edge</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="trim-mm" className="text-xs font-normal text-muted-foreground">mm</Label>
                <Input
                  id="trim-mm"
                  type="text"
                  inputMode="decimal"
                  value={trimMm}
                  onChange={(e) => handleMmChange(e.target.value, 'trim')}
                  placeholder="0.5"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="trim-in" className="text-xs font-normal text-muted-foreground">in</Label>
                <Input
                  id="trim-in"
                  type="text"
                  inputMode="decimal"
                  value={trimIn}
                  onChange={(e) => handleInchesChange(e.target.value, 'trim')}
                  placeholder="0.020"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Bleed Distance */}
          <div className="space-y-2">
            <Label className="text-xs">Bleed distance from edge</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="bleed-mm" className="text-xs font-normal text-muted-foreground">mm</Label>
                <Input
                  id="bleed-mm"
                  type="text"
                  inputMode="decimal"
                  value={bleedMm}
                  onChange={(e) => handleMmChange(e.target.value, 'bleed')}
                  placeholder="2.0"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bleed-in" className="text-xs font-normal text-muted-foreground">in</Label>
                <Input
                  id="bleed-in"
                  type="text"
                  inputMode="decimal"
                  value={bleedIn}
                  onChange={(e) => handleInchesChange(e.target.value, 'bleed')}
                  placeholder="0.079"
                  className="h-8 text-sm"
                />
              </div>
            </div>
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
