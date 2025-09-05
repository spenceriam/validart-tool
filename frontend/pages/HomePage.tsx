import React from 'react';
import Header from '../components/Header';
import ArtworkUpload from '../components/ArtworkUpload';
import CardDimensions from '../components/CardDimensions';
import SafeZone from '../components/SafeZone';
import Options from '../components/Options';
import PunchHoles from '../components/PunchHoles';
import Preview from '../components/Preview';
import Export from '../components/Export';
import Footer from '../components/Footer';
import { ValidartProvider } from '../contexts/ValidartContext';

export default function HomePage() {
  return (
    <ValidartProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            <ArtworkUpload />
            <CardDimensions />
            <SafeZone />
            <Options />
            <PunchHoles />
            <Preview />
            <Export />
          </div>
        </main>
        <Footer />
      </div>
    </ValidartProvider>
  );
}
