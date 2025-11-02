// File storage utilities using Supabase or S3-compatible storage

import { createClient } from "@supabase/supabase-js";
import { generateUniqueFilename } from "@/lib/utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const storage = {
  async uploadFile(
    file: File,
    folder: string,
    jobId: string
  ): Promise<{ key: string; url: string }> {
    if (!supabase) {
      // Fallback to local storage for development
      return {
        key: `local/${folder}/${generateUniqueFilename(file.name, jobId)}`,
        url: `/uploads/${folder}/${file.name}`,
      };
    }

    const fileName = generateUniqueFilename(file.name, jobId);
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("flowbench")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("flowbench")
      .getPublicUrl(filePath);

    return {
      key: filePath,
      url: urlData.publicUrl,
    };
  },

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    folder: string,
    jobId: string,
    mimeType: string
  ): Promise<{ key: string; url: string }> {
    if (!supabase) {
      // Fallback to local storage for development
      return {
        key: `local/${folder}/${generateUniqueFilename(fileName, jobId)}`,
        url: `/uploads/${folder}/${fileName}`,
      };
    }

    const uniqueFileName = generateUniqueFilename(fileName, jobId);
    const filePath = `${folder}/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from("flowbench")
      .upload(filePath, buffer, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload buffer: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("flowbench")
      .getPublicUrl(filePath);

    return {
      key: filePath,
      url: urlData.publicUrl,
    };
  },

  async downloadFile(key: string): Promise<Blob> {
    if (!supabase) {
      throw new Error("Storage not configured");
    }

    const { data, error } = await supabase.storage
      .from("flowbench")
      .download(key);

    if (error || !data) {
      throw new Error(`Failed to download file: ${error?.message}`);
    }

    return data;
  },

  async deleteFile(key: string): Promise<void> {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.storage.from("flowbench").remove([key]);

    if (error) {
      console.error(`Failed to delete file: ${error.message}`);
    }
  },

  async deleteFiles(keys: string[]): Promise<void> {
    if (!supabase || keys.length === 0) {
      return;
    }

    const { error } = await supabase.storage.from("flowbench").remove(keys);

    if (error) {
      console.error(`Failed to delete files: ${error.message}`);
    }
  },
};

// Helper to generate unique filenames
function generateUniqueFilename(
  originalName: string,
  prefix: string
): string {
  const ext = originalName.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}.${ext}`;
}

