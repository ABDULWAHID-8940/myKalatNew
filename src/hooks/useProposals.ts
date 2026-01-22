import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type { Ipro, ApiError } from "@/types/api";

export const useAllProposals = (id: string) =>
  useQuery<Ipro[], ApiError>({
    queryKey: ["All-proposals", id],
    queryFn: () => apiClient<Ipro[]>(`/proposal?jobId=${id}`),
  });

export const useUpdateProposalStatus = (jobId: string) => {
  const qc = useQueryClient();

  return useMutation<
    Ipro,
    ApiError,
    { proposalId: string; status: Ipro["status"] }
  >({
    mutationFn: ({ proposalId, status }) =>
      apiClient<Ipro>(`/proposal/${proposalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["All-proposals", jobId] });
      toast.success("Proposal updated");
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to update proposal. Please try again.",
      );
    },
  });
};
