"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateJobApplication } from "@/hooks/useJobs";
import { useGoals } from "@/hooks/useGoals";
import type { IGoal, IJob } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup
} from "@/components/ui/select";

import { useUser } from "@/context/User";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check,Target,Users,Heart } from "lucide-react";
// import { undefined } from "better-auth";
const priorities = [
  { id: "reachability", label: "Reachability", icon: Target,color: "text-blue-500", },
  { id: "customer", label: "Customer Bringing", icon: Users,color: "text-green-500", },
  { id: "engagement", label: "Engagement", icon: Heart,color: "text-purple-500", },
];

const JobPostingForm = () => {
   const [selectedPriority, setSelectedPriority] = useState<string>("");
  const router = useRouter();
  const { user } = useUser();
  const createJobMutation = useCreateJobApplication();

 const togglePriority = (id: string) => {
  setSelectedPriority(id);
};

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
    price: "",
    location: "Tecno",
    campaignPriority: "",
    socialMedia: [] as Array<{
      platform: "instagram" | "tiktok" | "telegram";
    }>,
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<
    Array<"instagram" | "tiktok" | "telegram">
  >(["tiktok"]);    

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
      if (formData.price.trim() === "") {
        return;
      }

      const numericPrice = Number(formData.price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return;
      }

      // Prepare job data with correct types
      const jobData = {
  title: formData.title,
  description: formData.description,
  price: numericPrice,
  location: formData.location,
  campaignPriority: selectedPriority || undefined,
  socialMedia: selectedPlatforms.map((platform) => ({ platform })),
};

      createJobMutation.mutate(
        jobData as Partial<IJob>,
        {
          onSuccess: () => {
            setFormData({
              title: "",
              description: "",
              price: "",
              location: "Tecno",
              campaignPriority: "",
              socialMedia: [],
            });
            setSelectedPlatforms(["tiktok"]);
            router.push("/business/myjobs");
          },
        }
      );
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

              <h3 className="font-semibold mb-2">Campaign Priorities *</h3>

              <div className="flex gap-3 flex-wrap">
              {priorities.map((p) => {
                const Icon = p.icon;

            return (
                <button
                   type="button"
                   key={p.id}
                   onClick={() => togglePriority(p.id)}
                   className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition",
                      selectedPriority === p.id
                    ? "bg-blue-100 border-blue-500"
                     : "bg-white border-gray-300 hover:bg-gray-50"
                   )}
                    >
                  <Icon className={cn("w-4 h-4", p.color)} />
                  {p.label}
                </button>
    );
  })}
</div>


               
                <div className="space-y-2">
                  <Label>Required Social Media Platforms *</Label>
                  <div className="rounded-md border bg-background p-2">
                    <div className="flex flex-wrap gap-2">
                      {(["instagram", "tiktok", "telegram"] as const).map(
                        (platform) => {
                          const selected = selectedPlatforms.includes(platform);
                          return (
                            <Button
                              key={platform}
                              type="button"
                              variant="outline"
                              aria-pressed={selected}
                              onClick={() => handlePlatformToggle(platform)}
                              className={cn(
                                "h-9 rounded-full px-3 text-xs sm:text-sm gap-2",
                                selected &&
                                  "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                              )}
                            >
                              {selected && <Check className="h-4 w-4" />}
                              {platform.charAt(0).toUpperCase() +
                                platform.slice(1)}
                            </Button>
                          );
                        },
                      )}
                    </div>
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
