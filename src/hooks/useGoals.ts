import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError, IGoal } from "@/types/api";

type GoalQueryKey = ["goals", string];

function goalsKey(businessId?: string): GoalQueryKey {
  return ["goals", businessId || "all"];
}

async function goalFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const json = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const err: ApiError = {
      message:
        json?.message || json?.error || res.statusText || "Request failed",
      status: res.status,
    };
    throw err;
  }

  return json as T;
}

export function useGoals(businessId?: string, opts?: { enabled?: boolean }) {
  return useQuery<IGoal[], ApiError>({
    queryKey: goalsKey(businessId),
    enabled: opts?.enabled ?? true,
    queryFn: () => {
      const url = businessId
        ? `/api/goal?businessId=${businessId}`
        : "/api/goal";
      return goalFetch<IGoal[]>(url);
    },
  });
}

export type CreateGoalInput = {
  businessId: string;
  targetValue: number;
  currentValue?: number;
  unit: string;
  startDate: string | Date;
  estimatedEndDate: string | Date;
};

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation<IGoal, ApiError, CreateGoalInput>({
    mutationFn: (payload) =>
      goalFetch<IGoal>("/api/goal", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      toast.success("Goal created");
      qc.invalidateQueries({ queryKey: goalsKey(variables.businessId) });
      qc.invalidateQueries({ queryKey: goalsKey() });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create goal");
    },
  });
}

export type UpdateGoalInput = {
  goalId: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate?: string | Date;
  estimatedEndDate?: string | Date;
  businessId?: string;
};

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation<IGoal, ApiError, UpdateGoalInput>({
    mutationFn: ({ goalId, businessId: _businessId, ...updates }) =>
      goalFetch<IGoal>("/api/goal", {
        method: "PATCH",
        body: JSON.stringify({ goalId, ...updates }),
      }),
    onSuccess: (_data, variables) => {
      toast.success("Goal updated");
      qc.invalidateQueries({ queryKey: goalsKey(variables.businessId) });
      qc.invalidateQueries({ queryKey: goalsKey() });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update goal");
    },
  });
}

export type DeleteGoalInput = {
  goalId: string;
  businessId?: string;
};

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation<
    { message: string; goal: IGoal },
    ApiError,
    DeleteGoalInput
  >({
    mutationFn: ({ goalId }) =>
      goalFetch<{ message: string; goal: IGoal }>("/api/goal", {
        method: "DELETE",
        body: JSON.stringify({ goalId }),
      }),
    onSuccess: (_data, variables) => {
      toast.success("Goal deleted");
      qc.invalidateQueries({ queryKey: goalsKey(variables.businessId) });
      qc.invalidateQueries({ queryKey: goalsKey() });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete goal");
    },
  });
}
