import { useEffect, useState } from 'react';
import { db, initDatabase, getDatabaseStats, getAllVirtualCopies, updateVirtualCopy } from '@/services/db';
import { ImportDialog } from '@/components/ImportDialog';
import { Gallery } from '@/components/Gallery';
import { DetailView } from '@/components/DetailView';
import { SidebarLeft } from '@/components/SidebarLeft';
import { Layout } from '@/components/Layout';
import { MasterPhoto, VirtualCopy } from '@/types';

type VirtualCopyFull = VirtualCopy & { master: MasterPhoto };

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<VirtualCopyFull | null>(null);

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

  const handleUpdatePhoto = async (id: string, changes: Partial<VirtualCopy>) => {
    await updateVirtualCopy(id, changes);

    // Refresh selected photo in memory
    if (selectedPhoto && selectedPhoto.id === id) {
      setSelectedPhoto({ ...selectedPhoto, ...changes });
    }

    await refreshStats();
  };

  /* Navigation Logic */
  const handleNav = async (direction: 'next' | 'prev') => {
    if (!selectedPhoto) return;

    // Fetch all virtual copies to find current index
    const allCopies = await getAllVirtualCopies();
    // Sort logic should match Gallery
    allCopies.sort((a, b) => b.master.dateTaken.getTime() - a.master.dateTaken.getTime());

    const currentIndex = allCopies.findIndex(p => p.id === selectedPhoto.id);

    if (currentIndex === -1) return;

    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    // Bounds check
    if (nextIndex >= 0 && nextIndex < allCopies.length) {
      setSelectedPhoto(allCopies[nextIndex]);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
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
      </Layout>
    );
  }

  if (!dbInitialized) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-serif font-bold text-vintage-accent animate-pulse">Stillbytes</h1>
            <p className="text-gray-500 font-mono text-xs">Initializing secure local storage...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const hasPhotos = dbStats && dbStats.photoCount > 0;

  return (
    <Layout>
      {hasPhotos ? (
        <div className="flex h-screen overflow-hidden bg-pro-bg">
          {/* Left Sidebar */}
          <SidebarLeft
            totalPhotos={dbStats.photoCount}
            onImportClick={() => setShowImport(true)}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 relative flex flex-col">
            {selectedPhoto ? (
              <DetailView
                photo={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                // @ts-ignore - Update function signature changed
                onUpdatePhoto={handleUpdatePhoto}
                onNextPhoto={() => handleNav('next')}
                onPrevPhoto={() => handleNav('prev')}
                onSelectPhoto={setSelectedPhoto}
              />
            ) : (
              <Gallery
                onSelectPhoto={(photo) => setSelectedPhoto(photo as any)}
                onImportClick={() => setShowImport(true)}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-[#1a1a1a] to-[#1a1a1a]">
          <div className="text-center space-y-8 max-w-2xl">
            <h1 className="text-7xl font-serif font-bold text-vintage-accent leading-tight">Stillbytes</h1>
            <p className="text-2xl text-gray-400 font-light leading-relaxed">
              A premium, local-first RAW photo editor. <br />
              No subscriptions. No cloud. Just your art.
            </p>

            <div className="pt-6">
              <button
                onClick={() => setShowImport(true)}
                className="bg-vintage-accent hover:opacity-90 text-black px-12 py-4 rounded-full font-bold text-xl shadow-[0_0_30px_rgba(230,185,126,0.2)] transform hover:scale-105 transition-all duration-300"
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
                <div key={i} className="bg-[#222]/50 p-4 rounded border border-white/5 backdrop-blur-sm">
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
    </Layout>
  );
}

export default App;
