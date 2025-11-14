// Cloudinary video URL service
// Cloud Name: dthuqyxmv
// Note: Videos have Cloudinary auto-generated IDs (e.g., _hecw6c) appended to filenames

import { CLOUDINARY_VIDEO_IDS } from '../data/cloudinaryVideoIds';

const CLOUDINARY_CLOUD_NAME = 'dthuqyxmv';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;

/**
 * Get Cloudinary video URL using the mapped video IDs
 * @param path - Path to video (e.g., "exercise-demo-videos/ACL/Straight_Leg_Raises.mp4")
 * @returns Full Cloudinary URL with optimizations
 */
export const getCloudinaryVideoUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.replace(/^\//, '');
  
  // Convert the path to the expected format and look up the ID
  const pathWithoutExtension = cleanPath.replace(/\.(mp4|mov|webm)$/i, '');
  const cloudinaryId = CLOUDINARY_VIDEO_IDS[pathWithoutExtension];
  
  if (!cloudinaryId) {
    console.warn(`⚠️ No Cloudinary ID found for: ${pathWithoutExtension}`);
    console.warn('Available paths:', Object.keys(CLOUDINARY_VIDEO_IDS));
    // Fallback to original path (won't work but helps debugging)
    return `${CLOUDINARY_BASE_URL}/q_auto,f_auto/${cleanPath}`;
  }
  
  // Return the Cloudinary URL with the actual video ID
  return `${CLOUDINARY_BASE_URL}/q_auto,f_auto/${cloudinaryId}.mp4`;
};

/**
 * Get Cloudinary video URL with specific transformations
 * @param path - Path to video
 * @param options - Transformation options
 * @returns Optimized video URL
 */
export const getCloudinaryVideoUrlWithOptions = (
  path: string,
  options?: {
    quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
    width?: number;
    height?: number;
    format?: 'mp4' | 'webm';
  }
): string => {
  const cleanPath = path.replace(/^\//, '');
  
  const transformations = [];
  
  if (options?.quality) {
    transformations.push(`q_${options.quality}`);
  } else {
    transformations.push('q_auto');
  }
  
  if (options?.width) {
    transformations.push(`w_${options.width}`);
  }
  
  if (options?.height) {
    transformations.push(`h_${options.height}`);
  }
  
  if (options?.format) {
    transformations.push(`f_${options.format}`);
  } else {
    transformations.push('f_auto');
  }
  
  const transformString = transformations.join(',');
  
  return `${CLOUDINARY_BASE_URL}/${transformString}/${cleanPath}`;
};

/**
 * Convert local video path to Cloudinary path
 * @param localPath - Local path (e.g., "/exercise-demo-videos/ACL/video.mp4")
 * @returns Cloudinary-compatible path
 */
export const convertToCloudinaryPath = (localPath: string): string => {
  // Remove /public/ prefix if present
  let path = localPath.replace(/^\/public\//, '');
  
  // Remove leading slash
  path = path.replace(/^\//, '');
  
  // Replace spaces with underscores (Cloudinary convention)
  path = path.replace(/ /g, '_');
  
  // Remove file extension (Cloudinary handles this)
  path = path.replace(/\.(mp4|mov|webm)$/i, '');
  
  return path;
};

export default {
  getCloudinaryVideoUrl,
  getCloudinaryVideoUrlWithOptions,
  convertToCloudinaryPath,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_BASE_URL
};
