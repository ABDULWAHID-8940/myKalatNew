"use client";

// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Search, X } from "lucide-react";
import { InfluencerCard } from "@/components/influencers";
import { useInfluencers } from "@/hooks/useInfluencers";
import { Skeleton } from "@/components/ui/skeleton";

const InfluencerCardSkeleton = () => {
  return (
    <div className="border rounded-lg overflow-hidden h-full">
      <div className="p-6">
        <div className="flex flex-col items-center text-center mb-4">
          <Skeleton className="h-20 w-20 rounded-full mb-4" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-5 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        <div className="mb-4 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>

        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
};

export default function InfluencerSearchPage() {
  const { influencers, loading } = useInfluencers();

  return (
    <div className="mx-auto container p-8">
      <h1 className="md:text-3xl text-2xl font-bold mb-6">Find Influencers</h1>
      {/* <div className="mb-8">
        

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search influencers by name, specialty..."
            className="pl-10 pr-10"
          />
          <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="fitness">Fitness</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Followers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="10k">10K+</SelectItem>
              <SelectItem value="50k">50K+</SelectItem>
              <SelectItem value="100k">100K+</SelectItem>
              <SelectItem value="1m">1M+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading
          ? Array(12)
              .fill(0)
              .map((_, index) => <InfluencerCardSkeleton key={index} />)
          : influencers.map((influencer) => (
              <InfluencerCard key={influencer._id} influencer={influencer} />
            ))}
      </div>
    </div>
  );
}
