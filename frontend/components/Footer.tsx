import React from 'react';
import { Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-4">
      <div className="container mx-auto px-6 text-center">
        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            © 2025 Validart by <a href="https://www.lionmystic.com" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Lion Mystic</a>. Open source tool for artwork safety preview.
          </p>
          <div className="flex justify-center items-center gap-2">
            <a href="https://x.com/spencer_i_am" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
              <Twitter className="h-3 w-3" />
              <span>@spencer_i_am</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
