import React, { useState, useMemo, useRef } from "react";
import { ForexPairResult } from "../types";
import { ChevronRight, ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, Rocket, Zap } from "lucide-react";

interface RankingTableProps {
  pairs: ForexPairResult[];
  selectedPair: string;
  onSelectPair: (pairName: string) => void;
  targetPips: number;
  onGoToThreeYen?: () => void;
  onGoToGmoCoin?: () => void;
  onGoToHedge?: () => void;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  pairs,
  selectedPair,
  onSelectPair,
  targetPips,
  onGoToThreeYen,
  onGoToGmoCoin,
  onGoToHedge,
}) => {
  const [filterTab, setFilterTab] = useState<"ALL" | "EXPLODING" | "COILING" | "GOLDEN" | "BUY" | "SELL">("ALL");

  // Map pairs by name for O(1) live data retrieval
  const pairMap = useMemo(() => {
    const map = new Map<string, ForexPairResult>();
    pairs.forEach((p) => map.set(p.pair, p));
    return map;
  }, [pairs]);

  // Map actual real-time rank (1-indexed based on current live ranking order)
  const actualRankMap = useMemo(() => {
    const map = new Map<string, number>();
    pairs.forEach((p, idx) => map.set(p.pair, idx + 1));
    return map;
  }, [pairs]);

  // Track rank changes between live data updates
  const prevRankMapRef = useRef<Map<string, number>>(new Map());
  const rankDiffMap = useMemo(() => {
    const diffMap = new Map<string, number>();
    const prevMap = prevRankMapRef.current;
    if (prevMap.size > 0) {
      pairs.forEach((p, idx) => {
        const currentRank = idx + 1;
        if (prevMap.has(p.pair)) {
          const prevRank = prevMap.get(p.pair)!;
          diffMap.set(p.pair, prevRank - currentRank); // positive means climbed up
        } else {
          diffMap.set(p.pair, 0);
        }
      });
    }
    const newMap = new Map<string, number>();
    pairs.forEach((p, idx) => newMap.set(p.pair, idx + 1));
    prevRankMapRef.current = newMap;
    return diffMap;
  }, [pairs]);

  // Filtered items directly from live-sorted pairs
  const filteredItems = useMemo(() => {
    return pairs.filter((item) => {
      if (filterTab === "EXPLODING") return item.bigBreakoutSignal?.isExploding;
      if (filterTab === "COILING") return item.bigBreakoutSignal?.isCoiling;
      if (filterTab === "GOLDEN") return item.entryQuality?.winRateImpact === "BOOST";
      if (filterTab === "BUY") return item.positionType === "LONG";
      if (filterTab === "SELL") return item.positionType === "SHORT";
      return true;
    });
  }, [pairs, filterTab]);

  // Detected Big Breakouts & Coiling Squeezes
  const explodingPairs = useMemo(() => {
    return pairs.filter((p) => p.bigBreakoutSignal?.isExploding);
  }, [pairs]);

  const coilingPairs = useMemo(() => {
    return pairs.filter((p) => p.bigBreakoutSignal?.isCoiling);
  }, [pairs]);

  const goldenDipRallyPairs = useMemo(() => {
    return pairs.filter((p) => p.entryQuality?.winRateImpact === "BOOST");
  }, [pairs]);

  return (
    <div className="bg-white border border-[#141414] shadow-hard overflow-hidden my-6 font-sans">
      {/* GMO Coin Top 5 Special Banner */}
      {onGoToGmoCoin && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-3 px-4 border-b border-[#141414] flex items-center justify-between gap-3 text-slate-950 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
              ⭐ GMO COIN
            </span>
            <span>GMOコイン向け用：絶好の押し目買い/戻り売り 勝率上位5ペア（12万回AI検証）特設ビュー</span>
          </div>
          <button
            onClick={onGoToGmoCoin}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1"
          >
            <span>GMOコインTOP 5を開く</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick 3-Yen Top 3 Banner */}
      {onGoToThreeYen && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-3 px-4 border-b border-[#141414] flex items-center justify-between gap-3 text-slate-950 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
              🔥 SPECIAL
            </span>
            <span>３円以上（3.00円 / 300pips）狙える為替ペア TOP 3 (到達確率＆12万回期待勝率) を解析済み</span>
          </div>
          <button
            onClick={onGoToThreeYen}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-white rounded text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1"
          >
            <span>3円以上 TOP 3を見る</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick High Win-Rate Hedge Pairs Banner */}
      {onGoToHedge && (
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 p-3 px-4 border-b border-[#141414] flex items-center justify-between gap-3 text-white flex-wrap">
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
              🛡️ QUANT HEDGE
            </span>
            <span>急変ショックを最大89%相殺！利益最優先の相関ヘッジペア厳選（09:05〜21:25当日決済型・勝率89%〜）</span>
          </div>
          <button
            onClick={onGoToHedge}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-emerald-300 rounded text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1"
          >
            <span>高勝率ヘッジペアを見る</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 🚀 BIG EXPLOSION RADAR (突き抜ける大相場・爆発初動検知レーダー) */}
      <div className="p-3.5 px-4 bg-[#141414] text-white border-b border-[#141414]">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-purple-600 text-white rounded shadow-sm animate-pulse">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono font-black text-xs uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                BIG EXPLOSION RADAR // 突き抜ける大相場・爆発初動リアルタイム検知
              </span>
              <p className="text-[11px] text-gray-300 leading-tight">
                過去2日〜14日高値安値ブレイク・ボラティリティ極限収縮(スクイーズ)・8大通貨強弱ダイバージェンスを常時連動解析
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-purple-950 text-purple-300 border border-purple-700 px-2.5 py-0.5 font-bold">
              大相場急伸・急落: <strong className="text-white font-black">{explodingPairs.length}件</strong>
            </span>
            <span className="bg-amber-950 text-amber-300 border border-amber-700 px-2.5 py-0.5 font-bold">
              爆発寸前スクイーズ: <strong className="text-white font-black">{coilingPairs.length}件</strong>
            </span>
          </div>
        </div>

        {/* Live Detected Breakout Cards / Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          {/* Active Exploding Pairs */}
          <div className="p-2.5 bg-purple-950/70 border border-purple-700/80 rounded flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-[11px] text-purple-300 font-bold">
              <span className="flex items-center gap-1">
                <Rocket className="w-3.5 h-3.5 text-purple-400" />
                <span>🚀 突き抜け発生中 (押し目待ち不要・ブレイク即追随推奨)</span>
              </span>
              <span>{explodingPairs.length}ペア</span>
            </div>
            {explodingPairs.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {explodingPairs.map((p) => {
                  const isSel = p.pair === selectedPair;
                  return (
                    <button
                      key={p.pair}
                      onClick={() => onSelectPair(p.pair)}
                      className={`p-1.5 px-2.5 rounded font-mono text-left cursor-pointer transition-all flex items-center justify-between gap-2 shadow-sm text-[11px] ${
                        isSel
                          ? "bg-amber-300 text-slate-950 font-black ring-2 ring-amber-400 border border-amber-600"
                          : "bg-purple-900/90 hover:bg-purple-800 text-white border border-purple-500"
                      }`}
                    >
                      <span className={isSel ? "text-slate-950 font-black" : "font-black text-amber-300"}>{p.pair}</span>
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold border ${
                        isSel
                          ? "bg-amber-100 text-amber-950 border-amber-500"
                          : "bg-purple-950 text-purple-200 border-purple-600"
                      }`}>
                        {p.bigBreakoutSignal?.label}
                      </span>
                      <ChevronRight className={`w-3 h-3 ${isSel ? "text-slate-950" : "text-purple-300"}`} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10.5px] text-purple-200/70 font-mono italic">
                現在、突き抜け基準値（通貨強弱極大乖離＋数日レンジ完全突破）を満たす急変ペアはありません。通常レンジの押し目・戻り戦略が有効です。
              </p>
            )}
          </div>

          {/* Active Coiling / Squeezing Pairs */}
          <div className="p-2.5 bg-amber-950/70 border border-amber-700/80 rounded flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-[11px] text-amber-300 font-bold">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ 爆発寸前スクイーズ (エネルギー極限充填・ブレイク待ち)</span>
              </span>
              <span>{coilingPairs.length}ペア</span>
            </div>
            {coilingPairs.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {coilingPairs.map((p) => {
                  const isSel = p.pair === selectedPair;
                  return (
                    <button
                      key={p.pair}
                      onClick={() => onSelectPair(p.pair)}
                      className={`p-1.5 px-2.5 rounded font-mono text-left cursor-pointer transition-all flex items-center justify-between gap-2 shadow-sm text-[11px] ${
                        isSel
                          ? "bg-amber-300 text-slate-950 font-black ring-2 ring-amber-400 border border-amber-600"
                          : "bg-amber-900/90 hover:bg-amber-800 text-white border border-amber-500"
                      }`}
                    >
                      <span className={isSel ? "text-slate-950 font-black" : "font-black text-amber-200"}>{p.pair}</span>
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold border ${
                        isSel
                          ? "bg-amber-100 text-amber-950 border-amber-500"
                          : "bg-amber-950 text-amber-300 border border-amber-600"
                      }`}>
                        充填度: {p.bigBreakoutSignal?.squeezeScore}%
                      </span>
                      <ChevronRight className={`w-3 h-3 ${isSel ? "text-slate-950" : "text-amber-300"}`} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10.5px] text-amber-200/70 font-mono italic">
                現在、充填度70%超の極限スクイーズ状態のペアはありません。各ペアは健全なボラティリティで推移しています。
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Quant Engine Live Execution Status Banner */}
      <div className="bg-slate-900 text-white px-4 py-2.5 border-b border-[#141414] flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-emerald-400">AI自律クオンツエンジン稼働中:</span>
          <span className="text-slate-200">
            リアルタイム実勢レート・初押し目/戻り売り好適度・市場セッション流動性を動的判定中
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300 flex-wrap">
          <span className="bg-slate-800 px-2 py-0.5 border border-slate-700 rounded text-amber-300">
            AI自律進化: 1日3回 (08:30 / 16:30 / 21:30 JST)
          </span>
        </div>
      </div>

      {/* Table Header / Subtitle */}
      <div className="p-4 border-b border-[#141414] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-[#E4E3E0]">
        <div>
          <h2 className="text-base font-black text-[#141414] font-mono tracking-tight flex items-center gap-2 uppercase">
            RANKING // QUANT WIN RATE MATRIX (21通貨ペア到達確率順位)
          </h2>
          <p className="text-xs text-[#141414]/80 mt-0.5">
            現在値から【{targetPips}pips】利確ターゲットへの到達期待度（直近モメンタム × 初押し目判定 × セッション流動性）
          </p>
        </div>
        
        {/* Real-Time Live Status Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-950 border border-emerald-600 px-3 py-1 text-xs font-mono font-bold shadow-hard-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>リアルタイム常時自動更新</span>
          </div>

          <div className="text-xs font-mono font-bold bg-white border border-[#141414] text-[#141414] px-3 py-1 shadow-hard-sm">
            PAIRS: <span className="font-extrabold">{pairs.length}</span>
          </div>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="p-2.5 px-4 bg-white border-b border-[#141414] flex items-center gap-2 flex-wrap text-xs font-mono font-bold">
        <span className="text-gray-500 font-normal text-[11px] mr-1">絞り込みフィルター:</span>
        <button
          onClick={() => setFilterTab("ALL")}
          className={`px-3 py-1 border shadow-hard-sm cursor-pointer transition-all ${
            filterTab === "ALL"
              ? "bg-[#141414] text-white border-[#141414]"
              : "bg-white text-[#141414] hover:bg-gray-100 border-[#141414]"
          }`}
        >
          すべて ({pairs.length})
        </button>

        <button
          onClick={() => setFilterTab("EXPLODING")}
          className={`px-3 py-1 border shadow-hard-sm cursor-pointer transition-all flex items-center gap-1.5 ${
            filterTab === "EXPLODING"
              ? "bg-purple-900 text-white border-purple-950 font-black"
              : "bg-purple-50 text-purple-950 hover:bg-purple-100 border-purple-600"
          }`}
        >
          <Rocket className="w-3.5 h-3.5 text-purple-600" />
          <span>🚀 突き抜け大相場 ({explodingPairs.length})</span>
        </button>

        <button
          onClick={() => setFilterTab("COILING")}
          className={`px-3 py-1 border shadow-hard-sm cursor-pointer transition-all flex items-center gap-1.5 ${
            filterTab === "COILING"
              ? "bg-amber-800 text-white border-amber-950 font-black"
              : "bg-amber-50 text-amber-950 hover:bg-amber-100 border-amber-600"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>⚡ 爆発寸前スクイーズ ({coilingPairs.length})</span>
        </button>

        <button
          onClick={() => setFilterTab("GOLDEN")}
          className={`px-3 py-1 border shadow-hard-sm cursor-pointer transition-all flex items-center gap-1.5 ${
            filterTab === "GOLDEN"
              ? "bg-emerald-800 text-white border-emerald-950 font-black"
              : "bg-emerald-50 text-emerald-950 hover:bg-emerald-100 border-emerald-600"
          }`}
        >
          <span>💎 絶好の押し目/戻り ({goldenDipRallyPairs.length})</span>
        </button>

        <button
          onClick={() => setFilterTab("BUY")}
          className={`px-3 py-1 border shadow-hard-sm cursor-pointer transition-all ${
            filterTab === "BUY"
              ? "bg-emerald-600 text-white border-emerald-800 font-black"
              : "bg-white text-emerald-900 hover:bg-emerald-50 border-[#141414]"
          }`}
        >
          LONG (買い推奨)
        </button>

        <button
          onClick={() => setFilterTab("SELL")}
          className={`px-3 py-1 border shadow-hard-sm cursor-pointer transition-all ${
            filterTab === "SELL"
              ? "bg-rose-600 text-white border-rose-800 font-black"
              : "bg-white text-rose-900 hover:bg-rose-50 border-[#141414]"
          }`}
        >
          SHORT (売り推奨)
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#141414] text-[#E4E3E0] font-mono uppercase tracking-wider border-b border-[#141414]">
              <th className="py-3 px-4 font-bold" title="リアルタイム計算順位 (常時最新順に自動整列)">
                RANK (リアルタイム順位)
              </th>
              <th className="py-3 px-4 font-bold">PAIR (通貨ペア)</th>
              <th className="py-3 px-4 font-bold">RECOMMEND (AIお勧め)</th>
              <th className="py-3 px-4 font-bold">PRICE (現在値 & レンジ横棒)</th>
              <th className="py-3 px-4 font-bold">2-DAY 騰落 (横棒)</th>
              <th className="py-3 px-4 font-bold" title="本日および過去14日間の安値・高値に対する現在値の位置 (高値乖離 / 安値回復率)">
                レンジ位置 (本日/14日 横棒)
              </th>
              <th className="py-3 px-4 font-bold">MACRO TREND</th>
              <th className="py-3 px-4 font-bold">TARGET (目標値)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {filteredItems.map((item, index) => {
              const actualRank = actualRankMap.get(item.pair) ?? (index + 1);
              const rankDiff = rankDiffMap.get(item.pair) ?? 0;
              const isSelected = item.pair === selectedPair;

              const isLong = item.positionType === "LONG" || item.recommendation.includes("ロング") || item.recommendation.includes("買い");
              const isShort = item.positionType === "SHORT" || item.recommendation.includes("ショート") || item.recommendation.includes("売り");

              return (
                <tr
                  key={item.pair}
                  onClick={() => onSelectPair(item.pair)}
                  className={`cursor-pointer transition-all border-b border-[#141414]/15 ${
                    isSelected
                      ? "bg-amber-100/80 text-[#141414] ring-2 ring-amber-500 ring-inset shadow-md font-medium"
                      : "hover:bg-amber-50/50 text-[#141414] odd:bg-white even:bg-slate-50/60"
                  }`}
                >
                    {/* Actual Rank & Real-Time Movement Indicator */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        {isSelected && (
                          <span className="w-1.5 h-6 bg-amber-500 rounded-full shrink-0 animate-pulse" title="選択中ペア" />
                        )}
                        <span className={`font-black text-sm px-2 py-0.5 border shadow-hard-sm ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 border-amber-600 font-extrabold"
                            : "bg-white text-[#141414] border-[#141414]"
                        }`}>
                          #{actualRank}
                        </span>
                        {rankDiff > 0 && (
                          <span
                            className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 border border-emerald-600 shadow-hard-sm"
                            title={`直近のリアルタイム計算で順位上昇中（${rankDiff}ランクUP）`}
                          >
                            ↑{rankDiff}
                          </span>
                        )}
                        {rankDiff < 0 && (
                          <span
                            className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 border border-rose-600 shadow-hard-sm"
                            title={`直近のリアルタイム計算で順位下降中（${Math.abs(rankDiff)}ランクDOWN）`}
                          >
                            ↓{Math.abs(rankDiff)}
                          </span>
                        )}
                        {rankDiff === 0 && (
                          <span className="text-[10px] text-gray-400 font-bold ml-0.5">-</span>
                        )}
                      </div>
                    </td>

                    {/* Pair Name & Position Direction Badge & Recommendation Probability */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex flex-col items-start gap-1 min-w-[125px]">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base tracking-tight text-[#141414]">{item.pair}</span>
                          {isSelected && (
                            <span className="text-[10px] font-black text-amber-900 bg-amber-300 px-1.5 py-0.2 rounded border border-amber-500 uppercase tracking-tighter">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[11px] font-black border border-[#141414] whitespace-nowrap inline-flex items-center gap-1 shadow-hard-sm ${
                            isLong
                              ? "bg-emerald-600 text-white"
                              : isShort
                              ? "bg-rose-600 text-white"
                              : "bg-gray-200 text-[#141414]"
                          }`}
                        >
                          {isLong ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                              <span>LONG (買)</span>
                            </>
                          ) : isShort ? (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                              <span>SHORT (売)</span>
                            </>
                          ) : (
                            <span>静観</span>
                          )}
                        </span>

                        {/* 通貨ペアの下に表示する推奨確率 */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                          <span className="text-gray-500 font-bold">推奨確率:</span>
                          <span className={`font-black px-1.5 py-0.2 rounded border shadow-hard-sm ${
                            item.probability >= 70
                              ? "bg-emerald-100 text-emerald-950 border-emerald-500"
                              : item.probability >= 50
                              ? "bg-amber-100 text-amber-950 border-amber-500"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                          }`}>
                            {item.probability}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Recommendation Badge & Entry Quality */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-extrabold text-[#141414] bg-white px-2 py-0.5 border border-[#141414] shadow-hard-sm whitespace-nowrap">
                            {item.pair}
                          </span>
                          <span className={`inline-block px-2.5 py-1 text-xs font-bold border border-[#141414] shadow-hard-sm whitespace-nowrap ${
                            isLong
                              ? "bg-emerald-100 text-emerald-950 border-emerald-800"
                              : isShort
                              ? "bg-rose-100 text-rose-950 border-rose-800"
                              : "bg-gray-200 text-[#141414]"
                          }`}>
                            {item.recommendation}
                          </span>
                        </div>

                        {/* 突き抜ける大相場・爆発初動シグナルバッジ */}
                        {item.bigBreakoutSignal && (item.bigBreakoutSignal.isExploding || item.bigBreakoutSignal.isCoiling) && (
                          <div
                            className={`px-2 py-0.5 text-[10.5px] font-mono border shadow-hard-sm inline-flex items-center gap-1.5 w-fit ${item.bigBreakoutSignal.badgeClass}`}
                            title={item.bigBreakoutSignal.advice}
                          >
                            <span>{item.bigBreakoutSignal.label}</span>
                            <span className="text-[9.5px] opacity-80 font-normal">({item.bigBreakoutSignal.subLabel})</span>
                          </div>
                        )}

                        {item.entryQuality && (
                          <div
                            className={`px-2 py-0.5 text-[10.5px] font-mono border shadow-hard-sm inline-flex items-center gap-1.5 w-fit ${item.entryQuality.badgeClass}`}
                            title={item.entryQuality.advice}
                          >
                            <span>{item.entryQuality.label}</span>
                            <span className="text-[9.5px] opacity-75 font-normal">({item.entryQuality.subLabel})</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 5. Current Price & Range Position (Today) */}
                    <td className="py-3 px-4 font-mono min-w-[170px]">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-extrabold text-sm tracking-tight text-[#141414]">
                          {item.currentPrice}
                        </span>

                        <div className="flex flex-col gap-1 border border-[#141414]/20 bg-white/95 p-2 shadow-hard-sm text-xs">
                          <div className="flex items-center justify-between text-[10px] font-bold text-gray-600">
                            <span>本日レンジ位置</span>
                            <span className="text-gray-800 font-black">{item.todayRangePips != null ? item.todayRangePips : 0}p</span>
                          </div>

                          {/* 本日位置の横棒ゲージバー */}
                          <div className="relative w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300">
                            <div
                              className={`h-full rounded-full ${isLong ? "bg-emerald-500" : "bg-rose-500"}`}
                              style={{ width: `${Math.min(100, Math.max(5, item.todayPosFromLow != null ? item.todayPosFromLow : 50))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10.5px] font-bold">
                            <span className="text-emerald-700">安値+{item.todayPosFromLow != null ? item.todayPosFromLow : 0}%</span>
                            <span className="text-rose-700">高値{item.todayPosFromHigh != null ? item.todayPosFromHigh : 0}%</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 7. 2-Day Return & Range */}
                    <td className="py-3 px-4 font-mono font-bold text-xs min-w-[120px]">
                      {item.return2dPercent !== undefined ? (
                        <div className="flex flex-col gap-1">
                          <span className={`${
                            item.return2dPercent > 0 ? "text-emerald-700" : item.return2dPercent < 0 ? "text-rose-700" : "text-gray-600"
                          } font-black text-sm`}>
                            {item.return2dPercent >= 0 ? "+" : ""}{item.return2dPercent}%
                          </span>

                          {/* 2日騰落の横棒モメンタムバー */}
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                            <div
                              className={`h-full rounded-full ${item.return2dPercent >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                              style={{ width: `${Math.min(100, Math.max(10, Math.abs(item.return2dPercent) * 50))}%` }}
                            />
                          </div>

                          <span className="text-[10px] text-gray-500 font-normal">
                            2日幅: {item.range2dPips || 0}p
                          </span>
                        </div>
                      ) : (
                        <span className="opacity-50">---</span>
                      )}
                    </td>

                    {/* 8. Range Position (Today & 14-Day) 全部横棒表示 */}
                    <td className="py-3 px-4 font-mono text-xs min-w-[160px]">
                      {item.todayPosFromLow !== undefined ? (
                        <div className="space-y-2">
                          {/* Today Position Gauge Bar */}
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-700 mb-0.5">
                              <span>本日: +{item.todayPosFromLow}%</span>
                              <span className="text-gray-500 font-semibold">{item.todayPosFromHigh}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                              <div
                                className={`h-full rounded-full ${
                                  (item.todayPosFromLow || 0) >= 70
                                    ? "bg-emerald-500"
                                    : (item.todayPosFromLow || 0) <= 30
                                    ? "bg-rose-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, item.todayPosFromLow || 0))}%` }}
                              />
                            </div>
                          </div>

                          {/* 14-Day Position Gauge Bar */}
                          {item.pos14dFromLow !== undefined && (
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-bold text-gray-700 mb-0.5">
                                <span>14日: +{item.pos14dFromLow}%</span>
                                <span className="text-gray-500 font-semibold">{item.pos14dFromHigh}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                                <div
                                  className={`h-full rounded-full ${
                                    (item.pos14dFromLow || 0) >= 70
                                      ? "bg-emerald-500"
                                      : (item.pos14dFromLow || 0) <= 30
                                      ? "bg-rose-500"
                                      : "bg-indigo-500"
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(5, item.pos14dFromLow || 0))}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="opacity-50">---</span>
                      )}
                    </td>

                    {/* 9. Macro Trend */}
                    <td className="py-3 px-4 text-xs font-semibold">
                      <span className="bg-white/80 px-2 py-1 rounded border border-gray-300 inline-block">
                        {item.trendLabel}
                      </span>
                    </td>

                    {/* 10. Target Price */}
                    <td className="py-3 px-4 font-mono font-black text-xs text-[#141414]">
                      <span className={`px-2 py-0.5 border shadow-hard-sm ${
                        isSelected
                          ? "bg-amber-300 text-amber-950 border-amber-600"
                          : "bg-white text-[#141414] border-[#141414]"
                      }`}>
                        {item.targetPrice}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
        </table>
      </div>
    </div>
  );
};
