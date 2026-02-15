
import { GoogleGenAI, Type } from "@google/genai";
import { MarketData, TradingSignal } from "../types";

// Always use process.env.API_KEY directly when initializing the GoogleGenAI client instance.
// The key's availability is handled externally and must not be requested from the user.

export const fetchRealMarketData = async (): Promise<MarketData> => {
  // Create a new GoogleGenAI instance right before making an API call to ensure current credentials
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Acesse e pesquise em TEMPO REAL os seguintes indicadores financeiros usando as fontes oficiais:
    1. VIX (Índice de Volatilidade): Consulte obrigatoriamente https://www.cnbc.com/quotes/.VIX
    2. DXY (Índice do Dólar): Consulte tradingview.com
    3. Mini Índice (WIN): Consulte tradingview.com (valor esperado em torno de 186.480,00)
    4. Mini Dólar (WDO): Consulte tradingview.com (valor esperado em torno de 5.22)
    5. DI (Juros Futuros Brasil): Pesquise o DI1F29 ou vencimento líquido mais próximo na B3/TradingView.
    6. Contratos de Swap Cambial: Pesquise no site do Banco Central do Brasil ou notícias recentes de leilão de swap hoje.

    Retorne os valores exatos encontrados em formato JSON: vix, dxy, di, dollar, index, swapContracts.
    Se não encontrar o número exato de contratos, estime o volume financeiro do leilão anunciado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vix: { type: Type.NUMBER },
            dxy: { type: Type.NUMBER },
            di: { type: Type.NUMBER },
            dollar: { type: Type.NUMBER },
            index: { type: Type.NUMBER },
            swapContracts: { type: Type.NUMBER }
          },
          required: ["vix", "dxy", "di", "dollar", "index", "swapContracts"]
        },
        tools: [{ googleSearch: {} }]
      }
    });

    // Extract grounding chunks for website URLs as required for Google Search grounding
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || "Fonte de Mercado"
    })).filter((s: any) => s.uri !== "") || [];

    // response.text is a getter, do not call it as a function
    const data = JSON.parse(response.text || "{}");
    
    return {
      ...data,
      lastUpdate: new Date().toLocaleTimeString(),
      sources: sources
    };
  } catch (error) {
    console.error("Erro ao buscar dados reais:", error);
    throw error;
  }
};

export const analyzeMarket = async (data: MarketData): Promise<TradingSignal[]> => {
  // Create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analise os seguintes dados do mercado brasileiro e global:
    - VIX: ${data.vix} (Medo Global)
    - DXY: ${data.dxy} (Força do Dólar)
    - DI: ${data.di}% (Custo do Dinheiro/Risco Brasil)
    - WIN: ${data.index} pts (Mini Índice)
    - WDO: R$ ${data.dollar} (Mini Dólar)
    - Swap Cambial: ${data.swapContracts} contratos (Intervenção BCB)

    REGRAS DE SINALIZAÇÃO:
    1. COMPRA ÍNDICE: Se VIX está caindo, DXY está caindo e DI está estável ou em queda, há ALINHAMENTO para COMPRA de índice.
    2. OPERAÇÃO DÓLAR (HEDGE BCB): Avalie os contratos de swap. Se o dólar está subindo e o BC anunciou swap cambial, ele está fazendo hedge (vendendo dólar para prover liquidez). Sinalize VENDA de dólar se o BC entrar pesado. Se o dólar sobe e não há swap, pode ser sinal de COMPRA de dólar até o BC agir.

    Retorne dois sinais (INDICE e DOLAR) em JSON, justificando com base no alinhamento desses indicadores.
  `;

  const response = await ai.models.generateContent({
    // Using gemini-3-pro-preview for complex reasoning task (financial analysis)
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            asset: { type: Type.STRING, enum: ["INDICE", "DOLAR"] },
            action: { type: Type.STRING, enum: ["COMPRA", "VENDA", "NEUTRO"] },
            reasoning: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            timestamp: { type: Type.STRING }
          },
          required: ["asset", "action", "reasoning", "confidence", "timestamp"]
        },
        tools: [{ googleSearch: {} }]
      }
    }
  });

  // response.text is a getter
  return JSON.parse(response.text || "[]");
};

/**
 * Evaluates the likelihood of intervention by the Central Bank of Brazil.
 * Fix: Added this missing export which was causing the import error in App.tsx.
 */
export const checkIntervention = async (data: MarketData): Promise<string> => {
  // Create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analise a situação de intervenção cambial do Banco Central do Brasil:
    - Valor do Dólar (WDO): R$ ${data.dollar}
    - Contratos de Swap detectados: ${data.swapContracts}
    
    O BCB costuma intervir quando o dólar sobe rápido demais ou atinge patamares de estresse.
    Com base nesses dados, descreva se há sinais de intervenção ativa ou se o mercado está em calmaria.
    Seja breve e direto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    // response.text is a getter
    return response.text || "Monitorando níveis de intervenção...";
  } catch (error) {
    console.error("Erro ao analisar intervenção:", error);
    return "Não foi possível completar a análise de intervenção no momento.";
  }
};
