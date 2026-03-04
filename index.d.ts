export interface OptimizeOptions {
  /**
   * Callback function to receive log messages.
   * @default () => {}
   */
  onLogs?: (log: string) => void
  /**
   * If true, only simulate optimization without making changes.
   * @default false
   */
  dryRun?: boolean
  /**
   * Output format for the optimized file (e.g., 'jpg', 'webp', 'mp4').
   */
  format?: string
  /**
   * Resize configuration (e.g., '50%', 'w960', 'h480', '100kB').
   */
  resize?: string
  /**
   * Use lossy compression.
   * @default false
   */
  losy?: boolean
  /**
   * Suppress output messages.
   * @default true
   */
  mute?: boolean
}

export interface OptimizeResult {
  /**
   * Size of the original file in bytes.
   */
  originalSize: number
  /**
   * Size of the optimized file in bytes.
   */
  optimizedSize: number
}

export interface DirOptions extends OptimizeOptions {}

export interface DirResult extends OptimizeResult {
  /**
   * Total bytes saved from optimization.
   */
  savings: number
}

/**
 * Optimize a single file (image or video).
 *
 * @param filePath - Path to the file to optimize
 * @param options - Optimization options
 * @returns Promise resolving to optimization result
 *
 * @example
 * ```typescript
 * import { file } from 'optimo';
 *
 * const result = await file('image.jpg', { format: 'webp' });
 * console.log(`Saved ${result.originalSize - result.optimizedSize} bytes`);
 * ```
 */
export function file(filePath: string, options?: OptimizeOptions): Promise<OptimizeResult>

/**
 * Optimize all media files in a directory recursively.
 *
 * @param folderPath - Path to the directory
 * @param options - Optimization options
 * @returns Promise resolving to directory optimization result
 *
 * @example
 * ```typescript
 * import { dir } from 'optimo';
 *
 * const result = await dir('./images', { format: 'webp', losy: true });
 * console.log(`Total savings: ${result.savings} bytes`);
 * ```
 */
export function dir(folderPath: string, options?: DirOptions): Promise<DirResult>

/**
 * Format bytes to human-readable string.
 *
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "1.5 MB")
 *
 * @example
 * ```typescript
 * import { formatBytes } from 'optimo';
 *
 * console.log(formatBytes(1024 * 1024)); // "1 MB"
 * ```
 */
export function formatBytes(bytes: number, decimals?: number): string
