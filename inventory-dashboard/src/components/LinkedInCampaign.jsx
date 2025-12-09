import React, { useState, useEffect } from 'react';
import { Linkedin, Send, CheckCircle2 } from 'lucide-react';

const STEP_CONTENT = 0;
const STEP_SUCCESS = 1;

export default function LinkedInCampaign({ onComplete, initialText = '' }) {
  const [currentStep, setCurrentStep] = useState(STEP_CONTENT);
  const [postContent, setPostContent] = useState({
    text: initialText || 'Excited to launch our new inventory optimization engine! #Boltic #Inventory #AI'
  });

  // Update text if initialText changes (e.g. from parent generation)
  useEffect(() => {
    if (initialText) {
        setPostContent(prev => ({ ...prev, text: initialText }));
    }
  }, [initialText]);

  const handleContentChange = (e) => {
    setPostContent({ ...postContent, [e.target.name]: e.target.value });
  };

  const handlePostToLinkedIn = () => {
    // Open LinkedIn Feed with pre-filled text
    const text = encodeURIComponent(postContent.text);
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${text}`;
    
    // Open in new tab
    window.open(linkedinUrl, '_blank');
    
    // Move to success step
    setCurrentStep(STEP_SUCCESS);
    if (onComplete) {
        // Optional: wait a bit before calling onComplete if the parent expects it
        setTimeout(onComplete, 3000);
    }
  };

  const renderContentStep = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-lg bg-white p-4 border border-indigo-100 shadow-sm dark:bg-slate-900 dark:border-slate-700">
         <div className="flex items-center gap-2 text-indigo-900 mb-2 dark:text-indigo-200">
          <Send className="w-4 h-4" />
          <h4 className="font-semibold text-sm">Compose Your Post</h4>
        </div>
        <textarea
          name="text"
          rows={5}
          value={postContent.text}
          onChange={handleContentChange}
          className="w-full rounded-lg border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-3 border resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
          placeholder="What do you want to talk about?"
        />
        <div className="flex justify-end mt-1">
            <span className="text-[10px] text-gray-400">{postContent.text.length} chars</span>
        </div>
      </div>
       
       <button 
            onClick={handlePostToLinkedIn}
            className="w-full flex justify-center items-center gap-2 rounded-lg bg-[#0077b5] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#006097] transition-all transform active:scale-95"
        >
            <Linkedin className="w-4 h-4" /> Share to LinkedIn
       </button>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in zoom-in duration-500">
         <div className="bg-green-100 p-3 rounded-full text-green-600 mb-2 shadow-sm ring-4 ring-green-50 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-900/10">
            <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="text-center space-y-1">
            <h4 className="text-green-800 font-bold text-lg dark:text-green-400">Redirecting...</h4>
            <p className="text-xs text-gray-600 max-w-xs mx-auto dark:text-gray-400">
                Opening LinkedIn...
            </p>
        </div>
         <button 
            onClick={() => setCurrentStep(STEP_CONTENT)}
            className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
        >
            Create Another Post
        </button>
    </div>
  );

  return (
    <div className="w-full">
      <div className="min-h-[200px] flex flex-col justify-center">
        {currentStep === STEP_CONTENT && renderContentStep()}
        {currentStep === STEP_SUCCESS && renderSuccessStep()}
      </div>
    </div>
  );
}
