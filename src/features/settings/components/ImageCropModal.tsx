import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { useLanguage } from '@/shared/context/LanguageContext';

interface ImageCropModalProps {
    imageUrl: string;
    onCropComplete: (croppedFile: File) => void;
    onCancel: () => void;
}

export function ImageCropModal({ imageUrl, onCropComplete, onCancel }: ImageCropModalProps) {
    const { t } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            imageRef.current = img;
            setImageLoaded(true);
            // Center image initially
            const canvas = canvasRef.current;
            if (canvas) {
                const scale = Math.max(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                setZoom(scale);
            }
        };
        img.src = imageUrl;
    }, [imageUrl]);

    // Draw on canvas
    useEffect(() => {
        if (!imageLoaded || !imageRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = imageRef.current;

        // Calculate min zoom to cover the circle (300px diameter)
        const minZoom = 300 / Math.min(img.width, img.height);
        if (zoom < minZoom) setZoom(minZoom);

        // Calculate boundaries for position
        const scaledWidth = img.width * zoom;
        const scaledHeight = img.height * zoom;

        // Limits: image must cover circle (center +/- 150)
        const minX = (canvas.width / 2 + 150) - scaledWidth - (canvas.width - scaledWidth) / 2;
        const maxX = (canvas.width / 2 - 150) - (canvas.width - scaledWidth) / 2;
        const minY = (canvas.height / 2 + 150) - scaledHeight - (canvas.height - scaledHeight) / 2;
        const maxY = (canvas.height / 2 - 150) - (canvas.height - scaledHeight) / 2;

        let correctedX = position.x;
        let correctedY = position.y;

        if (correctedX < minX) correctedX = minX;
        if (correctedX > maxX) correctedX = maxX;
        if (correctedY < minY) correctedY = minY;
        if (correctedY > maxY) correctedY = maxY;

        if (correctedX !== position.x || correctedY !== position.y) {
            setPosition({ x: correctedX, y: correctedY });
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image with zoom and position
        const x = (canvas.width - scaledWidth) / 2 + correctedX;
        const y = (canvas.height - scaledHeight) / 2 + correctedY;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Draw circular crop overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cut out circle
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, Math.PI * 2);
        ctx.fill();

        // Draw circle border
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, Math.PI * 2);
        ctx.stroke();
    }, [imageLoaded, zoom, position]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleCrop = () => {
        if (!canvasRef.current || !imageRef.current) return;

        const canvas = canvasRef.current;
        const img = imageRef.current;

        // Use a higher resolution for the final crop
        const cropCanvas = document.createElement('canvas');
        const cropSize = 512; // High resolution
        cropCanvas.width = cropSize;
        cropCanvas.height = cropSize;
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) return;

        const scaledWidth = img.width * zoom;
        const scaledHeight = img.height * zoom;
        const x = (canvas.width - scaledWidth) / 2 + position.x;
        const y = (canvas.height - scaledHeight) / 2 + position.y;

        // Calculate source coordinates based on circular area
        const radius = 150;
        const sourceX = (canvas.width / 2 - radius - x) / zoom;
        const sourceY = (canvas.height / 2 - radius - y) / zoom;
        const sourceSize = (radius * 2) / zoom;

        // Draw the image to the crop canvas
        cropCtx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            0,
            0,
            cropSize,
            cropSize
        );

        // Convert to blob and then to File
        cropCanvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                onCropComplete(file);
            }
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl border-emerald-500/50 shadow-2xl animate-in zoom-in-95 duration-500 bg-slate-950">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                {t('crop_photo_title')}
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                {t('center_face_hint')}
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Canvas */}
                    <div className="relative bg-slate-900 rounded-2xl p-4 border border-slate-800">
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={400}
                            className="w-full cursor-move"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                        <div className="absolute top-8 left-8 flex items-center gap-2 bg-slate-950/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-800">
                            <Move size={16} className="text-emerald-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {t('drag_center_hint')}
                            </span>
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Zoom
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <input
                                type="range"
                                min="0.5"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                            />
                            <button
                                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-4 text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleCrop}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/40 transition-all"
                        >
                            {t('confirm')}
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
