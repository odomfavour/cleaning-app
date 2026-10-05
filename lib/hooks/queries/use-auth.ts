import {
  logout,
  getCurrentUser,
  login,
  registerCustomer,
  AuthUser,
  RegisterCustomerInput,
} from "@/lib/api/services/auth.service";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const authKeys = {
  currentUser: ["auth", "current-user"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: getCurrentUser,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),

    onSuccess: ({ user }) => {
      queryClient.setQueryData<AuthUser>(authKeys.currentUser, user);
    },

    onError: (error) => {
      console.error("Login failed:", getApiErrorMessage(error));
    },
  });
}

export function useRegisterCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterCustomerInput) => registerCustomer(input),

    onSuccess: ({ user }) => {
      queryClient.setQueryData<AuthUser>(authKeys.currentUser, user);
    },

    onError: (error) => {
      console.error("Account registration failed:", getApiErrorMessage(error));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: authKeys.currentUser,
      });
    },
  });
}
