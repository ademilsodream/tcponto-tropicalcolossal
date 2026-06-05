import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';

interface ToolQrScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (codigo: string) => void;
}

const SCANNER_ID = 'tool-qr-scanner-region';

const ToolQrScanner: React.FC<ToolQrScannerProps> = ({ open, onClose, onScan }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 1) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // scanner may already be stopped
      }
      scannerRef.current = null;
    }
  };

  const handleClose = async () => {
    await stopScanner();
    setError(null);
    onClose();
  };

  const handleScanSuccess = async (decodedText: string) => {
    await stopScanner();
    onScan(decodedText);
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const startScanner = async () => {
      setStarting(true);
      setError(null);

      try {
        await stopScanner();
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!cancelled) {
              handleScanSuccess(decodedText);
            }
          },
          () => {}
        );
      } catch (err) {
        console.error('Erro ao iniciar scanner:', err);
        if (!cancelled) {
          setError('Não foi possível acessar a câmera. Verifique as permissões.');
        }
      } finally {
        if (!cancelled) {
          setStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ler QR Code da Ferramenta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {starting && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Iniciando câmera...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <div
            id={SCANNER_ID}
            className="w-full overflow-hidden rounded-lg bg-black min-h-[280px]"
          />

          <Button variant="outline" className="w-full" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolQrScanner;
