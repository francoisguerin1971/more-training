import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import {
    Video, Mic, MicOff, VideoOff,
    MessageSquare, User, MoreVertical, Users,
    Activity, Zap, UserPlus, Share,
    BarChart2, Play, Radio, Monitor, HelpCircle, X, Send, Paperclip, Image,
    BrainCircuit, CheckCircle, Loader, FileText, Hand, Smile, Plus, Trash2, Upload
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';

interface LiveConnectionProps {
    onClose: () => void;
}

// Translations helper hook (mock implementation for this file to avoid full refactor)
// In a real scenario, use `useTranslations` from your i18n provider
import { translations } from '@/core/services/translations';
import { useAuthStore } from '@/features/auth/stores/authStore';
// For this standalone component, we'll create a simple hook
const useText = () => {
    // Default to 'es' or get from local storage/store
    const lang = localStorage.getItem('language') || 'es';
    // Fallback to Spanish if key not found, or English as ultimate fallback
    const t = (key: string) => {
        // @ts-ignore
        return translations[lang]?.[key] || translations['es']?.[key] || key;
    };
    return t;
};

const SPORTS_BACKGROUNDS = [
    { id: 'gym', name: 'Gym', url: '/assets/backgrounds/gym.png' },
    { id: 'stadium', name: 'Football', url: '/assets/backgrounds/football.png' },
    { id: 'track', name: 'Athletics', url: '/assets/backgrounds/track.png' },
    { id: 'yoga', name: 'Yoga', url: '/assets/backgrounds/yoga.png' },
    { id: 'swimming', name: 'Swimming', url: '/assets/backgrounds/swimming.png' },
    { id: 'basketball', name: 'Basketball', url: '/assets/backgrounds/basketball.png' },
    { id: 'tennis', name: 'Tennis', url: '/assets/backgrounds/tennis.png' },
    { id: 'golf', name: 'Golf', url: '/assets/backgrounds/golf.png' },
    { id: 'rowing', name: 'Rowing', url: '/assets/backgrounds/rowing.png' },
    { id: 'cycling', name: 'Cycling', url: '/assets/backgrounds/cycling.png' }
];

export function LiveConnection({ onClose }: LiveConnectionProps) {
    const t = useText();
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [activeTab, setActiveTab] = useState('studio_chat');
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showBackgrounds, setShowBackgrounds] = useState(false);
    const [activeBackground, setActiveBackground] = useState<string | null>(null);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [processingState, setProcessingState] = useState<'idle' | 'transcribing' | 'summarizing' | 'sending' | 'complete'>('idle');
    const [isSessionStarted, setIsSessionStarted] = useState(false);
    const [saveTranscript, setSaveTranscript] = useState(true);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const messageInputRef = useRef<HTMLInputElement>(null);
    const [showLobbyBackgrounds, setShowLobbyBackgrounds] = useState(false);

    // Custom Backgrounds Logic
    const [customBackgrounds, setCustomBackgrounds] = useState<{ id: string, url: string }[]>(() => {
        const saved = localStorage.getItem('live_custom_backgrounds');
        return saved ? JSON.parse(saved) : [];
    });

    // Camera & Segmentation Logic
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const segmentationRef = useRef<SelfieSegmentation | null>(null);
    const [isSegmentationReady, setIsSegmentationReady] = useState(false);

    // Initialize MediaPipe
    useEffect(() => {
        const selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });
        selfieSegmentation.setOptions({
            modelSelection: 1,
            selfieMode: false,
        });
        selfieSegmentation.onResults((results) => {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (!canvas || !video) return;

            // Mark ready on first result
            if (!isSegmentationReady) setIsSegmentationReady(true);

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Resize canvas to match video
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Draw the Video first
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

            // 2. Apply the Mask using destination-in (keeps video where mask is opaque)
            // Note: MediaPipe mask is usually white (opaque) on person. 
            // We use destination-in to KEEP the person.
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

            ctx.restore();
        });
        segmentationRef.current = selfieSegmentation;

        return () => {
            if (segmentationRef.current) {
                segmentationRef.current.close();
            }
        }
    }, []);

    // Processing Loop & Stability
    useEffect(() => {
        let animationId: number;
        let lastTime = 0;
        // FPS Limit to stabilize mask jitter (30fps)
        const fpsInterval = 1000 / 30;

        const processVideo = async (time: number) => {
            if (!lastTime) lastTime = time;
            const elapsed = time - lastTime;

            if (isCameraOn && videoRef.current && segmentationRef.current && videoRef.current.readyState >= 2) {
                if (elapsed > fpsInterval) {
                    lastTime = time - (elapsed % fpsInterval);
                    try {
                        // Ensure dimensions match to prevent rescaling jitter
                        if (canvasRef.current && (canvasRef.current.width !== videoRef.current.videoWidth)) {
                            canvasRef.current.width = videoRef.current.videoWidth;
                            canvasRef.current.height = videoRef.current.videoHeight;
                        }
                        await segmentationRef.current.send({ image: videoRef.current });
                    } catch (e) {
                        console.error("Segmentation error", e);
                    }
                }
            }
            animationId = requestAnimationFrame(processVideo);
        };

        if (isCameraOn) {
            if (videoRef.current) {
                videoRef.current.play().catch(e => console.error("Play error", e));
            }
            animationId = requestAnimationFrame(processVideo);
        }

        return () => cancelAnimationFrame(animationId);
    }, [isCameraOn, activeBackground]);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            if (isCameraOn && !isSessionStarted) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setIsCameraOn(false);
                }
            } else {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCameraOn, isSessionStarted]);

    // Helper for Preview Backgrounds
    const getPreviewStyle = (bgId: string | null) => {
        if (!bgId) return {};
        const custom = customBackgrounds.find(c => c.id === bgId);
        if (custom) {
            return { backgroundImage: `url(${custom.url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        }
        const predefined = SPORTS_BACKGROUNDS.find(b => b.id === bgId);
        if (predefined) {
            // Predefined backgrounds use classes, but for the preview we might need inline styles if they are complex, 
            // OR we just return the classname. The current logic uses a div with className.
            // Let's return the object expected by the style prop OR the className.
            // Actually the current implementation uses `bg.style` which are Tailwind classes (gradients).
            // So we need to handle both cases in the JSX.
            return null; // Signal to use className
        }
        return {};
    };

    const handleUploadBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            const newBg = { id: `custom-${Date.now()}`, url };
            const updated = [...customBackgrounds, newBg];
            setCustomBackgrounds(updated);
            localStorage.setItem('live_custom_backgrounds', JSON.stringify(updated));
            setActiveBackground(newBg.id);
        }
    };

    const handleRemoveBackground = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = customBackgrounds.filter(bg => bg.id !== id);
        setCustomBackgrounds(updated);
        localStorage.setItem('live_custom_backgrounds', JSON.stringify(updated));
        if (activeBackground === id) setActiveBackground(null);
    };

    const handleTerminate = () => {
        if (saveTranscript) {
            setProcessingState('transcribing');

            // Simulate AI workflow
            setTimeout(() => setProcessingState('summarizing'), 2000);
            setTimeout(() => setProcessingState('sending'), 4500);
            setTimeout(() => setProcessingState('complete'), 6000);
            setTimeout(() => {
                onClose();
            }, 8000);
        } else {
            onClose();
        }
    };

    // Mock Chat Messages
    const [chatMessages, setChatMessages] = useState([
        { id: 1, sender: 'System', text: 'Session initialized. Bio-metrics active.', style: 'system' },
        { id: 2, sender: 'Coach', text: 'Ready to start?', style: 'user' }
    ]);

    const currentBgStyle = activeBackground
        ? SPORTS_BACKGROUNDS.find(bg => bg.id === activeBackground)?.style || "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent"
        : "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent";

    // Helper to get background style (handling custom vs predefined)
    const getBackgroundStyle = (bgId: string | null) => {
        if (!bgId) return null;
        if (bgId.startsWith('custom-')) {
            const custom = customBackgrounds.find(c => c.id === bgId);
            return custom ? { backgroundImage: `url(${custom.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
        }
        return { className: SPORTS_BACKGROUNDS.find(b => b.id === bgId)?.style };
    };

    const activeBgStyle = activeBackground ? getBackgroundStyle(activeBackground) : null;

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 relative">

            {/* Session Not Started Overlay - SPLIT LAYOUT */}
            {!isSessionStarted && (
                <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-8 lg:py-16 lg:px-20 overflow-y-auto">
                    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-stretch h-full lg:h-[700px] max-h-[90vh]">

                        {/* LEFT COLUMN: Deep Navy Theme */}
                        <div className="flex-1 bg-[#0B1120] border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center relative max-h-full">
                            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">{t('live_room_title')}</h2>
                            <p className="text-slate-400 text-xs font-medium mb-5">{t('waiting_participants')}</p>

                            {/* Camera Preview Area - With Segmentation Canvas */}
                            <div className="w-full aspect-video bg-black rounded-2xl border-2 border-slate-800 mb-6 relative overflow-hidden group shadow-2xl flex-shrink-0">

                                {/* Background Layer (CSS Gradient) - Visible Behind Canvas when Active */}
                                {activeBackground && (
                                    <div
                                        className={cn(
                                            "absolute inset-0 bg-cover bg-center transition-all duration-300 z-0",
                                            !customBackgrounds.find(c => c.id === activeBackground) && SPORTS_BACKGROUNDS.find(bg => bg.id === activeBackground)?.url
                                                ? `bg-[url(${SPORTS_BACKGROUNDS.find(bg => bg.id === activeBackground)?.url})]`
                                                : SPORTS_BACKGROUNDS.find(bg => bg.id === activeBackground)?.style
                                        )}
                                        style={activeBackground && SPORTS_BACKGROUNDS.find(bg => bg.id === activeBackground)?.url ? { backgroundImage: `url(${SPORTS_BACKGROUNDS.find(bg => bg.id === activeBackground)?.url})` } : getPreviewStyle(activeBackground) || {}}
                                    />
                                )}

                                {!isCameraOn && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-20 p-4 text-center">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 border border-slate-700">
                                            <VideoOff size={24} className="text-slate-500" />
                                        </div>
                                        <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">{t('camera_off_title')}</p>
                                    </div>
                                )}

                                <div className={cn(
                                    "absolute inset-0 transition-opacity duration-700 flex items-center justify-center overflow-hidden z-10",
                                    isCameraOn ? "opacity-100" : "opacity-0"
                                )}>
                                    {/* Video: Show if NO background active OR if Segmentation NOT Ready. Hide ONLY if background active AND Ready. */}
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={cn(
                                            "w-full h-full object-cover transform -scale-x-100 absolute inset-0 transition-opacity",
                                            activeBackground && isSegmentationReady ? "opacity-0" : "opacity-100"
                                        )}
                                    />
                                    {/* Canvas: Show ONLY if background active AND Ready. */}
                                    <canvas
                                        ref={canvasRef}
                                        className={cn(
                                            "w-full h-full object-cover transform -scale-x-100 absolute inset-0 transition-opacity",
                                            activeBackground && isSegmentationReady ? "opacity-100" : "opacity-0"
                                        )}
                                    />

                                    {/* Loading Indicator for AI */}
                                    {activeBackground && !isSegmentationReady && isCameraOn && (
                                        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full flex items-center gap-2 z-50">
                                            <Loader size={10} className="animate-spin" />
                                            AI Loading...
                                        </div>
                                    )}
                                </div>

                                {/* Lobby Controls Overlay */}
                                <div className="absolute bottom-4 inset-x-4 flex justify-center gap-4 z-30">
                                    <button
                                        onClick={() => setIsCameraOn(!isCameraOn)}
                                        className={cn(
                                            "p-3 rounded-xl border-2 transition-all shadow-lg hover:scale-105 active:scale-95",
                                            isCameraOn ? "bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800" : "bg-rose-600 border-rose-500 text-white"
                                        )}
                                    >
                                        {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                                    </button>
                                    <button
                                        onClick={() => setIsMicOn(!isMicOn)}
                                        className={cn(
                                            "p-3 rounded-xl border-2 transition-all shadow-lg hover:scale-105 active:scale-95",
                                            isMicOn ? "bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800" : "bg-rose-600 border-rose-500 text-white"
                                        )}
                                    >
                                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Participants Panel - Horizontal Inline */}
                            <div className="w-full mb-6 px-4 flex items-center justify-between bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={12} /> {t('participants_count_label')} (3)
                                </h4>
                                <div className="flex items-center -space-x-2">
                                    {[
                                        { name: 'You', role: 'Athlete' },
                                        { name: 'Sarah', role: 'Coach' },
                                        { name: 'Sys', role: 'Monitor' }
                                    ].map((p, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 hover:scale-110 transition-transform cursor-help" title={`${p.name} (${p.role})`}>
                                            {p.name[0]}
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                                        +
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsSessionStarted(true)}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2 hover:shadow-emerald-500/20 flex-shrink-0"
                            >
                                <Play size={18} fill="currentColor" /> {t('start_session') || 'REJOINDRE'}
                            </button>
                        </div>

                        {/* RIGHT COLUMN: Virtual Backgrounds (Always Visible) - Deep Navy */}
                        <div className="w-full lg:w-72 bg-[#0F172A]/90 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col flex-shrink-0">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Image size={14} />
                                {t('custom_backgrounds')}
                            </h4>

                            <div className="grid grid-cols-2 gap-2 content-start overflow-y-auto custom-scrollbar pr-1 max-h-[500px]">
                                {/* None Button */}
                                <button
                                    onClick={() => setActiveBackground(null)}
                                    className={cn(
                                        "aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95",
                                        activeBackground === null ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900/50 hover:bg-slate-800"
                                    )}
                                    title={t('background_none')}
                                >
                                    <VideoOff size={20} className={activeBackground === null ? "text-emerald-500" : "text-slate-500"} />
                                    <span className="text-[9px] font-bold uppercase text-slate-500">None</span>
                                </button>

                                {/* Add Background Tile */}
                                <label className="aspect-square rounded-xl border-2 border-slate-700 hover:border-emerald-500 border-dashed bg-slate-800/30 hover:bg-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative hover:scale-105 active:scale-95">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadBackground} />
                                    <Plus size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] text-slate-500 font-bold uppercase group-hover:text-emerald-500 transition-colors">Add New</span>
                                </label>

                                {/* Custom Backgrounds List */}
                                {customBackgrounds.map(bg => (
                                    <button
                                        key={bg.id}
                                        onClick={() => setActiveBackground(bg.id)}
                                        className={cn(
                                            "aspect-square rounded-xl border-2 relative overflow-hidden transition-all hover:scale-105 active:scale-95 group",
                                            activeBackground === bg.id ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-slate-800"
                                        )}
                                        style={{ backgroundImage: `url(${bg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    >
                                        <div
                                            className="absolute top-1 right-1 p-1 bg-rose-600 rounded-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110"
                                            onClick={(e) => handleRemoveBackground(bg.id, e)}
                                            title={t('remove_background')}
                                        >
                                            <Trash2 size={10} className="text-white" />
                                        </div>
                                        {activeBackground === bg.id && (
                                            <div className="absolute inset-0 border-2 border-emerald-500 rounded-lg pointer-events-none" />
                                        )}
                                    </button>
                                ))}

                                {/* Standard Backgrounds */}
                                {SPORTS_BACKGROUNDS.map(bg => (
                                    <button
                                        key={bg.id}
                                        onClick={() => setActiveBackground(bg.id)}
                                        className={cn(
                                            "aspect-square rounded-xl border-2 relative overflow-hidden transition-all hover:scale-105 active:scale-95",
                                            activeBackground === bg.id ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-slate-800 hover:border-slate-700"
                                        )}
                                    >
                                        <div className={cn("absolute inset-0 opacity-80 transition-opacity hover:opacity-100 bg-cover bg-center", bg.style)}
                                            style={bg.url ? { backgroundImage: `url(${bg.url})` } : {}}
                                        />
                                        {activeBackground === bg.id && (
                                            <div className="absolute inset-0 border-2 border-emerald-500 rounded-lg pointer-events-none" />
                                        )}
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                            <span className="text-[7px] text-white font-bold uppercase tracking-wider block text-center truncate">{bg.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* AI Processing Overlay */}
            {processingState !== 'idle' && (
                <div className="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500 rounded-[2.5rem]">
                    <div className="w-full max-w-md p-8 text-center space-y-8">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className={cn(
                                "absolute inset-0 bg-emerald-500/20 rounded-full blur-xl transition-all duration-1000",
                                processingState === 'complete' ? "scale-100 opacity-100" : "scale-150 opacity-50 animate-pulse"
                            )} />
                            <div className="relative bg-slate-900 border border-slate-700 w-full h-full rounded-full flex items-center justify-center shadow-2xl">
                                {processingState === 'complete' ? (
                                    <CheckCircle size={48} className="text-emerald-400 animate-in zoom-in duration-500" />
                                ) : (
                                    <BrainCircuit size={48} className="text-emerald-400 animate-pulse" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-widest">
                                {processingState === 'transcribing' && 'AI Transcription...'}
                                {processingState === 'summarizing' && 'Generating Summary...'}
                                {processingState === 'sending' && 'Syncing Workspaces...'}
                                {processingState === 'complete' && 'Session Archived'}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium animate-pulse">
                                {processingState === 'transcribing' && t('ai_transcribing')}
                                {processingState === 'summarizing' && t('ai_summarizing')}
                                {processingState === 'sending' && t('ai_sending')}
                                {processingState === 'complete' && t('ai_complete')}
                            </p>
                        </div>

                        <div className="flex justify-center gap-2">
                            {['transcribing', 'summarizing', 'sending'].map((step, i) => {
                                const currentStepIndex = ['transcribing', 'summarizing', 'sending', 'complete'].indexOf(processingState);
                                const stepIndex = i;
                                const isActive = currentStepIndex >= stepIndex;

                                return (
                                    <div key={step} className={cn(
                                        "w-3 h-3 rounded-full transition-all duration-500",
                                        isActive ? "bg-emerald-500 scale-110" : "bg-slate-800"
                                    )} />
                                );
                            })}
                        </div>

                        {processingState === 'complete' && (
                            <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 py-3 px-6 rounded-xl border border-emerald-500/20 animate-in slide-in-from-bottom-5">
                                <FileText size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">{t('report_generated')}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Backgrounds Selection Overlay */}
            {showBackgrounds && (
                <div className="absolute inset-x-0 bottom-40 z-[70] px-8 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-slate-950/90 backdrop-blur-2xl border border-slate-700 p-6 rounded-[2rem] shadow-2xl max-w-4xl w-full">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Image size={16} className="text-emerald-400" /> {t('virtual_backgrounds')}
                            </h3>
                            <button onClick={() => setShowBackgrounds(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="main_background_grid grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3">
                            {/* Upload Tile in Main View */}
                            <label
                                className="aspect-square rounded-xl border-2 border-slate-700 hover:border-emerald-500 border-dashed bg-slate-900 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:bg-slate-800"
                                title={t('add_background_tooltip')}
                            >
                                <input type="file" className="hidden" accept="image/*" onChange={handleUploadBackground} />
                                <Plus size={20} className="text-emerald-400" />
                            </label>
                            <button
                                onClick={() => setActiveBackground(null)}
                                className={cn(
                                    "aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105",
                                    activeBackground === null ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-600"
                                )}
                            >
                                <VideoOff size={16} className="text-slate-400" />
                                <span className="text-[8px] font-bold text-slate-500 uppercase">{t('background_none')}</span>
                            </button>
                            {customBackgrounds.map(bg => (
                                <button
                                    key={bg.id}
                                    onClick={() => setActiveBackground(bg.id)}
                                    className={cn(
                                        "aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 relative overflow-hidden transition-all hover:scale-105 group",
                                        activeBackground === bg.id ? "border-emerald-500" : "border-transparent"
                                    )}
                                    style={{ backgroundImage: `url(${bg.url})`, backgroundSize: 'cover' }}
                                >
                                    <div
                                        className="absolute top-1 right-1 p-1 bg-rose-600 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleRemoveBackground(bg.id, e)}
                                    >
                                        <Trash2 size={10} className="text-white" />
                                    </div>
                                </button>
                            ))}
                            {SPORTS_BACKGROUNDS.map(bg => (
                                <button
                                    key={bg.id}
                                    onClick={() => setActiveBackground(bg.id)}
                                    className={cn(
                                        "aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 relative overflow-hidden transition-all hover:scale-105",
                                        activeBackground === bg.id ? "border-emerald-500" : "border-transparent"
                                    )}
                                >
                                    <div className={cn("absolute inset-0 opacity-80", bg.style)} />
                                    <span className="relative z-10 text-[8px] font-bold text-white uppercase text-center leading-tight drop-shadow-md">{bg.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Help Overlay (omitted for brevity in replacement, but I must preserve it if I'm replacing the whole component or be careful with chunks) */}
            {/* ... keeping help overlay logic ... */}
            {showHelp && (
                <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-8 active:cursor-pointer" onClick={() => setShowHelp(false)}>
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-2xl shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white uppercase tracking-widest">{t('session_guide')}</h3>
                            <button onClick={() => setShowHelp(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-emerald-400 font-bold uppercase text-xs tracking-wider">
                                    <Video size={16} /> {t('data_overlay_title')}
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    {t('data_overlay_desc')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase text-xs tracking-wider">
                                    <Monitor size={16} /> {t('screen_share_title')}
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    {t('screen_share_desc')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-amber-400 font-bold uppercase text-xs tracking-wider">
                                    <MessageSquare size={16} /> {t('studio_chat_title')}
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    {t('studio_chat_desc')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-rose-400 font-bold uppercase text-xs tracking-wider">
                                    <Activity size={16} /> {t('biometrics_title')}
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    {t('biometrics_desc')}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setShowHelp(false)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-all">
                            {t('got_it')}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col gap-6">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-[2.5rem] relative overflow-hidden shadow-2xl transition-all duration-700">
                    {/* Active Background Layer */}
                    <div
                        className={cn(
                            "absolute inset-0 transition-all duration-1000 ease-in-out",
                            activeBgStyle && 'className' in activeBgStyle ? activeBgStyle.className : ""
                        )}
                        style={activeBgStyle && 'backgroundImage' in activeBgStyle ? activeBgStyle : undefined}
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center relative z-10">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-slate-900/80 backdrop-blur-sm border-4 border-slate-800 flex items-center justify-center mb-8 shadow-2xl relative group rotate-3 transition-transform duration-500">
                                {isScreenSharing ? <Monitor size={80} className="text-indigo-400" /> : <User size={80} className="text-slate-700 group-hover:text-emerald-400 transition-colors" />}
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-950 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-widest uppercase drop-shadow-lg">{isScreenSharing ? t('screen_share_title') : t('live_room_title')}</h3>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                                <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.2em] drop-shadow-md">Bio-Feedback Active</p>
                            </div>
                            {isHandRaised && (
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full animate-bounce">
                                    <Hand size={14} className="text-yellow-500" />
                                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">{t('hand_raised')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-10 right-10 w-64 aspect-video bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-20 group">
                        {!isCameraOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                <VideoOff className="text-slate-800" size={32} />
                            </div>
                        )}
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 bg-slate-950/80 rounded-xl border border-white/10 text-[9px] font-black text-white uppercase backdrop-blur-md">
                            <Radio size={12} className="text-emerald-400" />
                            {t('feed_you')}
                        </div>
                    </div>

                    {/* Help Button */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="absolute top-10 right-10 p-4 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-all z-30"
                        title={t('session_guide')}
                    >
                        <HelpCircle size={24} />
                    </button>

                    <div className="absolute top-10 left-10 flex gap-4 z-20">
                        <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-2xl border border-slate-800 p-4 rounded-3xl shadow-2xl">
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 shadow-lg">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Real-time HR</p>
                                <p className="text-2xl font-black text-white mt-0.5">168 <span className="text-xs font-bold text-slate-600">BPM</span></p>
                            </div>
                            <div className="w-px h-10 bg-slate-800 mx-2"></div>
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shadow-lg">
                                <Zap size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Rel. Power</p>
                                <p className="text-2xl font-black text-white mt-0.5">312 <span className="text-xs font-bold text-slate-600">WATTS</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/40 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[2.5rem] shadow-2xl z-20">
                        <button
                            onClick={() => setShowBackgrounds(!showBackgrounds)}
                            className={cn(
                                "p-4 rounded-2xl transition-all active:scale-90 shadow-xl border-2",
                                showBackgrounds ? "bg-emerald-600 border-emerald-400 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                            )}
                            title={t('virtual_backgrounds')}
                        >
                            <Image size={24} />
                        </button>
                        <div className="w-px h-10 bg-slate-800/50 mx-4"></div>
                        <button
                            onClick={() => setIsHandRaised(!isHandRaised)}
                            className={cn(
                                "p-4 rounded-2xl transition-all active:scale-90 shadow-xl border-2 relative group",
                                isHandRaised ? "bg-yellow-500 border-yellow-400 text-slate-900" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                            )}
                            title="Lever la main"
                        >
                            <Hand size={24} />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-32 p-2 bg-slate-900 border border-slate-700 rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <p className="text-[9px] text-slate-300 font-medium">{t('hand_raised_tooltip')}</p>
                            </div>
                        </button>
                        <div className="w-px h-10 bg-slate-800/50 mx-4"></div>
                        <div className="relative group">
                            <button
                                onClick={() => setIsCameraOn(!isCameraOn)}
                                className={cn(
                                    "p-4 rounded-2xl transition-all active:scale-90 shadow-xl border-2",
                                    isCameraOn ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white" : "bg-rose-600 border-rose-400 text-white"
                                )}
                            >
                                {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                            </button>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl text-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-xl transform translate-y-2 group-hover:translate-y-0">
                                <p className="text-[10px] text-white font-bold mb-1">{t('toggle_camera_tooltip')}</p>
                                <p className="text-[9px] text-slate-400 leading-tight">{t('camera_tooltip_desc')}</p>
                            </div>
                        </div>
                        <div className="relative group">
                            <button
                                onClick={() => setIsMicOn(!isMicOn)}
                                className={cn(
                                    "p-4 rounded-2xl transition-all active:scale-90 shadow-xl border-2",
                                    isMicOn ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white" : "bg-rose-600 border-rose-400 text-white"
                                )}
                            >
                                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                            </button>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl text-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-xl transform translate-y-2 group-hover:translate-y-0">
                                <p className="text-[10px] text-white font-bold mb-1">{t('toggle_mic_tooltip')}</p>
                                <p className="text-[9px] text-slate-400 leading-tight">{t('mic_tooltip_desc')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsScreenSharing(!isScreenSharing)}
                            className={cn(
                                "p-4 rounded-2xl transition-all active:scale-90 shadow-xl border-2",
                                isScreenSharing ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                            )}
                        >
                            <Monitor size={24} />
                        </button>
                        <div className="w-px h-10 bg-slate-800/50 mx-4"></div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 bg-slate-950/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-800">
                                <input
                                    type="checkbox"
                                    checked={saveTranscript}
                                    onChange={(e) => setSaveTranscript(e.target.checked)}
                                    className="accent-emerald-500"
                                    id="saveTranscript"
                                />
                                <label htmlFor="saveTranscript" className="text-[9px] font-bold text-slate-400 uppercase cursor-pointer select-none">{t('save_transcript')}</label>
                            </div>
                            <button
                                onClick={handleTerminate}
                                className="px-10 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl transition-all shadow-xl shadow-rose-900/40 font-black uppercase tracking-widest text-[10px]"
                            >
                                {t('terminate_session')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[420px] flex flex-col gap-6">
                <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800 shadow-2xl">
                    <div className="p-4 border-b border-slate-800 flex gap-2">
                        {['biometric_data', 'studio_chat', 'participants'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 py-3 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl transition-all border",
                                    activeTab === tab
                                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                                        : "bg-slate-950 border-slate-800 text-slate-500 hover:text-white"
                                )}
                            >
                                {t(tab + '_tab')}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 p-6">
                        {activeTab === 'biometric_data' && (
                            <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('advanced_telemetry')}</h4>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Stride Frequency', value: '184', unit: 'SPM', color: 'text-emerald-400' },
                                        { label: 'Impact Force', value: '1.24', unit: 'G', color: 'text-indigo-400' },
                                        { label: 'Ground Contact', value: '238', unit: 'MS', color: 'text-amber-400' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex justify-between items-center group hover:border-emerald-500/20 transition-all shadow-inner">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                            <div className="text-right">
                                                <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
                                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">{stat.unit}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Radio size={14} className="text-emerald-400 opacity-50" />
                                        <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{t('performance_insight')}</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium uppercase tracking-tight">
                                        Biomechanical efficiency is increasing. Vertical oscillation is now within optimal range for the current aerobic threshold.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'studio_chat' && (
                            <div className="flex flex-col h-full relative">
                                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                    {chatMessages.map(msg => (
                                        <div key={msg.id} className={cn("flex gap-3", msg.style === 'user' ? "flex-row-reverse" : "")}>
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                                {msg.sender[0]}
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed",
                                                msg.style === 'user'
                                                    ? "bg-emerald-600 text-white rounded-tr-none"
                                                    : "bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700"
                                            )}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-800 shrink-0 relative z-20">
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-full mb-2 right-0 bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-xl grid grid-cols-5 gap-1 z-50 animate-in zoom-in-95 duration-200">
                                            {['👍', '🔥', '💪', '🏃', '🚴', '🥇', '👋', '🛑', '❤️', '✅'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setMessageInput(prev => prev + emoji);
                                                        // Keep picker open for multi-select
                                                        setTimeout(() => messageInputRef.current?.focus(), 10);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="relative flex items-center group bg-slate-950 border border-slate-800 rounded-xl focus-within:border-emerald-500/50 transition-colors">
                                        <button className="p-3 text-slate-500 hover:text-emerald-400 transition-colors" title={t('send_file_title')}>
                                            <Paperclip size={16} />
                                        </button>
                                        <input
                                            ref={messageInputRef}
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder={t('message_placeholder')}
                                            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 outline-none h-10"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && messageInput.trim()) {
                                                    setChatMessages([...chatMessages, { id: Date.now(), sender: 'You', text: messageInput, style: 'user' }]);
                                                    setMessageInput('');
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEmojiPicker(!showEmojiPicker);
                                                // Focus input if opening ?? No, if opening, we lose focus to button? 
                                                // Actually we want input to be focused so we can type.
                                                if (!showEmojiPicker) {
                                                    setTimeout(() => messageInputRef.current?.focus(), 10);
                                                }
                                            }}
                                            className={cn("p-2 text-slate-500 hover:text-yellow-400 transition-colors", showEmojiPicker && "text-yellow-400")}
                                        >
                                            <Smile size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (messageInput.trim()) {
                                                    setChatMessages([...chatMessages, { id: Date.now(), sender: 'You', text: messageInput, style: 'user' }]);
                                                    setMessageInput('');
                                                    messageInputRef.current?.focus();
                                                }
                                            }}
                                            className="p-3 text-slate-500 hover:text-white transition-colors"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'participants' && (
                            <div className="h-full overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                {[
                                    { name: 'You', role: 'Athlete', status: 'Active', avatar: 'ME' },
                                    { name: 'Coach Sarah', role: 'Head Coach', status: 'Active', avatar: 'CS' },
                                    { name: 'Live Telemetry', role: 'System', status: 'Monitoring', avatar: 'LT' }
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 border border-slate-700">
                                            {p.avatar}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-xs">{p.name}</p>
                                            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">{p.status}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>                </Card>

                <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-[2rem] text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-indigo-900/40 active:scale-95 border-b-4 border-indigo-800">
                    <Play size={22} className="fill-current" /> {t('initialize_recording')}
                </button>
            </div>
        </div >
    );
}
