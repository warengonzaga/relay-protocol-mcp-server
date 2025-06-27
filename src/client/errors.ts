/**
 * Custom error classes for the Relay Protocol API client.
 * 
 * These error classes provide structured error handling with detailed context
 * for debugging and user feedback. Each error type includes relevant data
 * to help diagnose issues with API requests.
 */

/**
 * Error thrown when the Relay Protocol API returns an HTTP error response.
 * 
 * This error includes the HTTP status code, response data from the API,
 * and the original request data for comprehensive debugging.
 * 
 * @class RelayAPIError
 * @extends Error
 */
export class RelayAPIError extends Error {
  /**
   * Creates a new RelayAPIError instance.
   * 
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code from the API response
   * @param {any} [responseData] - Response body from the API
   * @param {any} [requestData] - Original request data that caused the error
   */
  constructor(
    message: string,
    public statusCode: number,
    public responseData?: any,
    public requestData?: any
  ) {
    super(message);
    this.name = 'RelayAPIError';
  }

  /**
   * Serializes the error to JSON for logging and debugging.
   * 
   * @returns {Object} JSON representation of the error with all context
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      responseData: this.responseData,
      requestData: this.requestData,
    };
  }
}

/**
 * Error thrown when there are network connectivity issues.
 * 
 * This includes timeouts, DNS resolution failures, connection refused,
 * and other network-level problems that prevent reaching the API.
 * 
 * @class RelayConnectionError
 * @extends Error
 */
export class RelayConnectionError extends Error {
  /**
   * Creates a new RelayConnectionError instance.
   * 
   * @param {string} message - Human-readable error message describing the connection issue
   * @param {Error} [originalError] - The underlying error that caused the connection failure
   */
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'RelayConnectionError';
  }
}


