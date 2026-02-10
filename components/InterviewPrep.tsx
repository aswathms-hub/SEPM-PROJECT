import React, { useState, useRef, useEffect } from 'react';
import { JobApplication } from '../types';
import { MessageSquare, User, Bot, Play, X, Send } from 'lucide-react';
import * as gemini from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface InterviewPrepProps {
  jobs: JobApplication[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const InterviewPrep: React.FC<InterviewPrepProps> = ({ jobs }) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeJob = jobs.find(j => j.id === selectedJobId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    if (!activeJob?.jobDescription) return;
    setIsLoading(true);
    setMessages([]);
    setSessionActive(true);

    try {
      chatSessionRef.current = gemini.createInterviewChat(activeJob.jobDescription);
      
      // Initial trigger to get the first question (empty message to start usually works if prompt is set up right, 
      // but strictly speaking we usually need to send a message or prompt to start. 
      // The system instruction sets the persona. We can send a "Ready" message invisible to user or just ask it to start.)
      const response = await chatSessionRef.current.sendMessage({ message: "I am ready to start the interview. Please ask the first question." });
      setMessages([{ role: 'model', text: response.text || "Hello! I'm ready to interview you. Tell me about yourself." }]);
    } catch (error) {
      console.error(error);
      setMessages([{ role: 'model', text: "Error starting session. Please check your API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;
    
    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I didn't catch that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error communicating with AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endSession = () => {
    setSessionActive(false);
    setMessages([]);
    chatSessionRef.current = null;
    setSelectedJobId('');
  };

  if (sessionActive && activeJob) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Interviewing for {activeJob.position}</h3>
            <p className="text-xs text-slate-300">at {activeJob.company}</p>
          </div>
          <button onClick={endSession} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                 <Bot size={16} />
               </div>
               <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2 relative">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your answer here..."
              className="w-full bg-slate-100 text-slate-900 placeholder-slate-500 rounded-full pl-5 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
      <div className="bg-purple-100 p-6 rounded-full text-purple-600 mb-6">
        <MessageSquare size={48} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">AI Mock Interviewer</h2>
      <p className="text-slate-600 mb-8 text-lg">
        Select a job application from your tracker to start a simulated interview session. 
        The AI will act as a hiring manager, ask relevant questions based on the job description, and provide feedback.
      </p>

      {jobs.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200">
          You haven't added any jobs yet. Go to the Job Tracker tab to add a job description first.
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
           <label className="block text-left font-medium text-slate-700 pl-1">Choose a Job Application</label>
           <select 
             className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white"
             value={selectedJobId}
             onChange={(e) => setSelectedJobId(e.target.value)}
           >
             <option value="">-- Select a job --</option>
             {jobs.filter(j => j.jobDescription).map(job => (
               <option key={job.id} value={job.id}>{job.position} at {job.company}</option>
             ))}
           </select>
           
           <button 
             onClick={startSession}
             disabled={!selectedJobId || isLoading}
             className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.98] duration-200"
           >
             {isLoading ? 'Starting...' : <><Play size={20} /> Start Interview Session</>}
           </button>
           
           {selectedJobId && !activeJob?.jobDescription && (
              <p className="text-red-500 text-sm mt-2">This job is missing a description. Add one in the Tracker to enable interviews.</p>
           )}
        </div>
      )}
    </div>
  );
};
