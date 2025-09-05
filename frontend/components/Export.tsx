import React from 'react';
import { Download } from 'lucide-react';
import { useValidart } from '../contexts/ValidartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function Export() {
  const { state } = useValidart();
  const [selectedDpi, setSelectedDpi] = React.useState('300');
  const { toast } = useToast();

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const downloadProof = () => {
    if (!state.artwork) {
      toast({
        title: "Error",
        description: "Please upload artwork first",
        variant: "destructive",
      });
      return;
    }

    const dpi = parseInt(selectedDpi);
    const mmToPx = dpi / 25.4;

    const exportWidth = state.cardWidth * mmToPx;
    const exportHeight = state.cardHeight * mmToPx;
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;
    
    const img = new Image();
    img.onload = () => {
      exportCtx.fillStyle = '#ffffff';
      exportCtx.fillRect(0, 0, exportWidth, exportHeight);
      
      const artworkAspect = img.width / img.height;
      const cardAspect = state.cardWidth / state.cardHeight;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (artworkAspect > cardAspect) {
        drawHeight = exportHeight;
        drawWidth = drawHeight * artworkAspect;
        drawX = (exportWidth - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = exportWidth;
        drawHeight = drawWidth / artworkAspect;
        drawX = 0;
        drawY = (exportHeight - drawHeight) / 2;
      }

      exportCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      exportCtx.fillStyle = '#ef4444';
      state.features.forEach(feature => {
        if (feature.type === 'circle') {
          exportCtx.beginPath();
          exportCtx.arc(feature.x * mmToPx, feature.y * mmToPx, feature.r * mmToPx, 0, 2 * Math.PI);
          exportCtx.fill();
        } else if (feature.type === 'slot') {
          const { x, y, width, height } = feature;
          const slotX = (x - width / 2) * mmToPx;
          const slotY = (y - height / 2) * mmToPx;
          const slotWidth = width * mmToPx;
          const slotHeight = height * mmToPx;
          const radius = slotHeight / 2;
          roundRect(exportCtx, slotX, slotY, slotWidth, slotHeight, radius);
          exportCtx.fill();
        }
      });
      
      exportCtx.save();
      exportCtx.globalAlpha = 0.4;
      exportCtx.fillStyle = 'white';
      exportCtx.font = `${exportWidth / 15}px system-ui`;
      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'middle';
      exportCtx.fillText('PROOF', exportWidth / 2, exportHeight / 2);
      exportCtx.restore();
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `Validart-proof-${state.cardWidth}x${state.cardHeight}-${timestamp}.png`;
      
      exportCanvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Success",
            description: "Proof downloaded successfully",
          });
        }
      }, 'image/png');
    };
    img.src = state.artwork;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Download Proof</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">DPI</Label>
            <Select value={selectedDpi} onValueChange={setSelectedDpi}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="150">150 DPI</SelectItem>
                <SelectItem value="300">300 DPI</SelectItem>
                <SelectItem value="600">600 DPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={downloadProof} 
            disabled={!state.artwork}
            className="w-full h-8 text-xs"
            size="sm"
          >
            <Download className="h-3 w-3 mr-1" />
            Download Proof
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
