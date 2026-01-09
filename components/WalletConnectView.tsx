import React, { useState, useRef, useEffect } from 'react';
import { Scan, Link as LinkIcon, X, CheckCircle, ExternalLink, Loader2, Camera, AlertTriangle } from 'lucide-react';
import { WCSession } from '../types';
import { createSession } from '../services/walletService';
import jsQR from 'jsqr';

interface WalletConnectViewProps {
  sessions: WCSession[];
  addSession: (session: WCSession) => void;
  removeSession: (id: string) => void;
}

export const WalletConnectView: React.FC<WalletConnectViewProps> = ({ sessions, addSession, removeSession }) => {
  const [uri, setUri] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Handle Scan Logic
  const startScanning = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Required for iOS Safari to play inline without going full screen
        videoRef.current.setAttribute("playsinline", "true"); 
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (canvas) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Attempt to decode
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
             setUri(code.data);
             stopScanning();
             return; 
          }
        }
      }
    }
    animationRef.current = requestAnimationFrame(tick);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const handleConnect = async () => {
    if (!uri) return;
    setIsConnecting(true);
    setError(null);
    try {
      const newSession = await createSession(uri);
      // Simulate fetching metadata
      const enrichedSession = {
        ...newSession,
        name: 'New Connection', // In real app, comes from WC metadata
        url: 'https://new-dapp.com'
      };
      addSession(enrichedSession);
      setUri('');
    } catch (err) {
      setError('Failed to connect. Ensure URI is valid.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-6 space-y-8 pb-24 animate-fade-in relative">
      
      {/* --- SCANNER OVERLAY --- */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="absolute top-6 right-6 z-20">
            <button 
              onClick={stopScanning}
              className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
             <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
             />
             <canvas ref={canvasRef} className="hidden" />
             
             {/* Scan Frame UI */}
             <div className="relative z-10 w-64 h-64 border-2 border-brand-400/50 rounded-3xl flex items-center justify-center shadow-[0_0_100px_rgba(168,85,247,0.2)]">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-500 rounded-tl-xl -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-500 rounded-tr-xl -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-500 rounded-bl-xl -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-500 rounded-br-xl -mb-1 -mr-1"></div>
                <div className="w-full h-0.5 bg-brand-500/50 absolute top-1/2 animate-pulse shadow-[0_0_15px_#a855f7]"></div>
             </div>
             
             <div className="absolute bottom-16 text-center">
                <p className="text-white font-bold text-lg mb-1">Scan QR Code</p>
                <p className="text-gray-400 text-sm">Align code within the frame</p>
             </div>
          </div>
        </div>
      )}

      <header className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">WalletConnect v2</h2>
        <p className="text-gray-400 text-sm">Connect your SuperWallet to desktop dApps via QR code or URI.</p>
      </header>

      {/* Connection Input */}
      <div className="bg-gray-850 p-4 rounded-xl border border-gray-700 space-y-4 shadow-lg">
        <div className="flex justify-between items-center mb-2">
           <h3 className="text-white font-semibold flex items-center gap-2">
             <LinkIcon size={18} className="text-brand-400" />
             New Connection
           </h3>
           <button 
             onClick={startScanning}
             className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1 font-bold"
           >
             <Scan size={14} /> Scan QR
           </button>
        </div>
        
        <div className="relative">
          <textarea
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="wc:..."
            className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-xs font-mono resize-none h-20"
          />
          {isScanning && <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center text-xs text-brand-400 font-bold backdrop-blur-sm rounded-lg">Scanner Active</div>}
        </div>

        <button
          onClick={handleConnect}
          disabled={isConnecting || !uri}
          className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all ${
            isConnecting || !uri 
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
            : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/50'
          }`}
        >
          {isConnecting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          {isConnecting ? 'Approving...' : 'Connect'}
        </button>
        
        {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                <AlertTriangle size={14} />
                {error}
            </div>
        )}
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-gray-400 font-semibold mb-4 text-sm uppercase tracking-wider">Active Sessions</h3>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-600 border border-dashed border-gray-800 rounded-xl">
              No active sessions
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex items-center justify-between group hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={session.icon} alt={session.name} className="w-10 h-10 rounded-full bg-gray-800" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{session.name}</h4>
                    <a href={session.url} target="_blank" rel="noreferrer" className="text-xs text-gray-500 flex items-center gap-1 hover:text-brand-400">
                      {session.url} <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                <button 
                  onClick={() => removeSession(session.id)}
                  className="text-gray-600 hover:text-red-400 p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};