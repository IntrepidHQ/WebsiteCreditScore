/** Supabase Storage bucket id (create via migration / dashboard). */
export const DATAROOM_BUCKET = "dataroom";

/** Per-file upload cap (Supabase free tier file limit is often 50MB; we stay conservative). */
export const DATAROOM_MAX_FILE_BYTES = 5 * 1024 * 1024;

export const DATAROOM_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
