import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

export function useCloudinaryUpload() {
  return useMutation<CloudinaryUploadResult, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || "Upload failed");
      }

      return json as CloudinaryUploadResult;
    },
    onError: (e) => toast.error(e.message || "Upload failed"),
  });
}
