"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import axios from "axios";

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

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  role: "influencer" | "business" | "admin";
  location: string;
  verified: boolean;
  socialMedia: SocialMedia;
  bio: string;
  price: number;
  companyName?: string | null;
  industry?: string | null;
  businessPhone?: string | null;
  businessSize?: "startup" | "small" | "medium" | "large" | null;
  businessVerified: boolean;
  onboarded: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  updateUser: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const parseSocialMedia = (socialMediaString: string): SocialMedia => {
    try {
      return JSON.parse(socialMediaString) as SocialMedia;
    } catch (error) {
      console.error("Error parsing social media data:", error);
      return {};
    }
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      const { data: session } = await authClient.getSession();

      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          emailVerified: session.user.emailVerified || false,
          image: session.user.image || "",
          createdAt: session.user.createdAt,
          updatedAt: session.user.updatedAt,
          role:
            session.user.role === "business"
              ? "business"
              : session.user.role === "admin"
                ? "admin"
                : "influencer",
          location: session.user.location || "Tecno, Ethiopia",
          verified: session.user.verified || false,
          socialMedia: parseSocialMedia(session.user.socialMedia || "{}"),
          bio: session.user.bio || "",
          price: session.user.price || 0,
          companyName: session.user.companyName ?? undefined,
          industry: session.user.industry ?? undefined,
          businessPhone: session.user.businessPhone ?? undefined,
          businessSize: session.user.businessSize
            ? (session.user.businessSize as
                | "startup"
                | "small"
                | "medium"
                | "large")
            : undefined,
          businessVerified: session.user.businessVerified || false,
          onboarded: session.user.onboarded || false,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      // Optimistic update
      setUser((prev) => ({
        ...prev!,
        ...updates,
      }));

      // Prepare updates for API
      const apiUpdates = {
        ...updates,
        ...(updates.socialMedia
          ? { socialMedia: JSON.stringify(updates.socialMedia) }
          : {}),
      };

      await axios.patch("/api/user/profile", apiUpdates);
    } catch (error) {
      console.error("Error updating user:", error);
      await refreshUser();
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
