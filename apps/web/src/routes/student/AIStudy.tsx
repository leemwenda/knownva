import { useState, useEffect, useRef, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { UploadCloud, Send, FileText, Sparkles, Loader2 } from 'lucide-react';

interface Doc { id: number; fileName: string; createdAt: string; }
interface Message { id: number; role: 'user' | 'assistant'; content: string; createdAt: string; }

export function AIStudy() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load documents on mount
  useEffect(() => {
    api<{ items: Doc[] }>('/ai/documents').then(res => {
      setDocuments(res.items);
      if (res.items.length > 0) setActiveDoc(res.items[0]);
    }).catch(console.error);
  }, []);

  // Load messages when active doc changes
  useEffect(() => {
    if (!activeDoc) return;
    api<{ items: Message[] }>(`/ai/documents/${activeDoc.id}/messages`).then(res => setMessages(res.items));
  }, [activeDoc]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatting]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await api<{ document: Doc }>('/ai/documents', { method: 'POST', body: fd });
      setDocuments(prev => [res.document, ...prev]);
      setActiveDoc(res.document);
    } catch (err) { alert('Upload failed'); } 
    finally { setIsUploading(false); }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeDoc) return;

    const userMsg = input;
    setInput('');
    setIsChatting(true);

    // Optimistic UI update
    const tempMsg: Message = { id: Date.now(), role: 'user', content: userMsg, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await api<{ message: Message }>(`/ai/documents/${activeDoc.id}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: userMsg })
      });
      setMessages(prev => [...prev, res.message]);
    } catch (err) {
      alert('AI failed to respond');
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in duration-500">
      
      {/* Left Sidebar: Documents */}
      <div className="w-72 flex flex-col gap-4">
        <div className="card p-4 flex-1 flex flex-col">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText className="h-4 w-4"/> My Documents</h2>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {documents.map(d => (
              <button key={d.id} onClick={() => setActiveDoc(d)} className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all ${activeDoc?.id === d.id ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'hover:bg-slate-50 text-slate-600'}`}>
                <p className="truncate">{d.fileName}</p>
              </button>
            ))}
            {documents.length === 0 && <p className="text-sm text-slate-400 text-center mt-10">No documents yet.</p>}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 cursor-pointer transition-colors">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {isUploading ? 'Uploading...' : 'Upload PDF'}
              <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
      </div>

      {/* Right Side: Chat Interface */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {!activeDoc ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Sparkles className="h-16 w-16 mb-4 text-brand-200" />
            <p className="text-lg font-medium">Upload a document to start studying.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex items-center gap-3">
              <div className="p-2 bg-brand-100 text-brand-600 rounded-lg"><Sparkles className="h-5 w-5" /></div>
              <div>
                <h2 className="font-bold text-slate-900">AI Study Assistant</h2>
                <p className="text-xs text-slate-500">Context: {activeDoc.fileName}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 mt-10">
                  <p>Ask me anything about this document.</p>
                  <div className="flex justify-center gap-2 mt-4 flex-wrap">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">Summarize this</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">Key concepts?</span>
                  </div>
                </div>
              )}
              
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${m.role === 'user' ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              
              {isChatting && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder="Ask a question about this document..." 
                  className="input-field flex-1"
                  disabled={isChatting}
                />
                <button type="submit" disabled={isChatting || !input.trim()} className="btn-primary p-3 aspect-square flex items-center justify-center">
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
