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
    <div className="w-full flex flex-col items-center min-h-screen bg-[#F8F9FB] text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-slate-200 flex justify-center sticky top-0 z-50">
        <div className="w-full max-w-4xl px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <FileText className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold">ResumeAI</span>
          </div>
          <a href="https://github.com/AksShri2004" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </nav>

      {/* Main Container - Forced Centering */}
      <div className="w-full max-w-2xl px-6 py-16 flex flex-col items-center text-center">
        
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold mb-4 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Gemini AI Powered
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Resume Extractor
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Upload your resume and get a structured <br/> JSON representation instantly.
          </p>
        </div>

        {/* Action Stack */}
        <div className="w-full space-y-8 flex flex-col items-center">
          
          {/* API Key Card */}
          <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-left">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Authentication</h3>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">X-API-Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none font-mono text-sm"
                placeholder="Enter your secret key"
              />
            </div>
          </div>

          {/* Upload Card */}
          <div className="w-full bg-white p-2 rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div 
              className={`group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400'}`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              <div className={`p-5 rounded-2xl mb-4 ${file ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                <Upload className="w-8 h-8" />
              </div>
              {file ? (
                <div className="text-center">
                  <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                  <p className="text-[10px] text-indigo-500 mt-1 uppercase font-bold tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <p className="font-bold text-slate-700">Choose PDF</p>
                  <p className="text-xs">Drag & Drop Resume</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={startExtraction}
              disabled={!file || !apiKey || loading}
              className={`w-full mt-2 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${(!file || !apiKey || loading) ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutPanelLeft className="w-5 h-5" />}
              {loading ? "Extracting..." : "Start Extraction"}
            </button>
          </div>

          {/* Result Card */}
          {(status || error || loading) && (
            <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-left">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Output</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                  status?.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  status?.status === 'failed' ? 'bg-red-50 text-red-600' :
                  'bg-indigo-50 text-indigo-700'
                }`}>
                  {status?.status || 'Active'}
                </span>
              </div>

              <div className="p-8">
                {error && <p className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
                {loading && !status && <div className="flex flex-col items-center py-10 text-indigo-600"><Loader2 className="animate-spin w-8 h-8 mb-2"/><p className="text-sm font-bold">Parsing...</p></div>}
                {status?.status === 'completed' && status.result && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><p className="text-[10px] text-slate-400 font-mono">ID: {jobId}</p><button onClick={() => {navigator.clipboard.writeText(JSON.stringify(status.result, null, 2)); alert("Copied!");}} className="text-[10px] font-bold text-indigo-600">COPY JSON</button></div>
                    <pre className="bg-[#1E1E1E] text-indigo-300 p-6 rounded-2xl text-[12px] font-mono leading-relaxed overflow-auto max-h-[400px] custom-scrollbar">
                      {JSON.stringify(status.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-2xl px-6 pb-20 text-center mt-auto">
        <div className="h-px bg-slate-200 w-full mb-8"></div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          Built by <a href="https://github.com/AksShri2004" target="_blank" rel="noreferrer" className="text-slate-900 underline underline-offset-4">Akshat Shrivastava</a>
        </p>
      </footer>
    </div>
  );
}

export default App;