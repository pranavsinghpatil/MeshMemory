import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus, Trash2, Check, UploadCloud } from 'lucide-react';
import { importGroupedAPI } from '../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Artefact {
  file: File | null;
  url: string | null;
  type: string; // copy_paste | pdf | screenshot | html | link
  title: string;
  status: 'queued' | 'processing' | 'done' | 'error';
}

export default function MultiImportDialog({ isOpen, onClose }: Props) {
  const [artefacts, setArtefacts] = useState<Artefact[]>([]);
  const [processing, setProcessing] = useState(false);

  const onDrop = (accepted: File[]) => {
    const newItems: Artefact[] = accepted.map((f) => ({
      file: f,
      url: null,
      type: inferType(f.name),
      title: f.name,
      status: 'queued',
    }));
    setArtefacts((prev) => [...prev, ...newItems]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const inferType = (filename: string): string => {
    if (filename.match(/\.pdf$/i)) return 'pdf';
    if (filename.match(/\.(png|jpg|jpeg)$/i)) return 'screenshot';
    if (filename.match(/\.txt$/i)) return 'copy_paste';
    return 'other';
  };

  const handleAddUrl = () => {
    const url = prompt('Paste share link or URL to import');
    if (!url) return;
    setArtefacts((prev) => [
      ...prev,
      {
        file: null,
        url,
        type: 'link',
        title: url,
        status: 'queued',
      },
    ]);
  };

  const startImport = async () => {
    setProcessing(true);
    setArtefacts((prev) => prev.map((a) => ({ ...a, status: 'processing' })));
    try {
      const files = artefacts.filter((a) => a.file);
      const urls = artefacts.filter((a) => a.url);
      const form = new FormData();
      files.forEach((a) => form.append('files', a.file as File));
      form.append('types', JSON.stringify(artefacts.map((a) => a.type)));
      form.append('titles', JSON.stringify(artefacts.map((a) => a.title)));
      if (urls.length) form.append('urls', JSON.stringify(urls.map((u) => u.url)));

      const res = await importGroupedAPI(form);
      console.log(res);
      setArtefacts((prev) => prev.map((a) => ({ ...a, status: 'done' })));
    } catch (err) {
      setArtefacts((prev) => prev.map((a) => ({ ...a, status: 'error' })));
    } finally {
      setProcessing(false);
    }
  };

  const removeArtefact = (idx: number) => {
    setArtefacts((prev) => prev.filter((_, i) => i !== idx));
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-4 overflow-y-auto max-h-[90vh]">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Import Chats</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </header>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 dark:border-gray-600'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-10 h-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Drag & drop files here, or click to select</p>
        </div>

        <button onClick={handleAddUrl} className="flex items-center space-x-1 text-indigo-600 text-sm">
          <Plus className="w-4 h-4" />
          <span>Add link</span>
        </button>

        {/* Artefact list */}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {artefacts.map((a, idx) => (
            <li key={idx} className="py-2 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {a.status === 'done' && <Check className="text-green-500 w-4 h-4" />}
                {a.status === 'processing' && <span className="loader w-4 h-4" />}
                {a.status === 'error' && <span className="text-red-500">⚠</span>}
                <span>{a.title}</span>
              </div>
              {a.status === 'queued' && (
                <button onClick={() => removeArtefact(idx)} className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            Cancel
          </button>
          <button
            onClick={startImport}
            disabled={!artefacts.length || processing}
            className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white disabled:opacity-50 flex items-center space-x-2"
          >
            <span>{processing ? 'Importing…' : 'Finish & Import'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
