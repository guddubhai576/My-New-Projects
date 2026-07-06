/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Classifier } from './components/Classifier';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-hidden relative flex flex-col">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[90px] pointer-events-none"></div>

      <header className="relative z-10 h-16 flex items-center justify-between px-4 md:px-8 bg-white/5 backdrop-blur-xl border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-rose-400 to-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Deepfake <span className="text-rose-400">Analyzer</span></h1>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-4xl flex-1 overflow-y-auto flex flex-col items-center">
        <div className="mb-10 text-center">
          <p className="text-white/40 font-medium max-w-lg mx-auto text-sm">
            Upload an image or video to analyze it for AI manipulation and deepfake artifacts.
          </p>
        </div>
        
        <Classifier />
        
        <footer className="mt-16 text-center text-white/40 text-xs uppercase tracking-widest font-bold">
          <p>Deepfake Detection Model &bull; Processing runs on-device</p>
        </footer>
      </main>
    </div>
  );
}
