import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { UploadCloud, Send, Sparkles, Loader2, FileText } from 'lucide-react';

export function AIStudy() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    api<{ items: any[] }>('/ai/documents').then(res => {
      setDocuments(res.items);
      if (res.items.length > 0) setActiveDoc(res.items[0]);
    });
  }, []);

  useEffect(() => {
    if (!activeDoc) return;
    api<{ items: any[] }>(`/ai/documents/${activeDoc.id}/messages`).then(res => setMessages(res.items));
  }, [activeDoc]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api<{ document: any }>('/ai/documents', { method: 'POST', body: fd });
      setDocuments(prev => [res.document, ...prev]); setActiveDoc(res.document);
    } catch (err) { alert('Upload failed'); } finally { setIsUploading(false); }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeDoc) return;
    const userMsg = input; setInput(''); setIsChatting(true);
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMsg }]);
    try {
      const res = await api<{ message: any }>(`/ai/documents/${activeDoc.id}/chat`, { method: 'POST', body: JSON.stringify({ message: userMsg }) });
      setMessages(prev => [...prev, res.message]);
    } catch (err) { alert('AI failed'); } finally { setIsChatting(false); }
  };

  const generatePack = async () => {
    if (!activeDoc) return;
    setIsGenerating(true);
    try {
      const res = await api<any>(`/ai/documents/${activeDoc.id}/generate-pack`, { method: 'POST' });
      alert(`✅ Study Pack Generated!\n\n- ${res.flashcardsGenerated || 0} Flashcards\n- ${res.quizzesGenerated || 0} Quizzes\n- ${res.studyPlanGenerated || 0} Study tasks`);
    } catch (err) { alert('Failed to generate pack'); } finally { setIsGenerating(false); }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-4 md:gap-6 animate-in fade-in duration-500">
      {/* Left sidebar: Documents */}
      <div className="w-72 hidden md:flex flex-col gap-3">
        <div className="card p-4 flex-1 flex flex-col">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <FileText className="h-4 w-4" /> My Documents
          </h2>

          <div className="flex-1 overflow-y-auto space-y-1">
            {documents.map(d => (
              <button key={d.id} onClick={() => setActiveDoc(d)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeDoc?.id === d.id
                    ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                }`}>
                <p className="truncate">{d.fileName}</p>
              </button>
            ))}
            {documents.length === 0 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No documents yet</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
            <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer transition-colors">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {isUploading ? 'Uploading...' : 'Upload PDF'}
              <input type="file" accept=".pdf,.txt,.docx" className="hidden" onChange={handleUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
      </div>

      {/* Right: Chat */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {!activeDoc ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-2xl mb-4">
              <Sparkles className="h-10 w-10 text-brand-500" />
            </div>
            <p className="text-lg font-medium mb-1">Ready to help you study</p>
            <p className="text-sm">Upload a document to get started.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-gradient-to-br from-brand-500 to-purple-600 text-white rounded-xl shadow-lg shadow-brand-500/20 flex-shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-slate-900 dark:text-white">AI Assistant</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Context: {activeDoc.fileName}</p>
                </div>
              </div>
              <button onClick={generatePack} disabled={isGenerating}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all disabled:opacity-50">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? 'Generating...' : 'Generate Pack'}
              </button>
            </div>

            {/* Messages — THIS is where the grey box was */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-transparent">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400 mb-4">Ask anything about this document</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Summarize this document', 'Key concepts?', 'Make me a quiz'].map((s, i) => (
                      <button key={i} onClick={() => setInput(s)}
                        className="px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-brand-500 dark:hover:border-brand-400 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-brand-600 dark:bg-brand-500 text-white rounded-br-sm shadow-lg shadow-brand-500/20'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-bl-sm shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}

              {isChatting && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-transparent">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question about this document..."
                  className="input-field flex-1" disabled={isChatting} />
                <button type="submit" disabled={isChatting || !input.trim()}
                  className="btn-primary p-3 aspect-square flex items-center justify-center">
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
