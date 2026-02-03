"use client";
import JobPreview from "@/components/JobPreview";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewJobs, useMyAppliedJobs, useMySavedJobs } from "@/hooks/useJobs";
import { useMemo, useState } from "react";
import { Briefcase, TrendingUp, Clock, Bookmark } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JobLists() {
  const { data: jobs, isLoading } = useNewJobs();
  const { data: appliedJobs, isLoading: isLoadingApplied } = useMyAppliedJobs();
  const { data: savedJobs, isLoading: isLoadingSaved } = useMySavedJobs();
  const [activeTab, setActiveTab] = useState("match");

  const savedIdSet = useMemo(
    () => new Set((savedJobs ?? []).map((j) => j._id)),
    [savedJobs],
  );
  const appliedIdSet = useMemo(
    () => new Set((appliedJobs ?? []).map((j) => j._id)),
    [appliedJobs],
  );

  return (
    <div className="min-h-screen bg-gray-200 p-4 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className=" mb-4">
          <h1 className="text-xl md:text-2xl text-gray-900">Available jobs</h1>
          <p className=" text-gray-600 max-w-2xl text-sm md:text-base">
            Find the perfect collaborative opportunities.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-auto sm:w-120 grid-cols-3 mb-2 ">
            <TabsTrigger
              value="match"
              className="flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              Matchs
            </TabsTrigger>
            <TabsTrigger
              value="applied"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              Applied
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Bookmark className="w-4 h-4" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="match">
            <div className="grid gap-5 ">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <div
                    key={job._id}
                    className="transform transition-all duration-300 hover:shadow-lg"
                  >
                    <JobPreview job={job} isSaved={savedIdSet.has(job._id)} />
                  </div>
                ))
              ) : (
                // Empty state
                <div className="col-span-full text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No opportunities available
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    There are currently no open opportunities that match your
                    criteria. Check back later for new collaborations.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applied">
            <div className="grid gap-5 ">
              {isLoadingApplied ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))
              ) : appliedJobs && appliedJobs.length > 0 ? (
                appliedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="transform transition-all duration-300 hover:shadow-lg"
                  >
                    <JobPreview
                      job={job}
                      isApplyed={true}
                      isSaved={savedIdSet.has(job._id)}
                    />
                  </div>
                ))
              ) : (
                // Empty state
                <div className="col-span-full text-center py-16">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    You haven't applied yet
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Browse available jobs and start applying.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="grid gap-5 ">
              {isLoadingSaved ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))
              ) : savedJobs && savedJobs.length > 0 ? (
                savedJobs.map((job) => (
                  <div key={job._id} className="transform transition-all ">
                    <JobPreview
                      job={job}
                      isSaved={true}
                      isApplyed={appliedIdSet.has(job._id)}
                    />
                  </div>
                ))
              ) : (
                // Empty state
                <div className="col-span-full text-center py-16">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    You haven't saved any jobs yet
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Select the <Bookmark className="inline-block" /> icon on job
                    listings to save them.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
