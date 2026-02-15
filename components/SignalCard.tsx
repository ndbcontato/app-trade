
import React from 'react';
import { ShoppingCart, Tag, Info, AlertTriangle } from 'lucide-react';
import { TradingSignal } from '../types';

interface SignalCardProps {
  signal: TradingSignal;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const isBuy = signal.action === 'COMPRA';
  const isSell = signal.action === 'VENDA';
  const isNeutral = signal.action === 'NEUTRO';

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-500 ${
      isBuy ? 'bg-green-950/20 border-green-500/30' : 
      isSell ? 'bg-red-950/20 border-red-500/30' : 
      'bg-gray-900 border-gray-700/30'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isBuy ? 'bg-green-500/20 text-green-400' : isSell ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/20 text-gray-400'}`}>
            {isBuy ? <ShoppingCart size={24} /> : isSell ? <Tag size={24} /> : <Info size={24} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{signal.asset}</h3>
            <span className="text-xs text-gray-400">{signal.timestamp}</span>
          </div>
        </div>
        <div className={`px-4 py-1 rounded-full text-xs font-bold tracking-widest border ${
          isBuy ? 'bg-green-500/10 text-green-400 border-green-500/50' : 
          isSell ? 'bg-red-500/10 text-red-400 border-red-500/50' : 
          'bg-gray-700/10 text-gray-400 border-gray-700/50'
        }`}>
          {signal.action}
        </div>
      </div>

      <p className="text-sm text-gray-300 mb-4 leading-relaxed">
        {signal.reasoning}
      </p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Confiança IA:</span>
          <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${isBuy ? 'bg-green-500' : isSell ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${signal.confidence * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-white">{(signal.confidence * 100).toFixed(0)}%</span>
        </div>
        {signal.confidence > 0.8 && (
          <div className="flex items-center text-yellow-500 gap-1 animate-pulse">
            <AlertTriangle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Alta Probabilidade</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalCard;
