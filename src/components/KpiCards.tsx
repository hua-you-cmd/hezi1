import React from "react";
import { ForexPairResult } from "../types";
import { Trophy, Target, Activity, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardsProps {
  topPair: ForexPairResult | null;
  targetPips: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ topPair, targetPips }) => {
  if (!topPair) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white border border-[#141414] animate-pulse" />
        ))}
      </div>
    );
  }

  const isLong = topPair.positionType === "LONG" || topPair.recommendation.includes("ロング") || topPair.recommendation.includes("買い");
  const isShort = topPair.positionType === "SHORT" || topPair.recommendation.includes("ショート") || topPair.recommendation.includes("売り");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6 font-sans">
      {/* 1. Top Recommended Pair & Direction Badge */}
      <div className="bg-white border-2 border-[#141414] p-4 shadow-hard transition-all">
        <div className="flex items-center justify-between text-[#141414]/60 text-[10px] font-mono uppercase tracking-wider mb-1 font-bold">
          <span>SIGNAL PRIORITY PICK (最優先通貨)</span>
          <span className="text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 border border-emerald-800">#1 WINNER</span>
        </div>
        <div className="flex flex-col items-start gap-1 my-1">
          <span className="text-2xl font-black text-[#141414] font-mono">
            {topPair.pair}
          </span>
          <span className={`px-2 py-0.5 text-xs font-mono font-black border-2 border-[#141414] flex items-center gap-1 shadow-hard-sm ${
            isLong
              ? "bg-emerald-600 text-white"
              : isShort
              ? "bg-rose-600 text-white"
              : "bg-gray-200 text-[#141414]"
          }`}>
            {isLong ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 stroke-[3]" />
                <span>LONG (買)</span>
              </>
            ) : isShort ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 stroke-[3]" />
                <span>SHORT (売)</span>
              </>
            ) : (
              <span>RANGE (静観)</span>
            )}
          </span>
        </div>
        <div className="text-xs text-[#141414] font-mono mt-2 pt-2 border-t border-[#141414]/20 flex justify-between">
          <span className="text-[#141414]/60">現在値 / 2日騰落:</span>
          <span className="font-extrabold text-[#141414]">
            {topPair.currentPrice} {topPair.return2dPercent !== undefined ? `(${topPair.return2dPercent >= 0 ? "+" : ""}${topPair.return2dPercent}%)` : ""}
          </span>
        </div>
      </div>

      {/* 2. AI Recommendation & Signal */}
      <div className="bg-[#141414] text-[#E4E3E0] border-2 border-[#141414] p-4 shadow-hard transition-all">
        <div className="flex items-center justify-between text-[#E4E3E0]/70 text-[10px] font-mono uppercase tracking-wider mb-1 font-bold">
          <span>AI RECOMMENDATION (売買サイン)</span>
          <span className="text-amber-400 font-bold">2日90%重視</span>
        </div>
        <div className="text-sm font-black text-amber-400 font-mono truncate my-1">
          {topPair.recommendation}
        </div>
        <div className="text-xs text-[#E4E3E0]/80 font-mono mt-2 pt-2 border-t border-[#E4E3E0]/20 flex justify-between">
          <span className="text-[#E4E3E0]/60">目標指値価格:</span>
          <span className="font-bold text-amber-300">{topPair.targetPrice}</span>
        </div>
      </div>

      {/* 3. Recommended Probability (推奨確率 アルゴリズム) */}
      <div className="bg-white border-2 border-[#141414] p-4 shadow-hard transition-all">
        <div className="flex items-center justify-between text-[#141414]/60 text-[10px] font-mono uppercase tracking-wider mb-1 font-bold">
          <span>ALGORITHM PROBABILITY (推奨確率)</span>
          <span className="text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 border border-emerald-800">推奨確率 (アルゴリズム)</span>
        </div>
        <div className="flex items-baseline justify-between my-1">
          <div className="text-3xl font-black text-emerald-800 font-mono">
            {topPair.probability}%
          </div>
          <div className="text-xs font-mono font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 border border-emerald-700">
            高確信度シグナル
          </div>
        </div>
        <div className="text-xs text-[#141414] font-mono mt-2 pt-2 border-t border-[#141414]/20 flex justify-between">
          <span className="text-[#141414]/60">期待回収値:</span>
          <span className="font-bold text-emerald-800">+{topPair.expectedPipsTrade} pips / トレード</span>
        </div>
      </div>

      {/* 4. Macro Trend & Volatility */}
      <div className="bg-white border-2 border-[#141414] p-4 shadow-hard transition-all">
        <div className="flex items-center justify-between text-[#141414]/60 text-[10px] font-mono uppercase tracking-wider mb-1 font-bold">
          <span>2-DAY RANGE & ATR</span>
          <Activity className="w-3.5 h-3.5 text-[#141414]" />
        </div>
        <div className="text-sm font-extrabold text-[#141414] truncate my-1">
          {topPair.trendLabel}
        </div>
        <div className="text-xs text-[#141414] font-mono mt-2 pt-2 border-t border-[#141414]/20 flex justify-between">
          <span className="text-[#141414]/60">直近2日値幅 / 14日ATR:</span>
          <span className="font-bold">{topPair.range2dPips || "---"}pips / {topPair.atrPips}pips</span>
        </div>
      </div>
    </div>
  );
};
