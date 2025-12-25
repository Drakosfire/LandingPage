/**
 * Test utilities for mocking API calls
 */

/**
 * Mocks a successful generation API response
 * @param data - Response data to return
 * @param delay - Optional delay in milliseconds
 */
export const mockGenerationSuccess = (data: unknown, delay: number = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data })
      } as Response);
    }, delay);
  });
};

/**
 * Mocks a failed generation API response
 * @param status - HTTP status code
 * @param message - Error message
 * @param delay - Optional delay in milliseconds
 */
export const mockGenerationError = (
  status: number,
  message: string,
  delay: number = 0
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: false,
        status,
        json: async () => ({ detail: message })
      } as Response);
    }, delay);
  });
};

/**
 * Mocks a network error (fetch failure)
 */
export const mockNetworkError = () => {
  return Promise.reject(new Error('Network error'));
};

/**
 * Mocks a timeout (no response)
 */
export const mockTimeout = () => {
  return new Promise(() => {
    // Never resolves
  });
};

/**
 * Sets up global fetch mock
 */
export const setupFetchMock = () => {
  const originalFetch = global.fetch;
  
  beforeAll(() => {
    global.fetch = jest.fn();
  });
  
  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });
  
  afterAll(() => {
    global.fetch = originalFetch;
  });
  
  return global.fetch as jest.Mock;
};

