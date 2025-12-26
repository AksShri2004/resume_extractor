import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Copy, Github, Key, LayoutPanelLeft, Code2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 pb-20">
      {/* Navbar - Centered Container */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Resume<span className="text-indigo-600">AI</span>
              </span>
            </div>
            <a href="https://github.com/AksShri2004" target="_blank" rel="noreferrer" 
               className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-16">
        {/* Centered Hero Area */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-[800] text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Parsing Resumes <br className="hidden sm:block"/> with <span className="text-indigo-600">Intelligence.</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Turn unstructured documents into perfect JSON schemas using Gemini 1.5 Flash. Fast, accurate, and ready for production.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Column: Input Forms */}
          <div className="w-full lg:w-[420px] space-y-6 shrink-0">
            
            {/* API Key Card */}
            <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight">Authentication</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">X-API-Key</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none font-mono text-sm"
                    placeholder="Enter your secret key"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 leading-relaxed italic text-center">
                    Your key is used for this session only and is never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Card */}
            <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200/60">
              <div 
                className={`group border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 group-hover:scale-110 ${file ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                  <Upload className="w-7 h-7" />
                </div>
                {file ? (
                  <div className="text-center">
                    <p className="font-bold text-indigo-700 text-sm break-all px-2">{file.name}</p>
                    <p className="text-[10px] text-indigo-400 mt-1 uppercase font-bold tracking-widest">{(file.size / 1024).toFixed(1)} KB • PDF</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-bold text-slate-700">Upload PDF</p>
                    <p className="text-xs text-slate-400 mt-1">Drag and drop resume here</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={startExtraction}
                disabled={!file || !apiKey || loading}
                className={`w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg ${(!file || !apiKey || loading) ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.97]'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <LayoutPanelLeft className="w-5 h-5" />
                    Run Pipeline
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Output Display */}
          <div className="flex-grow w-full">
            {(!status && !error && !loading) ? (
              <div className="h-full min-h-[450px] bg-white border border-slate-200/60 rounded-[32px] flex flex-col items-center justify-center p-12 text-center shadow-sm">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <Code2 className="w-10 h-10 text-slate-200" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Awaiting Data</h4>
                <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                  Your structured results will appear here in real-time once you start the extraction process.
                </p>
              </div>
            ) : (
              <div className={`bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden transition-all flex flex-col h-[550px] ${error ? 'border-red-200 ring-8 ring-red-50/50' : ''}`}>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <h3 className="font-bold text-slate-800 tracking-tight">Structured Output</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {status?.status === 'completed' && (
                       <button 
                       onClick={() => {
                         navigator.clipboard.writeText(JSON.stringify(status.result, null, 2));
                         alert("Copied to clipboard!");
                       }}
                       className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-all"
                       title="Copy JSON"
                     >
                       <Copy className="w-4 h-4" />
                     </button>
                    )}
                    <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] px-4 py-2 rounded-xl border-2 ${
                      status?.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      status?.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {status?.status || 'Queued'}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-grow overflow-hidden relative bg-[#0f172a]">
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center p-8 bg-white z-20">
                      <div className="text-center max-w-sm">
                        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                          <AlertCircle className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-slate-900 mb-2 text-lg">Extraction Failed</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{error}</p>
                        <button onClick={() => {setError(null); setLoading(false);}} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold">Try Again</button>
                      </div>
                    </div>
                  )}

                  {loading && !status && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <Loader2 className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="font-extrabold text-slate-800 mt-6 text-lg tracking-tight">AI is Processing</p>
                      <p className="text-xs text-slate-400 mt-2 font-medium">Extracting semantic entities from your PDF...</p>
                    </div>
                  )}

                  {status?.status === 'completed' && status.result && (
                    <div className="animate-in fade-in duration-1000 h-full">
                       <pre className="h-full text-indigo-300 text-xs sm:text-[13px] font-mono leading-relaxed overflow-auto custom-scrollbar p-2">
                        {JSON.stringify(status.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                
                {jobId && (
                  <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Job Reference</span>
                    <span className="text-[10px] font-mono text-slate-500">{jobId}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Centered Footer */}
      <footer className="max-w-6xl mx-auto px-6 mt-32 text-center">
        <div className="h-px bg-slate-200/60 w-full mb-10"></div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs font-medium">
            &copy; 2025 AI Resume Extractor Microservice
          </p>
          <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
            Architected by <a href="https://github.com/AksShri2004" target="_blank" rel="noreferrer" className="font-bold text-slate-900 hover:text-indigo-600 transition-all underline decoration-slate-200 underline-offset-4">Akshat Shrivastava</a>
          </p>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default App;