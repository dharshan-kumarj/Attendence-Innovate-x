// Install barcode scanner library: npm install react-qr-barcode-scanner
// This is a placeholder for barcode scanning logic
import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

interface BarcodeScannerModalProps {
  bootcamp: string;
  day: number;
  onClose: () => void;
}

export function BarcodeScannerModal({ bootcamp, day, onClose }: BarcodeScannerModalProps) {
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Fix: Use result?.text for QR/barcode value, and only add if not duplicate
  const handleDetected = (err: any, result: any) => {
    if (result?.text && scanning) {
      const code = result.text;
      if (!barcodes.includes(code)) {
        setBarcodes((prev) => [...prev, code]);
        setLastScanned(code);
        // Prevent rapid duplicate scans
        setScanning(false);
        setTimeout(() => {
          setScanning(true);
          setLastScanned(null);
        }, 1200);
      }
    }
  };

  const sendBarcodes = async () => {
    // Replace with your backend endpoint
    const endpoint = 'https://your-backend-endpoint.com/api/barcodes';
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bootcamp, day, barcodes }),
    });
    setBarcodes([]);
    setScanning(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col items-center border border-gray-800">
        <h2 className="text-xl font-extrabold mb-2 text-gray-100 text-center tracking-tight">
          {bootcamp}
          <span className="font-normal text-gray-400 ml-2">| Day {day}</span>
        </h2>
        <div className="mb-4 w-full h-52 flex items-center justify-center bg-gray-800 rounded-xl border border-gray-700">
          {scanning ? (
            <BarcodeScannerComponent
              width={270}
              height={170}
              onUpdate={handleDetected}
            />
          ) : (
            <p className="text-gray-400">Scanning paused</p>
          )}
        </div>
        <div className="mb-4 w-full">
          <h3 className="font-semibold mb-2 text-gray-200 text-left">Scanned Barcodes:</h3>
          <ul className="max-h-28 overflow-y-auto text-xs">
            {barcodes.length === 0 ? (
              <li className="text-gray-500 italic">No barcodes scanned yet.</li>
            ) : (
              barcodes.map((code, idx) => (
                <li key={idx} className="bg-gray-800 text-gray-100 rounded px-2 py-1 mb-1 border border-gray-700 break-all">{code}</li>
              ))
            )}
          </ul>
        </div>
        <div className="flex gap-2 w-full justify-between mt-2">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              scanning ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-900 hover:bg-blue-700'
            } text-gray-100`}
            onClick={() => setScanning(!scanning)}
          >
            {scanning ? 'Pause' : 'Resume'}
          </button>
          <button
            className="bg-green-700 hover:bg-green-800 text-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            onClick={sendBarcodes}
            disabled={barcodes.length === 0}
          >
            Send
          </button>
          <button
            className="bg-red-700 hover:bg-red-800 text-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
