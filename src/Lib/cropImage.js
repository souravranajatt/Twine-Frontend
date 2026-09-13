/**
 * Creates an Image object from a URL or Data URI
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Converts degree to radian
 * @param {number} degree
 * @returns {number}
 */
export function getRadianAngle(degree) {
  return (degree * Math.PI) / 180;
}

/**
 * Returns the cropped image as a Base64 Data URL
 * @param {string} imageSrc - Source URL or Data URI of image
 * @param {Object} pixelCrop - Pixel crop rectangle { x, y, width, height }
 * @param {number} rotation - Rotation angle in degrees
 * @returns {Promise<string>} - Base64 Data URL (image/jpeg)
 */
export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of rotated image
  const { width: bBoxWidth, height: bBoxHeight } = calculateRotatedDimensions(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas context to center point on canvas
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  // Create final canvas for the cropped area
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Cropped canvas 2D context not available');
  }

  // Set cropped canvas size to matching pixelCrop
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped portion from the rotated canvas onto the target canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return as Base64 Data URL (image/jpeg for optimal compatibility with Twine backend & Cloudinary)
  return croppedCanvas.toDataURL('image/jpeg', 0.92);
}

function calculateRotatedDimensions(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}
