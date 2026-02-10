import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume }) => {
  return (
    <div id="resume-preview" className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] mx-auto p-[15mm] text-slate-800 print-only">
      {/* Header */}
      <header className="border-b-2 border-slate-800 pb-6 mb-6">
        <h1 className="text-4xl font-bold uppercase tracking-wide text-slate-900 mb-2">
          {resume.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-3">
          {resume.email && (
            <div className="flex items-center gap-1">
              <Mail size={14} /> <span>{resume.email}</span>
            </div>
          )}
          {resume.phone && (
            <div className="flex items-center gap-1">
              <Phone size={14} /> <span>{resume.phone}</span>
            </div>
          )}
          {resume.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} /> <span>{resume.location}</span>
            </div>
          )}
          {resume.website && (
            <div className="flex items-center gap-1">
              <Globe size={14} /> <span>{resume.website}</span>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed text-slate-700">
            {resume.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">
            Work Experience
          </h2>
          <div className="space-y-5">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-900">{exp.role}</h3>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-2">{exp.company}</div>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-900">{edu.school}</h3>
                  <span className="text-xs font-medium text-slate-500">
                    {edu.graduationDate}
                  </span>
                </div>
                <div className="text-sm text-slate-700">{edu.degree}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
