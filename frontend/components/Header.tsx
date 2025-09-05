import React, { useState, useEffect } from 'react';
import { Moon, Sun, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useValidart } from '../contexts/ValidartContext';
import { useToast } from '@/components/ui/use-toast';

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const { dispatch } = useValidart();
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark';
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const clearArtwork = () => {
    dispatch({ type: 'RESET_STATE' });
    toast({
      title: "Artwork cleared",
      description: "All settings have been reset",
    });
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">Validart</h1>
            <p className="text-sm opacity-90">Artwork Safety Preview for Event Cards</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearArtwork}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear artwork
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
