
import { GoogleGenAI, Type } from "@google/genai";
import { MarketData, TradingSignal } from "../types";

export const fetchRealMarketData = async (): Promise<MarketData> => {
  // Inicialização obrigatória dentro da função para garantir chave atualizada
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Aja como um terminal Bloomberg de alta precisão. Pesquise em TEMPO REAL (agora: ${new Date().toISOString()}) e retorne os valores dos seguintes indicadores financeiros usando as fontes citadas:

    1. VIX (CBOE Volatility Index): Verifique CNBC (.VIX) e Investing.com.
    2. DXY (US Dollar Index): Verifique TradingView e Bloomberg.
    3. Mini Índice (WIN - Vencimento Atual): Verifique B3 e TradingView. Valor esperado prox 186k.
    4. Mini Dólar (WDO - Vencimento Atual): Verifique B3 e TradingView. Valor esperado prox 5.2x.
    5. Taxa DI (DI1F29 ou contrato futuro mais líquido): Verifique Investing.com BR ou site oficial da B3.
    6. Intervenções do Banco Central (BCB): Pesquise no site oficial bcb.gov.br e portais de notícias (Valor Econômico, G1 Economia) por anúncios de leilões de SWAP CAMBIAL realizados hoje ou agendados.

    IMPORTANTE: Retorne os dados estritamente em JSON com as chaves: vix, dxy, di, dollar, index, swapContracts.
    Se não encontrar o número exato de swaps, use 0 e descreva na análise.
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

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || "Fonte de Mercado"
    })).filter((s: any) => s.uri !== "") || [];

    // response.text é um GETTER, não uma função.
    const textOutput = response.text;
    if (!textOutput) throw new Error("Resposta da IA vazia");
    
    const data = JSON.parse(textOutput);
    
    return {
      ...data,
      lastUpdate: new Date().toLocaleTimeString(),
      sources: sources
    };
  } catch (error) {
    console.error("Erro na comunicação Gemini:", error);
    throw error;
  }
};

export const analyzeMarket = async (data: MarketData): Promise<TradingSignal[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analise o alinhamento macro para o mercado brasileiro:
    DADOS: VIX: ${data.vix} | DXY: ${data.dxy} | DI: ${data.di}% | WIN: ${data.index} | WDO: ${data.dollar} | SWAPS BCB: ${data.swapContracts}.

    REGRAS DE OURO:
    - ALINHAMENTO COMPRA ÍNDICE: VIX e DXY em queda simultânea (apetite ao risco global) + DI estável/queda.
    - HEDGE DOLAR: Se o dólar está em patamar de estresse e o BCB injetou swaps (${data.swapContracts}), há uma força de venda institucional (Hedge do BC).
    
    Gere recomendações claras de COMPRA, VENDA ou NEUTRO para o INDICE e para o DOLAR.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", // Modelo superior para análise lógica
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
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const checkIntervention = async (data: MarketData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Pesquise especificamente no site do Banco Central do Brasil (bcb.gov.br) e Valor Econômico se houve atuação hoje no câmbio com o dólar cotado a R$ ${data.dollar}. 
    Explique o impacto técnico dos ${data.swapContracts} contratos detectados no fluxo de liquidez.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "Sem intervenções registradas nas fontes oficiais.";
  } catch (err) {
    return "Erro ao consultar fontes do Banco Central.";
  }
};
