/**
 * API Request Wrapper
 * 
 * Centralized API calls with:
 * - Automatic timeout (30s)
 * - Error handling
 * - Loading state management
 * - Retry logic
 */

const DEFAULT_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 2;

export interface ApiOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an API call with timeout and error handling
 */
export async function apiCall<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${retries} for ${url}`);
        // Wait before retry (exponential backoff)
        await sleep(Math.pow(2, attempt) * 1000);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            response.statusText
          );
        }

        // Parse JSON response
        const data = await response.json();
        
        // Check for application-level errors
        if (data.success === false) {
          throw new ApiError(
            data.error || 'Request failed',
            response.status
          );
        }

        return data as T;

      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new ApiError(
              `Request timeout after ${timeout / 1000}s. The server is taking longer than expected. Please try again.`
            );
          }
        }

        throw error;
      }

    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof ApiError) {
        if (error.status && error.status >= 400 && error.status < 500) {
          // Client errors (4xx) - don't retry
          throw error;
        }
      }

      // Continue to next retry
      if (attempt < retries) {
        console.warn(`⚠️ Request failed, retrying... (${attempt + 1}/${retries})`);
        continue;
      }
    }
  }

  // All retries failed
  throw lastError || new ApiError('Request failed after all retries');
}

/**
 * GET request
 */
export async function apiGet<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  return apiCall<T>(url, {
    ...options,
    method: 'GET'
  });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  url: string,
  data: any,
  options: ApiOptions = {}
): Promise<T> {
  return apiCall<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data)
  });
}

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  }
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Helper: Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * USAGE EXAMPLES:
 * 
 * // Simple GET request
 * const data = await apiGet('/api/data');
 * 
 * // GET with query params
 * const url = '/api/data' + buildQueryString({ id: 123, type: 'order' });
 * const data = await apiGet(url);
 * 
 * // POST request
 * const result = await apiPost('/api/save', { name: 'Test', value: 123 });
 * 
 * // With custom timeout
 * const data = await apiGet('/api/slow', { timeout: 60000 }); // 60s
 * 
 * // With error handling
 * try {
 *   const data = await apiGet('/api/data');
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error('API Error:', error.message, error.status);
 *   } else {
 *     console.error('Network Error:', error);
 *   }
 * }
 */
