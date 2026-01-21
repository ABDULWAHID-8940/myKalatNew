"use client";

import React, { useEffect, useState } from "react";
import { Edit, ImagePlusIcon, Loader2, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { authClient } from "@/lib/auth-client";

export default function EditBuissnesProfile({ user }: { user: any }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessSize, setBusinessSize] = useState("");
  const [onboarded, setOnboarded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setBio(user.bio || "");
    setLocation(user.location || "");
    setImage(user.image || "");
    setCoverImage(user.coverImage || "");
    setCompanyName(user.companyName || "");
    setIndustry(user.industry || "");
    setBusinessPhone(user.businessPhone || "");
    setBusinessSize(user.businessSize || "");
    setOnboarded(!!user.onboarded);
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authClient.updateUser({
        name,
        bio,
        location,
        image,
        coverImage,
        companyName,
        industry,
        businessPhone,
        businessSize,
        onboarded,
      });
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit size={16} />
          <span className="hidden sm:block">Edit profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-lg h-[90svh] sm:h-auto sm:max-h-[90vh] overflow-hidden [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Edit Business Profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your business profile here.
        </DialogDescription>
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          <ProfileBg
            coverImage={coverImage}
            setCoverImage={setCoverImage}
            disabled={isSaving}
          />
          <Avatar image={image} setImage={setImage} disabled={isSaving} />
          <div className="px-6 pt-4 pb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your business"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your location"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Your industry"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="Your business phone"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessSize">Business Size</Label>
                <Select
                  value={businessSize}
                  onValueChange={setBusinessSize}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboarded">Onboarded</Label>
                <Select
                  value={String(onboarded)}
                  onValueChange={(value) => setOnboarded(value === "true")}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileBg({
  coverImage,
  setCoverImage,
  disabled,
}: {
  coverImage: string;
  setCoverImage: (url: string) => void;
  disabled?: boolean;
}) {
  const uploadMutation = useCloudinaryUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadMutation.mutateAsync(file);
      setCoverImage(data.url);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const uploading = uploadMutation.isPending;

  return (
    <div className="h-24 sm:h-32">
      <div className="relative flex size-full items-center justify-center overflow-hidden bg-muted">
        {coverImage && (
          <img
            className="size-full object-cover"
            src={coverImage}
            alt="Cover image"
            width={512}
            height={96}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <label
            className={`z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
              uploading || disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Change cover image"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlusIcon size={16} aria-hidden="true" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
              disabled={uploading || disabled}
            />
          </label>
          {coverImage && (
            <button
              type="button"
              className={`z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                uploading || disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => setCoverImage("")}
              aria-label="Remove cover image"
              disabled={uploading || disabled}
            >
              <XIcon size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({
  image,
  setImage,
  disabled,
}: {
  image: string;
  setImage: (url: string) => void;
  disabled?: boolean;
}) {
  const uploadMutation = useCloudinaryUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadMutation.mutateAsync(file);
      setImage(data.url);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const uploading = uploadMutation.isPending;

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-xs shadow-black/10">
        {image && (
          <img
            src={image}
            className="size-full object-cover"
            width={80}
            height={80}
            alt="Profile image"
          />
        )}
        <label
          className={`absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
            uploading || disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Change profile picture"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlusIcon size={16} aria-hidden="true" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            disabled={uploading || disabled}
          />
        </label>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
