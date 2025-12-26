import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Copy, Github, Key } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileText className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI Resume Extractor</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/AksShri2004" target="_blank" className="text-slate-500 hover:text-indigo-600 transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Extract Data with Precision</h2>
          <p className="text-lg text-slate-600">Upload your PDF resume and get structured JSON in seconds powered by Gemini.</p>
        </div>

        <div className="grid gap-8">
          {/* Config Card */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Key className="text-indigo-600 w-5 h-5" />
              <h3 className="text-lg font-semibold">Configuration</h3>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Microservice API Key (X-API-Key)</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="Enter your secret key"
              />
              <p className="text-xs text-slate-500 italic">Your key is never stored. It is used only for the current session requests.</p>
            </div>
          </section>

          {/* Upload Area */}
          <section className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div 
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept=".pdf" 
                onChange={handleFileChange} 
              />
              <div className={`p-4 rounded-full mb-4 ${file ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Upload className="w-8 h-8" />
              </div>
              {file ? (
                <div className="text-center">
                  <p className="font-semibold text-indigo-700">{file.name}</p>
                  <p className="text-sm text-indigo-500">{(file.size / 1024).toFixed(1)} KB • PDF Document</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-semibold text-slate-700 text-lg">Click or drag to upload</p>
                  <p className="text-sm text-slate-500">Only PDF files are supported</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={startExtraction}
              disabled={!file || !apiKey || loading}
              className={`w-full py-4 font-bold text-white transition-all flex items-center justify-center gap-2 ${(!file || !apiKey || loading) ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Extract Information"
              )}
            </button>
          </section>

          {/* Status & Error */}
          {(status || error) && (
            <section className={`p-6 rounded-2xl border ${error ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Pipeline Status</h3>
                  {status?.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {status?.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                  status?.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  status?.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {status?.status || 'Initiating'}
                </span>
              </div>
              
              {jobId && (
                <p className="text-[10px] text-slate-400 mb-2 font-mono">Job ID: {jobId}</p>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {status?.status === 'completed' && status.result && (
                <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-500 uppercase">Extracted Data</h4>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(status.result, null, 2));
                        alert("Copied to clipboard!");
                      }}
                      className="text-xs flex items-center gap-1 text-indigo-600 hover:underline"
                    >
                      <Copy className="w-3 h-3" /> Copy JSON
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-5 rounded-xl overflow-x-auto text-sm leading-relaxed shadow-inner">
                    {JSON.stringify(status.result, null, 2)}
                  </pre>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 pb-12 text-center">
        <div className="h-px bg-slate-200 w-full mb-8"></div>
        <p className="text-slate-500 text-sm">
          Built with ❤️ by <a href="https://github.com/AksShri2004" target="_blank" className="font-bold text-slate-900 hover:text-indigo-600">Akshat Shrivastava</a>
        </p>
      </footer>
    </div>
  );
}

export default App;