import React, { useState, useEffect } from 'react';
import { Moon, Sun, RotateCcw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useValidart } from '../contexts/ValidartContext';
import { useToast } from '@/components/ui/use-toast';
import InfoModal from './InfoModal';

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(true);
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

    // Check if user has seen the info modal before
    const hasSeenInfo = localStorage.getItem('validart_has_seen_info');
    if (hasSeenInfo) {
      setShowInfoModal(false);
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

  const handleInfoModalClose = () => {
    setShowInfoModal(false);
    localStorage.setItem('validart_has_seen_info', 'true');
  };

  const openInfoModal = () => {
    setShowInfoModal(true);
  };

  return (
    <>
      <header className="bg-primary text-primary-foreground shadow-lg border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">Validart</h1>
              <p className="text-sm opacity-90">Tool to help validate artwork on event cards</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={openInfoModal}
                className="text-primary-foreground hover:bg-primary-foreground/10"
                title="Help & Information"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
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

      <InfoModal 
        isOpen={showInfoModal} 
        onClose={handleInfoModalClose} 
      />
    </>
  );
}
