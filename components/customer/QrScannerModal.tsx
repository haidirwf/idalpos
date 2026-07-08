'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, CameraOff, AlertTriangle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerModalProps {
  onClose: () => void;
}

export default function QrScannerModal({ onClose }: QrScannerModalProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const element = document.getElementById('reader-element');
    if (!element) {
      return;
    }
    const html5QrCode = new Html5Qrcode('reader-element');
    scannerInstanceRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: 'environment' },
        {
          fps: 20,
          aspectRatio: 1.0,
          qrbox: (width: number, height: number) => {
            const size = Math.min(width, height) * 0.75;
            return { width: size, height: size };
          },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        (decodedText: string) => {
          // Success callback
          const match = decodedText.match(/\/table\/([a-zA-Z0-9_-]+)/);
          let tableNum = '';
          if (match) {
            tableNum = match[1];
          } else if (/^[a-zA-Z0-9_-]+$/.test(decodedText.trim())) {
            tableNum = decodedText.trim();
          }

          if (tableNum) {
            // Stop scanner first, then navigate
            html5QrCode
              .stop()
              .then(() => {
                router.push(`/table/${tableNum}`);
                onClose();
              })
              .catch((err: unknown) => {
                console.error('Failed to stop scanner:', err);
                router.push(`/table/${tableNum}`);
                onClose();
              });
          }
        },
        () => {
          // Ignore failure callbacks to reduce noise
        }
      )
      .then(() => {
        setInitializing(false);
      })
      .catch((err: unknown) => {
        console.error('Camera startup error:', err);
        setErrorMsg(
          'Gagal mengakses kamera. Pastikan izin kamera telah diberikan dan perangkat mendukung.'
        );
        setInitializing(false);
      });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch((err: unknown) => {
          console.error('Cleanup stop error:', err);
        });
      }
    };
  }, [router, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0F0F10]/95 flex flex-col justify-between p-6 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500 border border-amber-500/20">
            <Camera size={20} />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white">Pindai QR Code</h2>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
              Arahkan ke QR Meja Anda
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-xl transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
      </header>

      {/* Viewfinder area */}
      <div className="max-w-md mx-auto w-full my-auto flex flex-col items-center">
        {initializing && (
          <div className="text-center py-12 animate-pulse">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">Menyiapkan kamera...</p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 text-center max-w-sm">
            <AlertTriangle className="mx-auto text-red-500 mb-3 animate-bounce" size={32} />
            <h3 className="font-bold text-sm text-red-300">Akses Kamera Ditolak</h3>
            <p className="mt-2 text-xs text-red-400/90 leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <div
          className={`relative w-full max-w-xs aspect-square bg-black rounded-3xl overflow-hidden border border-neutral-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${
            initializing || errorMsg ? 'hidden' : 'block'
          }`}
        >
          {/* Glowing viewfinder overlay corners */}
          <div className="absolute inset-0 pointer-events-none z-10 border-2 border-transparent">
            {/* Top-Left */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-500 rounded-tl-lg shadow-[-2px_-2px_10px_rgba(245,158,11,0.3)]" />
            {/* Top-Right */}
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-500 rounded-tr-lg shadow-[2px_-2px_10px_rgba(245,158,11,0.3)]" />
            {/* Bottom-Left */}
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-500 rounded-bl-lg shadow-[-2px_2px_10px_rgba(245,158,11,0.3)]" />
            {/* Bottom-Right */}
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-500 rounded-br-lg shadow-[2px_2px_10px_rgba(245,158,11,0.3)]" />
            
            {/* Scan animation bar */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-[scan_2s_infinite_ease-in-out]" />
          </div>

          <div id="reader-element" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Footer tips */}
      <footer className="text-center max-w-xs mx-auto w-full text-xs text-neutral-500 pb-4">
        {!errorMsg ? (
          <p className="leading-relaxed">
            Pindai QR code yang ada di atas meja makan Anda untuk melihat menu dan memesan hidangan secara langsung.
          </p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-neutral-600">
            <CameraOff size={14} />
            <span>Kamera tidak aktif</span>
          </div>
        )}
      </footer>

      {/* Scan animation custom styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(220px);
          }
        }
        #reader-element video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}} />
    </div>
  );
}
