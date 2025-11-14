"use client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type { IUser, ApiError } from "@/types/api";

export const useGetUser = (id: string) =>
  useQuery<IUser, ApiError>({
    queryKey: ["All-proposals", id],
    queryFn: () => apiClient<IUser>(`/user/${id}`),
  });
