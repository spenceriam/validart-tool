import React from 'react';
import { Trash2 } from 'lucide-react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Features() {
  const { state, dispatch } = useValidart();

  const handleClearFeatures = () => {
    dispatch({ type: 'CLEAR_FEATURES' });
  };

  const createCircleFeature = (size: number) => {
    const newFeature = {
      id: `feature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'circle' as const,
      x: state.cardWidth / 2,
      y: state.cardHeight / 2,
      r: size,
    };
    dispatch({ type: 'ADD_FEATURE', payload: newFeature });
  };

  const createSlotFeature = (width: number, height: number) => {
    const newFeature = {
      id: `feature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'slot' as const,
      x: state.cardWidth / 2,
      y: state.cardHeight / 2,
      width: width,
      height: height,
    };
    dispatch({ type: 'ADD_FEATURE', payload: newFeature });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-medium mb-2">Circles</h3>
            <div className="flex gap-2 justify-center mb-3">
              {[3, 5, 7].map(size => (
                <button
                  key={size}
                  onClick={() => createCircleFeature(size)}
                  className="flex flex-col items-center p-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div
                    className="bg-destructive rounded-full border-2 border-white shadow-sm mb-1"
                    style={{
                      width: `${size * 4}px`,
                      height: `${size * 4}px`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{size}mm</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium mb-2">Slots</h3>
            <div className="flex gap-2 justify-center mb-3">
              <button
                onClick={() => createSlotFeature(15, 5)}
                className="flex flex-col items-center p-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div
                  className="bg-destructive rounded-full border-2 border-white shadow-sm mb-1"
                  style={{
                    width: `${15 * 2}px`,
                    height: `${5 * 2}px`,
                  }}
                />
                <span className="text-xs text-muted-foreground">15x5mm</span>
              </button>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFeatures}
            className="w-full h-8 text-xs"
            disabled={state.features.length === 0}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all features
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
