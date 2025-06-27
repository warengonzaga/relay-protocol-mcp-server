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
  async getTokenPrice(chainId: number, address: string): Promise<TokenPrice> {
    const response = await this.client.get<TokenPrice>('/currencies/token/price', {
      params: { chainId, address }
    });
    return response.data;
  }

  /**
   * Get an executable quote for bridge, swap or call
   * https://docs.relay.link/references/api/get-quote
   */
  async getQuote(request: QuoteRequest): Promise<Quote> {
    const response = await this.client.post<Quote>('/quote', request);
    return response.data;
  }

  /**
   * Get execution status for a request (v2)
   * https://docs.relay.link/references/api/get-intents-status-v2
   */
  async getExecutionStatus(requestId: string): Promise<ExecutionStatus> {
    const response = await this.client.get<ExecutionStatus>('/intents/status/v2', {
      params: { requestId }
    });
    return response.data;
  }

  /**
   * Get all cross-chain transactions with filtering
   * https://docs.relay.link/references/api/get-requests
   */
  async getRequests(request: GetRequestsRequest = {}): Promise<GetRequestsResponse> {
    const response = await this.client.get<GetRequestsResponse>('/requests/v2', {
      params: request
    });
    return response.data;
  }

  /**
   * Notify backend about a transaction
   * https://docs.relay.link/references/api/transactions-index
   */
  async indexTransaction(request: TransactionIndexRequest): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/transactions/index', request);
    return response.data;
  }

  /**
   * Notify backend to index transfers, wraps and unwraps
   * https://docs.relay.link/references/api/transactions-single
   */
  async indexTransactionSingle(request: TransactionSingleRequest): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/transactions/single', request);
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
