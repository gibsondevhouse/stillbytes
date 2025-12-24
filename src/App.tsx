import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { initDatabase, getDatabaseStats } from '@/services/db';
import { ImportDialog } from '@/components/ImportDialog';
import { Gallery } from '@/components/Gallery';
import { DetailView } from '@/components/DetailView';
import { Photo } from '@/types';
import { updatePhoto } from '@/services/db';

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    async function setupDatabase() {
      try {
        await initDatabase();
        const stats = await getDatabaseStats();
        setDbStats(stats);
        setDbInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
    setupDatabase();
  }, []);

  const refreshStats = async () => {
    const stats = await getDatabaseStats();
    setDbStats(stats);
  };

  const handleUpdatePhoto = async (id: number, changes: Partial<Photo>) => {
    await updatePhoto(id, changes);
    await refreshStats();
  };

  /* Navigation Logic */
  const handleNextPhoto = async () => {
    if (!selectedPhoto || !dbStats?.photoCount) return;
    // Simple navigation strategy: get next photo by date
    // For MVP we just close to gallery if we can't find next, or improve later
    // Real implementation requires fetching the ID list or next item 
    // This is a placeholder for Day 5 polish

    // Better strategy: We don't have the full list in memory here.
    // Let's just pass a "canNav" capability or implement proper gallery state later.
    // For now, let's skip complex nav logic to avoid bugs and focus on Compare/Export
  };
  const handlePrevPhoto = async () => {
    // Placeholder for previous photo logic
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#1a1a1a]">
        <div className="panel text-center space-y-4 max-w-md">
          <p className="text-red-400 font-mono text-lg">✗ Database Error</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dbInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold text-vintage-accent animate-pulse">Stillbytes</h1>
          <p className="text-gray-500 font-mono text-xs">Initializing secure local storage...</p>
        </div>
      </div>
    );
  }

  // Show Gallery if photos exist, otherwise show landing page
  const hasPhotos = dbStats && dbStats.photoCount > 0;

  return (
    <>
      <Toaster position="top-right" />

      <div className="h-screen flex flex-col bg-[#1a1a1a]">
        {hasPhotos ? (
          <Gallery
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
            onImportClick={() => setShowImport(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8 max-w-2xl">
              <h1 className="text-7xl font-serif font-bold text-vintage-accent leading-tight">Stillbytes</h1>
              <p className="text-2xl text-gray-400 font-light leading-relaxed">
                A premium, local-first RAW photo editor. <br />
                No subscriptions. No cloud. Just your art.
              </p>

              <div className="pt-6">
                <button
                  onClick={() => setShowImport(true)}
                  className="bg-vintage-accent hover:opacity-90 text-black px-12 py-4 rounded-full font-bold text-xl shadow-[0_0_30px_rgba(230,185,126,0.3)] transform hover:scale-105 transition-all duration-300"
                >
                  Get Started — Import Photos
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-16 text-left">
                {[
                  { label: 'Privacy', desc: 'Photos never leave your disk' },
                  { label: 'Speed', desc: 'Native LibRaw & Sharp engine' },
                  { label: 'Freedom', desc: 'Edit RAWs without fees' }
                ].map((feature, i) => (
                  <div key={i} className="panel bg-[#222]/50">
                    <h3 className="text-vintage-accent font-bold text-sm mb-1 uppercase tracking-widest">{feature.label}</h3>
                    <p className="text-gray-500 text-xs">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showImport && (
          <ImportDialog
            onClose={() => setShowImport(false)}
            onImportComplete={refreshStats}
          />
        )}
      </div>

      {/* Detail View */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black">
          <DetailView
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onUpdatePhoto={handleUpdatePhoto}
            onNextPhoto={handleNextPhoto}
            onPrevPhoto={handlePrevPhoto}
          />
        </div>
      )}
    </>
  );
}

export default App;
