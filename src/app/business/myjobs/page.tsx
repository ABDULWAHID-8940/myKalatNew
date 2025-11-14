"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMyJobs } from "@/hooks/useJobs";
import Link from "next/link";

export default function JobManagementPage() {
  const { data: jobs, isLoading } = useMyJobs();

  if (jobs?.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-xl font-semibold">No Job Found</h1>
      </div>
    );
  }

  return (
    <div className="container flex flex-col gap-5 mx-auto px-4 py-6 max-w-4xl">
      {jobs?.map((job) => (
        <div
          key={job._id}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden border"
        >
          {/* Compact Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      job.status === "open"
                        ? "default"
                        : job.status === "completed"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {job.status}
                  </Badge>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {job.location}
                  </span>
                </div>
              </div>
              <div className="text-base font-medium text-blue-600 dark:text-blue-400">
                Budget: {job.price} Birr
              </div>
            </div>
          </div>

          {/* Compact Content */}
          <div className="p-4 sm:p-5">
            {/* Description */}
            <section className="mb-6">
              <h2 className="text-base font-medium mb-2 text-gray-800 dark:text-gray-200">
                Campaign Details
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {job.description}
              </p>
            </section>

            <Separator className="my-4" />

            {/* Platforms */}
            <section className="mb-6">
              <h2 className="text-base font-medium mb-2 text-gray-800 dark:text-gray-200">
                Target Platforms
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {job.socialMedia.map((platform) => (
                  <Badge
                    key={platform.platform}
                    variant="outline"
                    className="text-xs"
                  >
                    {platform.platform}
                  </Badge>
                ))}
              </div>
            </section>

            <Separator className="my-4" />

            {/* Compact Stats */}
            <section className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Hired
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {job.hiredInfluencers.length}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Proposals
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {job.proposalsSubmitted.length}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Spent
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.floor(job.price * job.hiredInfluencers.length)} Birr
                </p>
              </div>
            </section>

            <Separator className="my-4" />

            {/* Compact Actions */}
            <div className="space-y-3">
              <h2 className="text-base font-medium text-gray-800 dark:text-gray-200">
                Manage Job
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                {job.status === "open" && (
                  <>
                    <Button asChild size="sm" className="text-xs">
                      <Link href={`/business/proposals/${job._id}`}>
                        View Proposals ({job.proposalsSubmitted.length})
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" className="text-xs">
                      Close
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
