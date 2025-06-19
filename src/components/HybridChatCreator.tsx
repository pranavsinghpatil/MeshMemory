import React, { useState } from 'react';
import { importSource, importGrouped, createHybrid } from '../lib/api';

const HybridChatCreator: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);
  const [titles, setTitles] = useState<string[]>(['']);
  const [types, setTypes] = useState<string[]>(['copy_paste']);
  const [progress, setProgress] = useState<number>(0);
  const [batchId, setBatchId] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleUrlChange = (idx: number, value: string) => {
    const u = [...urls]; u[idx] = value; setUrls(u);
  };

  const addUrlField = () => {
    setUrls([...urls, '']);
    setTitles([...titles, '']);
    setTypes([...types, 'link']);
  };

  const handleSubmit = async () => {
    setMessage(''); setProgress(0);
    const formData = new FormData();
    files.forEach((f, i) => {
      formData.append('files', f);
      formData.append('types', types[i] || 'copy_paste');
      formData.append('titles', titles[i] || f.name);
    });
    urls.forEach((u, i) => {
      if (u) {
        formData.append('urls', u);
        formData.append('types', types[files.length + i] || 'link');
        formData.append('titles', titles[files.length + i] || u);
      }
    });
    try {
      setProgress(20);
      const res = await importSource(formData);
      setBatchId(res.import_batch_id);
      setProgress(100);
      setMessage(`Imported ${res.chunks_processed} chunks`);
    } catch (e: any) {
      setMessage(e.message || 'Import failed');
      setProgress(0);
    }
  };

  return (
    <div className="hybrid-chat-creator">
      <h2>Grouped Chat Import</h2>
      <div>
        <label>Files:</label>
        <input type="file" multiple onChange={handleFileChange} />
      </div>
      <div>
        <label>URLs:</label>
        {urls.map((u, i) => (
          <input key={i} type="text" value={u} onChange={e => handleUrlChange(i, e.target.value)} placeholder="Enter URL" />
        ))}
        <button onClick={addUrlField}>Add URL</button>
      </div>
      <div>
        <button onClick={handleSubmit}>Import</button>
      </div>
      {progress > 0 && <progress value={progress} max={100} />}
      {batchId && <p>Batch ID: {batchId}</p>}
      {message && <p>{message}</p>}
    </div>
  );
};

export default HybridChatCreator;
