import { api } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";

const artworkBucket = new Bucket("artwork-uploads", {
  public: false,
  versioned: false,
});

interface UploadUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface UploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
}

// Generate a signed upload URL for artwork files
export const getUploadUrl = api<UploadUrlRequest, UploadUrlResponse>(
  { expose: true, method: "POST", path: "/upload/url" },
  async (req) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
    if (!allowedTypes.includes(req.fileType)) {
      throw new Error("Invalid file type. Only JPEG, PNG, and SVG files are allowed.");
    }

    // Validate file size (10MB limit)
    if (req.fileSize > 10 * 1024 * 1024) {
      throw new Error("File size too large. Maximum size is 10MB.");
    }

    // Generate unique file key
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const fileExtension = req.fileName.split('.').pop();
    const fileKey = `${timestamp}-${randomSuffix}.${fileExtension}`;

    // Generate signed upload URL
    const { url } = await artworkBucket.signedUploadUrl(fileKey, {
      ttl: 3600, // 1 hour
    });

    return {
      uploadUrl: url,
      fileKey,
    };
  }
);

interface DownloadUrlRequest {
  fileKey: string;
}

interface DownloadUrlResponse {
  downloadUrl: string;
}

// Generate a signed download URL for artwork files
export const getDownloadUrl = api<DownloadUrlRequest, DownloadUrlResponse>(
  { expose: true, method: "POST", path: "/download/url" },
  async (req) => {
    const { url } = await artworkBucket.signedDownloadUrl(req.fileKey, {
      ttl: 3600, // 1 hour
    });

    return {
      downloadUrl: url,
    };
  }
);
