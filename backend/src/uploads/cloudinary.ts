import { v2 as cloudinary } from "cloudinary";

export type UploadConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

const UPLOAD_FOLDER = "jobfinder";

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getUploadConfig(): UploadConfig | null {
  const cloudName = readEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = readEnv("CLOUDINARY_API_KEY");
  const apiSecret = readEnv("CLOUDINARY_API_SECRET");
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function isUploadsConfigured(): boolean {
  return getUploadConfig() !== null;
}

export async function uploadImage(bytes: Uint8Array, contentType: string): Promise<string> {
  const config = getUploadConfig();
  if (!config) throw new Error("Uploads are not configured");

  const dataUri = `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    folder: UPLOAD_FOLDER,
    resource_type: "image",
  });

  return result.secure_url;
}
