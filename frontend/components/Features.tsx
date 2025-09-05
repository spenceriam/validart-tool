import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Features() {
  const { state, dispatch } = useValidart();
  const [customCircleSize, setCustomCircleSize] = useState('3');
  const [customSlotWidth, setCustomSlotWidth] = useState('15');
  const [customSlotHeight, setCustomSlotHeight] = useState('5');
  const [showCustomCircle, setShowCustomCircle] = useState(false);
  const [showCustomSlot, setShowCustomSlot] = useState(false);

  const handleClearFeatures = () => {
    dispatch({ type: 'CLEAR_FEATURES' });
  };

  const handleRoundedCornersChange = (checked: boolean) => {
    dispatch({ type: 'SET_ROUNDED_CORNERS', payload: checked });
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

  const createCustomCircle = () => {
    const size = parseFloat(customCircleSize);
    if (size > 0 && size <= 20) {
      createCircleFeature(size);
      setShowCustomCircle(false);
    }
  };

  const createCustomSlot = () => {
    const width = parseFloat(customSlotWidth);
    const height = parseFloat(customSlotHeight);
    if (width > 0 && height > 0 && width <= 50 && height <= 50) {
      createSlotFeature(width, height);
      setShowCustomSlot(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Rounded Corners */}
          <div className="flex items-center space-x-2 pb-2 border-b border-border">
            <Switch
              id="rounded-corners"
              checked={state.roundedCorners}
              onCheckedChange={handleRoundedCornersChange}
            />
            <Label htmlFor="rounded-corners" className="text-xs">Rounded corners</Label>
          </div>

          {/* Punch Holes */}
          <div>
            <h3 className="text-xs font-medium mb-2">Punch Holes</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[3, 5, 7, 10].map(size => (
                <button
                  key={size}
                  onClick={() => createCircleFeature(size)}
                  className="flex flex-col items-center p-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div
                    className="bg-destructive rounded-full border-2 border-white shadow-sm mb-1"
                    style={{
                      width: `${Math.min(size * 3, 24)}px`,
                      height: `${Math.min(size * 3, 24)}px`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{size}mm</span>
                </button>
              ))}
            </div>
            <Dialog open={showCustomCircle} onOpenChange={setShowCustomCircle}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Custom size
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Custom Punch Hole</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-circle-size" className="text-sm">Diameter (mm)</Label>
                    <Input
                      id="custom-circle-size"
                      type="number"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={customCircleSize}
                      onChange={(e) => setCustomCircleSize(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCustomCircle(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={createCustomCircle} className="flex-1">
                      Add
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Slots */}
          <div>
            <h3 className="text-xs font-medium mb-2">Slots</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { width: 15, height: 5, label: "15x5" },
                { width: 20, height: 5, label: "20x5" },
                { width: 25, height: 8, label: "25x8" },
                { width: 30, height: 10, label: "30x10" }
              ].map(slot => (
                <button
                  key={slot.label}
                  onClick={() => createSlotFeature(slot.width, slot.height)}
                  className="flex flex-col items-center p-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div
                    className="bg-destructive rounded-full border-2 border-white shadow-sm mb-1"
                    style={{
                      width: `${Math.min(slot.width * 1.2, 30)}px`,
                      height: `${Math.min(slot.height * 2, 16)}px`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{slot.label}mm</span>
                </button>
              ))}
            </div>
            <Dialog open={showCustomSlot} onOpenChange={setShowCustomSlot}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Custom size
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Custom Slot</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="custom-slot-width" className="text-sm">Width (mm)</Label>
                      <Input
                        id="custom-slot-width"
                        type="number"
                        min="0.1"
                        max="50"
                        step="0.1"
                        value={customSlotWidth}
                        onChange={(e) => setCustomSlotWidth(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-slot-height" className="text-sm">Height (mm)</Label>
                      <Input
                        id="custom-slot-height"
                        type="number"
                        min="0.1"
                        max="50"
                        step="0.1"
                        value={customSlotHeight}
                        onChange={(e) => setCustomSlotHeight(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCustomSlot(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={createCustomSlot} className="flex-1">
                      Add
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
