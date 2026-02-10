import React from 'react';
import { LucideIcon, Briefcase, FileText, LayoutDashboard, MessageSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  id, 
  active, 
  onClick 
}: { 
  icon: LucideIcon; 
  label: string; 
  id: string; 
  active: boolean; 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col no-print z-10">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-blue-600">
            <Briefcase size={28} />
            <span className="text-xl font-bold tracking-tight">CareerFlow AI</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={LayoutDashboard} 
            label="Job Tracker" 
            id="tracker" 
            active={activeTab === 'tracker'} 
            onClick={() => setActiveTab('tracker')} 
          />
          <NavItem 
            icon={FileText} 
            label="Resume Builder" 
            id="resume" 
            active={activeTab === 'resume'} 
            onClick={() => setActiveTab('resume')} 
          />
          <NavItem 
            icon={MessageSquare} 
            label="Interview Prep" 
            id="interview" 
            active={activeTab === 'interview'} 
            onClick={() => setActiveTab('interview')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          Powered by Gemini 3
        </div>
      </aside>

      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 no-print">
         <div className="flex items-center space-x-2 text-blue-600">
            <Briefcase size={24} />
            <span className="text-lg font-bold">CareerFlow</span>
          </div>
          <div className="flex space-x-4">
             <button onClick={() => setActiveTab('tracker')} className={activeTab === 'tracker' ? 'text-blue-600' : 'text-slate-500'}><LayoutDashboard size={24}/></button>
             <button onClick={() => setActiveTab('resume')} className={activeTab === 'resume' ? 'text-blue-600' : 'text-slate-500'}><FileText size={24}/></button>
             <button onClick={() => setActiveTab('interview')} className={activeTab === 'interview' ? 'text-blue-600' : 'text-slate-500'}><MessageSquare size={24}/></button>
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:p-8 p-4 pt-20 md:pt-8 relative">
        {children}
      </main>
    </div>
  );
};
