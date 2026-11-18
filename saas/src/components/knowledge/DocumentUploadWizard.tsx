'use client';

import { useState } from 'react';

type DocumentUploadWizardProps = {
  isOpen: boolean;
  onClose: () => void;
  datasetId?: string;
  onSuccess?: () => void;
};

export function DocumentUploadWizard({
  isOpen,
  onClose,
  onSuccess,
}: DocumentUploadWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string>('');
  const [chunkSize, setChunkSize] = useState(500);
  const [indexingTechnique, setIndexingTechnique] = useState<'high_quality' | 'economy'>('high_quality');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setUploading(true);
    // Simulate upload & indexing
    await new Promise((r) => setTimeout(r, 1000));
    setUploading(false);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        {/* Wizard Step Indicator */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    step === s
                      ? 'bg-blue-600 text-white'
                      : step > s
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {step > s ? '✓' : s}
                </span>
                <span className="text-xs font-medium text-gray-600">
                  {s === 1 ? 'Upload File' : s === 2 ? 'Text Chunking' : 'Index & Vector'}
                </span>
                {s < 3 && <span className="text-gray-300">→</span>}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step 1: File Dropzone */}
        {step === 1 && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-2xl">
                📂
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">
                {fileName ? fileName : 'Drag & drop your files here, or browse'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Supports PDF, DOCX, Markdown, TXT (up to 15MB)
              </p>

              <button
                type="button"
                onClick={() => setFileName('Company_Technical_Manual_v2.pdf')}
                className="mt-4 rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                Select Sample Document
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                disabled={!fileName}
                onClick={() => setStep(2)}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
              >
                Next: Chunking Rules →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Text Chunking */}
        {step === 2 && (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Segment / Chunk Size
              </label>
              <p className="text-xs text-gray-500">
                Maximum token length per chunk for vector embedding search.
              </p>
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="range"
                  min={100}
                  max={1500}
                  step={50}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer accent-blue-600"
                />
                <span className="font-mono text-sm font-bold text-gray-900 w-16 text-right">
                  {chunkSize} tokens
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-700">Preview Segment Chunking</p>
              <p className="mt-1 text-xs text-gray-600 font-mono">
                Document will be partitioned into approx. {Math.ceil(2400 / chunkSize)} chunks using double newline separator.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 cursor-pointer"
              >
                Next: Indexing Mode →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Indexing & Technique */}
        {step === 3 && (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-gray-900">
              Embedding & Indexing Model
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIndexingTechnique('high_quality')}
                className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                  indexingTechnique === 'high_quality'
                    ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900">High Quality</p>
                <p className="mt-1 text-xs text-gray-500">
                  Deep vector embeddings with high semantic recall accuracy.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIndexingTechnique('economy')}
                className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                  indexingTechnique === 'economy'
                    ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900">Economy</p>
                <p className="mt-1 text-xs text-gray-500">
                  Keyword inverted index for rapid queries with low storage cost.
                </p>
              </button>
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={handleFinish}
                className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
              >
                {uploading ? 'Processing & Vectorizing...' : 'Save & Start Indexing'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
