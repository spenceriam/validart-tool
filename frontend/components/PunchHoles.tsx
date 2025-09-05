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
    <Card>
      <CardHeader>
        <CardTitle>5. Punch Holes (Freestyle)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Click to add punch holes:</h3>
            <div className="flex gap-4 justify-center mb-4">
              {[3, 5, 7].map(size => (
                <button
                  key={size}
                  onClick={() => createPunchHole(size)}
                  className="flex flex-col items-center p-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div
                    className="bg-destructive rounded-full border-2 border-white shadow-md mb-1"
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
          <Button
            variant="outline"
            onClick={handleClearHoles}
            className="w-full"
            disabled={state.punchHoles.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all holes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
