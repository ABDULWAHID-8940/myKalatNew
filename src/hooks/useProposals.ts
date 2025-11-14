import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type { Ipro, ApiError } from "@/types/api";

export const useAllProposals = (id: string) =>
  useQuery<Ipro[], ApiError>({
    queryKey: ["All-proposals", id],
    queryFn: () => apiClient<Ipro[]>(`/proposal?jobId=${id}`),
  });
