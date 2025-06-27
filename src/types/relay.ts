// Relay Protocol API Types for Cross-chain Bridging and Execution

export interface Currency {
  id: string;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  supportsBridging: boolean;
}

export interface FeaturedToken {
  id: string;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  supportsBridging: boolean;
  metadata: {
    logoURI: string;
  };
}

export interface ERC20Currency {
  id: string;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  supportsBridging: boolean;
  supportsPermit?: boolean;
  withdrawalFee: number;
  depositFee: number;
  surgeEnabled: boolean;
}

export interface ChainContracts {
  multicall3: string;
  multicaller: string;
  onlyOwnerMulticaller: string;
  relayReceiver: string;
  erc20Router: string;
  approvalProxy: string;
}

export interface Chain {
  id: number;
  name: string;
  displayName: string;
  httpRpcUrl: string;
  wsRpcUrl: string;
  explorerUrl: string;
  explorerName: string;
  explorerPaths?: {
    transaction: string;
  };
  depositEnabled: boolean;
  tokenSupport: string;
  disabled: boolean;
  partialDisableLimit: number;
  blockProductionLagging: boolean;
  currency: Currency;
  withdrawalFee: number;
  depositFee: number;
  surgeEnabled: boolean;
  featuredTokens: FeaturedToken[];
  erc20Currencies: ERC20Currency[];
  iconUrl: string;
  logoUrl?: string;
  brandColor?: string;
  contracts: ChainContracts;
  vmType: string;
  explorerQueryParams?: Record<string, any>;
  baseChainId: number;
  statusMessage?: string;
  solverAddresses: string[];
  tags: string[];
}

export interface ChainsResponse {
  chains: Chain[];
}

export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri?: string;
}

export interface TokenPrice {
  price: string;
  currency: string;
  timestamp: number;
}

export interface QuoteRequest {
  user: string;
  recipient?: string;
  originChainId: number;
  destinationChainId: number;
  originCurrency: string;
  destinationCurrency: string;
  amount: string;
  tradeType?: 'EXACT_INPUT' | 'EXACT_OUTPUT' | 'EXPECTED_OUTPUT';
}

export interface QuoteStep {
  id: string;
  action: string;
  description: string;
  kind: 'transaction' | 'signature';
  items: StepItem[];
}

export interface StepItem {
  status: 'incomplete' | 'complete';
  data?: TransactionData | SignatureData;
  check?: {
    endpoint: string;
    method: string;
  };
  post?: {
    endpoint: string;
    method: string;
    body: any;
  };
}

export interface TransactionData {
  from: string;
  to: string;
  data: string;
  value: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  chainId: number;
  gas: number;
}

export interface SignatureData {
  signatureKind: 'eip191' | 'eip712';
  message: string;
  types?: any;
  domain?: any;
  primaryType?: string;
}

export interface Quote {
  steps: QuoteStep[];
  fees: {
    gas: string;
    gasCurrency: string;
    relayer: string;
    relayerGas: string;
    relayerService: string;
    relayerCurrency: string;
  };
  breakdown: {
    value: string;
    timeEstimate: number;
  };
  balances: {
    userBalance: string;
    requiredToSolve: string;
  };
}

export interface ExecutionStatus {
  status: 'refund' | 'delayed' | 'waiting' | 'failure' | 'pending' | 'success';
  details?: string;
  inTxHashes: string[];
  txHashes: string[];
  time: number;
  originChainId: number;
  destinationChainId: number;
}

export interface GetRequestsRequest {
  limit?: number;
  continuation?: string;
  user?: string;
  hash?: string;
  originChainId?: number;
  destinationChainId?: number;
  privateChainsToInclude?: string;
  id?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  startBlock?: number;
  endBlock?: number;
  chainId?: string;
  referrer?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

export interface GetRequestsResponse {
  requests: CrossChainRequest[];
  continuation?: string;
}

export interface CrossChainRequest {
  id: string;
  user: string;
  originChainId: number;
  destinationChainId: number;
  originCurrency: string;
  destinationCurrency: string;
  amount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MultiInputQuoteRequest {
  user: string;
  recipient?: string;
  destinationChainId: number;
  destinationCurrency: string;
  amount: string;
  originTokens: Array<{
    chainId: number;
    currency: string;
    amount: string;
  }>;
}

export interface TransactionIndexRequest {
  txHash: string;
  chainId: string;
  requestId?: string;
}

export interface TransactionSingleRequest {
  requestId: string;
  chainId: string;
  tx: string;
}

// Get Currencies V2 API types
export interface CurrenciesV2Request {
  defaultList?: boolean;
  chainIds?: number[];
  term?: string;
  address?: string;
  currencyId?: string;
  tokens?: string[];
  verified?: boolean;
  limit?: number;
  includeAllChains?: boolean;
  useExternalSearch?: boolean;
  depositAddressOnly?: boolean;
}

export interface CurrencyMetadata {
  logoURI?: string;
  verified?: boolean;
  isNative?: boolean;
}

export interface CurrencyV2 {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  vmType: 'bvm' | 'evm' | 'svm' | 'tvm' | 'tonvm' | 'suivm' | 'hypevm';
  metadata?: CurrencyMetadata;
}

// Swap Multi-Input API types
export interface SwapOrigin {
  chainId: number;
  currency: string;
  amount: string;
  user?: string;
}

export interface SwapTx {
  to: string;
  value: string;
  data: string;
}

export interface SwapMultiInputRequest {
  user: string;
  origins: SwapOrigin[];
  destinationCurrency: string;
  destinationChainId: number;
  tradeType: 'EXACT_INPUT' | 'EXACT_OUTPUT';
  recipient?: string;
  refundTo?: string;
  amount?: string;
  txs?: SwapTx[];
  txsGasLimit?: number;
  partial?: boolean;
  referrer?: string;
  gasLimitForDepositSpecifiedTxs?: number;
}

export interface FeeAmount {
  currency: CurrencyV2;
  amount: string;
  amountFormatted: string;
  amountUsd: string;
  minimumAmount: string;
}

export interface SwapFees {
  gas: FeeAmount;
  relayer: FeeAmount;
  relayerGas: FeeAmount;
  relayerService: FeeAmount;
  app: FeeAmount;
}

export interface SwapBreakdown {
  value: string;
  timeEstimate: number;
}

export interface SwapBalances {
  userBalance: string;
  requiredToSolve: string;
}

export interface ImpactInfo {
  usd: string;
  percent: string;
}

export interface SlippageTolerance {
  origin: {
    usd: string;
    value: string;
    percent: string;
  };
  destination: {
    usd: string;
    value: string;
    percent: string;
  };
}

export interface SwapDetails {
  operation: string;
  timeEstimate: number;
  userBalance: string;
  sender: string;
  recipient: string;
  currencyIn: FeeAmount;
  currencyOut: FeeAmount;
  totalImpact: ImpactInfo;
  swapImpact: ImpactInfo;
  rate: string;
  slippageTolerance: SlippageTolerance;
}

export interface SwapResponse {
  steps: QuoteStep[];
  fees: SwapFees;
  breakdown: SwapBreakdown[];
  balances: SwapBalances;
  details: SwapDetails;
}
