"use client";

import Link from "next/link";
import Image from "next/image";
import EditBuissnesProfile from "@/components/editBuissnesProfile";
import { MapPin, BadgeCheck, Star, LogOut, ShieldX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GoalDisplay from "@/components/GoalDisplay";
import ConfirmLogoutModal from "@/components/ConfirmLogoutModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

function ProfilePage() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const hasCoverImage = Boolean(session?.user?.coverImage);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      // Redirect to home page or login page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  if (isPending) {
    return (
      <div className="mx-auto mt-5 sm:mt-0 p-4 sm:px-6 max-w-5xl mb-20">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <AspectRatio ratio={4 / 1} className="bg-muted">
            <Skeleton className="h-full w-full" />
          </AspectRatio>
          <div className="px-4 sm:px-6 pb-5">
            <div className="relative flex gap-3 sm:gap-4">
              <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full ring-2 ring-white shadow-md -mt-2 sm:-mt-8" />
              <div className="flex-1 pt-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Separator className="my-4" />
            <div>
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-5 sm:mt-0 p-4 sm:px-6 max-w-5xl mb-20">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <ShieldX className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Failed to load profile data. Please check your connection and try
              again.
            </p>
            <Button onClick={() => refetch()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session?.user?.role !== "business") {
    return (
      <div className="mx-auto mt-5 sm:mt-0 p-4 sm:px-6 max-w-5xl mb-20">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <ShieldX className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 leading-relaxed">
              This page is restricted to business accounts only. Please ensure
              you're logged in with the correct account type.
            </p>
            <Button onClick={() => refetch()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto sm:mt-0 p-4 sm:px-6 max-w-5xl mb-20">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div>
          <AspectRatio ratio={4 / 1} className="bg-muted">
            {hasCoverImage ? (
              <Image
                src={session?.user?.coverImage as string}
                alt="Cover image"
                fill
                className="rounded-md object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-muted">
                <div className="absolute inset-y-0 right-0 flex items-center justify-end p-3 sm:p-6">
                  <div className="max-w-[70%] rounded-md border border-gray-200 bg-white/90 px-3 py-2 text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {session?.user?.companyName || "Business"}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600">
                      {session?.user?.industry || "No industry"}
                    </div>
                    <div className="mt-0.5 inline-flex items-center justify-end gap-1 text-xs text-gray-600">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{session?.user?.location || "No location"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="z-10 absolute top-3 right-3 flex gap-2">
              <EditBuissnesProfile user={session?.user} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogoutModalOpen(true)}
                className="bg-white/90 hover:bg-white border-red-200 hover:border-red-300 text-red-600 hover:text-red-700"
              >
                <LogOut size={16} className="mr-1" />
                Logout
              </Button>
            </div>
          </AspectRatio>
        </div>

        {/* Profile Info Section */}
        <div className="px-4 sm:px-6 pb-5">
          <div className="relative flex gap-3 sm:gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-white shadow-md -mt-2 sm:-mt-8">
              <AvatarImage
                src={session?.user?.image || "https://github.com/shadcn.png"}
                alt={"name"}
              />
              <AvatarFallback className="bg-gray-200">
                {session?.user?.name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl leading-tight">
                  {session?.user?.companyName || "No company name"}
                </h1>
                {session?.user?.businessVerified && (
                  <BadgeCheck
                    strokeWidth={3}
                    size={20}
                    className="text-blue-500"
                  />
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />{" "}
                  {session?.user?.location || "No location"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
              {session?.user?.bio || "No bio yet."}
            </p>
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Industry:</span>{" "}
              <span className="font-medium">
                {session?.user?.industry || "Not specified"}
              </span>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Business Size:</span>{" "}
              <span className="font-medium">
                {session?.user?.businessSize || "Not specified"}
              </span>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Business Phone:</span>{" "}
              <span className="font-medium">
                {session?.user?.businessPhone || "Not specified"}
              </span>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Onboarded:</span>{" "}
              <span className="font-medium">
                {session?.user?.onboarded ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Goals section */}
          <div>
            <div className="flex items-center justify-between py-2">
              <div className="text-base font-semibold text-gray-900">
                Business Goals
              </div>
              <Link href="/business/goals">
                <Button variant="outline" size="sm">
                  Manage Goals
                </Button>
              </Link>
            </div>
            <div className="pt-2">
              <GoalDisplay businessId={session?.user?.id || ""} />
            </div>
          </div>
        </div>
      </div>
      <ConfirmLogoutModal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}

export default ProfilePage;
