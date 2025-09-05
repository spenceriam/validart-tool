import React from 'react';
import Header from '../components/Header';
import ArtworkUpload from '../components/ArtworkUpload';
import CardDimensions from '../components/CardDimensions';
import EdgeDistances from '../components/SafeZone';
import Features from '../components/Features';
import Preview from '../components/Preview';
import Export from '../components/Export';
import Footer from '../components/Footer';
import { ValidartProvider } from '../contexts/ValidartContext';

export default function HomePage() {
  return (
    <ValidartProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex">
          {/* Main Preview Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <Preview />
          </div>
          
          {/* Right Sidebar */}
          <div className="w-80 border-l border-border bg-card p-6 overflow-y-auto">
            <div className="space-y-6">
              <ArtworkUpload />
              <CardDimensions />
              <EdgeDistances />
              <Features />
              <Export />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ValidartProvider>
  );
}
