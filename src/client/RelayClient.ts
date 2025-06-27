/**
 * HTTP client for interacting with the Relay Protocol REST API.
 * 
 * This client provides typed methods for all Relay Protocol API endpoints,
 * including cross-chain bridging, token swapping, price queries, and transaction
 * monitoring. It handles authentication, error processing, and request/response
 * transformation.
 * 
 * Features:
 * - Automatic error handling and transformation
 * - Request/response interceptors for debugging
 * - Configurable timeouts and base URLs
 * - Full TypeScript support with response typing
 * 
 * @see https://docs.relay.link/references/api/ - Official API documentation
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { RelayAPIError, RelayConnectionError } from './errors.js';
import type {
  ChainsResponse,
  TokenPrice,
  QuoteRequest,
  Quote,
  ExecutionStatus,
  GetRequestsRequest,
  GetRequestsResponse,
  TransactionIndexRequest,
  TransactionSingleRequest,
  CurrenciesV2Request,
  CurrencyV2,
  SwapMultiInputRequest,
  SwapResponse,
} from '../types/relay.js';

/**
 * Main HTTP client for the Relay Protocol API.
 * 
 * This class encapsulates all communication with the Relay Protocol REST API,
 * providing typed methods for each endpoint with proper error handling and
 * request/response transformation.
 * 
 * @class RelayClient
 */
export class RelayClient {
  /** Axios HTTP client instance configured for Relay Protocol API */
  private client: AxiosInstance;

  /**
   * Creates a new RelayClient instance.
   * 
   * Initializes the HTTP client with the specified base URL and timeout,
   * sets up default headers, and configures request/response interceptors
   * for error handling and debugging.
   * 
   * @param {string} baseUrl - Base URL for the Relay Protocol API (e.g., 'https://api.relay.link')
   * @param {number} [timeout=30000] - Request timeout in milliseconds
   */
  constructor(baseUrl: string, timeout: number = 30000) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Sets up Axios interceptors for request/response processing.
   * 
   * Request interceptor: Currently passes requests through unchanged.
   * Could be extended for authentication, request logging, etc.
   * 
   * Response interceptor: Handles errors and transforms them into
   * appropriate custom error types (RelayAPIError, RelayConnectionError).
   * 
   * @private
   */
  private setupInterceptors(): void {
    // Request interceptor - currently unused but available for future enhancements
    // Note: Logging is intentionally omitted to avoid stdout pollution in MCP
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for comprehensive error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle timeout and connection errors
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new RelayConnectionError('Request timed out', error);
        }

        // Handle network connectivity issues
        if (!error.response) {
          throw new RelayConnectionError('Network error - no response received', error);
        }

        // Extract error message from API response
        const errorMessage = 
          (error.response.data as any)?.message || 
          (error.response.data as any)?.error || 
          `HTTP ${error.response.status} error`;

        // Transform API errors into structured RelayAPIError
        throw new RelayAPIError(
          errorMessage,
          error.response.status,
          error.response.data,
          error.config?.data
        );
      }
    );
  }

  /**
   * Get all supported blockchain chains for cross-chain operations.
   * 
   * Returns detailed information about each supported blockchain including
   * RPC URLs, block explorers, native currencies, supported tokens, and
   * contract addresses for cross-chain operations.
   * 
   * @param {string} [includeChains] - Optional comma-separated list of chain IDs to filter results
   * @returns {Promise<ChainsResponse>} Complete chain information for supported networks
   * @throws {RelayAPIError} When the API returns an error response
   * @throws {RelayConnectionError} When network connectivity issues occur
   * 
   * @see https://docs.relay.link/references/api/get-chains - API documentation
   * 
   * @example
   * ```typescript
   * // Get all supported chains
   * const allChains = await client.getChains();
   * 
   * // Get specific chains only
   * const ethAndPolygon = await client.getChains('1,137');
   * ```
   */
  async getChains(includeChains?: string): Promise<ChainsResponse> {
    const params = includeChains ? { includeChains } : {};
    const response = await this.client.get<ChainsResponse>('/chains', { params });
    return response.data;
  }

  /**
   * Get the current market price for a specific token on a blockchain.
   * 
   * Returns real-time pricing information for any supported token.
   * Useful for calculating transaction values before bridging or swapping.
   * 
   * @param {number} chainId - The blockchain network ID where the token exists
   * @param {string} address - The token contract address (must be checksummed)
   * @returns {Promise<TokenPrice>} Current price data with timestamp
   * @throws {RelayAPIError} When the token is not found or API error occurs
   * @throws {RelayConnectionError} When network connectivity issues occur
   * 
   * @see https://docs.relay.link/references/api/get-token-price - API documentation
   * 
   * @example
   * ```typescript
   * // Get USDC price on Ethereum
   * const usdcPrice = await client.getTokenPrice(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
   * 
   * // Get WETH price on Optimism
   * const wethPrice = await client.getTokenPrice(10, '0x4200000000000000000000000000000000000006');
   * ```
   */
  async getTokenPrice(chainId: number, address: string): Promise<TokenPrice> {
    const response = await this.client.get<TokenPrice>('/currencies/token/price', {
      params: { chainId, address }
    });
    return response.data;
  }

  /**
   * Get an executable quote for bridging tokens between chains or swapping within a chain.
   * 
   * Returns a complete quote with transaction steps, fee breakdown, and execution details.
   * The quote includes all necessary transaction data to execute the bridge or swap.
   * 
   * @param {QuoteRequest} request - Quote parameters including chains, tokens, amounts, and addresses
   * @returns {Promise<Quote>} Executable quote with transaction steps and fee information
   * @throws {RelayAPIError} When parameters are invalid or no route is available
   * @throws {RelayConnectionError} When network connectivity issues occur
   * 
   * @see https://docs.relay.link/references/api/get-quote - API documentation
   * 
   * @example
   * ```typescript
   * // Bridge USDC from Ethereum to Optimism
   * const quote = await client.getQuote({
   *   user: '0x742d35Cc6AbC5A1c7F2Cb4a5c5b3Bc1234567890',
   *   originChainId: 1,
   *   destinationChainId: 10,
   *   originCurrency: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
   *   destinationCurrency: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
   *   amount: '1000000', // 1 USDC (6 decimals)
   *   tradeType: 'EXACT_INPUT'
   * });
   * ```
   */
  async getQuote(request: QuoteRequest): Promise<Quote> {
    const response = await this.client.post<Quote>('/quote', request);
    return response.data;
  }

  /**
   * Get the current execution status of a cross-chain request.
   * 
   * Monitors the progress of a previously submitted cross-chain transaction,
   * providing real-time status updates, transaction hashes, and execution details.
   * 
   * @param {string} requestId - The unique identifier for the cross-chain request to monitor
   * @returns {Promise<ExecutionStatus>} Current status with transaction details and progress
   * @throws {RelayAPIError} When the request ID is invalid or API error occurs
   * @throws {RelayConnectionError} When network connectivity issues occur
   * 
   * @see https://docs.relay.link/references/api/get-intents-status-v2 - API documentation
   * 
   * @example
   * ```typescript
   * // Monitor a cross-chain request
   * const status = await client.getExecutionStatus('0x1234567890abcdef...');
   * 
   * // Check if transaction completed successfully
   * if (status.status === 'success') {
   *   console.log('Transaction completed:', status.txHashes);
   * }
   * ```
   */
  async getExecutionStatus(requestId: string): Promise<ExecutionStatus> {
    const response = await this.client.get<ExecutionStatus>('/intents/status/v2', {
      params: { requestId }
    });
    return response.data;
  }

  /**
   * Get paginated list of cross-chain transactions with advanced filtering.
   * 
   * Retrieves historical cross-chain requests with support for filtering by
   * user address, chain IDs, time ranges, transaction hashes, and more.
   * Includes pagination for handling large datasets.
   * 
   * @param {GetRequestsRequest} [request={}] - Filter and pagination parameters
   * @returns {Promise<GetRequestsResponse>} Paginated list of cross-chain requests
   * @throws {RelayAPIError} When filter parameters are invalid or API error occurs
   * @throws {RelayConnectionError} When network connectivity issues occur
   * 
   * @see https://docs.relay.link/references/api/get-requests - API documentation
   * 
   * @example
   * ```typescript
   * // Get recent requests for a specific user
   * const userRequests = await client.getRequests({
   *   user: '0x742d35Cc6AbC5A1c7F2Cb4a5c5b3Bc1234567890',
   *   limit: 10,
   *   sortBy: 'createdAt',
   *   sortDirection: 'desc'
   * });
   * 
   * // Get requests between Ethereum and Polygon
   * const ethPolygonRequests = await client.getRequests({
   *   originChainId: 1,
   *   destinationChainId: 137,
   *   limit: 20
   * });
   * ```
   */
  async getRequests(request: GetRequestsRequest = {}): Promise<GetRequestsResponse> {
    const response = await this.client.get<GetRequestsResponse>('/requests/v2', {
      params: request
    });
    return response.data;
  }

  /**
   * Notify the Relay backend about a transaction for indexing and tracking.
   * 
   * Registers a transaction with the Relay system to enable proper status monitoring
   * and request linking. Should be called after executing transactions from quotes.
   * 
   * @param {TransactionIndexRequest} request - Transaction details for indexing
   * @returns {Promise<{message: string}>} Confirmation message from the API
   * @throws {RelayAPIError} When transaction data is invalid or API error occurs
   * @throws {RelayConnectionError} When network connectivity issues occur
   * 
   * @see https://docs.relay.link/references/api/transactions-index - API documentation
   * 
   * @example
   * ```typescript
   * // Index a transaction after execution
   * const result = await client.indexTransaction({
   *   txHash: '0xabcdef1234567890...',
   *   chainId: '1',
   *   requestId: '0x1234567890abcdef...' // Optional, from quote response
   * });
   * ```
   */
  async indexTransaction(request: TransactionIndexRequest): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/transactions/index', request);
    return response.data;
  }

  /**
   * Notify the backend to index transfers, wraps, and unwraps for a specific transaction.
   * 
   * Used for indexing specific operations within a transaction, particularly
   * for tracking wrap/unwrap operations and transfer events.
   * 
   * @param {TransactionSingleRequest} request - Transaction and request details for indexing
   * @returns {Promise<{message: string}>} Confirmation message from the API
   * @throws {RelayAPIError} When transaction data is invalid or API error occurs
   * @throws {RelayConnectionError} When network connectivity issues occur
   * 
   * @see https://docs.relay.link/references/api/transactions-single - API documentation
   * 
   * @example
   * ```typescript
   * // Index specific transfers within a transaction
   * const result = await client.indexTransactionSingle({
   *   requestId: '0x1234567890abcdef...',
   *   chainId: '1',
   *   tx: '0xabcdef1234567890...'
   * });
   * ```
   */
  async indexTransactionSingle(request: TransactionSingleRequest): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/transactions/single', request);
    return response.data;
  }

  /**
   * Get curated currency metadata with advanced filtering capabilities.
   * 
   * Retrieves comprehensive information about supported tokens across all chains,
   * with powerful filtering options for finding specific currencies by symbol,
   * address, chain, verification status, and more.
   * 
   * @param {CurrenciesV2Request} [request={}] - Filter parameters for currency search
   * @returns {Promise<CurrencyV2[]>} Array of currency metadata matching the filters
   * @throws {RelayAPIError} When filter parameters are invalid or API error occurs
   * @throws {RelayConnectionError} When network connectivity issues occur
   * 
   * @see https://docs.relay.link/references/api/get-currencies-v2 - API documentation
   * 
   * @example
   * ```typescript
   * // Find USDC on all supported chains
   * const usdcTokens = await client.getCurrencies({
   *   term: 'usdc',
   *   verified: true,
   *   limit: 10
   * });
   * 
   * // Get all verified tokens on Ethereum
   * const ethTokens = await client.getCurrencies({
   *   chainIds: [1],
   *   verified: true,
   *   defaultList: true
   * });
   * 
   * // Search by specific contract address
   * const tokenInfo = await client.getCurrencies({
   *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
   *   includeAllChains: true
   * });
   * ```
   */
  async getCurrencies(request: CurrenciesV2Request = {}): Promise<CurrencyV2[]> {
    const response = await this.client.post<CurrencyV2[]>('/currencies/v2', request);
    return response.data;
  }

  /**
   * Execute multi-chain token swaps from multiple origin chains to a single destination.
   * 
   * Enables complex swapping scenarios where tokens from multiple source chains
   * are aggregated and swapped to a single destination token. Returns executable
   * transaction steps and comprehensive fee breakdown.
   * 
   * @param {SwapMultiInputRequest} request - Multi-chain swap parameters and configuration
   * @returns {Promise<SwapResponse>} Executable swap quote with transaction steps and detailed fees
   * @throws {RelayAPIError} When swap parameters are invalid or no route is available
   * @throws {RelayConnectionError} When network connectivity issues occur
   * 
   * @see https://docs.relay.link/references/api/swap-multi-input - API documentation
   * 
   * @example
   * ```typescript
   * // Swap USDC from Ethereum and Polygon to USDC on Base
   * const swapResult = await client.swapMultiInput({
   *   user: '0x742d35Cc6AbC5A1c7F2Cb4a5c5b3Bc1234567890',
   *   origins: [
   *     {
   *       chainId: 1,
   *       currency: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
   *       amount: '500000000' // 500 USDC
   *     },
   *     {
   *       chainId: 137,
   *       currency: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
   *       amount: '300000000' // 300 USDC
   *     }
   *   ],
   *   destinationCurrency: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
   *   destinationChainId: 8453,
   *   tradeType: 'EXACT_INPUT'
   * });
   * ```
   */
  async swapMultiInput(request: SwapMultiInputRequest): Promise<SwapResponse> {
    const response = await this.client.post<SwapResponse>('/execute/swap/multi-input', request);
    return response.data;
  }
}
