
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface IndicatorCardProps {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ label, value, change, unit = "" }) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-[#1a1a1e] border border-white/5 rounded-xl p-4 shadow-lg hover:border-white/10 transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        {change !== undefined && (
          <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
            {isPositive ? <TrendingUp size={14} className="mr-1" /> : isNegative ? <TrendingDown size={14} className="mr-1" /> : <Minus size={14} className="mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold font-mono text-white">{value}</span>
        <span className="ml-1 text-xs text-gray-500">{unit}</span>
      </div>
    </div>
  );
};

export default IndicatorCard;
