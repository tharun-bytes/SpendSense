import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { uploadCSVFile, AuditSummary } from '../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a valid CSV file (.csv).');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setAuditResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        setHeaders(rawHeaders);
        const sampleRows = lines.slice(1, 5).map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));
        setPreviewRows(sampleRows);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const res = await uploadCSVFile(selectedFile);
      setAuditResult(res.audit_summary);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-2xl liquid-glass rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-zinc-300" />
              Import Transaction CSV
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              SpendSense automatically standardizes varied bank headers, cleans currency values, and eliminates duplicate rows.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {auditResult ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-medium text-white">Import & Cleaning Complete!</h4>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-zinc-400">Valid Records</p>
                <p className="text-lg font-mono font-medium text-emerald-400">{auditResult.valid_rows}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-zinc-400">Duplicates Removed</p>
                <p className="text-lg font-mono font-medium text-amber-400">{auditResult.duplicates_removed}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-zinc-400">Excluded Corrupt</p>
                <p className="text-lg font-mono font-medium text-zinc-400">{auditResult.excluded_rows}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">Updating dashboard metrics...</p>
          </div>
        ) : (
          <div className="space-y-5 mt-4">
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-white bg-white/5'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-300">
                  <FileText className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB — Click or drop to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-white">
                      Drop transaction CSV here or <span className="underline decoration-white/40">browse</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Accepts statements from Chase, HDFC, SBI, BoA, Revolut, Monzo, PayPal, and generic CSVs
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CSV Sample Preview */}
            {previewRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Detected Headers ({headers.length})</span>
                  <span className="font-mono text-zinc-500">First 4 preview rows</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/40 p-2 max-h-36">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-300 font-mono">
                        {headers.map((h, i) => (
                          <th key={i} className="px-2 py-1 whitespace-nowrap font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-400 font-mono">
                      {previewRows.map((row, idx) => (
                        <tr key={idx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-2 py-1 whitespace-nowrap">
                              {cell || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || loading}
                onClick={handleUpload}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium text-black bg-white hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Cleaning & Processing...
                  </>
                ) : (
                  <>
                    Normalize & Import
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
