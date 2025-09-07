import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-sm bg-background/80"
        onClick={onClose}
      />
      
      {/* Modal content container */}
      <div className="relative w-full max-w-2xl mx-auto bg-card rounded-2xl shadow-2xl border border-border">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <img src="/validart-logo.png" alt="Validart Logo" className="h-16" />
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Welcome to Validart
              </h2>
              <p className="text-muted-foreground">
                Tool to help validate artwork on event cards
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground text-center">
                How to Use Validart
              </h3>
              
              <div className="space-y-3 text-sm text-foreground/80">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  <p><strong>Set card dimensions:</strong> Enter the width and height of your event card in millimeters or inches.</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <p><strong>Upload artwork:</strong> Add your card design by uploading a JPG, PNG, or SVG file (max 10MB).</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <p><strong>Add features:</strong> Place punch holes and slots as needed for your card design. Use the alignment tools to position them precisely.</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">4</span>
                  <p><strong>Configure trim & bleed:</strong> Adjust the trim and bleed line distances according to your vendor's specifications.</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">5</span>
                  <p><strong>Download:</strong> Once satisfied with your validation, use the download button to export a screenshot of your design with all features marked.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Important Notice
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>This is not a proofing solution.</strong> Validart is an aide for personal artwork checks to ensure punch holes and slots won't conflict with your designs. Final approval is always subject to your vendor's specifications and requirements.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Open Source Project
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Validart was built to be open source to aide artwork validation and prevent wasted time and cards on unvalidated designs. This tool helps identify potential issues before production.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button 
                onClick={onClose}
                className="px-8 py-2"
              >
                I understand
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
