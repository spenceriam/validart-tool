import React from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EdgeDistances() {
  const { state } = useValidart();

  const getEdgeDistances = () => {
    if (state.features.length === 0) return [];

    const results = state.features.map(feature => {
      let featureLeft, featureRight, featureTop, featureBottom;
      let featureName;

      if (feature.type === 'circle') {
        const { x, y, r } = feature;
        featureLeft = x - r;
        featureRight = x + r;
        featureTop = y - r;
        featureBottom = y + r;
        featureName = `Punch hole (${(r * 2).toFixed(1)}mm)`;
      } else if (feature.type === 'slot') {
        const { x, y, width, height } = feature;
        featureLeft = x - width / 2;
        featureRight = x + width / 2;
        featureTop = y - height / 2;
        featureBottom = y + height / 2;
        featureName = `Slot (${width.toFixed(1)}×${height.toFixed(1)}mm)`;
      } else {
        return null;
      }

      // Calculate distances to each edge
      const distanceToLeft = featureLeft;
      const distanceToRight = state.cardWidth - featureRight;
      const distanceToTop = featureTop;
      const distanceToBottom = state.cardHeight - featureBottom;

      // Find minimum distances for horizontal and vertical
      const minHorizontal = Math.min(distanceToLeft, distanceToRight);
      const minVertical = Math.min(distanceToTop, distanceToBottom);
      const closestHorizontalEdge = distanceToLeft < distanceToRight ? 'left' : 'right';
      const closestVerticalEdge = distanceToTop < distanceToBottom ? 'top' : 'bottom';

      return {
        id: feature.id,
        name: featureName,
        x: feature.x,
        y: feature.y,
        minHorizontal,
        minVertical,
        closestHorizontalEdge,
        closestVerticalEdge,
        minOverall: Math.min(minHorizontal, minVertical)
      };
    }).filter(Boolean);

    return results.sort((a, b) => a.minOverall - b.minOverall);
  };

  const edgeDistances = getEdgeDistances();

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Edge Distances</CardTitle>
      </CardHeader>
      <CardContent>
        {edgeDistances.length > 0 ? (
          <div className="space-y-3">
            {edgeDistances.map((info, index) => (
              <div key={info.id} className={`p-3 rounded-lg border ${index === 0 ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950' : 'border-border bg-muted/30'}`}>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {info.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Horizontal:</span>
                    <div className="font-medium">
                      {info.minHorizontal.toFixed(1)}mm ({info.closestHorizontalEdge})
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vertical:</span>
                    <div className="font-medium">
                      {info.minVertical.toFixed(1)}mm ({info.closestVerticalEdge})
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Position: ({info.x.toFixed(1)}, {info.y.toFixed(1)})
                </div>
              </div>
            ))}
            {edgeDistances.length > 1 && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/20 rounded">
                <strong>Closest to edge:</strong> {edgeDistances[0].name} at {edgeDistances[0].minOverall.toFixed(1)}mm
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            No features to measure
          </div>
        )}
      </CardContent>
    </Card>
  );
}
