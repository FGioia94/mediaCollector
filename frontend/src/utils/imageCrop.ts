import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

export async function getCroppedImageDataUrl(
  imageSrc: string,
  crop: Area,
  outputSize = 512,
): Promise<string> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const sx = Math.max(0, Math.round(crop.x));
  const sy = Math.max(0, Math.round(crop.y));
  const sw = Math.max(1, Math.round(crop.width));
  const sh = Math.max(1, Math.round(crop.height));

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outputSize, outputSize);

  return canvas.toDataURL("image/jpeg", 0.92);
}
