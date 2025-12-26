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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                ResumeAI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/AksShri2004" target="_blank" rel="noreferrer" 
                 className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Hero Area */}
        <div className="text-center mb-12 px-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Intelligent Resume Parsing
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Convert unstructured resumes into high-fidelity JSON data using Gemini 1.5 Flash.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* API Key Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800">API Authentication</h3>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">X-API-Key</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-mono text-sm"
                  placeholder="Paste your secret key..."
                />
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  Key is transmitted over HTTPS and never stored.
                </p>
              </div>
            </div>

            {/* Upload Card */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
              <div 
                className={`group border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${file ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                  <Upload className="w-8 h-8" />
                </div>
                {file ? (
                  <div className="text-center">
                    <p className="font-bold text-indigo-700 break-all">{file.name}</p>
                    <p className="text-xs text-indigo-500 mt-1 uppercase font-semibold">{(file.size / 1024).toFixed(1)} KB • PDF</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-bold text-slate-700 text-lg">Upload Resume</p>
                    <p className="text-sm text-slate-500">Drop your PDF file here</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={startExtraction}
                disabled={!file || !apiKey || loading}
                className={`w-full mt-2 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${(!file || !apiKey || loading) ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 active:scale-[0.98]'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Pipeline...
                  </>
                ) : (
                  <>
                    <LayoutPanelLeft className="w-5 h-5" />
                    Extract Data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Status & Results */}
          <div className="lg:col-span-7">
            {(!status && !error && !loading) ? (
              <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <Code2 className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">Ready for Extraction</p>
                <p className="text-sm max-w-xs mx-auto">Upload a resume and click extract to see the semantic breakdown here.</p>
              </div>
            ) : (
              <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all h-full flex flex-col ${error ? 'border-red-100 ring-4 ring-red-50' : ''}`}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800">Extraction Results</h3>
                    {status?.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                    status?.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    status?.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>
                    {status?.status || 'Active'}
                  </span>
                </div>

                <div className="p-6 flex-grow">
                  {error && (
                    <div className="flex items-start gap-3 bg-red-50 p-4 rounded-2xl text-red-700 border border-red-100">
                      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Operation Failed</p>
                        <p className="text-xs mt-1 leading-relaxed">{error}</p>
                      </div>
                    </div>
                  )}

                  {loading && !status && (
                    <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <p className="font-bold">Analyzing Semantics...</p>
                      <p className="text-xs text-slate-400 mt-2">This may take up to 30 seconds</p>
                    </div>
                  )}

                  {status?.status === 'completed' && status.result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-mono text-slate-400">ID: {jobId}</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(status.result, null, 2));
                            alert("Copied to clipboard!");
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold text-slate-600 transition-all flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy JSON
                        </button>
                      </div>
                      <div className="relative flex-grow">
                        <pre className="absolute inset-0 bg-slate-900 text-indigo-300 p-6 rounded-2xl overflow-auto text-xs sm:text-sm font-mono leading-relaxed shadow-inner border border-slate-800 custom-scrollbar">
                          {JSON.stringify(status.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full mb-8"></div>
        <p className="text-slate-400 text-xs sm:text-sm">
          Engineering Project by <a href="https://github.com/AksShri2004" target="_blank" rel="noreferrer" className="font-bold text-slate-600 hover:text-indigo-600 transition-colors">Akshat Shrivastava</a>
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}

export default App;
