import React, { useState, useRef, useEffect } from 'react';
import { Camera, Keyboard } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose?: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [manualInput, setManualInput] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isManualMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isManualMode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (manualInput.trim()) {
        onScan(manualInput.trim());
        setManualInput('');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Barcode Scanner</h5>
        {onClose && (
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            Close
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="d-flex gap-2 mb-3">
          <button
            className={`btn ${!isManualMode ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setIsManualMode(false)}
          >
            <Camera size={16} className="me-2" />
            Camera Scanner
          </button>
          <button
            className={`btn ${isManualMode ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setIsManualMode(true)}
          >
            <Keyboard size={16} className="me-2" />
            Manual Input
          </button>
        </div>

        {!isManualMode ? (
          <div className="text-center py-5 bg-light rounded">
            <div className="mb-3">
              <Camera size={48} className="text-muted" />
            </div>
            <p className="text-muted">
              Camera scanner requires additional library integration.
              Use manual input for now.
            </p>
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsManualMode(true)}
            >
              Switch to Manual Input
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit}>
            <div className="mb-3">
              <label className="form-label">Enter Barcode</label>
              <input
                ref={inputRef}
                type="text"
                className="form-control form-control-lg"
                placeholder="Scan or enter barcode..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setManualInput('')}
              >
                Clear
              </button>
            </div>
            <div className="mt-3 text-muted small">
              <strong>Tip:</strong> Connect a barcode scanner and it will automatically
              input the barcode when you scan an item.
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
