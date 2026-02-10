import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ResumeBuilder } from './components/ResumeBuilder';
import { JobTracker } from './components/JobTracker';
import { InterviewPrep } from './components/InterviewPrep';
import { ResumeData, JobApplication } from './types';

// Mock Initial Data
const initialResume: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  summary: '',
  experience: [],
  education: [],
  skills: []
};

function App() {
  const [activeTab, setActiveTab] = useState('resume');
  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [jobs, setJobs] = useState<JobApplication[]>([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return <ResumeBuilder resume={resume} setResume={setResume} />;
      case 'tracker':
        return <JobTracker jobs={jobs} setJobs={setJobs} resume={resume} />;
      case 'interview':
        return <InterviewPrep jobs={jobs} />;
      default:
        return <ResumeBuilder resume={resume} setResume={setResume} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
