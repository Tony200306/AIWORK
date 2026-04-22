import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Task {
  id: string;
  text: string;
  est_time?: number;
  task_source?: "chip" | "manual";
  kind: string;
  parent_id: string;
  relation_type: string;
  isLoading?: boolean;
}

interface ListSuggestionTaskState {
  tasks: Task[];
}

interface ListSuggestionTaskStore {
  data: ListSuggestionTaskState;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  removeTask: (index: number) => void;
  removeTaskById: (id: string) => void;
  replaceTaskAtIndex: (index: number, newTasks: Task[]) => void;
  replaceTaskById: (oldTaskId: string, newTasks: Task[]) => void;
  clearTasks: () => void;
  setIsLoadingForTask: (index: number, isLoading: boolean) => void;
  setAllTasksLoadingState: (isLoading: boolean) => void;
}

const defaultDataState: ListSuggestionTaskState = {
  tasks: [],
};

export const useListSuggestionTaskStore = create<ListSuggestionTaskStore>()(
  persist(
    (set, get) => ({
      data: defaultDataState,
      setTasks: (tasks: Task[]) => {
        set(state => ({
          data: {
            ...state.data,
            tasks,
          },
        }));
      },
      addTask: (task: Task) => {
        set(state => ({
          data: {
            ...state.data,
            tasks: [...state.data.tasks, task],
          },
        }));
      },
      removeTask: (index: number) => {
        set(state => ({
          data: {
            ...state.data,
            tasks: state.data.tasks?.filter((_, i) => i !== index),
          },
        }));
      },
      removeTaskById: (id: string) => {
        set(state => ({
          data: {
            ...state.data,
            tasks: state.data.tasks?.filter(t => t.id !== id),
          },
        }));
      },
      replaceTaskAtIndex: (index: number, newTasks: Task[]) => {
        set(state => ({
          data: {
            ...state.data,
            tasks: [
              ...state.data.tasks.slice(0, index),
              ...newTasks,
              ...state.data.tasks.slice(index + 1),
            ],
          },
        }));
      },
      replaceTaskById: (oldTaskId: string, newTasks: Task[]) => {
        set(state => {
          const index = state.data.tasks.findIndex(t => t.id === oldTaskId);
          if (index === -1) return state;

          return {
            data: {
              ...state.data,
              tasks: [
                ...state.data.tasks.slice(0, index),
                ...newTasks,
                ...state.data.tasks.slice(index + 1),
              ],
            },
          };
        });
      },
      clearTasks: () => {
        set({ data: defaultDataState });
      },
      setIsLoadingForTask: (index: number, isLoading: boolean) => {
        set(state => {
          const task = state.data.tasks[index];
          if (!task) return state;

          const updatedTask: Task = { ...task, isLoading };
          const updatedTasks = [...state.data.tasks];
          updatedTasks[index] = updatedTask;

          return {
            data: {
              ...state.data,
              tasks: updatedTasks,
            },
          };
        });
      },
      setAllTasksLoadingState: (isLoading: boolean) => {
        set(state => ({
          data: {
            ...state.data,
            tasks: state.data.tasks?.map(task => ({ ...task, isLoading })),
          },
        }));
      },
    }),
    {
      name: 'list-suggestion-task',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        data: {
          tasks: state.data.tasks,
          // Don't persist loading states
        },
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        data: {
          ...currentState.data,
          tasks: persistedState?.data?.tasks || [],
          loadingTaskIds: new Set(), // Always initialize as empty Set
        },
      }),
    },
  ),
);
