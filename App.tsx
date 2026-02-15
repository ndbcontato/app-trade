
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Bell, 
  RefreshCcw, 
  Activity,
  ChevronRight,
  Zap,
  ShieldAlert,
  ExternalLink,
  Globe,
  Info,
  CheckCircle2
} from 'lucide-react';
import { MarketData, TradingSignal } from './types';
import { analyzeMarket, checkIntervention, fetchRealMarketData } from './services/geminiService';
import IndicatorCard from './components/IndicatorCard';
import SignalCard from './components/SignalCard';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [marketData, setMarketData] = useState<MarketData>({
    vix: 15.42,
    dxy: 103.20,
    di: 11.25,
    dollar: 5.22,
    index: 186480,
    swapContracts: 0,
    lastUpdate: 'Aguardando atualização...',
    sources: []
  });

  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [interventionNote, setInterventionNote] = useState<string>('');

  const refreshAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const realData = await fetchRealMarketData();
      setMarketData(realData);
      
      const result = await analyzeMarket(realData);
      setSignals(result);
      
      const intervention = await checkIntervention(realData);
      setInterventionNote(intervention);

      // Trigger visual "notification"
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    } catch (err) {
      console.error("Erro na atualização:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAnalysis();
  }, [refreshAnalysis]);

  return (
    <div className="min-h-screen pb-24 md:pb-8 flex flex-col items-center p-4 md:p-8 relative">
      
      {/* Simulated Mobile Notification */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-bounce">
          <div className="bg-[#1a1a1e] border border-blue-500/50 rounded-2xl p-4 shadow-2xl flex items-center gap-4 border-l-4 border-l-blue-500">
            <div className="bg-blue-500 p-2 rounded-lg text-white">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">Novo Sinal TradeGuard</h4>
              <p className="text-[10px] text-gray-400">Análise de VIX, DXY e Swaps concluída.</p>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-gray-500 hover:text-white">
              <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 bg-[#131316] p-4 rounded-2xl border border-white/5 sticky top-4 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">TradeGuard AI</h1>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              Ref: TradingView & CNBC
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={refreshAnalysis}
            disabled={loading}
            className={`p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all ${loading ? 'animate-spin text-blue-400' : ''}`}
          >
            <RefreshCcw size={18} />
          </button>
          <button 
            onClick={() => setShowNotification(!showNotification)}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#131316]"></span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl space-y-6">
        
        {/* Alignment Rule Box */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-green-400 uppercase mb-1">Estratégia de Alinhamento</h3>
            <p className="text-[11px] text-green-200/80 leading-snug">
              O sistema monitora o <span className="font-bold text-white">VIX (Fear)</span>, <span className="font-bold text-white">DXY (Global $)</span> e <span className="font-bold text-white">DI (Juros)</span>. 
              O alinhamento de queda nesses três pilares dispara o sinal de <span className="underline decoration-green-500 font-bold text-white">COMPRA PARA O ÍNDICE</span>.
            </p>
          </div>
        </div>

        {/* Real-time Indicators Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              Monitoramento em Tempo Real
            </h2>
            <span className="text-[10px] font-mono text-gray-600 bg-gray-900 px-2 py-1 rounded">Update: {marketData.lastUpdate}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <IndicatorCard label="VIX (CNBC)" value={marketData.vix} />
            <IndicatorCard label="DXY (TradingView)" value={marketData.dxy} />
            <IndicatorCard label="DI (B3/TV)" value={marketData.di} unit="%" />
            <IndicatorCard label="WIN (Mini Índice)" value={marketData.index.toLocaleString('pt-BR')} />
            <IndicatorCard label="WDO (Mini Dólar)" value={`R$ ${marketData.dollar.toFixed(2)}`} />
            <IndicatorCard label="Intervenção BCB" value={marketData.swapContracts > 0 ? marketData.swapContracts.toLocaleString() : "Monitorando Swaps"} unit={marketData.swapContracts > 0 ? "contr." : ""} />
          </div>
        </section>

        {/* AI Analysis Result */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 size={16} className="text-green-400" />
            Notificações de Compra/Venda IA
          </h2>
          {loading ? (
            <div className="w-full h-48 flex flex-col items-center justify-center bg-[#131316] rounded-2xl border border-white/5 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium animate-pulse">Cruzando VIX, DXY e DI em tempo real...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {signals.length > 0 ? (
                signals.map((sig, idx) => <SignalCard key={idx} signal={sig} />)
              ) : (
                <div className="col-span-2 p-8 text-center bg-gray-900 rounded-2xl border border-gray-800 text-gray-500 italic">
                  Aguardando sinal de mercado.
                </div>
              )}
            </div>
          )}
        </section>

        {/* BCB Intervention Evaluation */}
        <section className="bg-[#131316] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500">
              <ShieldAlert size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Análise de Contratos de Swap (BCB)</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-black/30 rounded-xl border border-white/5 min-h-[100px]">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-white/5 rounded w-full animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-300 leading-relaxed italic">
                    {interventionNote || "Nenhuma anomalia de intervenção detectada para o patamar atual do câmbio."}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-yellow-500 font-bold uppercase">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    Monitorando entrada de Hedge do Banco Central
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sources Section */}
        {marketData.sources && marketData.sources.length > 0 && (
          <section className="bg-blue-950/10 border border-blue-500/10 rounded-2xl p-6">
             <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe size={14} /> Fontes das Notificações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {marketData.sources.slice(0, 4).map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <span className="text-xs text-gray-300 truncate max-w-[200px]">{source.title}</span>
                  <ExternalLink size={12} className="text-blue-500" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-8 pb-12 border-t border-white/5 flex flex-col items-center gap-4 text-center text-gray-500">
          <p className="text-xs max-w-sm">
            Focado em sinalizar alinhamento VIX/DXY/DI e intervenções do BCB.
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold">TradeGuard AI © 2024</p>
        </footer>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/30 p-1 flex items-center md:hidden z-[100]">
        <button 
          onClick={refreshAnalysis}
          className="w-full flex items-center justify-between px-6 py-3 text-white font-bold"
        >
          <div className="flex items-center gap-3">
            {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Zap size={18} className="fill-white" />}
            <span>RECEBER NOTIFICAÇÕES</span>
          </div>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default App;
