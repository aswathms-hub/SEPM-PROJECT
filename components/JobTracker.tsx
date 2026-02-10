import React, { useState } from 'react';
import { JobApplication, JobStatus, ResumeData, AnalysisResult } from '../types';
import { Plus, MoreHorizontal, ExternalLink, Trash2, BrainCircuit } from 'lucide-react';
import * as gemini from '../services/geminiService';

interface JobTrackerProps {
  jobs: JobApplication[];
  setJobs: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  resume: ResumeData;
}

export const JobTracker: React.FC<JobTrackerProps> = ({ jobs, setJobs, resume }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newJob, setNewJob] = useState<Partial<JobApplication>>({ status: JobStatus.WISHLIST });
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const columns = Object.values(JobStatus);

  const addJob = () => {
    if (!newJob.company || !newJob.position) return;
    const job: JobApplication = {
      id: Date.now().toString(),
      company: newJob.company,
      position: newJob.position,
      status: newJob.status || JobStatus.WISHLIST,
      dateApplied: new Date().toLocaleDateString(),
      jobDescription: newJob.jobDescription || '',
    };
    setJobs(prev => [...prev, job]);
    setNewJob({ status: JobStatus.WISHLIST, company: '', position: '' });
    setIsAdding(false);
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (selectedJob?.id === id) setSelectedJob(null);
  };

  const updateStatus = (id: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const analyzeJob = async (job: JobApplication) => {
    if (!job.jobDescription) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await gemini.analyzeJobMatch(resume, job.jobDescription);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Job Tracker</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Add Job
        </button>
      </div>

      {/* Add Job Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Add New Application</h3>
            <div className="space-y-4">
              <input 
                placeholder="Company Name" 
                className="w-full border p-2 rounded"
                value={newJob.company || ''}
                onChange={e => setNewJob({...newJob, company: e.target.value})}
              />
              <input 
                placeholder="Position Title" 
                className="w-full border p-2 rounded"
                value={newJob.position || ''}
                onChange={e => setNewJob({...newJob, position: e.target.value})}
              />
              <textarea 
                placeholder="Job Description (Paste here for AI Analysis)" 
                className="w-full border p-2 rounded h-32"
                value={newJob.jobDescription || ''}
                onChange={e => setNewJob({...newJob, jobDescription: e.target.value})}
              />
              <select 
                className="w-full border p-2 rounded"
                value={newJob.status}
                onChange={e => setNewJob({...newJob, status: e.target.value as JobStatus})}
              >
                {columns.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button onClick={addJob} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Job</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1000px] h-full">
          {columns.map(status => (
            <div key={status} className="flex-1 min-w-[200px] bg-slate-100 rounded-xl p-3 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-semibold text-slate-700">{status}</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                  {jobs.filter(j => j.status === status).length}
                </span>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {jobs.filter(j => j.status === status).map(job => (
                  <div 
                    key={job.id} 
                    onClick={() => { setSelectedJob(job); setAnalysis(null); }}
                    className={`bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all ${selectedJob?.id === job.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="font-semibold text-slate-800">{job.position}</div>
                    <div className="text-sm text-slate-500">{job.company}</div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                      <span className="text-xs text-slate-400">{job.dateApplied}</span>
                      <select 
                        className="text-xs border rounded p-1 bg-slate-50"
                        value={job.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => updateStatus(job.id, e.target.value as JobStatus)}
                      >
                        {columns.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details / Analysis Panel */}
      {selectedJob && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-40 transform transition-transform border-l border-slate-200 p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{selectedJob.position}</h2>
              <div className="text-lg text-slate-600">{selectedJob.company}</div>
            </div>
            <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600">
              <ExternalLink size={24} />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-slate-700 mb-2">Job Description</h3>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-100">
              {selectedJob.jobDescription || "No description provided."}
            </div>
          </div>

          <div className="mb-8">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <BrainCircuit size={20} className="text-purple-600"/> 
                 AI Resume Match
                </h3>
               <button 
                onClick={() => analyzeJob(selectedJob)}
                disabled={isAnalyzing || !selectedJob.jobDescription}
                className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
               >
                 {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
               </button>
             </div>

             {analysis ? (
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-4">
                    <div className={`text-3xl font-bold ${analysis.score >= 70 ? 'text-green-600' : analysis.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {analysis.score}%
                    </div>
                    <div className="text-sm text-slate-600 leading-tight">Match Score based on skills and experience</div>
                 </div>
                 
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700">
                   {analysis.summary}
                 </div>

                 <div>
                   <h4 className="font-semibold text-red-600 text-sm mb-2">Missing Keywords</h4>
                   <div className="flex flex-wrap gap-2">
                     {analysis.missingKeywords.map(kw => (
                       <span key={kw} className="bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded text-xs font-medium">{kw}</span>
                     ))}
                   </div>
                 </div>

                 <div>
                   <h4 className="font-semibold text-blue-600 text-sm mb-2">Suggestions</h4>
                   <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                     {analysis.suggestions.map((s, i) => (
                       <li key={i}>{s}</li>
                     ))}
                   </ul>
                 </div>
               </div>
             ) : (
               <div className="text-center py-8 text-slate-400 text-sm">
                 Click analyze to see how your resume fits this job.
               </div>
             )}
          </div>

          <button 
            onClick={() => deleteJob(selectedJob.id)}
            className="w-full py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Delete Application
          </button>
        </div>
      )}
    </div>
  );
};
