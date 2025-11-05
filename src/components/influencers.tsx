"use client"; // Ensure this is at the very top of the file

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin } from "lucide-react";
import { useInfluencers } from "@/context/Influencer";
import Link from "next/link";
import { InfluencerDetailPopup } from "@/components/drawer";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SocialMediaPlatform {
  username: string;
  followers: string | number;
}

interface SocialMedia {
  instagram?: SocialMediaPlatform;
  tiktok?: SocialMediaPlatform;
  telegram?: SocialMediaPlatform;
  [key: string]: SocialMediaPlatform | undefined;
}

interface Influencerm {
  _id: string;
  name: string;
  image: string;
  bio: string;
  location: string;
  price: number;
  socialMedia: SocialMedia;
  verified: boolean;
}

export const InfluencerCard = ({ influencer }: { influencer: Influencerm }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const socialMedia: SocialMedia =
    typeof influencer.socialMedia === "string"
      ? JSON.parse(influencer.socialMedia)
      : influencer.socialMedia;

  // Type-safe follower calculation
  const totalFollowers = Object.values(socialMedia).reduce(
    (total: number, platform?: SocialMediaPlatform) => {
      if (!platform?.followers) return total;

      const followers =
        typeof platform.followers === "string"
          ? parseInt(platform.followers.replace(/\D/g, "")) // Remove non-digits
          : platform.followers;

      return total + (isNaN(followers) ? 0 : followers);
    },
    0
  );

  return (
    <>
      <InfluencerDetailPopup
        influencer={influencer}
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-4">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={influencer.image} alt={influencer.name} />
              <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <h3 className="font-semibold text-lg">{influencer.name}</h3>
                {influencer.verified && (
                  <CheckCircle className="h-4 w-4 ml-1 text-blue-500" />
                )}
              </div>
              <div className="flex items-center justify-center text-sm">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  {influencer.location ? influencer.location : "no location"}
                </span>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-1">
                {influencer.bio?.trim() ? influencer.bio : "No bio available"}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="font-medium">{influencer.price} Birr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Followers:</span>
              <span className="font-medium">
                {totalFollowers.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsPopupOpen(true)}
          >
            View Profile
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

const InfluencerCardSkeleton = () => {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
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
      </CardContent>
    </Card>
  );
};

const InfluencerSection = () => {
  const { influencers, loading } = useInfluencers();

  return (
    <section className="md:py-16 py-8 bg-white" id="influencers">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="md:text-3xl text-2xl font-bold mb-4">
            Browse Top Influencers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with verified marketing professionals and influencers who
            can help take your brand to the next level
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array(8)
                .fill(0)
                .map((_, index) => <InfluencerCardSkeleton key={index} />)
            : influencers
                .slice(0, 8)
                .map((influencer) => (
                  <InfluencerCard
                    key={influencer._id}
                    influencer={influencer}
                  />
                ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/business/influencers"
            className="bg-primary px-5 py-3 rounded-md text-white font-semibold hover:bg-primary/80 transition-colors"
          >
            View All Influencers
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InfluencerSection;
