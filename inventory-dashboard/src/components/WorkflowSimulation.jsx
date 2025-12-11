import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Database, BrainCircuit, Server } from 'lucide-react';

const steps = [
  { id: 1, label: "Connecting to Boltic Inventory Table", icon: Database },
  { id: 2, label: "Aggregating Historical Sales Data", icon: Server },
  { id: 3, label: "Boltic AI Analysis & Optimization", icon: BrainCircuit },
];

export default function WorkflowSimulation({ onComplete, itemId }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Trigger Workflow APIs
    const triggerWorkflow = async () => {
        try {
            await fetch('/api/boltic/trigger-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ triggerSource: 'InventoryDashboard', itemId })
            });
        } catch (e) {
            console.error("Failed to trigger workflow", e);
        }
    };
    triggerWorkflow();

    // Sequence of delays for each step to create a realistic "processing" feel
    const delays = [6500, 9000, 6500];

    let stepIndex = 0;

    const runNextStep = () => {
      if (stepIndex >= steps.length) {
        // All steps done, wait a tiny bit then finish
        setTimeout(onComplete, 800);
        return;
      }

      setCurrentStep(stepIndex);
      
      setTimeout(() => {
        stepIndex++;
        runNextStep();
      }, delays[stepIndex]);
    };

    runNextStep();

    return () => {}; // Cleanup if needed
  }, [onComplete]);

  return (
    <div className="w-full rounded-xl border border-indigo-100 bg-white p-6 shadow-lg ring-1 ring-indigo-50 dark:bg-slate-900 dark:border-slate-700 dark:ring-0">
      <div className="mb-6 flex items-center justify-between border-b border-indigo-50 pb-4 dark:border-slate-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Boltic Workflow Engine</h3>
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            Running
            <span className="ml-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
            </span>
        </span>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isPending = index > currentStep;

          return (
            <div key={step.id} className={`flex items-center gap-4 transition-all duration-500 ${isPending ? 'opacity-40 grayscale' : 'opacity-100'}`}>
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                {isCompleted ? (
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-sm ring-4 ring-green-100 transition-all duration-300 dark:ring-green-900/30">
                     <CheckCircle2 className="h-6 w-6 animate-in zoom-in spin-in-12" />
                   </div>
                ) : isActive ? (
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100 transition-all duration-300 dark:ring-indigo-900/30">
                     <Loader2 className="h-5 w-5 animate-spin" />
                   </div>
                ) : (
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 ring-4 ring-gray-50 dark:bg-slate-800 dark:ring-slate-700 dark:text-gray-500">
                     <step.icon className="h-5 w-5" />
                   </div>
                )}
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`absolute -bottom-6 left-1/2 h-6 w-0.5 -translate-x-1/2 transition-colors duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
                )}
              </div>

              <div className="flex-1">
                <p className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-indigo-700 dark:text-indigo-400 scale-105 origin-left' : isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {step.label}
                </p>
                {isActive && (
                    <p className="animate-pulse text-xs text-indigo-400">Processing...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
