
export interface MarketData {
  vix: number;
  dxy: number;
  di: number;
  dollar: number;
  index: number;
  swapContracts: number;
  lastUpdate: string;
  sources?: { uri: string; title: string }[];
}

export interface TradingSignal {
  asset: 'INDICE' | 'DOLAR';
  action: 'COMPRA' | 'VENDA' | 'NEUTRO';
  reasoning: string;
  confidence: number;
  timestamp: string;
}

export interface InterventionAlert {
  type: 'BCB_INTERVENTION';
  probability: number;
  message: string;
  details: string;
}
