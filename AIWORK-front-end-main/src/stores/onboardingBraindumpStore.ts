import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Question {
  slug: string;
  question: string;
  answer: string;
}

interface Task {
  id: string;
  text: string;
  est_time?: number;
  task_source?: "chip" | "manual";
  kind: string;
  parent_id: string;
  relation_type: string;

}

interface OnboardingBraindumpState {
  session_id: string | null;
  selected_tasks: Task[];
  questions: Question[];
  manualTaskCount: number;
}

interface OnboardingBraindumpStore {
  data: OnboardingBraindumpState;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setQuery: (query: string) => void;
  setSessionId: (sessionId: string) => void;
  setSelectedTasks: (tasks: Task[]) => void;
  addSelectedTask: (task: Task) => void;
  removeSelectedTask: (id: string) => void;
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (index: number, question: Question) => void;
  removeQuestion: (index: number) => void;
  reset: () => void;
}

const defaultDataState: OnboardingBraindumpState = {
  session_id: null,
  selected_tasks: [],
  questions: [],
  manualTaskCount: 0,
};

export const useOnboardingBraindumpStore = create<OnboardingBraindumpStore>()(
  persist(
    set => ({
      data: defaultDataState,
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      setQuery: (query: string) => {
        set(state => ({
          data: {
            ...state.data,
            query,
          },
        }));
      },
      setSelectedTasks: (tasks: Task[]) => {
        set(state => ({
          data: {
            ...state.data,
            selected_tasks: tasks,
          },
        }));
      },
      addSelectedTask: (task: Task) => {
        set(state => ({
          data: {
            ...state.data,
            selected_tasks: [...state.data.selected_tasks, task],
          },
        }));
      },
      removeSelectedTask: (id: string) => {
        set(state => ({
          data: {
            ...state.data,
            selected_tasks: state.data.selected_tasks?.filter(t => t.id !== id),
          },
        }));
      },
      setQuestions: (questions: Question[]) => {
        set(state => ({
          data: {
            ...state.data,
            questions,
          },
        }));
      },
      addQuestion: (question: Question) => {
        set(state => {
          const existingIndex = state.data.questions.findIndex(
            q => q.slug === question.slug
          );

          let updatedQuestions;
          if (existingIndex !== -1) {
            // Replace existing question with new answer
            updatedQuestions = state.data.questions?.map((q, i) =>
              i === existingIndex ? question : q
            );
          } else {
            // Add new question
            updatedQuestions = [...state.data.questions, question];
          }

          return {
            data: {
              ...state.data,
              questions: updatedQuestions,
            },
          };
        });
      },
      updateQuestion: (index: number, question: Question) => {
        set(state => ({
          data: {
            ...state.data,
            questions: state.data.questions?.map((q, i) => (i === index ? question : q)),
          },
        }));
      },
      removeQuestion: (index: number) => {
        set(state => ({
          data: {
            ...state.data,
            questions: state.data.questions?.filter((_, i) => i !== index),
          },
        }));
      },

      setSessionId: (sessionId: string) => {
        set(state => ({
          data: {
            ...state.data,
            session_id: sessionId,
          },
        }));
      },
      reset: () => {
        set({ data: defaultDataState });
      },
    }),
    {
      storage: createJSONStorage(() => sessionStorage),
      name: 'onboarding-braindump-context',
      partialize: state => ({
        data: state.data,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
