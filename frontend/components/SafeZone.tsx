import React from 'react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function EdgeDistances() {
  const { state } = useValidart();

  const getMinDistanceToEdge = () => {
    if (state.features.length === 0) return null;

    let minDistance = Infinity;
    let closestFeature = null;

    state.features.forEach(feature => {
      let featureLeft, featureRight, featureTop, featureBottom;

      if (feature.type === 'circle') {
        const { x, y, r } = feature;
        featureLeft = x - r;
        featureRight = x + r;
        featureTop = y - r;
        featureBottom = y + r;
      } else if (feature.type === 'slot') {
        const { x, y, width, height } = feature;
        featureLeft = x - width / 2;
        featureRight = x + width / 2;
        featureTop = y - height / 2;
        featureBottom = y + height / 2;
      } else {
        return;
      }

      // Calculate distances to each edge
      const distanceToLeft = featureLeft;
      const distanceToRight = state.cardWidth - featureRight;
      const distanceToTop = featureTop;
      const distanceToBottom = state.cardHeight - featureBottom;

      const minFeatureDistance = Math.min(
        distanceToLeft,
        distanceToRight,
        distanceToTop,
        distanceToBottom
      );

      if (minFeatureDistance < minDistance) {
        minDistance = minFeatureDistance;
        closestFeature = feature;
      }
    });

    return minDistance === Infinity ? null : {
      distance: minDistance,
      feature: closestFeature
    };
  };

  const edgeInfo = getMinDistanceToEdge();

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Edge Distances</CardTitle>
      </CardHeader>
      <CardContent>
        {edgeInfo ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Closest feature to edge:
            </div>
            <div className="text-sm font-medium">
              {edgeInfo.distance.toFixed(1)}mm
            </div>
            <div className="text-xs text-muted-foreground">
              {edgeInfo.feature.type === 'circle' ? 'Punch hole' : 'Slot'} at ({edgeInfo.feature.x.toFixed(1)}, {edgeInfo.feature.y.toFixed(1)})
            </div>
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
