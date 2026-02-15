
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
  CheckCircle2,
  Database
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
      
      const [result, intervention] = await Promise.all([
        analyzeMarket(realData),
        checkIntervention(realData)
      ]);
      
      setSignals(result);
      setInterventionNote(intervention);

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
      
      {showNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-bounce">
          <div className="bg-[#1a1a1e] border border-blue-500/50 rounded-2xl p-4 shadow-2xl flex items-center gap-4 border-l-4 border-l-blue-500">
            <div className="bg-blue-500 p-2 rounded-lg text-white">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">Análise de Multfontes</h4>
              <p className="text-[10px] text-gray-400">TradingView, Bloomberg e B3 consultados.</p>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-gray-500 hover:text-white">
              <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      )}

      <header className="w-full max-w-4xl flex items-center justify-between mb-8 bg-[#131316] p-4 rounded-2xl border border-white/5 sticky top-4 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">TradeGuard Pro AI</h1>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest">
              <Database size={10} /> 
              Multi-Source Engine Actived
            </div>
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
        </div>
      </header>

      <main className="w-full max-w-4xl space-y-6">
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Globe size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-blue-400 uppercase mb-1">Rede de Indicadores Expandida</h3>
            <p className="text-[11px] text-blue-200/80 leading-snug">
              Monitorando simultaneamente: <span className="text-white font-medium">Investing.com (DI), Bloomberg (DXY), CNBC (VIX), B3 (WIN/WDO)</span> e <span className="text-white font-medium">BCB (Swaps)</span>.
            </p>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              Real-Time Dashboard
            </h2>
            <span className="text-[10px] font-mono text-gray-600 bg-gray-900 px-2 py-1 rounded">Sincronizado: {marketData.lastUpdate}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <IndicatorCard label="VIX (CBOE/CNBC)" value={marketData.vix} />
            <IndicatorCard label="DXY (Bloomberg)" value={marketData.dxy} />
            <IndicatorCard label="DI (Investing BR)" value={marketData.di} unit="%" />
            <IndicatorCard label="WIN (Mini Índice)" value={marketData.index.toLocaleString('pt-BR')} />
            <IndicatorCard label="WDO (Mini Dólar)" value={`R$ ${marketData.dollar.toFixed(2)}`} />
            <IndicatorCard label="Swap Cambial (BCB)" value={marketData.swapContracts > 0 ? marketData.swapContracts.toLocaleString() : "0"} unit="contr." />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 size={16} className="text-green-400" />
            Alinhamento & Sinais IA
          </h2>
          {loading ? (
            <div className="w-full h-48 flex flex-col items-center justify-center bg-[#131316] rounded-2xl border border-white/5 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium animate-pulse">Varrendo Bloomberg, B3 e Investing.com...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {signals.map((sig, idx) => <SignalCard key={idx} signal={sig} />)}
            </div>
          )}
        </section>

        <section className="bg-[#131316] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500">
              <ShieldAlert size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Análise de Hedge Institucional</h2>
          </div>
          <div className="p-4 bg-black/30 rounded-xl border border-white/5">
            <p className="text-sm text-gray-300 leading-relaxed italic">
              {interventionNote || "Consultando fontes oficiais do Banco Central..."}
            </p>
          </div>
        </section>

        {marketData.sources && marketData.sources.length > 0 && (
          <section className="bg-blue-950/10 border border-blue-500/10 rounded-2xl p-6">
             <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe size={14} /> Fontes Detectadas pelo Grounding
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {marketData.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <span className="text-xs text-gray-300 truncate max-w-[250px]">{source.title}</span>
                  <ExternalLink size={12} className="text-blue-500" />
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/30 p-1 flex items-center md:hidden z-[100]">
        <button 
          onClick={refreshAnalysis}
          className="w-full flex items-center justify-between px-6 py-3 text-white font-bold"
        >
          <div className="flex items-center gap-3">
            {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Zap size={18} className="fill-white" />}
            <span>ATUALIZAR MULTIFONTES</span>
          </div>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default App;
