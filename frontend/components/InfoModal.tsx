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
      {/* Glassmorphism backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40"
        onClick={onClose}
      />
      
      {/* Modal content container */}
      <div className="relative w-full max-w-4xl mx-auto h-[90vh] sm:h-auto">
        {/* The actual modal card */}
        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 flex overflow-hidden h-full">
          {/* Column 1: Wallpaper */}
          <div 
            className="w-[100px] flex-shrink-0 bg-repeat bg-center" 
            style={{ backgroundImage: "url('/convention-background.jpg')" }}
          >
            {/* This div is just for the background */}
          </div>

          {/* Column 2: Content */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-10"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Validart
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Tool to help validate artwork on event cards
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  How to Use Validart
                </h3>
                
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    <p><strong>Set card dimensions:</strong> Enter the width and height of your event card in millimeters or inches.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    <p><strong>Upload artwork:</strong> Add your card design by uploading a JPG, PNG, or SVG file (max 10MB).</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    <p><strong>Add features:</strong> Place punch holes and slots as needed for your card design. Use the alignment tools to position them precisely.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    <p><strong>Configure trim & bleed:</strong> Adjust the trim and bleed line distances according to your vendor's specifications.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">5</span>
                    <p><strong>Download:</strong> Once satisfied with your validation, use the download button to export a screenshot of your design with all features marked.</p>
                  </div>
                </div>
              </div>

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

              <div className="flex justify-center pt-4">
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
    </div>
  );
}
