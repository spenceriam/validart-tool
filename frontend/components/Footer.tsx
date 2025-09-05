import React from 'react';
import { Button } from '@/components/ui/button';
import { useValidart } from '../contexts/ValidartContext';
import { useToast } from '@/components/ui/use-toast';

export default function Footer() {
  const { dispatch } = useValidart();
  const { toast } = useToast();

  const clearStorage = () => {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('validart_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Reset application state
    dispatch({ type: 'RESET_STATE' });
    
    toast({
      title: "Success",
      description: "Storage cleared successfully",
    });
  };

  return (
    <footer className="bg-muted border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          © 2024 Validart. Open source tool for artwork safety preview.
        </p>
        <Button variant="outline" size="sm" onClick={clearStorage}>
          Clear Storage
        </Button>
      </div>
    </footer>
  );
}
