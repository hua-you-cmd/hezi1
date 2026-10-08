import React, { useState, useEffect } from "react";
import { RefreshCw, Lock, Clock, Globe, Cpu, Play, Square, AlertCircle } from "lucide-react";
import { JstInfo, EvolutionState } from "../types";

interface HeaderProps {
  updatedAt: string | null;
  jstInfo?: JstInfo;
  evolutionState?: EvolutionState | null;
  loading: boolean;
  onRefresh: () => void;
  targetPips: number;
  onTargetPipsChange: (val: number) => void;
  onLockApp: () => void;
  isLiveActive: boolean;
  onStartLive: () => void;
  onStopLive: () => void;
  countdown: number;
  isWithinOperatingHours: boolean;
  dataSource?: string;
  isLiveYahooFinance?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  updatedAt,
  jstInfo,
  evolutionState,
  loading,
  onRefresh,
  targetPips,
  onTargetPipsChange,
  onLockApp,
  isLiveActive,
  onStartLive,
  onStopLive,
  countdown,
  isWithinOperatingHours,
  dataSource,
  isLiveYahooFinance = false,
}) => {
  const isYahooSynchronizing = isLiveActive && Boolean(isLiveYahooFinance);

  // Live ticking JST Clock state - only ticks after pressing Start (isLiveActive = true)
  const [currentJstTime, setCurrentJstTime] = useState<string>("");

  useEffect(() => {
    // Only update and tick clock when isLiveActive is true (started by user)
    if (!isLiveActive) {
      return;
    }

    const updateTime = () => {
      try {
        const now = new Date();
        const str = new Intl.DateTimeFormat("ja-JP", {
          timeZone: "Asia/Tokyo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          weekday: "short",
          hour12: false,
        }).format(now);
        setCurrentJstTime(`${str} JST`);
      } catch {
        setCurrentJstTime(new Date().toLocaleTimeString("ja-JP"));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const sessionColor = jstInfo?.isWeekendClosed
    ? "bg-rose-100 text-rose-950 border-rose-800"
    : jstInfo?.activeSessionCategory === "GOLDEN"
    ? "bg-amber-100 text-amber-950 border-amber-800 font-black"
    : jstInfo?.activeSessionCategory === "LONDON"
    ? "bg-emerald-100 text-emerald-950 border-emerald-800"
    : "bg-blue-100 text-blue-950 border-blue-800";

  return (
    <header className="bg-white border-b border-[#141414] text-[#141414] px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#141414] text-[#E4E3E0] font-mono font-black text-xs uppercase tracking-wider shadow-hard-sm">
            QUANT-AI (クオンツAI)
          </div>
          <div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tighter text-[#141414]">
                FX STRATEGY ENGINE (FX戦略エンジン)
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border border-amber-600 bg-amber-200 text-amber-950">
                GMOコインFX 全21ペア対応
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border border-[#141414] bg-[#E4E3E0]">
                2-DAY 90% / ALGO PROB
              </span>
            </div>
            <p className="text-xs text-[#141414]/70 mt-0.5">
              GMOコイン外国為替FX 取扱全21通貨ペア完全対応・【過去2日間 90% / それ以前 10%】配分＆アルゴリズム推奨確率判定
            </p>
          </div>
        </div>

        {/* Right Info: Live JST Clock, Yahoo Finance Real-time Badge & Session Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
          {/* Yahoo Finance Real-time Data Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs shadow-hard-sm border-2 transition-all ${
              isYahooSynchronizing
                ? "bg-emerald-50 border-emerald-600 text-emerald-950"
                : "bg-slate-100 border-slate-400 text-slate-700"
            }`}
          >
            {isYahooSynchronizing ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            ) : (
              <span className="inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
            )}
            <span className="font-black">
              {isYahooSynchronizing
                ? (dataSource || "Yahoo!ファイナンス (リアルタイム実レート直接同期中)")
                : "Yahoo!ファイナンス (待機中 / スタートで同期開始)"}
            </span>
          </div>

          {/* Operating Hours Window Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900 text-emerald-300 border border-slate-700 px-2.5 py-1 font-mono text-xs shadow-hard-sm">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold">稼働: 08:30〜23:00 JST</span>
          </div>

          {/* Live JST Clock & Market Session Badge */}
          <div
            className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-xs shadow-hard-sm transition-all ${
              isLiveActive
                ? "bg-[#E4E3E0]/70 border-[#141414]"
                : "bg-slate-100 border-slate-400 text-slate-700"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 shrink-0 ${isLiveActive ? "text-emerald-700" : "text-slate-400"}`} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className={`font-bold ${isLiveActive ? "text-[#141414]" : "text-slate-700"}`}>
                {isLiveActive
                  ? (currentJstTime || updatedAt || "日本時間同期中...")
                  : currentJstTime
                  ? `${currentJstTime} (時計停止中)`
                  : updatedAt
                  ? `${updatedAt} (時計待機中)`
                  : "日本時間 (待機中 / スタートで時計開始)"}
              </span>
              {jstInfo?.activeSessionName && (
                <span className={`text-[10px] px-1.5 py-0.5 border font-bold ${sessionColor}`}>
                  {jstInfo.activeSessionName.split("(")[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Dedicated Start/Stop Controls, Operating Status, Target Pips, Lock, Manual Refresh */}
      <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-[#141414]/15 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Start and Stop Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-white border-2 border-[#141414] shadow-hard-sm">
            {/* スタート ボタン */}
            <button
              onClick={onStartLive}
              disabled={isLiveActive || !isWithinOperatingHours}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-black uppercase transition-all cursor-pointer ${
                isLiveActive
                  ? "bg-emerald-600 text-white shadow-inner cursor-default opacity-90"
                  : !isWithinOperatingHours
                  ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-hard-sm border border-emerald-700"
              }`}
              title={
                !isWithinOperatingHours
                  ? "現在は稼働時間外です (08:30〜23:00 JST の間のみ時計・Yahoo!実レート同期・データ更新・AI分析が稼働します)"
                  : isLiveActive
                  ? "時計・Yahoo!ファイナンス実レート同期＆AI分析稼働中 (15秒周期更新)"
                  : "スタートを押すと、日本時間時計・Yahoo!ファイナンス実レート直接同期＆15秒ごとのデータ更新・AI分析を開始します"
              }
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>▶ スタート</span>
            </button>

            {/* 終了 (停止) ボタン */}
            <button
              onClick={onStopLive}
              disabled={!isLiveActive}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-black uppercase transition-all cursor-pointer ${
                !isLiveActive
                  ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-default"
                  : "bg-rose-600 hover:bg-rose-500 text-white hover:shadow-hard-sm border border-rose-800"
              }`}
              title="データ更新・AI分析の自動更新を終了・停止"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>⏹ 終了 (停止)</span>
            </button>
          </div>

          {/* Operating Status / Countdown Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold border shadow-hard-sm ${
              !isWithinOperatingHours
                ? "bg-rose-50 border-rose-300 text-rose-900"
                : isLiveActive
                ? "bg-emerald-100 border-emerald-800 text-emerald-950"
                : "bg-amber-50 border-amber-400 text-amber-950"
            }`}
          >
            {!isWithinOperatingHours ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>時間外 (8:30〜23:00 JST稼働)</span>
              </span>
            ) : isLiveActive ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
                <span>Yahoo!同期＆15秒更新中 ({countdown}s後)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>停止中 (スタート待ち)</span>
              </span>
            )}
          </div>

          {/* Target Pips Setting */}
          <div className="flex items-center gap-2 bg-[#E4E3E0] border border-[#141414] px-3 py-1.5 text-xs font-mono">
            <span className="font-bold text-[#141414] uppercase">Target (目標):</span>
            <select
              value={targetPips}
              onChange={(e) => onTargetPipsChange(Number(e.target.value))}
              className="bg-white text-[#141414] font-bold px-2 py-0.5 border border-[#141414] focus:outline-none cursor-pointer"
            >
              <option value={25}>25 pips (0.25円幅 / 短期)</option>
              <option value={30}>✨ 30 pips (0.30円幅) [基本推奨]</option>
              <option value={50}>50 pips (0.50円幅 / デイトレ)</option>
              <option value={100}>100 pips (1.00円幅 / スイング)</option>
              <option value={150}>150 pips (1.50円幅)</option>
              <option value={200}>200 pips (2.00円幅)</option>
              <option value={250}>250 pips (2.50円幅)</option>
              <option value={300}>🔥 300 pips (3.00円幅 / 3円以上狙い)</option>
            </select>
          </div>

          {/* Quick 30-Pips Standard Target Switch */}
          <button
            onClick={() => onTargetPipsChange(30)}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-black uppercase border transition-all cursor-pointer ${
              targetPips === 30
                ? "bg-emerald-600 text-white border-emerald-800 shadow-sm"
                : "bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100"
            }`}
            title="目標値を基本推奨の30pips(0.30円幅)に切り替え"
          >
            <span>✨ 30pips推奨</span>
          </button>

          {/* Quick 3-Yen Target Switch */}
          <button
            onClick={() => onTargetPipsChange(300)}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-black uppercase border transition-all cursor-pointer ${
              targetPips === 300
                ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
                : "bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200"
            }`}
            title="目標値を3.00円(300pips)に切り替え"
          >
            <span>🔥 3円以上狙い (300p)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Lock Button */}
          <button
            onClick={onLockApp}
            className="flex items-center gap-1 bg-[#E4E3E0] hover:bg-red-100 text-[#141414] border border-[#141414] font-mono font-bold text-xs uppercase px-2.5 py-1.5 transition-all cursor-pointer"
            title="アプリをロック"
          >
            <Lock className="w-3.5 h-3.5 text-red-700" />
            <span>LOCK</span>
          </button>

          {/* Manual Refresh / AI Recalculate Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-mono font-black uppercase text-xs tracking-wider px-4 py-1.5 border-2 border-[#141414] transition-all shadow-hard cursor-pointer disabled:opacity-50 relative overflow-hidden group"
            id="manual-refresh-btn"
            title="ボタンを押すたびに最新の市場リアルタイムデータと120,000回(12万回)AIモンテカルロシミュレーションを即座に再評価・再計算"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            <span>{loading ? "AI再計算中 (120,000x ML)..." : "⚡ 今すぐ手動更新"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
