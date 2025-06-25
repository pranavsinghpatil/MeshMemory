import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Loader2 } from 'lucide-react';
import { importChatText, importChatFromUrl, importChatFromFile, createHybridChat } from '@/services/hybrid';
import { toast } from 'sonner';

interface ImportedSource {
  id: string;
  title: string;
  messageCount: number;
  status: 'importing' | 'done' | 'error';
  type: 'text' | 'url' | 'file';
  error?: string;
}

const CreateHybrid = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sources, setSources] = useState<ImportedSource[]>([]);
  const [textBlock, setTextBlock] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [url, setUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const parseMessageCount = (text: string) => {
    // naive: count lines with ':'
    return text.split('\n').filter((l) => l.includes(':')).length;
  };

  // Add a new source with importing status
  const addImportingSource = (title: string, type: 'text' | 'url' | 'file') => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    setSources((prev) => ([...prev, { id: tempId, title, messageCount: 0, status: 'importing', type }]));
    return tempId;
  };

  // Update a source by tempId
  const updateSource = (tempId: string, patch: Partial<ImportedSource>) => {
    setSources((prev) => prev.map((s) => s.id === tempId ? { ...s, ...patch } : s));
  };

  // Remove a source by id
  const removeSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const handleImportText = async () => {
    if (!textBlock.trim()) return toast.error('Paste some chat text first');
    const title = textTitle || `Paste ${sources.length + 1}`;
    const tempId = addImportingSource(title, 'text');
    setTextBlock('');
    setTextTitle('');
    try {
      const sourceId = await importChatText(textBlock, title);
      updateSource(tempId, { id: sourceId, status: 'done', messageCount: parseMessageCount(textBlock) });
      toast.success('Chat imported');
    } catch (err: any) {
      updateSource(tempId, { status: 'error', error: err.message || 'Import failed' });
      toast.error(err.message || 'Import failed');
    }
  };

  const handleImportUrl = async () => {
    if (!url.trim()) return toast.error('Enter a URL');
    const title = urlTitle || `URL ${sources.length + 1}`;
    const tempId = addImportingSource(title, 'url');
    setUrl('');
    setUrlTitle('');
    try {
      const sourceId = await importChatFromUrl(url, title);
      updateSource(tempId, { id: sourceId, status: 'done', messageCount: 0 });
      toast.success('Chat imported from URL');
    } catch (err: any) {
      updateSource(tempId, { status: 'error', error: err.message || 'Import failed' });
      toast.error(err.message || 'Import failed');
    }
  };

  const handleImportFile = async () => {
    if (!file) return toast.error('Select a file');
    const title = fileTitle || file.name;
    const tempId = addImportingSource(title, 'file');
    setFile(null);
    setFileTitle('');
    try {
      const sourceId = await importChatFromFile(file, title);
      updateSource(tempId, { id: sourceId, status: 'done', messageCount: 0 });
      toast.success('Chat imported from file');
    } catch (err: any) {
      updateSource(tempId, { status: 'error', error: err.message || 'Import failed' });
      toast.error(err.message || 'Import failed');
    }
  };

  const handleCreateHybrid = async () => {
    if (sources.length < 2) {
      return toast.error('Import at least two chats');
    }
    setIsCreating(true);
    try {
      const payload = {
        title: 'Hybrid Chat',
        chatIds: sources.map((s) => s.id),
      };
      const data = await createHybridChat(payload);
      toast.success('Hybrid chat created');
      navigate(`/app/chats/${data.hybridChatId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create hybrid chat');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 pb-32">
      <h1 className="text-3xl font-bold">Create Hybrid Chat</h1>

      {/* Import options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paste Text */}
        <Card>
          <CardHeader>
            <CardTitle>Paste Chat Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Optional title (e.g., Slack export)"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
            />
            <Textarea
              placeholder="Paste your chat transcript here..."
              rows={8}
              value={textBlock}
              onChange={(e) => setTextBlock(e.target.value)}
            />
            <Button onClick={handleImportText} disabled={!textBlock.trim()}>
              Import Chat
            </Button>
          </CardContent>
        </Card>
        
        {/* Import from URL */}
        <Card>
          <CardHeader>
            <CardTitle>Import from URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Optional title (e.g., WhatsApp link)"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
            />
            <Input
              placeholder="Paste a chat export URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={handleImportUrl} disabled={!url.trim()}>
              Import from URL
            </Button>
          </CardContent>
        </Card>
        
        {/* Import from File */}
        <Card>
          <CardHeader>
            <CardTitle>Import from File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Optional title (e.g., Teams export)"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
            />
            <Input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleImportFile} disabled={!file}>
              Import from File
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Imported list */}
      {sources.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            Imported Chats <span className="text-sm text-muted-foreground">({sources.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sources.map((src) => (
              <Card key={src.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 w-8 h-8 p-0"
                  onClick={() => removeSource(src.id)}
                  disabled={src.status === 'importing'}
                >
                  <Trash className="w-4 h-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {src.title} {src.type === 'url' && <span className="text-xs bg-muted px-2 py-0.5 rounded">URL</span>}
                    {src.type === 'file' && <span className="text-xs bg-muted px-2 py-0.5 rounded">File</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {src.status === 'importing' && <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin"/> Importing...</span>}
                  {src.status === 'error' && <span className="text-xs text-red-500">{src.error}</span>}
                  {src.status === 'done' && <span className="text-sm text-muted-foreground">{src.messageCount} messages</span>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Floating import tracker bar */}
      {sources.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-background/95 border-t border-border shadow-lg flex items-center gap-2 px-6 py-3 z-50">
          <div className="flex flex-1 gap-2 overflow-x-auto">
            {sources.map((src, idx) => (
              <div 
                key={src.id} 
                className={`rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 shadow ${
                  src.status === 'done' 
                    ? 'bg-green-100 text-green-800' 
                    : src.status === 'error' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-800 animate-pulse'
                }`}
              >
                <span>={idx+1}=</span>
                {src.title}
                {src.status === 'importing' && <Loader2 className="w-3 h-3 animate-spin"/>}
                {src.status === 'error' && <span>!</span>}
              </div>
            ))}
          </div>
          <Button
            onClick={handleCreateHybrid}
            disabled={isCreating || sources.filter(s => s.status === 'done').length < 2}
            className="ml-4 flex items-center gap-2"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Make Hybrid
          </Button>
        </div>
      )}
    </div>
  );
                <CardHeader>
                  <CardTitle className="text-lg">{src.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {src.messageCount} messages
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <Button
          onClick={handleCreateHybrid}
          disabled={isCreating || sources.length < 2}
          className="flex items-center gap-2"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Make Hybrid
        </Button>
      </div>
    </div>
  );
};

export default CreateHybrid;
