/**
 * TypeScript type definitions for the Relay Protocol API
 * 
 * This module contains comprehensive type definitions for all data structures
 * used in the Relay Protocol ecosystem, including chains, currencies, transactions,
 * quotes, and execution responses. These types ensure type safety throughout
 * the MCP server implementation.
 * 
 * The types mirror the Relay Protocol REST API specification and provide
 * compile-time validation for all API interactions.
 * 
 * @module types/relay
 */

/**
 * Represents a basic currency/token within the Relay Protocol ecosystem.
 * Used for simple currency listings and basic token information.
 */
export interface Currency {
  /** Unique identifier for the currency */
  id: string;
  /** Token symbol (e.g., 'USDC', 'ETH') */
  symbol: string;
  /** Full token name (e.g., 'USD Coin', 'Ethereum') */
  name: string;
  /** Contract address for ERC-20 tokens, zero address for native tokens */
  address: string;
  /** Number of decimal places for token amounts */
  decimals: number;
  /** Whether this token supports cross-chain bridging */
  supportsBridging: boolean;
}

/**
 * Extended currency information for featured/promoted tokens.
 * Includes additional metadata like logos for enhanced user experience.
 */
export interface FeaturedToken {
  /** Unique identifier for the currency */
  id: string;
  /** Token symbol (e.g., 'USDC', 'ETH') */
  symbol: string;
  /** Full token name (e.g., 'USD Coin', 'Ethereum') */
  name: string;
  /** Contract address for ERC-20 tokens, zero address for native tokens */
  address: string;
  /** Number of decimal places for token amounts */
  decimals: number;
  /** Whether this token supports cross-chain bridging */
  supportsBridging: boolean;
  /** Additional metadata for featured tokens */
  metadata: {
    /** URL to the token's logo image */
    logoURI: string;
  };
}

/**
 * Comprehensive ERC-20 token information with bridging details.
 * Includes fee information and advanced features like permit support.
 */
export interface ERC20Currency {
  /** Unique identifier for the currency */
  id: string;
  /** Token symbol (e.g., 'USDC', 'ETH') */
  symbol: string;
  /** Full token name (e.g., 'USD Coin', 'Ethereum') */
  name: string;
  /** Contract address for ERC-20 tokens, zero address for native tokens */
  address: string;
  /** Number of decimal places for token amounts */
  decimals: number;
  /** Whether this token supports cross-chain bridging */
  supportsBridging: boolean;
  /** Whether the token supports EIP-2612 permit for gasless approvals */
  supportsPermit?: boolean;
  /** Fee charged when withdrawing this token (in basis points) */
  withdrawalFee: number;
  /** Fee charged when depositing this token (in basis points) */
  depositFee: number;
  /** Whether surge pricing is enabled for this token during high demand */
  surgeEnabled: boolean;
}

/**
 * Smart contract addresses deployed on a specific chain.
 * These contracts enable Relay Protocol functionality including bridging and execution.
 */
export interface ChainContracts {
  /** Multicall3 contract for batching multiple calls */
  multicall3: string;
  /** Relay-specific multicaller contract */
  multicaller: string;
  /** Owner-restricted multicaller contract */
  onlyOwnerMulticaller: string;
  /** Contract that receives bridged assets and executes calls */
  relayReceiver: string;
  /** Router contract for ERC-20 token operations */
  erc20Router: string;
  /** Proxy contract for token approvals */
  approvalProxy: string;
}

/**
 * Blockchain network information supported by Relay Protocol.
 * Contains network metadata and deployed contract addresses.
 */
export interface Chain {
  /** Chain ID as defined in EIP-155 (e.g., 1 for Ethereum, 137 for Polygon) */
  id: number;
  /** Technical name of the chain (e.g., 'ethereum', 'polygon') */
  name: string;
  /** Human-readable display name (e.g., 'Ethereum', 'Polygon') */
  displayName: string;
  /** HTTP RPC endpoint URL for connecting to the chain */
  httpRpcUrl: string;
  /** WebSocket RPC endpoint URL for real-time connection */
  wsRpcUrl: string;
  /** Base URL for the blockchain explorer */
  explorerUrl: string;
  /** Name of the blockchain explorer (e.g., 'Etherscan', 'Polygonscan') */
  explorerName: string;
  /** Optional custom paths for explorer URLs */
  explorerPaths?: {
    /** Path template for transaction URLs */
    transaction: string;
  };
  /** Whether deposits to this chain are enabled */
  depositEnabled: boolean;
  /** Level of token support on this chain */
  tokenSupport: string;
  /** Whether this chain is currently disabled */
  disabled: boolean;
  /** Limit for partial disable functionality */
  partialDisableLimit: number;
  /** Whether block production is lagging behind expected times */
  blockProductionLagging: boolean;
  /** Native currency information for this chain */
  currency: Currency;
  /** Fee charged when withdrawing from this chain (in basis points) */
  withdrawalFee: number;
  /** Fee charged when depositing to this chain (in basis points) */
  depositFee: number;
  /** Whether surge pricing is enabled during high demand */
  surgeEnabled: boolean;
  /** List of featured/promoted tokens on this chain */
  featuredTokens: FeaturedToken[];
  /** Complete list of supported ERC-20 tokens on this chain */
  erc20Currencies: ERC20Currency[];
  /** URL for the chain's icon image */
  iconUrl: string;
  /** Optional URL for the chain's logo image */
  logoUrl?: string;
  /** Optional brand color for UI theming */
  brandColor?: string;
  /** Smart contract addresses deployed on this chain */
  contracts: ChainContracts;
  /** Virtual machine type (e.g., 'evm' for Ethereum Virtual Machine) */
  vmType: string;
  /** Optional query parameters for explorer URLs */
  explorerQueryParams?: Record<string, any>;
  /** Base chain ID for Layer 2 networks */
  baseChainId: number;
  /** Optional status message for chain health */
  statusMessage?: string;
  /** List of solver addresses for cross-chain operations */
  solverAddresses: string[];
  /** Tags for categorizing the chain */
  tags: string[];
}

/**
 * Response format for chain listing API endpoints.
 * Contains an array of all supported blockchain networks.
 */
export interface ChainsResponse {
  /** Array of supported blockchain networks */
  chains: Chain[];
}

/**
 * Basic token information for cross-chain operations.
 * Used in currency discovery and token listings.
 */
export interface Token {
  /** Chain ID where this token exists */
  chainId: number;
  /** Contract address of the token */
  address: string;
  /** Full name of the token */
  name: string;
  /** Symbol/ticker of the token */
  symbol: string;
  /** Number of decimal places */
  decimals: number;
  /** Optional URL for token logo image */
  logoUri?: string;
}

/**
 * Current price information for a token.
 * Includes timestamp for price freshness validation.
 */
export interface TokenPrice {
  /** Current price as a string to preserve precision */
  price: string;
  /** Currency denomination for the price (e.g., 'USD') */
  currency: string;
  /** Unix timestamp when price was last updated */
  timestamp: number;
}

/**
 * Request parameters for getting a bridging/swap quote.
 * Defines source and destination for cross-chain operations.
 */
export interface QuoteRequest {
  /** User wallet address */
  user: string;
  /** Optional recipient address (defaults to user) */
  recipient?: string;
  /** Source chain ID */
  originChainId: number;
  /** Destination chain ID */
  destinationChainId: number;
  /** Source token contract address */
  originCurrency: string;
  /** Destination token contract address */
  destinationCurrency: string;
  /** Amount to bridge/swap (in smallest unit) */
  amount: string;
  /** Type of trade execution */
  tradeType?: 'EXACT_INPUT' | 'EXACT_OUTPUT' | 'EXPECTED_OUTPUT';
}

/**
 * Individual step in a multi-step bridging/swap operation.
 * Each step represents a required action (transaction or signature).
 */
export interface QuoteStep {
  /** Unique identifier for this step */
  id: string;
  /** Action type description */
  action: string;
  /** Human-readable description of the step */
  description: string;
  /** Type of user interaction required */
  kind: 'transaction' | 'signature';
  /** Array of items within this step */
  items: StepItem[];
}

/**
 * Individual item within a quote step.
 * Contains the actual data needed for execution.
 */
export interface StepItem {
  /** Current status of this item */
  status: 'incomplete' | 'complete';
  /** Transaction or signature data if available */
  data?: TransactionData | SignatureData;
  /** Optional endpoint for checking item status */
  check?: {
    /** API endpoint URL */
    endpoint: string;
    /** HTTP method for the check */
    method: string;
  };
  /** Optional endpoint for posting completion data */
  post?: {
    /** API endpoint URL */
    endpoint: string;
    /** HTTP method for posting */
    method: string;
    /** Request body data */
    body: any;
  };
}

/**
 * Ethereum transaction data for executing bridging operations.
 * Contains all necessary fields for transaction submission.
 */
export interface TransactionData {
  /** Address sending the transaction */
  from: string;
  /** Address receiving the transaction */
  to: string;
  /** Transaction calldata */
  data: string;
  /** ETH value to send (in wei) */
  value: string;
  /** Maximum fee per gas (EIP-1559) */
  maxFeePerGas?: string;
  /** Maximum priority fee per gas (EIP-1559) */
  maxPriorityFeePerGas?: string;
  /** Chain ID for the transaction */
  chainId: number;
  /** Gas limit for the transaction */
  gas: number;
}

/**
 * Signature data for permit transactions and other signed messages.
 * Supports both EIP-191 and EIP-712 signature formats.
 */
export interface SignatureData {
  /** Type of signature format required */
  signatureKind: 'eip191' | 'eip712';
  /** Message to be signed */
  message: string;
  /** EIP-712 type definitions (required for eip712 signatures) */
  types?: any;
  /** EIP-712 domain separator (required for eip712 signatures) */
  domain?: any;
  /** Primary type name for EIP-712 signatures */
  primaryType?: string;
}

/**
 * Complete quote response for bridging/swap operations.
 * Contains execution steps, fee breakdown, and balance requirements.
 */
export interface Quote {
  /** Array of steps required to complete the operation */
  steps: QuoteStep[];
  /** Detailed fee breakdown for the operation */
  fees: {
    /** Gas fee for executing transactions */
    gas: string;
    /** Currency used for gas fee calculation */
    gasCurrency: string;
    /** Relayer fee amount */
    relayer: string;
    /** Gas fee for relayer operations */
    relayerGas: string;
    /** Service fee for relayer */
    relayerService: string;
    /** Currency for relayer fees */
    relayerCurrency: string;
  };
  /** Value and timing breakdown */
  breakdown: {
    /** Total value being transferred */
    value: string;
    /** Estimated time to complete (in seconds) */
    timeEstimate: number;
  };
  /** Balance information and requirements */
  balances: {
    /** User's current balance of the source token */
    userBalance: string;
    /** Required balance to execute the operation */
    requiredToSolve: string;
  };
}

/**
 * Execution status for a cross-chain request.
 * Tracks the current state and progress of operations.
 */
export interface ExecutionStatus {
  /** Current status of the execution */
  status: 'refund' | 'delayed' | 'waiting' | 'failure' | 'pending' | 'success';
  /** Additional status details if available */
  details?: string;
  /** Array of input transaction hashes */
  inTxHashes: string[];
  /** Array of output transaction hashes */
  txHashes: string[];
  /** Timestamp of last status update */
  time: number;
  /** Source chain ID */
  originChainId: number;
  /** Destination chain ID */
  destinationChainId: number;
}

/**
 * Request parameters for fetching cross-chain requests.
 * Supports filtering and pagination for request history.
 */
export interface GetRequestsRequest {
  /** Maximum number of requests to return */
  limit?: number;
  /** Pagination token for next page */
  continuation?: string;
  /** Filter by user address */
  user?: string;
  /** Filter by transaction hash */
  hash?: string;
  /** Filter by origin chain ID */
  originChainId?: number;
  /** Filter by destination chain ID */
  destinationChainId?: number;
  /** Include private chains in results */
  privateChainsToInclude?: string;
  /** Filter by request ID */
  id?: string;
  /** Filter by start timestamp */
  startTimestamp?: number;
  /** Filter by end timestamp */
  endTimestamp?: number;
  /** Filter by start block number */
  startBlock?: number;
  /** Filter by end block number */
  endBlock?: number;
  /** Filter by chain ID */
  chainId?: string;
  /** Filter by referrer address */
  referrer?: string;
  /** Sort field */
  sortBy?: 'createdAt' | 'updatedAt';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Response format for request listing API.
 * Contains array of requests and pagination information.
 */
export interface GetRequestsResponse {
  /** Array of cross-chain requests */
  requests: CrossChainRequest[];
  /** Pagination token for next page if available */
  continuation?: string;
}

/**
 * Individual cross-chain request record.
 * Contains complete information about a bridging/swap operation.
 */
export interface CrossChainRequest {
  /** Unique identifier for the request */
  id: string;
  /** User wallet address that initiated the request */
  user: string;
  /** Source chain ID */
  originChainId: number;
  /** Destination chain ID */
  destinationChainId: number;
  /** Source token contract address */
  originCurrency: string;
  /** Destination token contract address */
  destinationCurrency: string;
  /** Amount being transferred (in smallest unit) */
  amount: string;
  /** Current status of the request */
  status: string;
  /** ISO timestamp when request was created */
  createdAt: string;
  /** ISO timestamp when request was last updated */
  updatedAt: string;
}

/**
 * Request parameters for indexing a transaction.
 * Used to track and monitor specific transactions.
 */
export interface TransactionIndexRequest {
  /** Transaction hash to index */
  txHash: string;
  /** Chain ID where the transaction occurred */
  chainId: string;
  /** Optional request ID to associate with the transaction */
  requestId?: string;
}

/**
 * Request parameters for single transaction operations.
 * Links transactions to specific cross-chain requests.
 */
export interface TransactionSingleRequest {
  /** Request ID to associate with the transaction */
  requestId: string;
  /** Chain ID where the transaction occurred */
  chainId: string;
  /** Transaction hash */
  tx: string;
}

/**
 * Request parameters for currency discovery API v2.
 * Supports filtering and pagination for token listings.
 */
export interface CurrenciesV2Request {
  /** Only return default token list */
  defaultList?: boolean;
  /** Filter by specific chain IDs */
  chainIds?: number[];
  /** Search term for token name or symbol */
  term?: string;
  /** Filter by token contract address */
  address?: string;
  /** Filter by specific currency ID */
  currencyId?: string;
  /** Filter by array of specific token addresses */
  tokens?: string[];
  /** Only return verified tokens */
  verified?: boolean;
  /** Maximum number of results to return */
  limit?: number;
  /** Include tokens from all supported chains */
  includeAllChains?: boolean;
  /** Use external search services for broader results */
  useExternalSearch?: boolean;
  /** Only include tokens that support deposits */
  depositAddressOnly?: boolean;
}

/**
 * Metadata information for currencies in v2 API.
 * Includes verification status and additional properties.
 */
export interface CurrencyMetadata {
  /** URL for token logo image */
  logoURI?: string;
  /** Whether the token is verified/trusted */
  verified?: boolean;
  /** Whether this is the native token of the chain */
  isNative?: boolean;
}

/**
 * Enhanced currency information from v2 API.
 * Includes virtual machine type and metadata.
 */
export interface CurrencyV2 {
  /** Chain ID where this currency exists */
  chainId: number;
  /** Contract address of the token */
  address: string;
  /** Token symbol */
  symbol: string;
  /** Full token name */
  name: string;
  /** Number of decimal places */
  decimals: number;
  /** Virtual machine type of the blockchain */
  vmType: 'bvm' | 'evm' | 'svm' | 'tvm' | 'tonvm' | 'suivm' | 'hypevm';
  /** Additional metadata for the currency */
  metadata?: CurrencyMetadata;
}

/**
 * Origin specification for multi-input swap operations.
 * Defines a source token and amount for aggregation.
 */
export interface SwapOrigin {
  /** Source chain ID */
  chainId: number;
  /** Source token contract address */
  currency: string;
  /** Amount to swap from this origin (in smallest unit) */
  amount: string;
  /** Optional specific user address for this origin */
  user?: string;
}

/**
 * Transaction specification for additional operations.
 * Used in complex swap operations that require extra transaction steps.
 */
export interface SwapTx {
  /** Transaction recipient address */
  to: string;
  /** ETH value to send (in wei) */
  value: string;
  /** Transaction calldata */
  data: string;
}

/**
 * Complete request specification for multi-input swap operations.
 * Enables aggregating tokens from multiple sources into a single destination.
 */
export interface SwapMultiInputRequest {
  /** User wallet address that will make deposits and receive tokens */
  user: string;
  /** Array of origin tokens to swap from multiple chains */
  origins: SwapOrigin[];
  /** Destination token contract address */
  destinationCurrency: string;
  /** Destination chain ID */
  destinationChainId: number;
  /** Type of trade execution */
  tradeType: 'EXACT_INPUT' | 'EXACT_OUTPUT';
  /** Optional recipient address (defaults to user) */
  recipient?: string;
  /** Optional refund address in case of failure */
  refundTo?: string;
  /** Required for EXACT_OUTPUT: exact amount to receive at destination */
  amount?: string;
  /** Optional additional transactions to execute */
  txs?: SwapTx[];
  /** Gas limit for additional transactions */
  txsGasLimit?: number;
  /** Allow partial fills if full amount not available */
  partial?: boolean;
  /** Referrer address for fee sharing */
  referrer?: string;
  /** Gas limit for deposit-specified transactions */
  gasLimitForDepositSpecifiedTxs?: number;
}

/**
 * Detailed fee amount with currency information.
 * Provides formatted values and USD equivalent for fees.
 */
export interface FeeAmount {
  /** Currency information for the fee */
  currency: CurrencyV2;
  /** Raw fee amount (in smallest unit) */
  amount: string;
  /** Human-readable formatted amount */
  amountFormatted: string;
  /** USD equivalent of the fee */
  amountUsd: string;
  /** Minimum fee amount required */
  minimumAmount: string;
}

/**
 * Comprehensive fee breakdown for swap operations.
 * Includes all types of fees involved in multi-chain swaps.
 */
export interface SwapFees {
  /** Gas fees for executing transactions */
  gas: FeeAmount;
  /** Relayer fees for cross-chain execution */
  relayer: FeeAmount;
  /** Gas fees paid by relayer */
  relayerGas: FeeAmount;
  /** Service fees for relayer operations */
  relayerService: FeeAmount;
  /** Application/protocol fees */
  app: FeeAmount;
}

/**
 * Value and timing breakdown for swap operations.
 * Provides total value and execution time estimates.
 */
export interface SwapBreakdown {
  /** Total value being transferred */
  value: string;
  /** Estimated time to complete (in seconds) */
  timeEstimate: number;
}

/**
 * Balance information for swap operations.
 * Shows user's current balance and requirements for execution.
 */
export interface SwapBalances {
  /** User's current balance of the source tokens */
  userBalance: string;
  /** Required balance to execute the swap operation */
  requiredToSolve: string;
}

/**
 * Price impact information for swap operations.
 * Shows how the swap affects token prices in USD and percentage terms.
 */
export interface ImpactInfo {
  /** Price impact in USD terms */
  usd: string;
  /** Price impact as a percentage */
  percent: string;
}

/**
 * Slippage tolerance settings for swap operations.
 * Defines acceptable price movement for both origin and destination tokens.
 */
export interface SlippageTolerance {
  /** Slippage tolerance for origin token */
  origin: {
    /** Slippage value in USD */
    usd: string;
    /** Raw slippage value */
    value: string;
    /** Slippage as a percentage */
    percent: string;
  };
  /** Slippage tolerance for destination token */
  destination: {
    /** Slippage value in USD */
    usd: string;
    /** Raw slippage value */
    value: string;
    /** Slippage as a percentage */
    percent: string;
  };
}

/**
 * Detailed information about a swap operation.
 * Includes operation metadata, participants, and impact analysis.
 */
export interface SwapDetails {
  /** Type of operation being performed */
  operation: string;
  /** Estimated time to complete (in seconds) */
  timeEstimate: number;
  /** User's balance in the source token */
  userBalance: string;
  /** Address sending the tokens */
  sender: string;
  /** Address receiving the tokens */
  recipient: string;
  /** Input currency and amount details */
  currencyIn: FeeAmount;
  /** Output currency and amount details */
  currencyOut: FeeAmount;
  /** Total price impact of the operation */
  totalImpact: ImpactInfo;
  /** Price impact from the swap portion only */
  swapImpact: ImpactInfo;
  /** Exchange rate for the swap */
  rate: string;
  /** Slippage tolerance settings */
  slippageTolerance: SlippageTolerance;
}

/**
 * Complete response for multi-input swap operations.
 * Contains all information needed to execute complex multi-chain swaps.
 */
export interface SwapResponse {
  /** Array of steps required to complete the swap */
  steps: QuoteStep[];
  /** Detailed fee breakdown */
  fees: SwapFees;
  /** Value and timing breakdown */
  breakdown: SwapBreakdown[];
  /** Balance information and requirements */
  balances: SwapBalances;
  /** Detailed swap operation information */
  details: SwapDetails;
}
