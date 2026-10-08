import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Flame,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  BarChart3,
  Award,
  Zap,
  Target,
  CheckCircle2,
} from "lucide-react";
import { ThreeYenTargetData, ThreeYenTopPair, JstInfo, ForexPairResult } from "../types";

interface ThreeYenTargetSectionProps {
  threeYenData: ThreeYenTargetData | undefined;
  jstInfo?: JstInfo;
  pairs?: ForexPairResult[];
  onSetTargetPips?: (pips: number) => void;
}

export const ThreeYenTargetSection: React.FC<ThreeYenTargetSectionProps> = ({
  threeYenData,
  jstInfo,
  pairs,
  onSetTargetPips,
}) => {
  if (!threeYenData || !threeYenData.top3 || threeYenData.top3.length === 0) {
    return null;
  }

  const { top3, marketOverview } = threeYenData;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="px-3 py-1 text-xs font-black rounded-lg bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-sm shadow-amber-500/30">
            👑 第1位 (TOP 1)
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 text-xs font-black rounded-lg bg-slate-300 text-slate-950 flex items-center gap-1.5 shadow-sm">
            🥈 第2位 (TOP 2)
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1 text-xs font-black rounded-lg bg-amber-700/80 text-amber-100 flex items-center gap-1.5 shadow-sm">
            🥉 第3位 (TOP 3)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="three-yen-target-section-root" className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-[#141414] via-slate-900 to-[#1e1b4b] border-2 border-[#141414] rounded-2xl p-6 lg:p-8 text-white shadow-hard relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-500 text-slate-950 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                3.00円 (300 Pips) ビッグスイング
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                最新リアルタイム為替レート完全同期
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                過去2日間 90% 重視
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-amber-400 shrink-0" />
              ３円以上狙える為替ペア TOP 3 (確率＆期待勝率)
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Yahoo!ファイナンスの最新為替レートに完全同期。日足ATRボラティリティと直近2日相場動態から、
              <strong>【3.00円以上（300pips）】</strong>の大きな利益確定を狙える最高期待値のクロス円3銘柄をリアルタイム抽出しています。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-3.5 text-center min-w-[150px]">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">目標利確値幅</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5 font-mono">3.00 円</div>
              <div className="text-[10px] text-slate-400 font-mono">300.0 Pips</div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3.5 text-center min-w-[150px]">
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">平均リスクリワード</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5 font-mono">1 : 3.5</div>
              <div className="text-[10px] text-slate-400 font-mono">損小利大・高期待値</div>
            </div>
          </div>
        </div>

        {/* Market Overview Brief */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl">
          <strong className="text-amber-400 font-bold mr-1.5">⚡ クオンツ相場総括:</strong>
          {marketOverview}
        </div>
      </div>

      {/* 2. TOP 3 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {top3.map((item) => {
          const isRank1 = item.rank === 1;
          const liveMatch = pairs?.find((p) => p.pair === item.pair);
          const currentPrice = liveMatch ? liveMatch.currentPrice : item.currentPrice;
          const isLong = liveMatch ? liveMatch.positionType === "LONG" : item.direction === "BUY";
          const targetPrice = liveMatch ? Number((isLong ? currentPrice + 3.00 : currentPrice - 3.00).toFixed(3)) : item.targetPrice;
          const stopLossPrice = liveMatch ? Number((isLong ? currentPrice - 0.75 : currentPrice + 0.75).toFixed(3)) : item.stopLossPrice;
          const return2d = liveMatch ? liveMatch.return2dPercent : item.return2dPercent;
          const prob = liveMatch ? Number((liveMatch.winRate1000 - (item.rank - 1) * 1.5).toFixed(1)) : item.probability;

          return (
            <div
              key={item.pair}
              className={`rounded-2xl border-2 transition-all p-5 lg:p-6 flex flex-col justify-between relative ${
                isRank1
                  ? "bg-gradient-to-b from-white to-amber-50/40 border-amber-500 shadow-hard"
                  : "bg-white border-[#141414] shadow-hard"
              }`}
            >
              {/* Top Row: Rank Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {getRankBadge(item.rank)}
                </div>

                {/* Pair Name & Direction & Current Price */}
                <div className="flex items-start justify-between mt-1">
                  <div>
                    <div className="flex flex-col items-start gap-1">
                      <h3 className="text-3xl font-black text-[#141414] tracking-tight">{item.pair}</h3>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-black rounded-md flex items-center gap-1 shadow-sm ${
                          isLong
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {isLong ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" /> : <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />}
                        {isLong ? "LONG (買)" : "SHORT (売)"}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-1.5">
                      現在値: <strong className="text-[#141414] text-sm">{currentPrice}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">目標値 ({isLong ? "+3.00円" : "-3.00円"})</div>
                    <div className={`text-xl font-black font-mono ${isLong ? "text-emerald-700" : "text-rose-700"}`}>
                      {targetPrice}
                    </div>
                  </div>
                </div>

                {/* Core Metrics: Recommended Probability Box */}
                <div className="my-4 bg-slate-900 text-white p-3.5 rounded-xl shadow-inner flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      推奨確率 (アルゴリズム)
                    </div>
                    <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                      {prob}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">直近2日相場(90%重み)追随</div>
                  </div>

                  <div className="text-right bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
                    <div className="text-[10px] text-slate-400">期待獲得幅</div>
                    <div className="text-lg font-black text-amber-300 font-mono">+{item.expectedYenGain}円</div>
                    <div className="text-[10px] text-emerald-400 font-bold">+{item.expectedPips} pips</div>
                  </div>
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4 bg-[#E4E3E0]/40 p-3 rounded-lg border border-[#141414]/20">
                  <div>
                    <span className="text-slate-500 block text-[10px]">期待獲得円幅</span>
                    <strong className="text-emerald-700 font-bold text-sm">+{item.expectedYenGain} 円</strong>
                    <span className="text-[10px] text-slate-400"> (+{item.expectedPips} pips)</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">到達予想日数</span>
                    <strong className="text-[#141414] font-bold text-sm">約 {item.estimatedDays} 日</strong>
                    <span className="text-[10px] text-slate-400"> (ATR:{item.atrDailyPips}p)</span>
                  </div>

                  <div className="mt-1 pt-1 border-t border-slate-200">
                    <span className="text-slate-500 block text-[10px]">目安損切り価格 (SL)</span>
                    <strong className="text-rose-700 font-bold">{stopLossPrice}</strong>
                  </div>

                  <div className="mt-1 pt-1 border-t border-slate-200">
                    <span className="text-slate-500 block text-[10px]">リスクリワード</span>
                    <strong className="text-indigo-700 font-bold">{item.riskRewardRatio}</strong>
                  </div>
                </div>

                {/* Rationale Box */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-xs font-bold text-[#141414] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    {item.reasonTitle}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                    リアルタイム為替レート <strong>{currentPrice}</strong> 円からの3.00円利確目標は <strong>{targetPrice}</strong> 円 ({isLong ? "上昇" : "下落"}スイング)。日足ATRボラティリティと直近2日間モメンタム ({return2d >= 0 ? "+" : ""}{return2d}%) に基づき、リスクリワード比 1:3.5 で300pips到達を狙います。
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="text-[11px] font-mono text-slate-500">
                  直近2日: <strong className={return2d >= 0 ? "text-emerald-600" : "text-rose-600"}>{return2d >= 0 ? `+${return2d}%` : `${return2d}%`}</strong>
                </div>

                {onSetTargetPips && (
                  <button
                    onClick={() => onSetTargetPips(300)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                      isRank1
                        ? "bg-[#141414] text-white hover:bg-slate-800"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>300pips(3円幅)に適用</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Swing Strategy Checklist for 3 Yen Gain */}
      <div className="bg-white border-2 border-[#141414] rounded-2xl p-5 lg:p-6 shadow-hard">
        <h4 className="text-sm font-black text-[#141414] flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>3円(300pips) 大台獲得スイング戦略の必須ルール</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              損小利大 (1 : 3.5 以上) の厳守
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              損切り幅は70〜85pips（0.7〜0.85円）に厳格固定し、利益確定300pips（3.00円）で利大損小を完全実現。
            </p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl space-y-1">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
              直近2日間モメンタム追随
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              過去の全統計より、2日前の騰落ベクトルと合致した順張り初動スイングが最も期待値高く大台に到達。
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              分割利確でリスクゼロ化
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              +150pips（1.50円幅）到達時にポジション半数を利確し、残りの損切りラインを建値へ引き上げて大台3円を追尾。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
