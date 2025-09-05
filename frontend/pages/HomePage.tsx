import React from 'react';
import Header from '../components/Header';
import ArtworkUpload from '../components/ArtworkUpload';
import CardDimensions from '../components/CardDimensions';
import TrimBleedLines from '../components/TrimBleedLines';
import EdgeDistances from '../components/SafeZone';
import Features from '../components/Features';
import Preview from '../components/Preview';
import Export from '../components/Export';
import Footer from '../components/Footer';
import { ValidartProvider, useValidart } from '../contexts/ValidartContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

function AppInner() {
  const { state } = useValidart();

  const getBannerIcon = () => {
    if (!state.banner) return null;
    switch (state.banner.type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'danger': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getBannerVariant = () => {
    if (!state.banner) return 'default';
    return state.banner.type === 'danger' ? 'destructive' : 'default';
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      {state.banner && (
        <div className="px-4 pt-4">
          <Alert variant={getBannerVariant()} className="max-w-md mx-auto">
            {getBannerIcon()}
            <AlertDescription>{state.banner.message}</AlertDescription>
          </Alert>
        </div>
      )}
      <main className="flex-1 flex overflow-hidden">
        {/* Main Preview Area */}
        <div className="flex-1 relative">
          <Preview />
        </div>
        
        {/* Right Sidebar */}
        <div className="w-80 border-l border-border bg-card p-6 overflow-y-auto">
          <div className="space-y-6">
            <ArtworkUpload />
            <CardDimensions />
            <TrimBleedLines />
            <EdgeDistances />
            <Features />
            <Export />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <ValidartProvider>
      <AppInner />
    </ValidartProvider>
  );
}
