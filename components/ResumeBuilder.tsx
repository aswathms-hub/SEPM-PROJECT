import React, { useState } from 'react';
import { ResumeData, Experience, Education } from '../types';
import { ResumePreview } from './ResumePreview';
import { Plus, Trash2, Wand2, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import * as gemini from '../services/geminiService';

interface ResumeBuilderProps {
  resume: ResumeData;
  setResume: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ resume, setResume }) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [enhancingExpId, setEnhancingExpId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('personal');

  const handleInputChange = (field: keyof ResumeData, value: any) => {
    setResume(prev => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setResume(prev => ({ ...prev, experience: [newExp, ...prev.experience] }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeExperience = (id: string) => {
    setResume(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      graduationDate: ''
    };
    setResume(prev => ({ ...prev, education: [newEdu, ...prev.education] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEducation = (id: string) => {
    setResume(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const handleSkillsChange = (value: string) => {
    // Split by comma and trim
    const skills = value.split(',').map(s => s.trim()).filter(s => s);
    setResume(prev => ({ ...prev, skills }));
  };

  // AI Handlers
  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    const summary = await gemini.generateResumeSummary(resume);
    setResume(prev => ({ ...prev, summary }));
    setIsGeneratingSummary(false);
  };

  const enhanceExperience = async (id: string, text: string) => {
    setEnhancingExpId(id);
    const enhanced = await gemini.enhanceDescription(text);
    updateExperience(id, 'description', enhanced);
    setEnhancingExpId(null);
  };

  const SectionToggle = ({ id, title }: { id: string, title: string }) => (
    <button 
      onClick={() => setActiveSection(activeSection === id ? '' : id)}
      className="flex items-center justify-between w-full p-4 bg-slate-50 border border-slate-200 rounded-lg mb-2 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
    >
      <span>{title}</span>
      {activeSection === id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6">
      {/* Editor Column */}
      <div className="w-full xl:w-1/2 flex flex-col h-full overflow-y-auto pr-2 no-print">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Resume Editor</h2>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <Printer size={18} />
            <span>Print / PDF</span>
          </button>
        </div>

        {/* Personal Details */}
        <div className="mb-4">
          <SectionToggle id="personal" title="Personal Details" />
          {activeSection === 'personal' && (
            <div className="p-4 border border-slate-200 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={resume.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={resume.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={resume.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={resume.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="New York, NY"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website / LinkedIn</label>
                  <input 
                    type="text" 
                    value={resume.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mb-4">
          <SectionToggle id="summary" title="Professional Summary" />
          {activeSection === 'summary' && (
            <div className="p-4 border border-slate-200 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Summary</label>
                <button 
                  onClick={generateSummary}
                  disabled={isGeneratingSummary}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <Wand2 size={14} />
                  {isGeneratingSummary ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <textarea 
                value={resume.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Brief professional summary..."
              />
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="mb-4">
          <SectionToggle id="experience" title="Work Experience" />
          {activeSection === 'experience' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
               {resume.experience.map((exp) => (
                <div key={exp.id} className="p-4 border border-slate-200 rounded-lg bg-white relative">
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <input 
                        type="text" 
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                        className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none font-medium"
                        placeholder="Job Title"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none"
                        placeholder="Company"
                      />
                    </div>
                    <div className="flex gap-2">
                       <input 
                        type="text" 
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none text-sm"
                        placeholder="Start Date"
                      />
                       <input 
                        type="text" 
                        value={exp.endDate}
                        disabled={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none text-sm disabled:opacity-50"
                        placeholder="End Date"
                      />
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        id={`current-${exp.id}`}
                        className="mr-2"
                      />
                      <label htmlFor={`current-${exp.id}`} className="text-sm text-slate-600">I currently work here</label>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                    <button 
                      onClick={() => enhanceExperience(exp.id, exp.description)}
                      disabled={enhancingExpId === exp.id || !exp.description}
                      className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                    >
                      <Wand2 size={12} />
                      {enhancingExpId === exp.id ? 'Enhancing...' : 'Enhance'}
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={addExperience}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Position
              </button>
            </div>
          )}
        </div>

        {/* Education */}
        <div className="mb-4">
          <SectionToggle id="education" title="Education" />
          {activeSection === 'education' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
               {resume.education.map((edu) => (
                <div key={edu.id} className="p-4 border border-slate-200 rounded-lg bg-white relative">
                   <button 
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 gap-4">
                    <input 
                      type="text" 
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none font-medium"
                      placeholder="School / University"
                    />
                     <input 
                      type="text" 
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none"
                      placeholder="Degree"
                    />
                     <input 
                      type="text" 
                      value={edu.graduationDate}
                      onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                      className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none text-sm"
                      placeholder="Graduation Year"
                    />
                  </div>
                </div>
              ))}
               <button 
                onClick={addEducation}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Education
              </button>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="mb-10">
          <SectionToggle id="skills" title="Skills" />
          {activeSection === 'skills' && (
            <div className="p-4 border border-slate-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
               <label className="block text-sm font-medium text-slate-700 mb-2">Skills (comma separated)</label>
               <textarea 
                  value={resume.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="React, TypeScript, Tailwind CSS, Project Management..."
                />
            </div>
          )}
        </div>

      </div>

      {/* Preview Column */}
      <div className="hidden xl:block w-1/2 bg-slate-200 h-full rounded-xl overflow-y-auto p-8 border border-slate-300">
        <ResumePreview resume={resume} />
      </div>
    </div>
  );
};
