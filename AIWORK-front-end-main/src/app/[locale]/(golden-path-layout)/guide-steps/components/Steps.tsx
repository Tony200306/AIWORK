"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskComplete } from "./TaskComplete";

interface StepData {
  id: number;
  title: string;
  description: string;
  whatToDo: string[];
  successLooksLike: string[];
  commonIssues: string[];
  fastChecks: { label: string; checked: boolean }[];
}

const stepsData: StepData[] = [
  {
    id: 1,
    title: "Confirm access + admin rights",
    description:
      "If the UI looks different, screenshot/doc it and I'll adapt the path.",
    whatToDo: [
      "Confirm you have admin rights in Meta Business Suite.",
      "Ask client for access if missing.",
    ],
    successLooksLike: ["You can see Events Manager and Domains."],
    commonIssues: ["Wrong account", "Pending access"],
    fastChecks: [
      { label: "Access granted", checked: false },
      { label: "Business ID verified", checked: false },
    ],
  },
  {
    id: 2,
    title: "Create pixel + verify domain",
    description: "Set up the Meta Pixel and verify domain ownership.",
    whatToDo: [
      "Create a new pixel in Events Manager.",
      "Add your domain to Business Manager.",
      "Verify domain ownership via DNS or HTML.",
    ],
    successLooksLike: [
      "Pixel created and shows in Events Manager.",
      "Domain verified with green checkmark.",
    ],
    commonIssues: ["DNS propagation delay", "Incorrect verification code"],
    fastChecks: [
      { label: "Pixel created", checked: false },
      { label: "Domain verified", checked: false },
    ],
  },
  {
    id: 3,
    title: "Install base event + test helper",
    description: "Add the pixel code to your website and test it.",
    whatToDo: [
      "Install Meta Pixel base code in website header.",
      "Install Meta Pixel Helper Chrome extension.",
      "Test page load event fires correctly.",
    ],
    successLooksLike: [
      "Pixel Helper shows green icon.",
      "Events appear in Events Manager.",
    ],
    commonIssues: ["Code not in header", "Ad blockers interfering"],
    fastChecks: [
      { label: "Base code installed", checked: false },
      { label: "Helper extension working", checked: false },
    ],
  },
  {
    id: 4,
    title: "Validate firing on key flows",
    description: "Test pixel events on important user actions.",
    whatToDo: [
      "Test purchase/conversion events.",
      "Verify events show correct parameters.",
      "Check event matching quality score.",
    ],
    successLooksLike: [
      "All key events fire reliably.",
      "Parameters are accurate.",
    ],
    commonIssues: ["Missing parameters", "Duplicate events"],
    fastChecks: [
      { label: "Purchase event working", checked: false },
      { label: "Event quality good", checked: false },
    ],
  },
];

export const Steps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checks, setChecks] = useState<{ [key: string]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentStepData = stepsData.find((s) => s.id === currentStep);

  const toggleCheck = (stepId: number, checkLabel: string) => {
    const key = `${stepId}-${checkLabel}`;
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allSteps = stepsData?.map((step) => ({
    ...step,
    completed: completedSteps.includes(step.id),
    current: step.id === currentStep,
  }));

  const handleComplete = (data: {
    whatShipped: string;
    difficulty: "Easy" | "Normal" | "Hard";
    blockers?: string;
  }) => {
    console.log("Step completed:", { step: currentStep, ...data });
    setCompletedSteps((prev) => [...prev, currentStep]);
    
    // Move to next step if available
    if (currentStep < stepsData.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  if (!currentStepData) return null;

  return (
    <div className="space-y-4  flex flex-col flex-1 min-h-0">
      <div className="flex  items-center justify-between">
        <h3 className="text-sm text-gray-400">
          Step {currentStep} of {stepsData.length}
        </h3>
      </div>

      <div className="space-y-6 flex-1 flex flex-col min-h-0">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-sm text-gray-400">{currentStepData.description}</p>
        </div>
<div className="space-y-6  flex-1 min-h-0 overflow-auto">
        {/* WHAT TO DO */}
        <div className="bg-card rounded-lg border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
            What to do
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {currentStepData.whatToDo?.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SUCCESS LOOKS LIKE */}
        <div className="bg-card rounded-lg border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Success looks like
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {currentStepData.successLooksLike?.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* COMMON ISSUES HERE */}
        <div className="bg-card rounded-lg border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Common issues here
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {currentStepData.commonIssues?.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAST CHECKS */}
        <div className="bg-card rounded-lg border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Fast checks (30 sec)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {currentStepData.fastChecks?.map((check, idx) => {
              const key = `${currentStep}-${check.label}`;
              const isChecked = checks[key] || false;
              return (
                <button
                  key={idx}
                  onClick={() => toggleCheck(currentStep, check.label)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-green-600 border-green-600"
                        : "border-gray-600"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>{check.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* NEXT UP */}
        <div className="bg-card rounded-lg border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Next up
          </h3>
          <ol className="space-y-2 text-sm">
            {allSteps?.map((step) => (
              <li
                key={step.id}
                className={`flex items-start cursor-pointer hover:text-white transition-colors ${
                  step.completed
                    ? "line-through text-gray-500"
                    : step.current
                    ? "text-white font-medium"
                    : "text-gray-400"
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <span className="mr-2">{step.id}.</span>
                <span>{step.title}</span>
              </li>
            ))}
          </ol>
        </div>
        </div>
      </div>
      <div className="mt-2 flex justify-end">
         <div className="flex items-center gap-2">
            <Button size="icon" className="border-0! bg-0 text-primary">
              <ChevronLeft className="w-4 h-4" />
            </Button>
                    <Button onClick={() => setIsModalOpen(true)}>Mark step as done</Button>
            <Button size="icon" className="border-0! bg-0 text-primary">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
      </div>

      <TaskComplete
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        stepTitle={currentStepData.title}
        onComplete={handleComplete}
      />
    </div>
  );
};
