import { apiFetch } from "@/lib/api/client";

export type UploadResult = {
  url: string;
  secureUrl?: string;
  publicId?: string;
};

export async function uploadAdminFile(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  const result = await apiFetch<UploadResult | { data: UploadResult }>(
    "/admin/uploads",
    {
      method: "POST",
      token,
      body: form,
    },
  );

  if ("url" in result) return result;
  if ("data" in result && result.data?.url) return result.data;
  throw new Error("Upload response did not include a url");
}
