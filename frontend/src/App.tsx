import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Copy, Github, Key, LayoutPanelLeft, Sparkles } from 'lucide-react';

interface ResumeResult {
  skills: string[];
  experience: any[];
  education: any[];
  projects: any[];
  summary: string | null;
}

interface JobStatus {
  status: 'pending' | 'completed' | 'failed';
  result?: ResumeResult;
  error?: string;
}

const API_BASE_URL = "https://resume-extractor-5uc5.onrender.com/v1";

function App() {
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload a PDF file.");
      }
    }
  };

  const startExtraction = async () => {
    if (!file || !apiKey) {
      setError("Please provide an API Key and select a PDF.");
      return;
    }

    setLoading(true);
    setError(null);
    setJobId(null);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/parse`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Upload failed");
      }

      const { job_id } = await response.json();
      setJobId(job_id);
      pollStatus(job_id);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const pollStatus = (id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
          headers: { 'X-API-Key': apiKey },
        });
        
        if (!response.ok) throw new Error("Failed to fetch job status");
        
        const data: JobStatus = await response.json();
        setStatus(data);

        if (data.status === 'completed' || data.status === 'failed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setLoading(false);
        }
      } catch (err: any) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setError(err.message);
        setLoading(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans selection:bg-indigo-100 flex flex-col items-center">
      {/* Centered Navbar */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <FileText className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">ResumeAI</span>
          </div>
          <a href="https://github.com/AksShri2004" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </nav>

      {/* Main Content - Centered Wrapper */}
      <main className="w-full max-w-2xl px-6 py-16 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
            <Sparkles className="w-3 h-3" /> Powered by Gemini 1.5 Flash
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Resume Extractor
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Upload your resume and get a perfectly structured <br className="hidden sm:block" /> JSON representation in seconds.
          </p>
        </div>

        {/* Action Cards - Single Column Centered */}
        <div className="w-full space-y-8">
          
          {/* 1. API Key Section */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Configuration</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">X-API-Key</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none font-mono text-sm"
                  placeholder="Paste your secret key..."
                />
              </div>
            </div>
          </div>

          {/* 2. Upload Section */}
          <div className="bg-white p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div 
              className={`group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              <div className={`p-5 rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110 ${file ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                <Upload className="w-8 h-8" />
              </div>
              {file ? (
                <div className="text-center">
                  <p className="font-bold text-slate-800 break-all">{file.name}</p>
                  <p className="text-[10px] text-indigo-500 mt-1 uppercase font-bold tracking-widest">{(file.size / 1024).toFixed(1)} KB • PDF Ready</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-bold text-slate-700 text-lg">Choose File</p>
                  <p className="text-sm text-slate-400">Drag and drop your PDF resume</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={startExtraction}
              disabled={!file || !apiKey || loading}
              className={`w-full mt-2 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${(!file || !apiKey || loading) ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <LayoutPanelLeft className="w-5 h-5" />
                  Start AI Extraction
                </>
              )}
            </button>
          </div>

          {/* 3. Results Section */}
          {(status || error || loading) && (
            <div className={`bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500`}>
              <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Processing Pipeline</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                  status?.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  status?.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' :
                  'bg-indigo-50 text-indigo-600 border-indigo-100'
                }`}>
                  {status?.status || 'Active'}
                </span>
              </div>

              <div className="p-8">
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-2xl text-red-700 border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {loading && !status && (
                  <div className="flex flex-col items-center justify-center py-12 text-indigo-600">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-bold">AI is parsing your document...</p>
                  </div>
                )}

                {status?.status === 'completed' && status.result && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">JSON Output</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(status.result, null, 2));
                          alert("Copied!");
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                      >
                        <Copy className="w-3 h-3" /> COPY ALL
                      </button>
                    </div>
                    <div className="bg-[#1E1E1E] rounded-2xl p-6 overflow-hidden border border-slate-800">
                       <pre className="text-indigo-300 text-xs sm:text-[13px] font-mono leading-relaxed overflow-auto max-h-[400px] custom-scrollbar">
                        {JSON.stringify(status.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Centered Footer */}
      <footer className="w-full max-w-2xl px-6 pb-20 text-center">
        <div className="h-px bg-slate-200/50 w-full mb-8"></div>
        <p className="text-slate-400 text-xs font-medium">
          Built with precision by <a href="https://github.com/AksShri2004" target="_blank" rel="noreferrer" className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">Akshat Shrivastava</a>
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

export default App;
