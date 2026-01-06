import React, { useEffect, useState, useCallback } from 'react';
import { connectP2PWebSocket, fetchQuakeHistory } from './services/p2pService';
import { P2PQuakeEvent } from './types';
import { QuakeCard } from './components/QuakeCard';
import { Wifi, WifiOff, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [quakes, setQuakes] = useState<P2PQuakeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to merge new events uniquely by ID
  const addEvent = useCallback((event: P2PQuakeEvent) => {
    setQuakes(prev => {
      // Avoid duplicates
      if (prev.some(q => q.id === event.id)) return prev;
      // Sort by time descending
      return [event, ...prev].sort((a, b) => 
        new Date(b.earthquake.time).getTime() - new Date(a.earthquake.time).getTime()
      );
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      // 1. Fetch History
      const history = await fetchQuakeHistory();
      setQuakes(history);
      setLoading(false);

      // 2. Connect WebSocket
      const cleanup = connectP2PWebSocket(
        (event) => {
          console.log("New Earthquake Event:", event);
          addEvent(event);
        },
        (status) => setIsConnected(status)
      );

      return cleanup;
    };

    const cleanupPromise = init();
    
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [addEvent]);

  return (
    <div className="min-h-screen pb-12 bg-[#0f172a] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              P2P <span className="text-cyan-400">Quake</span> Monitor
            </h1>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${isConnected ? 'bg-green-900/20 border-green-700 text-green-400' : 'bg-red-900/20 border-red-700 text-red-400'}`}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isConnected ? 'Real-time Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <p>地震情報を取得中...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-slate-300">最新の地震情報</h2>
              <span className="text-xs text-slate-500">
                Source: P2P地震情報 (p2pquake.net)
              </span>
            </div>

            {quakes.length === 0 ? (
              <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                <p className="text-slate-400">表示可能な地震情報がありません</p>
              </div>
            ) : (
              quakes.map((quake, index) => (
                <QuakeCard 
                  key={quake.id} 
                  quake={quake} 
                  isLatest={index === 0} 
                />
              ))
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>Data provided by P2PQuake API (p2pquake.net)</p>
        <p className="mt-1 opacity-70">Powered by React • Tailwind</p>
      </footer>
    </div>
  );
};

export default App;