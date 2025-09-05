import React from 'react';
import { Trash2 } from 'lucide-react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PunchHoles() {
  const { state, dispatch } = useValidart();

  const handleClearHoles = () => {
    dispatch({ type: 'CLEAR_PUNCH_HOLES' });
  };

  const createPunchHole = (size: number) => {
    const newHole = {
      id: `hole-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: state.canvasWidth / 2,
      y: state.canvasHeight / 2,
      r: size,
    };
    dispatch({ type: 'ADD_PUNCH_HOLE', payload: newHole });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Punch Holes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-medium mb-2">Click to add punch holes:</h3>
            <div className="flex gap-2 justify-center mb-3">
              {[3, 5, 7].map(size => (
                <button
                  key={size}
                  onClick={() => createPunchHole(size)}
                  className="flex flex-col items-center p-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div
                    className="bg-destructive rounded-full border-2 border-white shadow-sm mb-1"
                    style={{
                      width: `${size * 3}px`,
                      height: `${size * 3}px`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{size}mm</span>
                </button>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHoles}
            className="w-full h-8 text-xs"
            disabled={state.punchHoles.length === 0}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all holes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
