import axios, { AxiosInstance, AxiosError } from 'axios';
import { RelayAPIError, RelayConnectionError } from './errors.js';
import type {
  ChainsResponse,
  TokenPrice,
  QuoteRequest,
  Quote,
  ExecutionStatus,
  CrossChainRequest,
  MultiInputQuoteRequest,
  TransactionIndexRequest,
  CurrenciesV2Request,
  CurrencyV2,
  SwapMultiInputRequest,
  SwapResponse,
} from '../types/relay.js';

export class RelayClient {
  private client: AxiosInstance;

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

  private setupInterceptors(): void {
    // Request interceptor - removed logging to avoid stdout pollution in MCP
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new RelayConnectionError('Request timed out', error);
        }

        if (!error.response) {
          throw new RelayConnectionError('Network error - no response received', error);
        }

        const errorMessage = 
          (error.response.data as any)?.message || 
          (error.response.data as any)?.error || 
          `HTTP ${error.response.status} error`;

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
   * Get all supported chains
   * https://docs.relay.link/references/api/get-chains
   */
  async getChains(includeChains?: string): Promise<ChainsResponse> {
    const params = includeChains ? { includeChains } : {};
    const response = await this.client.get<ChainsResponse>('/chains', { params });
    return response.data;
  }

  /**
   * Get token price for a specific chain and currency
   * https://docs.relay.link/references/api/get-token-price
   */
  async getTokenPrice(chainId: number, currency: string): Promise<TokenPrice> {
    const response = await this.client.get<TokenPrice>('/price', {
      params: { chain: chainId, currency }
    });
    return response.data;
  }

  /**
   * Get an executable quote for bridge, swap or call
   * https://docs.relay.link/references/api/get-quote
   */
  async getQuote(request: QuoteRequest): Promise<Quote> {
    const response = await this.client.get<Quote>('/quote', {
      params: request
    });
    return response.data;
  }

  /**
   * Get execution status for a request
   * https://docs.relay.link/references/api/get-execution-status
   */
  async getExecutionStatus(requestId: string): Promise<ExecutionStatus> {
    const response = await this.client.get<ExecutionStatus>(`/requests/${requestId}/status`);
    return response.data;
  }

  /**
   * Get cross-chain request details
   * https://docs.relay.link/references/api/get-request
   */
  async getRequest(requestId: string): Promise<CrossChainRequest> {
    const response = await this.client.get<CrossChainRequest>(`/requests/${requestId}`);
    return response.data;
  }

  /**
   * Notify backend about a transaction
   * https://docs.relay.link/references/api/transactions-index
   */
  async indexTransaction(request: TransactionIndexRequest): Promise<{ success: boolean }> {
    const response = await this.client.post<{ success: boolean }>('/transactions', request);
    return response.data;
  }

  /**
   * Get multi-input quote for swapping tokens from multiple origin chains
   * https://docs.relay.link/references/api/multi-input-quote
   */
  async getMultiInputQuote(request: MultiInputQuoteRequest): Promise<Quote> {
    const response = await this.client.post<Quote>('/quote/multi-input', request);
    return response.data;
  }

  /**
   * Get currencies metadata from curated list
   * https://docs.relay.link/references/api/get-currencies-v2
   */
  async getCurrencies(request: CurrenciesV2Request = {}): Promise<CurrencyV2[]> {
    const response = await this.client.post<CurrencyV2[]>('/currencies/v2', request);
    return response.data;
  }

  /**
   * Get executable quote for swapping tokens from multiple origin chains
   * https://docs.relay.link/references/api/swap-multi-input
   */
  async swapMultiInput(request: SwapMultiInputRequest): Promise<SwapResponse> {
    const response = await this.client.post<SwapResponse>('/execute/swap/multi-input', request);
    return response.data;
  }
}
