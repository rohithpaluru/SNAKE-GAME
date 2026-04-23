import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-mesh text-white font-sans flex flex-col relative overflow-x-hidden">
      <div className="z-10 flex flex-col min-h-screen w-full max-w-5xl mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <header className="w-full flex-shrink-0 flex flex-col items-center justify-center mb-8 md:mb-12 mt-6">
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter neon-text-blue text-center uppercase">
            NEON SYNTH-SNAKE
          </h1>
        </header>

        {/* Main Content Area: Game */}
        <main className="flex-1 flex items-center justify-center w-full mb-12">
           <div className="glass p-6 lg:p-10 relative z-10 w-full max-w-[600px] flex flex-col items-center pt-24 mt-8">
              <SnakeGame />
           </div>
        </main>

        {/* Footer: Music Player */}
        <footer className="w-full flex-shrink-0 mt-auto">
           <MusicPlayer />
        </footer>
      </div>
    </div>
  );
}
