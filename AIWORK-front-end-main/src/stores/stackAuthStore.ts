import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface StackAuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    displayName: string;
    profileImageUrl?: string;
  } | null;
}

interface StackAuthStore {
  data: StackAuthState;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setUser: (user: StackAuthState['user']) => void;
  logout: () => void;
}

const defaultState: StackAuthState = {
  isAuthenticated: false,
  user: null,
};

export const useStackAuthStore = create<StackAuthStore>()(
  persist(
    (set) => ({
      data: defaultState,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUser: (user) =>
        set((state) => ({
          data: {
            ...state.data,
            isAuthenticated: !!user,
            user,
          },
        })),
      logout: () => {
        set({ data: defaultState });
        window.location.replace('/stack-login');
      },
    }),
    {
      name: 'stackAuthStore',
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
