"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo,
  useCallback,
} from "react";
import { useStepTracking } from "@/hooks/useStepTracking";

// Định nghĩa kiểu cho hàm xử lý
type HandleNextType = (() => Promise<void> | void) | null;

interface OnboardingContextType {
  handleNext: HandleNextType;
  setHandleNext: Dispatch<SetStateAction<HandleNextType>>;
  // Current question & answer for Q&A pages
  currentQuestion: string;
  currentAnswer: string;
  setCurrentQuestion: (question: string) => void;
  setCurrentAnswer: (answer: string) => void;
  setQuestionAndAnswer: (question: string, answer: string) => void;
  resetQuestionAnswer: () => void;
  // Tracking
  trackStepCompleted: (
    stepSlug: string,
    stepIndex: number,
    value: string | string[] | number | number[]
  ) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [handleNext, setHandleNext] = useState<HandleNextType>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  const { trackOnboardingStepCompleted } = useStepTracking();

  const setQuestionAndAnswer = useCallback((question: string, answer: string) => {
    setCurrentQuestion(question);
    setCurrentAnswer(answer);
  }, []);

  const resetQuestionAnswer = useCallback(() => {
    setCurrentQuestion("");
    setCurrentAnswer("");
  }, []);

  const trackStepCompleted = useCallback(
    (
      stepSlug: string,
      stepIndex: number,
      value: string | string[] | number | number[]
    ) => {
      trackOnboardingStepCompleted(stepSlug, stepIndex, value);
    },
    [trackOnboardingStepCompleted]
  );

  const contextValue = useMemo(() => ({
    handleNext,
    setHandleNext,
    currentQuestion,
    currentAnswer,
    setCurrentQuestion,
    setCurrentAnswer,
    setQuestionAndAnswer,
    resetQuestionAnswer,
    trackStepCompleted,
  }), [handleNext, currentQuestion, currentAnswer, setQuestionAndAnswer, resetQuestionAnswer, trackStepCompleted]);

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}
export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error(
      "useOnboardingContext must be used within OnboardingProvider"
    );
  }
  return context;
}