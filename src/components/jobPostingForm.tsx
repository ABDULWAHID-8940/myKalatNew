"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateJobApplication } from "@/hooks/useJobs";
import { useGoals } from "@/hooks/useGoals";
import type { IGoal } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectLabel, SelectGroup } from "@/components/ui/select";
import { useUser } from "@/context/User";
import { useRouter } from "next/navigation";

const JobPostingForm = () => {
  const router = useRouter();
  const { user } = useUser();
  const createJobMutation = useCreateJobApplication();

  const {
    data: goalsData,
    isLoading: goalsLoading,
    error: goalsErrorObj,
  } = useGoals(user?.id);
  const goals = useMemo(
    () => (Array.isArray(goalsData) ? goalsData : []),
    [goalsData],
  );
  const goalsError = (goalsErrorObj as any)?.message as string | undefined;

  const formatGoalLabel = (g: IGoal & { name?: string }) => {
    if (g.name) return g.name;
    const end = new Date(g.estimatedEndDate);
    const endStr = isNaN(end.getTime())
      ? ""
      : ` by ${end.toLocaleDateString()}`;
    return `Target: ${g.targetValue} ${g.unit}${endStr}`;
  };

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    location: "Tecno",
    goalId: "",
    goalContributionPercent: "100",
    socialMedia: [] as Array<{
      platform: "instagram" | "tiktok" | "telegram";
    }>,
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<
    Array<"instagram" | "tiktok" | "telegram">
  >([]);

  const handlePlatformToggle = (
    platform: "instagram" | "tiktok" | "telegram",
  ) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare job data with string types only
      const jobData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        location: formData.location,
        goalId: formData.goalId || undefined, // Only include if selected
        goalContributionPercent: formData.goalId
          ? parseInt(formData.goalContributionPercent)
          : undefined,
        socialMedia: selectedPlatforms.map((platform) => ({ platform })), // Array of {platform: string}
      };

      await createJobMutation.mutate(jobData, {
        onSuccess: () => {
          setFormData({
            title: "",
            description: "",
            price: 0,
            location: "Tecno",
            goalId: "",
            goalContributionPercent: "100",
            socialMedia: [],
          });
          setSelectedPlatforms([]);
          router.push("/business/myjobs");
        },
      });
    } catch (error) {
      console.error("Error posting job:", error);
    }
  };

  return (
    <section className="py-10 bg-brand-gray" id="post-job">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-custom">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Instagram Marketing for our shop"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your job requirements in detail..."
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Budget (Birr) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      placeholder="100"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      disabled
                      placeholder="Addis Ababa, Ethiopia"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalId">
                      Associate with Goal (Optional)
                    </Label>
                    <Select
                      value={formData.goalId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, goalId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal to contribute to" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalsLoading && (
                          <SelectGroup>
                            <SelectLabel>Loading goals...</SelectLabel>
                          </SelectGroup>
                        )}
                        {!goalsLoading && goals.length === 0 && (
                          <SelectGroup>
                            <SelectLabel>No goals available</SelectLabel>
                          </SelectGroup>
                        )}
                        {!goalsLoading &&
                          goals
                            .filter(
                              (g): g is IGoal & { _id: string } =>
                                typeof g._id === "string" && g._id.length > 0,
                            )
                            .map((goal) => (
                              <SelectItem key={goal._id} value={goal._id}>
                                {formatGoalLabel(goal)}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                    {goalsError && (
                      <p className="text-xs text-red-600 mt-1">{goalsError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goalContributionPercent">
                      Goal Contribution (%)
                    </Label>
                    <Input
                      id="goalContributionPercent"
                      name="goalContributionPercent"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="100"
                      value={formData.goalContributionPercent}
                      onChange={handleChange}
                      disabled={!formData.goalId}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Required Social Media Platforms *</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["instagram", "tiktok", "telegram"] as const).map(
                      (platform) => (
                        <Button
                          className="text-xs sm:text-base px-1.5"
                          key={platform}
                          type="button"
                          variant={
                            selectedPlatforms.includes(platform)
                              ? "default"
                              : "outline"
                          }
                          onClick={() => handlePlatformToggle(platform)}
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </Button>
                      ),
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    createJobMutation.isPending ||
                    selectedPlatforms.length === 0
                  }
                >
                  {createJobMutation.isPending ? "Posting..." : "Post Job"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default JobPostingForm;
