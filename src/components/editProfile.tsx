"use client";

import React, { useState, useEffect } from "react";
import { ImagePlusIcon, XIcon, Edit } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { parseSocialMediaLinks } from "@/lib/socialMedia";

type SocialMediaLink = {
  platform: "instagram" | "tiktok" | "telegram";
  username: string;
  followers: string;
};

const ALLOWED_PLATFORMS: ReadonlySet<string> = new Set([
  "instagram",
  "tiktok",
  "telegram",
]);

export default function EditProfile({ user }: { user: any }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [socialMedia, setSocialMedia] = useState<SocialMediaLink[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setPrice(user.price || 0);
      setImage(user.image || "");
      setCoverImage(user.coverImage || "");
      setSocialMedia(
        parseSocialMediaLinks(user.socialMedia)
          .filter((s) => ALLOWED_PLATFORMS.has(s.platform))
          .map((s) => ({
            platform: s.platform as SocialMediaLink["platform"],
            username: s.username,
            followers: s.followers,
          })),
      );
    }
  }, [user]);

  const handleSocialChange = (
    index: number,
    field: keyof SocialMediaLink,
    value: string,
  ) => {
    const newSocials = [...socialMedia];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setSocialMedia(newSocials);
  };

  const addSocial = () => {
    setSocialMedia([
      ...socialMedia,
      { platform: "instagram", username: "", followers: "" },
    ]);
  };

  const removeSocial = (index: number) => {
    const newSocials = socialMedia.filter((_, i) => i !== index);
    setSocialMedia(newSocials);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authClient.updateUser({
        name,
        bio,
        location,
        price,
        image,
        coverImage,
        socialMedia: JSON.stringify(socialMedia),
      });
      // Optionally, refetch or show success
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
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here.
        </DialogDescription>
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          <ProfileBg coverImage={coverImage} setCoverImage={setCoverImage} />
          <Avatar image={image} setImage={setImage} />
          <div className="px-6 pt-4 pb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Average Price (Birr)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-4">
                <Label>Social Media</Label>
                {socialMedia.map((social, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <select
                      value={social.platform}
                      onChange={(e) =>
                        handleSocialChange(index, "platform", e.target.value)
                      }
                      className="p-2 border rounded-md bg-background"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="telegram">Telegram</option>
                    </select>
                    <Input
                      placeholder="Username"
                      value={social.username}
                      onChange={(e) =>
                        handleSocialChange(index, "username", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Followers"
                      value={social.followers}
                      onChange={(e) =>
                        handleSocialChange(index, "followers", e.target.value)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSocial(index)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addSocial}>
                  Add Social Media
                </Button>
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
}: {
  coverImage: string;
  setCoverImage: (url: string) => void;
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
            className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label="Change cover image"
          >
            <ImagePlusIcon size={16} aria-hidden="true" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
              disabled={uploadMutation.isPending}
            />
          </label>
          {coverImage && (
            <button
              type="button"
              className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={() => setCoverImage("")}
              aria-label="Remove cover image"
            >
              <XIcon size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Avatar({
  image,
  setImage,
}: {
  image: string;
  setImage: (url: string) => void;
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
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label="Change profile picture"
        >
          <ImagePlusIcon size={16} aria-hidden="true" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            disabled={uploadMutation.isPending}
          />
        </label>
      </div>
    </div>
  );
}
