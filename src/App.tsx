/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Classifier } from './components/Classifier';
import { Chatbot } from './components/Chatbot';
import { Auth } from './components/Auth';
import { Loader2, AlertTriangle, Check, Globe } from 'lucide-react';
import { Language, languages, translations } from './translations';

export default function App() {
  const [modelStatus, setModelStatus] = useState<{ isLoading: boolean; error: string | null }>({
    isLoading: true,
    error: null
  });
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-hidden relative flex flex-col">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[90px] pointer-events-none"></div>

      <header className="relative z-10 min-h-16 h-auto py-3 sm:py-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-8 bg-white/5 backdrop-blur-xl border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-rose-400 to-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">{t.APP_TITLE || 'Deepfake Analyzer'}</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Auth />
          
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-xs shadow-lg select-none hover:bg-white/10 transition-colors">
            <Globe className="w-3.5 h-3.5 text-rose-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs pr-1"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white text-xs">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model/API Connection Status Indicator */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-xs shadow-lg select-none transition-all duration-300">
            <span className="relative flex h-2 w-2">
              {modelStatus.isLoading ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </>
              ) : modelStatus.error ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              )}
            </span>
            <span className="font-semibold tracking-wide">
              {modelStatus.isLoading ? (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t.API_CONNECTING || 'Connecting API...'}
                </span>
              ) : modelStatus.error ? (
                <span className="flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t.API_OFFLINE || 'API Offline'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  {t.MODEL_ONLINE || 'Model Online'}
                </span>
              )}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-4xl flex-1 overflow-y-auto flex flex-col items-center">
        <div className="mb-10 text-center">
          <p className="text-white/40 font-medium max-w-lg mx-auto text-sm">
            {t.APP_SUBTITLE || 'Upload an image or video to analyze it for AI manipulation and deepfake artifacts.'}
          </p>
        </div>
        
        <Classifier onModelStatusChange={setModelStatus} language={language} />
        <Chatbot />
        
        <footer className="mt-16 text-center text-white/40 text-xs uppercase tracking-widest font-bold">
          <p>{t.FOOTER_TXT || 'Deepfake Detection Model • Processing runs on-device'}</p>
        </footer>
      </main>
    </div>
  );
}
