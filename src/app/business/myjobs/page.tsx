"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteJob, useMyJobs } from "@/hooks/useJobs";
import Link from "next/link";
import { useState } from "react";

export default function JobManagementPage() {
  const { data: jobs, isLoading } = useMyJobs();
  const deleteJob = useDeleteJob();
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobPendingDelete, setJobPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="container flex flex-col gap-5 mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold">My Jobs</h1>
          <p className="text-sm text-muted-foreground">Loading your jobs…</p>
        </div>

        {[0, 1].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-9/12" />
              <Separator />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">No jobs yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When you post a job, it will show up here with proposals and
              status updates.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/business#post-job">Post a Job</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/business">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
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
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setJobPendingDelete({
                            id: job._id,
                            title: job.title,
                          });
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete job
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open && deleteJob.isPending) return;
          setIsDeleteDialogOpen(open);
          if (!open) setJobPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
              {jobPendingDelete?.title ? (
                <span className="block mt-2">
                  Job:{" "}
                  <span className="font-medium">{jobPendingDelete.title}</span>
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteJob.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!jobPendingDelete || deleteJob.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (!jobPendingDelete) return;

                setDeletingJobId(jobPendingDelete.id);
                deleteJob.mutate(
                  { jobId: jobPendingDelete.id },
                  {
                    onSettled: () => {
                      setDeletingJobId(null);
                      setIsDeleteDialogOpen(false);
                      setJobPendingDelete(null);
                    },
                  },
                );
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteJob.isPending && deletingJobId === jobPendingDelete?.id
                ? "Deleting…"
                : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
