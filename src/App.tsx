import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-serif font-bold text-vintage-accent">Stillbytes</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Free, local, AI-native RAW photo editor for photographers.
          </p>
          <p className="text-sm text-gray-500">
            Built with React 18 + TypeScript + Vite + Tailwind + Electron
          </p>
          <div className="pt-4">
            <div className="panel inline-block">
              <p className="text-green-400 font-mono">✓ Day 1 Setup Complete</p>
              <p className="text-gray-400 text-sm mt-2">Ready for Day 2: Database Layer</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
