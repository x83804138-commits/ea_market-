import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Download } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-10"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Maximize2 className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Image Viewer</p>
                <p className="text-xs font-black text-white uppercase tracking-widest">
                  {currentIndex + 1} / {images.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = images[currentIndex];
                  link.download = `backtest-${currentIndex + 1}.png`;
                  link.click();
                }}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
                title="Download Image"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-red-500 hover:border-red-500 transition-all group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </div>

          {/* Main Image Container */}
          <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevious}
                  className="absolute left-0 z-10 p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-yellow-500 hover:text-black transition-all -translate-x-1/2 md:translate-x-0"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-0 z-10 p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-yellow-500 hover:text-black transition-all translate-x-1/2 md:translate-x-0"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full h-full flex items-center justify-center"
            >
              <img 
                src={images[currentIndex]} 
                alt={`Viewer ${currentIndex}`} 
                className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>

          {/* Thumbnails (Desktop) */}
          <div className="hidden md:flex gap-3 mt-8 pb-4 overflow-x-auto max-w-full px-10 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  idx === currentIndex ? 'border-yellow-500 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
