"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type { ApiError } from "@/types/api";
import { useUser } from "@/context/User";

export interface SocialMediaAction {
  platform: "instagram" | "tiktok" | "telegram";
  actionType: "post" | "story";
  quantity: number;
}

export type ContractStatus = "draft" | "active" | "completed" | "terminated";

export interface Contract {
  _id: string;
  senderId: string;
  reciverId: string;
  price: number;
  socialMediaActions: SocialMediaAction[];
  deadline: string;
  status: ContractStatus;
  activatedAt?: string;
  completedAt?: string;
  terminatedAt?: string;
  influencerConfirmed?: boolean;
  ownerConfirmed?: boolean;
  createdAt: string;
  updatedAt: string;
}

const contractsKey = (userId: string) => ["contracts", userId] as const;

export const useContracts = () => {
  const qc = useQueryClient();
  const { user } = useUser();
  const userId = user?.id;

  const contractsQuery = useQuery<Contract[], ApiError>({
    queryKey: userId ? contractsKey(userId) : ["contracts", "anonymous"],
    enabled: !!userId,
    queryFn: () => apiClient<Contract[]>(`/contract?influencerId=${userId}`),
  });

  const createContractMutation = useMutation<
    Contract,
    ApiError,
    {
      senderId: string;
      reciverId: string;
      price: number;
      socialMediaActions: SocialMediaAction[];
      deadline: string;
    }
  >({
    mutationFn: (payload) =>
      apiClient<Contract>("/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      if (userId) qc.invalidateQueries({ queryKey: contractsKey(userId) });
      toast.success("Contract created");
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to create contract. Please try again.",
      );
    },
  });

  const updateStatusMutation = useMutation<
    Contract,
    ApiError,
    {
      contractId: string;
      status:
        | "active"
        | "terminated"
        | "influencerConfirmed"
        | "ownerConfirmed";
      role: "influencer" | "business" | "admin";
    }
  >({
    mutationFn: ({ contractId, ...payload }) =>
      apiClient<Contract>(`/contract/${contractId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      if (userId) qc.invalidateQueries({ queryKey: contractsKey(userId) });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update contract.");
    },
  });

  return {
    contracts: contractsQuery.data ?? [],
    isLoading: contractsQuery.isLoading,
    isFetching: contractsQuery.isFetching,
    error: contractsQuery.error,
    fetchContracts: contractsQuery.refetch,
    createContract: createContractMutation.mutateAsync,
    updateContractStatus: (
      contractId: string,
      status:
        | "active"
        | "terminated"
        | "influencerConfirmed"
        | "ownerConfirmed",
      role: "influencer" | "business" | "admin",
    ) => updateStatusMutation.mutateAsync({ contractId, status, role }),
    getContract: (contractId: string) =>
      (contractsQuery.data ?? []).find((c) => c._id === contractId),
  };
};
