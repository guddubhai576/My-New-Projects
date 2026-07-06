import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Loader2, AlertCircle, Image as ImageIcon, Video, Link as LinkIcon } from 'lucide-react';

export function Classifier() {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);

  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [urlInput, setUrlInput] = useState('');
  
  const [isLiveStream, setIsLiveStream] = useState(false);
  
  const [isClassifying, setIsClassifying] = useState(false);
  const [predictions, setPredictions] = useState<{ className: string; probability: number; isFake: boolean }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isLiveStream && liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
    }
  }, [isLiveStream]);

  useEffect(() => {
    async function loadModel() {
      try {
        setIsModelLoading(true);
        // Simulate deepfake model initialization
        await new Promise(resolve => setTimeout(resolve, 1500));
        // TODO: Load actual deepfake detection model here
      } catch (err) {
        console.error("Failed to load model:", err);
        setModelError("Failed to load the analysis model.");
      } finally {
        setIsModelLoading(false);
      }
    }
    loadModel();
  }, []);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsClassifying(true);
      setPredictions([]);
      setUrlInput('');
      
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setMediaType(type);

      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaSrc(e.target?.result as string);
        setTimeout(() => classifyMedia(type), 500); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    
    setIsClassifying(true);
    setPredictions([]);
    
    // Basic heuristic to guess if video from URL
    const isVideoUrl = /\.(mp4|webm|ogg)$/i.test(urlInput.trim()) || urlInput.toLowerCase().includes('video');
    const type = isVideoUrl ? 'video' : 'image';
    
    setMediaType(type);
    setMediaSrc(urlInput.trim());
    
    // Simulate network load time before classifying
    setTimeout(() => classifyMedia(type), 1500);
  };

  const classifyMedia = async (type: 'image' | 'video') => {
    setIsClassifying(true);
    try {
      // Simulate inference time (videos take longer)
      const inferenceTime = type === 'video' ? 3000 : 1500;
      await new Promise(resolve => setTimeout(resolve, inferenceTime));
      
      // TODO: Replace with actual model prediction
      const fakeScore = Math.random(); 
      const realScore = 1 - fakeScore;

      const results = fakeScore > realScore 
        ? [
            { className: 'Fake / AI Manipulated', probability: fakeScore, isFake: true },
            { className: 'Authentic / Real', probability: realScore, isFake: false }
          ]
        : [
            { className: 'Authentic / Real', probability: realScore, isFake: false },
            { className: 'Fake / AI Manipulated', probability: fakeScore, isFake: true }
          ];
          
      setPredictions(results);
    } catch (error) {
      console.error("Classification error:", error);
    } finally {
      setIsClassifying(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const startLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setIsLiveStream(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLiveStream(false);
  };

  const captureFromLiveCamera = () => {
    if (liveVideoRef.current && canvasRef.current) {
      const video = liveVideoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        stopLiveCamera();
        setMediaSrc(dataUrl);
        setMediaType('image');
        classifyMedia('image');
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      
      {/* Model Status Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isModelLoading ? 'bg-amber-400 animate-pulse' : modelError ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">
            {isModelLoading ? 'Loading Deepfake Model...' : modelError ? 'Model Error' : 'Model Ready'}
          </span>
        </div>
        {isModelLoading && <Loader2 className="w-4 h-4 text-white/40 animate-spin" />}
        {modelError && <AlertCircle className="w-4 h-4 text-rose-400" />}
      </div>

      {/* Main Image Area */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-300 group">
        
        <input 
          type="file"
          accept="image/*,video/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleMediaUpload}
          className="hidden"
        />

        <div className="aspect-[4/5] sm:aspect-[4/3] w-full relative flex flex-col items-center justify-center">
          <div className="absolute inset-0 border-2 border-dashed border-rose-500/20 m-4 rounded-[2rem] pointer-events-none"></div>

          <canvas ref={canvasRef} className="hidden" />

          {isLiveStream ? (
            <div className="relative w-full h-full p-8 flex items-center justify-center">
              <video 
                ref={liveVideoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full max-h-[60vh] rounded-2xl shadow-2xl object-contain z-10"
              />
              <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-4">
                <button 
                  onClick={stopLiveCamera}
                  className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl transition-all shadow-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={captureFromLiveCamera}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                  Capture & Analyze
                </button>
              </div>
            </div>
          ) : mediaSrc ? (
            <div className="relative w-full h-full p-8 flex items-center justify-center">
              {mediaType === 'video' ? (
                <video 
                  src={mediaSrc} 
                  autoPlay
                  loop
                  muted
                  playsInline
                  crossOrigin="anonymous"
                  className={`max-w-full max-h-[60vh] rounded-2xl shadow-2xl transition-opacity duration-300 ${isClassifying ? 'opacity-50' : 'opacity-100'} object-contain z-10`}
                />
              ) : (
                <img 
                  src={mediaSrc} 
                  alt="Upload preview" 
                  crossOrigin="anonymous"
                  className={`max-w-full max-h-[60vh] rounded-2xl shadow-2xl transition-opacity duration-300 ${isClassifying ? 'opacity-50' : 'opacity-100'} object-contain z-10`}
                />
              )}
              
              {isClassifying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <Loader2 className="w-10 h-10 text-rose-400 animate-spin mb-4 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  <span className="text-xs font-bold text-white tracking-widest uppercase drop-shadow-md">Scanning Artifacts...</span>
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse"></div>
                </div>
              )}

              <div className="absolute bottom-6 right-6 z-30">
                <button 
                  onClick={() => {
                    setMediaSrc(null);
                    setPredictions([]);
                    setUrlInput('');
                  }}
                  disabled={isModelLoading || isClassifying}
                  className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white p-3 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 w-full max-w-sm relative z-10">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl border border-white/20 flex items-center justify-center mb-6 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-indigo-500/20 flex items-center justify-center">
                  <Video className="w-10 h-10 text-white/20" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight text-center">Analyze Media</h3>
              <p className="text-white/40 text-sm mb-8 text-center">
                Upload a file or paste a link to scan for AI manipulation.
              </p>
              
              <div className="flex flex-col sm:flex-row w-full gap-4 mb-6">
                <button 
                  onClick={startLiveCamera}
                  disabled={isModelLoading}
                  className="flex-1 px-6 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-rose-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <Camera className="w-5 h-5" />
                  Live Camera
                </button>
                <button 
                  onClick={triggerFileInput}
                  disabled={isModelLoading}
                  className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <Upload className="w-5 h-5" />
                  Upload Media
                </button>
              </div>

              <div className="w-full relative flex items-center py-2 mb-4">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-white/30 text-xs font-bold uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="flex flex-col w-full gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-white/30" />
                  </div>
                  <input 
                    type="url" 
                    placeholder="Paste image/video URL..." 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUrlSubmit();
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
                  />
                </div>
                <button 
                  onClick={handleUrlSubmit}
                  disabled={isModelLoading || !urlInput.trim()}
                  className="w-full px-6 py-3 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  Analyze URL
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {predictions.length > 0 && !isClassifying && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white mb-1">Authenticity Analysis</h2>
            <p className="text-xs text-white/40 tracking-tight">Confidence scores for deepfake detection</p>
          </div>
          
          <div className="p-6 space-y-6">
            {predictions.map((pred, idx) => {
              const confidence = Math.round(pred.probability * 100);
              const isTop = idx === 0;
              const textColor = isTop ? (pred.isFake ? 'text-rose-400' : 'text-emerald-400') : 'text-white';
              const barColor = pred.isFake ? 'bg-rose-500' : 'bg-emerald-500';

              return (
                <div key={idx} className="space-y-2">
                  <div className={`flex justify-between items-end ${isTop ? '' : 'opacity-60'}`}>
                    <span className="text-sm font-medium text-white capitalize">
                      {pred.className}
                    </span>
                    <span className={`text-sm font-bold ${isTop ? 'text-lg' : ''} ${textColor}`}>{confidence}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${isTop ? barColor : 'bg-white/30'}`}
                      style={{ width: `${confidence}%`, transitionDelay: `${idx * 150}ms` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

