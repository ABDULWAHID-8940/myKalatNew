export interface ApiResponse<T> {
  status: string;
  message: string;
  meta?: { total: number; totalPages: number };
  data: T;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface IJob {
  _id: string;
  title: string;
  description: string;
  price: number;
  location?: string;
  socialMedia: {
    platform: "instagram" | "youtube" | "tiktok" | "telegram";
  }[];
  postedBy: string;
  status: "open" | "in-progress" | "completed" | "cancelled";
  statusInPercent?: number; // Percentage of job completion
  goalId: string; // Reference to associated goal
  goalContributionPercent?: number; // Percentage contribution to the goal
  hiredInfluencers: string[]; // Array of hired influencers
  proposalsSubmitted: {
    proposal: string;
    influencer: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Ipro {
  _id: string;
  jobId: IJob;
  influencerId: {
    _id: string;
    name: string;
    image?: string;
  };
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role?: string;
  coverImage?: string;
  location?: string;
  socialMedia?: string;
  verified?: boolean;
  rating?: number;
  totalEarnings?: number;
  bio?: string;
  price?: number;
  companyName?: string;
  goals?: string[];
  industry?: string;
  businessPhone?: string;
  businessSize?: "startup" | "small" | "medium" | "large";
  businessVerified?: boolean;
  onboarded?: boolean;
  savedJobs?: string[];
}
