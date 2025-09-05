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
    const scaleFactor = dpi / 150;
    
    // Create export canvas
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;
    
    const exportWidth = state.canvasWidth * scaleFactor;
    const exportHeight = state.canvasHeight * scaleFactor;
    
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    
    // Scale context
    exportCtx.scale(scaleFactor, scaleFactor);
    
    // Load artwork and draw
    const img = new Image();
    img.onload = () => {
      // Clear canvas
      exportCtx.fillStyle = '#ffffff';
      exportCtx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
      
      // Draw artwork
      const artworkAspect = img.width / img.height;
      const cardAspect = state.cardWidth / state.cardHeight;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (artworkAspect > cardAspect) {
        drawHeight = state.canvasHeight;
        drawWidth = drawHeight * artworkAspect;
        drawX = (state.canvasWidth - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = state.canvasWidth;
        drawHeight = drawWidth / artworkAspect;
        drawX = 0;
        drawY = (state.canvasHeight - drawHeight) / 2;
      }

      exportCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      // Draw punch holes
      exportCtx.fillStyle = '#ef4444';
      state.punchHoles.forEach(hole => {
        exportCtx.beginPath();
        exportCtx.arc(hole.x, hole.y, hole.r, 0, 2 * Math.PI);
        exportCtx.fill();
      });
      
      // Add watermark
      exportCtx.save();
      exportCtx.globalAlpha = 0.4;
      exportCtx.fillStyle = 'white';
      exportCtx.font = '48px system-ui';
      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'middle';
      exportCtx.fillText('PROOF', state.canvasWidth / 2, state.canvasHeight / 2);
      exportCtx.restore();
      
      // Download
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
    <Card>
      <CardHeader>
        <CardTitle>7. Download Proof</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>DPI</Label>
            <Select value={selectedDpi} onValueChange={setSelectedDpi}>
              <SelectTrigger>
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
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Proof
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
