export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) {
    throw new Error("Please choose an image first.");
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error("Please choose a valid image file.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  return file;
}

export async function uploadImageToImgBB(file) {
  const image = validateImageFile(file);
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error("Image upload is not configured. Please contact support.");
  }

  const body = new FormData();
  body.append("image", image);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    { method: "POST", body }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success || !result?.data?.url) {
    throw new Error("Image upload failed. Please try another image.");
  }

  return String(result.data.url);
}
