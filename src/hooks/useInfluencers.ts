"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ApiError } from "@/types/api";

export interface Influencer {
  _id: string;
  name: string;
  image: string;
  bio: string;
  price: number;
  socialMedia: any;
  location: string;
  verified: boolean;
}

export const useInfluencers = () => {
  const query = useQuery<Influencer[], ApiError>({
    queryKey: ["influencers"],
    queryFn: () => apiClient<Influencer[]>("/influencer"),
  });

  return {
    influencers: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    fetchInfluencers: query.refetch,
  };
};
