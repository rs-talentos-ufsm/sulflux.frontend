import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AuthEnums,
  type EnumLoginStatus,
  type UserResponseDTO,
} from '@lib/shared';

type AuthState = {
  user: UserResponseDTO | null;
  status: EnumLoginStatus;
  setUser: (user: UserResponseDTO | null) => void;
  setStatus: (status: EnumLoginStatus) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: AuthEnums.LoginStatus.Unauthenticated,

      setUser: (user) =>
        set({
          user,
          status: user
            ? AuthEnums.LoginStatus.Authenticated
            : AuthEnums.LoginStatus.Unauthenticated,
        }),

      setStatus: (status) => set({ status }),

      logout: () =>
        set({
          user: null,
          status: AuthEnums.LoginStatus.Unauthenticated,
        }),
    }),
    {
      name: '@pgi-proa:auth-state',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
